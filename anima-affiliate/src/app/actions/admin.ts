'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { one, q, tx } from '@/lib/db';
import { requireAdmin, SessionUser } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { sendEmail } from '@/lib/email';
import { getSettings } from '@/lib/settings';
import { normaliseCode, validateCode } from '@/lib/codes';
import { createDiscountCode, setDiscountActive, shopifyConfigured, fetchRecentOrders } from '@/lib/shopify';
import { processShopifyOrder, approveMaturedCommissions } from '@/lib/orders';
import { money, pct } from '@/lib/money';

// Every action re-checks the admin role on the server. Nothing here trusts values the browser could change
// except the specific fields being edited, which are validated.
const back = (to: string, key: 'err' | 'msg', text: string) => redirect(`${to}${to.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(text)}`);
const who = (a: SessionUser) => ({ id: a.id, label: `admin:${a.email}` });
const ret = (fd: FormData, fallback: string) => {
  const r = String(fd.get('return_to') || fallback);
  return r.startsWith('/admin') ? r : fallback;
};

async function influencerContact(id: string) {
  return one<{ email: string; full_name: string; status: string; commission_rate: string; is_test: boolean }>(
    `select u.email, u.full_name, i.status, i.commission_rate, i.is_test from influencers i join users u on u.id = i.user_id where i.id = $1`, [id]);
}

async function shopifyToggle(codeRow: any, active: boolean) {
  if (codeRow.shopify_discount_id && shopifyConfigured()) await setDiscountActive(codeRow.shopify_discount_id, active);
}

export async function setInfluencerStatusAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get('id'));
  const to = String(fd.get('status')) as 'approved' | 'rejected' | 'suspended';
  const back_to = ret(fd, `/admin/influencers/${id}`);
  if (!['approved', 'rejected', 'suspended'].includes(to)) back(back_to, 'err', 'Unknown status.');
  const inf = await influencerContact(id);
  if (!inf) back('/admin/influencers', 'err', 'Influencer not found.');
  const from = inf!.status;
  if (from === to) back(back_to, 'msg', `Already ${to}.`);

  // Turning an influencer off also turns off their codes at Shopify checkout.
  if (to === 'rejected' || to === 'suspended') {
    const codes = await q<any>(`select * from affiliate_codes where influencer_id = $1 and status in ('active','pending_approval')`, [id]);
    for (const c of codes) {
      try { await shopifyToggle(c, false); } catch (e: any) { back(back_to, 'err', `Could not disable ${c.code} in Shopify: ${e.message}`); }
    }
  }
  await tx(async (c) => {
    await c.query(
      `update influencers set status = $2::influencer_status, status_changed_at = now(), approved_at = case when $3 and approved_at is null then now() else approved_at end where id = $1`,
      [id, to, to === 'approved']);
    if (to === 'rejected' || to === 'suspended') {
      await c.query(`update affiliate_codes set status = case when status = 'active' then 'disabled'::code_status else 'rejected'::code_status end, decided_at = now()
                      where influencer_id = $1 and status in ('active','pending_approval')`, [id]);
    }
    await audit(who(admin), `influencer.${to === 'approved' && from === 'suspended' ? 'reactivated' : to}`, 'influencer', id, { from, to }, c);
  });
  if (to === 'approved') await sendEmail(inf!.email, from === 'suspended' ? 'influencerReactivated' : 'applicationApproved', { name: inf!.full_name, rate: pct(inf!.commission_rate) });
  if (to === 'rejected') await sendEmail(inf!.email, 'applicationRejected', { name: inf!.full_name });
  if (to === 'suspended') await sendEmail(inf!.email, 'influencerSuspended', { name: inf!.full_name });
  revalidatePath('/admin');
  back(back_to, 'msg', `Status changed to ${to}.`);
}

const TermsSchema = z.object({
  commission_rate: z.coerce.number().min(0).max(50),
  discount_percent: z.coerce.number().min(0).max(90),
  max_discount_percent: z.coerce.number().min(0).max(90)
});
export async function updateInfluencerTermsAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get('id'));
  const p = TermsSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) back(`/admin/influencers/${id}`, 'err', 'Rates must be numbers between 0 and 90.');
  const d = p.data!;
  if (d.discount_percent > d.max_discount_percent) back(`/admin/influencers/${id}`, 'err', 'Discount cannot be higher than the maximum discount.');
  const before = await one<any>('select commission_rate, discount_percent, max_discount_percent from influencers where id = $1', [id]);
  await q('update influencers set commission_rate=$2, discount_percent=$3, max_discount_percent=$4 where id=$1', [id, d.commission_rate, d.discount_percent, d.max_discount_percent]);
  await audit(who(admin), 'influencer.terms_changed', 'influencer', id, { before, after: d });
  back(`/admin/influencers/${id}`, 'msg', 'Rates saved. New commission rate applies to new orders.');
}

export async function saveNotesAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get('id'));
  const notes = String(fd.get('admin_notes') || '').slice(0, 5000);
  await q('update influencers set admin_notes = $2 where id = $1', [id, notes]);
  await audit(who(admin), 'influencer.notes_updated', 'influencer', id);
  back(`/admin/influencers/${id}`, 'msg', 'Notes saved.');
}

export async function decideCodeAction(fd: FormData) {
  const admin = await requireAdmin();
  const codeId = String(fd.get('code_id'));
  const decision = String(fd.get('decision')) as 'approve' | 'reject' | 'disable' | 'enable';
  const code = await one<any>('select ac.*, i.status as inf_status, i.is_test as inf_test from affiliate_codes ac join influencers i on i.id = ac.influencer_id where ac.id = $1', [codeId]);
  const back_to = ret(fd, '/admin/codes');
  if (!code) back(back_to, 'err', 'Code not found.');
  const inf = (await influencerContact(code.influencer_id))!;
  try {
    if (decision === 'approve' || decision === 'enable') {
      if (code.inf_status !== 'approved') back(back_to, 'err', 'Only approved influencers can have an active code.');
      const other = await one(`select 1 from affiliate_codes where influencer_id = $1 and status = 'active' and id <> $2`, [code.influencer_id, codeId]);
      if (other) back(back_to, 'err', 'This influencer already has an active code. Disable it first.');
      let shopifyId = code.shopify_discount_id;
      if (!code.is_test) {
        if (!shopifyConfigured()) back(back_to, 'err', 'Connect Shopify first (Settings) so the code works at checkout.');
        if (shopifyId) await setDiscountActive(shopifyId, true);
        else shopifyId = await createDiscountCode(code.code, Number(code.discount_percent), inf.full_name);
      }
      await q(`update affiliate_codes set status='active', shopify_discount_id=$2, decided_at=now() where id=$1`, [codeId, shopifyId]);
      await audit(who(admin), decision === 'approve' ? 'code.approved' : 'code.enabled', 'affiliate_code', codeId, { code: code.code, shopify: shopifyId });
      await sendEmail(inf.email, 'codeApproved', { name: inf.full_name, code: code.code, discount: pct(code.discount_percent) });
    } else if (decision === 'reject') {
      await q(`update affiliate_codes set status='rejected', decided_at=now() where id=$1 and status='pending_approval'`, [codeId]);
      await audit(who(admin), 'code.rejected', 'affiliate_code', codeId, { code: code.code });
      await sendEmail(inf.email, 'codeRejected', { name: inf.full_name, code: code.code });
    } else if (decision === 'disable') {
      await shopifyToggle(code, false);
      await q(`update affiliate_codes set status='disabled', decided_at=now() where id=$1`, [codeId]);
      await audit(who(admin), 'code.disabled', 'affiliate_code', codeId, { code: code.code });
      await sendEmail(inf.email, 'codeDisabled', { name: inf.full_name, code: code.code });
    }
  } catch (e: any) {
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    back(back_to, 'err', `Shopify: ${e.message}`);
  }
  revalidatePath('/admin/codes');
  back(back_to, 'msg', `Code ${code.code}: ${decision}d.`);
}

export async function assignCodeAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get('id'));
  const s = await getSettings();
  const code = normaliseCode(String(fd.get('code') || ''));
  const bad = validateCode(code, s.code_min_length, s.code_max_length);
  if (bad) back(`/admin/influencers/${id}`, 'err', bad);
  const inf = await one<any>('select i.*, u.full_name, u.email from influencers i join users u on u.id = i.user_id where i.id = $1', [id]);
  if (!inf || inf.status !== 'approved') back(`/admin/influencers/${id}`, 'err', 'Approve the influencer first.');
  const discount = Number(fd.get('discount_percent') || inf.discount_percent);
  if (discount > Number(inf.max_discount_percent)) back(`/admin/influencers/${id}`, 'err', `Discount is above this influencer's maximum (${pct(inf.max_discount_percent)}).`);
  if (await one('select 1 from affiliate_codes where upper(code) = $1', [code])) back(`/admin/influencers/${id}`, 'err', 'That code already exists.');
  if (await one(`select 1 from affiliate_codes where influencer_id = $1 and status = 'active'`, [id])) back(`/admin/influencers/${id}`, 'err', 'Disable the current active code first.');
  let shopifyId: string | null = null;
  if (!inf.is_test) {
    if (!shopifyConfigured()) back(`/admin/influencers/${id}`, 'err', 'Connect Shopify first so the code works at checkout.');
    try { shopifyId = await createDiscountCode(code, discount, inf.full_name); } catch (e: any) { back(`/admin/influencers/${id}`, 'err', `Shopify: ${e.message}`); }
  }
  const row = await one<any>(`insert into affiliate_codes (influencer_id, code, discount_percent, status, shopify_discount_id, decided_at, is_test) values ($1,$2,$3,'active',$4,now(),$5) returning id`,
    [id, code, discount, shopifyId, inf.is_test]);
  await audit(who(admin), 'code.assigned', 'affiliate_code', row.id, { code, discount });
  await sendEmail(inf.email, 'codeApproved', { name: inf.full_name, code, discount: pct(discount) });
  back(`/admin/influencers/${id}`, 'msg', `Code ${code} created and active.`);
}

export async function setOrderStatusAction(fd: FormData) {
  const admin = await requireAdmin();
  const orderId = String(fd.get('order_id'));
  const to = String(fd.get('status'));
  const back_to = ret(fd, '/admin/orders');
  if (!['pending', 'approved', 'cancelled', 'refunded'].includes(to)) back(back_to, 'err', 'Use a payout to mark commissions as paid.');
  const o = await one<any>('select * from affiliate_orders where id = $1', [orderId]);
  if (!o) back(back_to, 'err', 'Order not found.');
  if (o.status === 'paid') back(back_to, 'err', 'This commission is already paid. Use a manual adjustment instead.');
  const reason = String(fd.get('reason') || '').slice(0, 300) || `Set to ${to} by admin`;
  const zero = to === 'cancelled' || to === 'refunded';
  await q(`update affiliate_orders set status=$2, status_reason=$3, commission_amount = case when $4 then 0 else round(eligible_amount * commission_rate / 100, 2) end, updated_at=now() where id=$1`,
    [orderId, to, reason, zero]);
  await audit(who(admin), 'commission.status_changed', 'affiliate_order', orderId, { order: o.order_name, from: o.status, to, reason });
  const inf = await influencerContact(o.influencer_id);
  if (inf) await sendEmail(inf.email, 'commissionStatus', { name: inf.full_name, order: o.order_name, status: to });
  back(back_to, 'msg', `${o.order_name}: ${to}.`);
}

export async function addAdjustmentAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get('id'));
  const amount = Math.round(Number(fd.get('amount')) * 100) / 100;
  const reason = String(fd.get('reason') || '').trim();
  if (!amount || !Number.isFinite(amount) || Math.abs(amount) > 100000) back(`/admin/influencers/${id}`, 'err', 'Enter an amount (use a minus sign for a deduction).');
  if (reason.length < 3) back(`/admin/influencers/${id}`, 'err', 'A reason is required for every adjustment.');
  const row = await one<any>('insert into commission_adjustments (influencer_id, amount, reason, created_by) values ($1,$2,$3,$4) returning id', [id, amount, reason, admin.id]);
  await audit(who(admin), 'commission.adjusted', 'influencer', id, { adjustment: row.id, amount, reason });
  back(`/admin/influencers/${id}`, 'msg', `Adjustment of ${money(amount)} recorded.`);
}

export async function createPayoutAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get('id'));
  const method = String(fd.get('method') || '').slice(0, 60);
  const reference = String(fd.get('reference') || '').slice(0, 120);
  const back_to = ret(fd, '/admin/payouts');
  const result = await tx(async (c) => {
    const orders = (await c.query(`select id, commission_amount from affiliate_orders where influencer_id = $1 and status = 'approved' and payout_id is null for update`, [id])).rows;
    const adjs = (await c.query(`select id, amount from commission_adjustments where influencer_id = $1 and payout_id is null for update`, [id])).rows;
    const total = Math.round((orders.reduce((s: number, o: any) => s + Number(o.commission_amount), 0) + adjs.reduce((s: number, a: any) => s + Number(a.amount), 0)) * 100) / 100;
    if (total <= 0) return { total: 0, payoutId: null };
    const p = (await c.query(`insert into payouts (influencer_id, amount, method, reference, created_by, is_test) values ($1,$2,$3,$4,$5,(select is_test from influencers where id = $1)) returning id`, [id, total, method, reference, admin.id])).rows[0];
    if (orders.length) await c.query(`update affiliate_orders set status='paid', payout_id=$2, status_reason='Paid', updated_at=now() where id = any($1::uuid[])`, [orders.map((o: any) => o.id), p.id]);
    if (adjs.length) await c.query(`update commission_adjustments set payout_id=$2 where id = any($1::uuid[])`, [adjs.map((a: any) => a.id), p.id]);
    await audit(who(admin), 'payout.created', 'influencer', id, { payout: p.id, amount: total, orders: orders.length, adjustments: adjs.length, method, reference }, c);
    return { total, payoutId: p.id };
  });
  if (!result.payoutId) back(back_to, 'err', 'Nothing to pay: no approved commission balance.');
  const inf = await influencerContact(id);
  if (inf) await sendEmail(inf.email, 'paymentCompleted', { name: inf.full_name, amount: money(result.total), reference });
  back(back_to, 'msg', `Payout of ${money(result.total)} recorded.`);
}

const SettingsSchema = z.object({
  default_commission_rate: z.coerce.number().min(0).max(50),
  default_discount_percent: z.coerce.number().min(0).max(90),
  max_discount_percent: z.coerce.number().min(0).max(90),
  code_min_length: z.coerce.number().int().min(3).max(10),
  code_max_length: z.coerce.number().int().min(6).max(30),
  hold_days: z.coerce.number().int().min(0).max(120)
});
export async function updateSettingsAction(fd: FormData) {
  const admin = await requireAdmin();
  const p = SettingsSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) back('/admin/settings', 'err', 'Please check the values.');
  const d = p.data!;
  if (d.default_discount_percent > d.max_discount_percent) back('/admin/settings', 'err', 'Default discount cannot exceed the maximum discount.');
  const before = await getSettings();
  await q(`update settings set default_commission_rate=$1, default_discount_percent=$2, max_discount_percent=$3, code_min_length=$4, code_max_length=$5, hold_days=$6, updated_at=now() where id=1`,
    [d.default_commission_rate, d.default_discount_percent, d.max_discount_percent, d.code_min_length, d.code_max_length, d.hold_days]);
  await audit(who(admin), 'settings.updated', 'settings', '1', { before, after: d });
  back('/admin/settings', 'msg', 'Program rules saved. They apply to new applications.');
}

export async function syncOrdersAction(fd: FormData) {
  const admin = await requireAdmin();
  const days = Math.min(Math.max(Number(fd.get('days') || 30), 1), 120);
  try {
    const orders = await fetchRecentOrders(new Date(Date.now() - days * 86400_000).toISOString());
    let created = 0, updated = 0;
    for (const o of orders) {
      const r = await processShopifyOrder(o, { source: 'manual-sync' });
      if (r.action === 'created') created++;
      if (r.action === 'updated') updated++;
    }
    const matured = await approveMaturedCommissions();
    await audit(who(admin), 'orders.synced', 'settings', null, { days, scanned: orders.length, created, updated, matured });
    back('/admin/settings', 'msg', `Checked ${orders.length} orders: ${created} new, ${updated} updated, ${matured} commissions approved.`);
  } catch (e: any) {
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    back('/admin/settings', 'err', e.message);
  }
}
