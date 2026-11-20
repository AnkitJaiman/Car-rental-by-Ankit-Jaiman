'use server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { q, one, tx } from '@/lib/db';
import { hashPassword, verifyPassword, startSession, endSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { sendEmail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { limited } from '@/lib/ratelimit';
import { randomToken, sha256 } from '@/lib/crypto';

const ip = () => headers().get('x-forwarded-for')?.split(',')[0].trim() || 'local';
const back = (path: string, err: string) => redirect(`${path}?err=${encodeURIComponent(err)}`);

export async function loginAction(fd: FormData) {
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const password = String(fd.get('password') || '');
  if (limited(`login:${ip()}`, 10, 15 * 60_000) || limited(`login:${email}`, 6, 15 * 60_000)) back('/login', 'Too many attempts. Please wait 15 minutes and try again.');
  const user = await one<{ id: string; password_hash: string; role: string }>('select id, password_hash, role from users where email = $1', [email]);
  if (!user || !(await verifyPassword(password, user.password_hash))) back('/login', 'Email or password is incorrect.');
  await q('update users set last_login_at = now() where id = $1', [user!.id]);
  await startSession(user!.id);
  redirect(user!.role === 'admin' ? '/admin' : '/dashboard');
}

export async function logoutAction() {
  endSession();
  redirect('/login');
}

const url = z.string().trim().url('Enter a full link starting with https://').max(300);
const optUrl = z.union([z.literal(''), url]);
const ApplySchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(10, 'Password must be at least 10 characters').max(200),
  phone: z.string().trim().min(6, 'Enter your phone number').max(40),
  country: z.string().trim().min(2, 'Enter your country').max(80),
  instagram_username: z.string().trim().min(1, 'Enter your Instagram username').max(60).transform((s) => s.replace(/^@/, '')),
  instagram_url: url,
  tiktok_url: optUrl,
  youtube_url: optUrl,
  total_followers: z.coerce.number().int('Followers must be a whole number').min(0).max(1_000_000_000),
  audience_country: z.string().trim().min(2, 'Enter your main audience country').max(80),
  content_category: z.string().trim().min(2, 'Choose a content category').max(80),
  introduction: z.string().trim().min(20, 'Tell us a little more about you (20+ characters)').max(1500),
  why_collaborate: z.string().trim().min(20, 'Tell us why you want to collaborate (20+ characters)').max(1500),
  terms: z.literal('on', { errorMap: () => ({ message: 'Please accept the program terms' }) })
});

export async function applyAction(fd: FormData) {
  if (limited(`apply:${ip()}`, 5, 60 * 60_000)) back('/apply', 'Too many applications from this connection. Please try again later.');
  const parsed = ApplySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) back('/apply', parsed.error.issues[0].message);
  const d = parsed.data!;
  if (await one('select 1 from users where email = $1', [d.email])) back('/apply', 'An account with this email already exists. Please sign in instead.');
  const s = await getSettings();
  const hash = await hashPassword(d.password);
  const userId = await tx(async (c) => {
    const u = (await c.query(
      `insert into users (email, password_hash, role, full_name, phone, country) values ($1,$2,'influencer',$3,$4,$5) returning id`,
      [d.email, hash, d.full_name, d.phone, d.country]
    )).rows[0];
    const inf = (await c.query(
      `insert into influencers (user_id, instagram_username, instagram_url, tiktok_url, youtube_url, total_followers, audience_country,
          content_category, introduction, why_collaborate, commission_rate, discount_percent, max_discount_percent)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id`,
      [u.id, d.instagram_username, d.instagram_url, d.tiktok_url || null, d.youtube_url || null, d.total_followers, d.audience_country,
       d.content_category, d.introduction, d.why_collaborate, s.default_commission_rate, s.default_discount_percent, s.max_discount_percent]
    )).rows[0];
    await audit({ id: u.id, label: `influencer:${d.email}` }, 'application.submitted', 'influencer', inf.id, { instagram: d.instagram_username, followers: d.total_followers }, c);
    return u.id as string;
  });
  await sendEmail(d.email, 'applicationReceived', { name: d.full_name });
  if (process.env.ADMIN_NOTIFY_EMAIL) await sendEmail(process.env.ADMIN_NOTIFY_EMAIL, 'applicationAdmin', { name: d.full_name, instagram: '@' + d.instagram_username, followers: d.total_followers });
  await startSession(userId);
  redirect('/dashboard/status?applied=1');
}

export async function forgotAction(fd: FormData) {
  const email = String(fd.get('email') || '').trim().toLowerCase();
  if (!limited(`forgot:${ip()}`, 5, 60 * 60_000)) {
    const user = await one<{ id: string; full_name: string }>('select id, full_name from users where email = $1', [email]);
    if (user) {
      const token = randomToken();
      await q(`insert into password_resets (token_hash, user_id, expires_at) values ($1,$2, now() + interval '1 hour')`, [sha256(token), user.id]);
      await sendEmail(email, 'passwordReset', { name: user.full_name, url: `/reset/${token}` });
    }
  }
  // Same answer whether or not the email exists, so accounts cannot be discovered.
  redirect('/forgot?msg=' + encodeURIComponent('If that email has an account, a reset link is on its way.'));
}

export async function resetAction(fd: FormData) {
  const token = String(fd.get('token') || '');
  const password = String(fd.get('password') || '');
  if (password.length < 10) back(`/reset/${token}`, 'Password must be at least 10 characters.');
  const row = await one<{ user_id: string }>(
    `select user_id from password_resets where token_hash = $1 and used_at is null and expires_at > now()`, [sha256(token)]);
  if (!row) back('/forgot', 'This reset link is invalid or has expired. Please request a new one.');
  await tx(async (c) => {
    await c.query('update users set password_hash = $2 where id = $1', [row!.user_id, await hashPassword(password)]);
    await c.query('update password_resets set used_at = now() where token_hash = $1', [sha256(token)]);
    await audit({ id: row!.user_id, label: 'user' }, 'password.reset', 'user', row!.user_id, undefined, c);
  });
  redirect('/login?msg=' + encodeURIComponent('Password updated. Please sign in.'));
}
