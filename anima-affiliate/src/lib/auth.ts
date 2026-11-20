import 'server-only';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { one } from './db';

const COOKIE = 'anima_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
  return new TextEncoder().encode(s);
}

export type SessionUser = {
  id: string;
  email: string;
  role: 'admin' | 'influencer';
  full_name: string;
  influencer_id: string | null;
  influencer_status: 'pending' | 'approved' | 'rejected' | 'suspended' | null;
};

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function startSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE
  });
}
export function endSession() {
  cookies().delete(COOKIE);
}

// Always re-reads the user and status from the database, so a suspension takes effect immediately.
export async function currentUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return await one<SessionUser>(
      `select u.id, u.email, u.role, u.full_name, i.id as influencer_id, i.status as influencer_status
         from users u left join influencers i on i.user_id = u.id where u.id = $1`,
      [payload.sub]
    );
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) redirect('/login');
  return u;
}
export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (u.role !== 'admin') redirect('/dashboard');
  return u;
}
// Affiliate features: approved influencers only. Everyone else is sent to the status page.
export async function requireApprovedInfluencer(): Promise<SessionUser & { influencer_id: string }> {
  const u = await requireUser();
  if (u.role === 'admin') redirect('/admin');
  if (!u.influencer_id || u.influencer_status !== 'approved') redirect('/dashboard/status');
  return u as SessionUser & { influencer_id: string };
}
