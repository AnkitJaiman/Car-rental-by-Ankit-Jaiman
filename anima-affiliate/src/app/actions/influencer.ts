'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { one, q, tx } from '@/lib/db';
import { requireUser, requireApprovedInfluencer, hashPassword, verifyPassword } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { normaliseCode, validateCode } from '@/lib/codes';
import { encrypt } from '@/lib/crypto';
import { audit } from '@/lib/audit';
import { sendEmail } from '@/lib/email';

const go = (path: string, key: 'err' | 'msg', text: string) => redirect(`${path}?${key}=${encodeURIComponent(text)}`);

// Approved influencers only. The discount and commission come from the admin-set values, never from the form.
export async function requestCodeAction(fd: FormData) {
  const u = await requireApprovedInfluencer();
  const s = await getSettings();
  const code = normaliseCode(String(fd.get('code') || ''));
  const bad = validateCode(code, s.code_min_length, s.code_max_length);
  if (bad) go('/dashboard/code', 'err', bad);
  const open = await one(`select 1 from affiliate_codes where influencer_id = $1 and status in ('pending_approval','active')`, [u.influencer_id]);
  if (open) go('/dashboard/code', 'err', 'You already have a code that is active or waiting for approval.');
  if (await one('select 1 from affiliate_codes where upper(code) = $1', [code])) go('/dashboard/code', 'err', 'That code is taken. Please try another.');
  const inf = await one<any>('select discount_percent from influencers where id = $1', [u.influencer_id]);
  try {
    await tx(async (c) => {
      const r = (await c.query(`insert into affiliate_codes (influencer_id, code, discount_percent) values ($1,$2,$3) returning id`, [u.influencer_id, code, inf.discount_percent])).rows[0];
      await audit({ id: u.id, label: `influencer:${u.email}` }, 'code.requested', 'affiliate_code', r.id, { code }, c);
    });
  } catch (e: any) {
    if (String(e?.code) === '23505') go('/dashboard/code', 'err', 'That code is taken. Please try another.');
    throw e;
  }
  await sendEmail(u.email, 'codeSubmittedInfluencer', { name: u.full_name, code });
  if (process.env.ADMIN_NOTIFY_EMAIL) await sendEmail(process.env.ADMIN_NOTIFY_EMAIL, 'codeSubmittedAdmin', { name: u.full_name, code });
  revalidatePath('/dashboard/code');
  go('/dashboard/code', 'msg', `Code ${code} submitted for approval.`);
}

const ProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  country: z.string().trim().min(2).max(80),
  instagram_username: z.string().trim().min(1).max(60).transform((s) => s.replace(/^@/, '')),
  instagram_url: z.string().trim().url().max(300),
  tiktok_url: z.union([z.literal(''), z.string().trim().url().max(300)]),
  youtube_url: z.union([z.literal(''), z.string().trim().url().max(300)])
});

export async function updateProfileAction(fd: FormData) {
  const u = await requireUser();
  if (!u.influencer_id) redirect('/admin');
  const p = ProfileSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) go('/dashboard/profile', 'err', `Please check: ${p.error.issues[0].path.join('.')} – ${p.error.issues[0].message}`);
  const d = p.data!;
  await tx(async (c) => {
    await c.query('update users set full_name=$2, phone=$3, country=$4 where id=$1', [u.id, d.full_name, d.phone, d.country]);
    await c.query('update influencers set instagram_username=$2, instagram_url=$3, tiktok_url=$4, youtube_url=$5 where id=$1',
      [u.influencer_id, d.instagram_username, d.instagram_url, d.tiktok_url || null, d.youtube_url || null]);
    await audit({ id: u.id, label: `influencer:${u.email}` }, 'profile.updated', 'influencer', u.influencer_id, undefined, c);
  });
  go('/dashboard/profile', 'msg', 'Profile saved.');
}

const PaySchema = z.object({
  method: z.enum(['paypal', 'wise', 'bank']),
  account_name: z.string().trim().min(2).max(120),
  account: z.string().trim().min(3).max(200),
  extra: z.string().trim().max(300).optional().default('')
});

export async function updatePaymentAction(fd: FormData) {
  const u = await requireUser();
  if (!u.influencer_id) redirect('/admin');
  const p = PaySchema.safeParse(Object.fromEntries(fd));
  if (!p.success) go('/dashboard/profile', 'err', 'Please complete all payment fields.');
  const d = p.data!;
  const masked = d.account.length <= 4 ? '****' : `${d.account.slice(0, 2)}***${d.account.slice(-3)}`;
  const hint = `${d.method === 'paypal' ? 'PayPal' : d.method === 'wise' ? 'Wise' : 'Bank'} · ${masked}`;
  await q('update influencers set payment_details_enc = $2, payment_details_hint = $3 where id = $1', [u.influencer_id, encrypt(JSON.stringify(d)), hint]);
  await audit({ id: u.id, label: `influencer:${u.email}` }, 'payment_details.updated', 'influencer', u.influencer_id, { hint });
  go('/dashboard/profile', 'msg', 'Payment details saved securely.');
}

export async function changePasswordAction(fd: FormData) {
  const u = await requireUser();
  const current = String(fd.get('current') || ''), next = String(fd.get('next') || '');
  const row = await one<any>('select password_hash from users where id = $1', [u.id]);
  if (!(await verifyPassword(current, row.password_hash))) go('/dashboard/profile', 'err', 'Current password is incorrect.');
  if (next.length < 10) go('/dashboard/profile', 'err', 'New password must be at least 10 characters.');
  await q('update users set password_hash = $2 where id = $1', [u.id, await hashPassword(next)]);
  await audit({ id: u.id, label: `influencer:${u.email}` }, 'password.changed', 'user', u.id);
  go('/dashboard/profile', 'msg', 'Password changed.');
}
