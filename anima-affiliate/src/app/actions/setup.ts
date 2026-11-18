'use server';
import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'crypto';
import { one, q } from '@/lib/db';
import { hashPassword, startSession } from '@/lib/auth';
import { audit } from '@/lib/audit';

// One-time creation of the first admin, from the browser. Works only while no admin exists
// and only with the SETUP_TOKEN set in the hosting settings.
export async function setupAdminAction(fd: FormData) {
  const expected = process.env.SETUP_TOKEN || '';
  const token = String(fd.get('token') || '');
  const a = Buffer.from(token), b = Buffer.from(expected);
  if (expected.length < 16 || a.length !== b.length || !timingSafeEqual(a, b)) redirect('/setup?err=' + encodeURIComponent('Setup code is incorrect.'));
  if (await one(`select 1 from users where role = 'admin'`)) redirect('/login?msg=' + encodeURIComponent('Setup is already complete. Please sign in.'));
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const name = String(fd.get('name') || '').trim() || 'Anima Admin';
  const password = String(fd.get('password') || '');
  if (!/^\S+@\S+\.\S+$/.test(email)) redirect('/setup?err=' + encodeURIComponent('Enter a valid email.'));
  if (password.length < 12) redirect('/setup?err=' + encodeURIComponent('Password must be at least 12 characters.'));
  const row = await one<{ id: string }>(`insert into users (email, password_hash, role, full_name) values ($1,$2,'admin',$3)
    on conflict (email) do update set role = 'admin', password_hash = excluded.password_hash returning id`, [email, await hashPassword(password), name]);
  await audit({ id: row!.id, label: `admin:${email}` }, 'setup.admin_created', 'user', row!.id);
  await startSession(row!.id);
  redirect('/admin');
}
