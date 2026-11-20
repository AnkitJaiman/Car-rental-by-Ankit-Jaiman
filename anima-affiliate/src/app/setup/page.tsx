import { redirect } from 'next/navigation';
import AuthShell from '@/components/AuthShell';
import { Notice } from '@/components/ui';
import { one } from '@/lib/db';
import { setupAdminAction } from '../actions/setup';
export const metadata = { title: 'First-time setup' };
export const dynamic = 'force-dynamic';

export default async function Setup({ searchParams }: { searchParams: { err?: string } }) {
  let ready = true;
  let why = '';
  try { if (await one(`select 1 from users where role = 'admin'`)) redirect('/login'); } catch (e: any) {
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    ready = false;
    why = explainDbError(e);
  }
  return (
    <AuthShell>
      <p className="eyebrow">First-time setup</p>
      <h1>Create the admin account</h1>
      {!ready ? <p className="alert alert--error">The database is not ready: {why}</p> : <>
        <p className="muted small">This page works once. After the admin exists it closes automatically.</p>
        <Notice err={searchParams.err} />
        <form action={setupAdminAction} className="form" style={{ marginTop: 16 }}>
          <label><span>Setup code (SETUP_TOKEN)</span><input name="token" type="password" required autoComplete="off" /></label>
          <label><span>Admin name</span><input name="name" required /></label>
          <label><span>Admin email</span><input name="email" type="email" required /></label>
          <label><span>Password (12+ characters)</span><input name="password" type="password" minLength={12} required autoComplete="new-password" /></label>
          <button className="btn" type="submit">Create admin</button>
        </form></>}
    </AuthShell>
  );
}

// Plain-language reason for a database connection problem. Never shows the address or password.
function explainDbError(e: any): string {
  const code = String(e?.code || '');
  const msg = String(e?.message || '');
  if (!process.env.DATABASE_URL) return 'DATABASE_URL is missing in Vercel (Settings > Environment Variables). [no-url]';
  if (code === '28P01' || /password authentication failed/i.test(msg)) return `the database password inside DATABASE_URL is wrong. ${urlCheck()} [28P01]`;
  if (code === '42P01' || /relation .* does not exist/i.test(msg)) return 'the tables are missing. Run db/schema.sql in the Supabase SQL editor. [42P01]';
  if (/tenant or user not found/i.test(msg)) return 'the user name in DATABASE_URL is wrong. Use the "Session pooler" link (user looks like postgres.xxxx). [user]';
  if (/ENOTFOUND|getaddrinfo/i.test(msg)) return 'the server address in DATABASE_URL is wrong. Copy the Session pooler link again. [host]';
  if (/ETIMEDOUT|ECONNREFUSED|timeout/i.test(msg)) return 'the database could not be reached. Use the Session pooler link (port 5432) and check the project is not paused. [network]';
  if (/Invalid URL|invalid connection|URI malformed|Cannot read properties of undefined/i.test(msg)) return 'DATABASE_URL is not a valid link. If the password has symbols like @ # % /, they break the link. [format]';
  if (/self.signed|certificate/i.test(msg)) return 'a secure-connection (SSL) problem. [ssl]';
  return `unexpected database error [${code || 'unknown'}].`;
}

// Safe hints about DATABASE_URL so the owner can compare it with their note. Never reveals the password.
function urlCheck(): string {
  try {
    const raw = process.env.DATABASE_URL || '';
    const hints: string[] = [];
    if (raw !== raw.trim()) hints.push('it has a space at the start or end');
    if (/^["']|["']$/.test(raw.trim())) hints.push('it is wrapped in quotes; remove them');
    const u = new URL(raw.trim());
    const pw = decodeURIComponent(u.password);
    hints.push(`the password in Vercel has ${pw.length} characters`);
    if (/[\[\]]/.test(pw)) hints.push('it still contains [ ] brackets');
    if (/\*/.test(pw)) hints.push('it contains * stars');
    if (/\s/.test(pw)) hints.push('it contains a space');
    if (/YOUR-PASSWORD|database ?password/i.test(pw)) hints.push('it is still the placeholder text, not the real password');
    if (!u.username.startsWith('postgres.')) hints.push('the user should start with postgres.');
    return 'Check: ' + hints.join('; ') + '. Compare the length with the password in your note.';
  } catch {
    return 'DATABASE_URL is not a valid link.';
  }
}
