import { tx, one } from './db';
import { audit } from './audit';
import { computeCommission, productsSummary, codesOnOrder } from './commission';
import { sendEmail } from './email';
import { money } from './money';

type Result = { matched: boolean; action?: 'created' | 'updated' | 'unchanged'; orderName?: string; code?: string };

// Records or updates the affiliate order for a Shopify order. Safe to call many times (idempotent).
export async function processShopifyOrder(order: any, opts: { chargeback?: boolean; source: string }): Promise<Result> {
  const codes = codesOnOrder(order);
  if (!codes.length) return { matched: false };

  return tx(async (c) => {
    const existing = (await c.query(`select * from affiliate_orders where shopify_order_id = $1 for update`, [order.id])).rows[0];
    let codeRow = existing
      ? (await c.query(`select ac.*, i.commission_rate as inf_rate from affiliate_codes ac join influencers i on i.id = ac.influencer_id where ac.id = $1`, [existing.code_id])).rows[0]
      : (await c.query(
          `select ac.*, i.commission_rate as inf_rate, i.status as inf_status
             from affiliate_codes ac join influencers i on i.id = ac.influencer_id
            where upper(ac.code) = any($1::text[]) and ac.status = 'active' and i.status = 'approved' limit 1`,
          [codes]
        )).rows[0];
    if (!codeRow) return { matched: false };

    // The commission rate is frozen when the order is first recorded.
    const rate = existing ? Number(existing.commission_rate) : Number(codeRow.inf_rate);
    const r = computeCommission(order, rate, opts.chargeback);

    if (!existing) {
      const ins = (await c.query(
        `insert into affiliate_orders (shopify_order_id, order_name, influencer_id, code_id, code_used, ordered_at, products_summary, currency,
            order_subtotal, discount_amount, eligible_amount, commission_rate, commission_amount, status, status_reason, financial_status, is_test)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) returning id`,
        [order.id, order.name, codeRow.influencer_id, codeRow.id, codeRow.code, order.created_at, productsSummary(order), order.currency || 'USD',
         r.subtotal, r.discount, r.eligible, rate, r.commission, r.status ?? 'pending', r.reason, order.financial_status ?? null, Boolean(codeRow.is_test)]
      )).rows[0];
      await audit({ label: `system:${opts.source}` }, 'order.recorded', 'affiliate_order', ins.id,
        { order: order.name, code: codeRow.code, eligible: r.eligible, commission: r.commission, status: r.status ?? 'pending' }, c);
      const inf = (await c.query(`select u.email, u.full_name from influencers i join users u on u.id = i.user_id where i.id = $1`, [codeRow.influencer_id])).rows[0];
      if (inf && !r.status) queueMicrotask(() => sendEmail(inf.email, 'newOrder', { name: inf.full_name, order: order.name, commission: money(r.commission, order.currency) }));
      return { matched: true, action: 'created', orderName: order.name, code: codeRow.code };
    }

    // Paid commissions are never changed automatically; an admin adjustment is needed instead.
    if (existing.status === 'paid') {
      if (r.status) await audit({ label: `system:${opts.source}` }, 'order.change_after_payout', 'affiliate_order', existing.id, { reason: r.reason }, c);
      return { matched: true, action: 'unchanged', orderName: order.name };
    }
    const newStatus = r.status ?? (existing.status === 'cancelled' || existing.status === 'refunded' ? 'pending' : existing.status);
    const changed = Number(existing.eligible_amount) !== r.eligible || Number(existing.commission_amount) !== r.commission || existing.status !== newStatus;
    if (!changed) return { matched: true, action: 'unchanged', orderName: order.name };
    await c.query(
      `update affiliate_orders set eligible_amount=$2, commission_amount=$3, discount_amount=$4, status=$5, status_reason=$6, financial_status=$7, updated_at=now() where id=$1`,
      [existing.id, r.eligible, r.commission, r.discount, newStatus, r.reason, order.financial_status ?? null]
    );
    await audit({ label: `system:${opts.source}` }, 'order.updated', 'affiliate_order', existing.id,
      { order: order.name, from: { status: existing.status, commission: existing.commission_amount }, to: { status: newStatus, commission: r.commission }, reason: r.reason }, c);
    if (existing.status !== newStatus) {
      const inf = (await c.query(`select u.email, u.full_name from influencers i join users u on u.id = i.user_id where i.id = $1`, [existing.influencer_id])).rows[0];
      if (inf) queueMicrotask(() => sendEmail(inf.email, 'commissionStatus', { name: inf.full_name, order: order.name, status: newStatus }));
    }
    return { matched: true, action: 'updated', orderName: order.name };
  });
}

// Moves pending commissions to approved once the return window has passed.
export async function approveMaturedCommissions(): Promise<number> {
  const s = await one<{ hold_days: number }>('select hold_days from settings where id = 1');
  return tx(async (c) => {
    const rows = (await c.query(
      `update affiliate_orders set status='approved', status_reason='Return window passed', updated_at=now()
        where status='pending' and ordered_at < now() - ($1 || ' days')::interval returning id, order_name`,
      [String(s?.hold_days ?? 30)]
    )).rows;
    for (const r of rows) await audit({ label: 'system:auto-approve' }, 'commission.auto_approved', 'affiliate_order', r.id, { order: r.order_name }, c);
    return rows.length;
  });
}
