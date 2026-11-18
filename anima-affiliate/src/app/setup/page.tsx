import { redirect } from 'next/navigation';
import AuthShell from '@/components/AuthShell';
import { Notice } from '@/components/ui';
import { one } from '@/lib/db';
import { setupAdminAction } from '../actions/setup';
export const metadata = { title: 'First-time setup' };
export const dynamic = 'force-dynamic';

export default async function Setup({ searchParams }: { searchParams: { err?: string } }) {
  let ready = true;
  try { if (await one(`select 1 from users where role = 'admin'`)) redirect('/login'); } catch (e: any) {
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    ready = false;
  }
  return (
    <AuthShell>
      <p className="eyebrow">First-time setup</p>
      <h1>Create the admin account</h1>
      {!ready ? <p className="alert alert--error">The database is not ready. Run db/schema.sql in the Supabase SQL editor first, then reload this page.</p> : <>
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
