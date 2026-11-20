import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { Notice } from '@/components/ui';
import { loginAction } from '../actions/auth';
export const metadata = { title: 'Influencer sign in' };

export default function Login({ searchParams }: { searchParams: { err?: string; msg?: string } }) {
  const store = process.env.STORE_URL || 'https://animajewel.store';
  return (
    <AuthShell>
      <p className="eyebrow">Anima Creators</p>
      <h1>Influencer sign in</h1>
      <p className="muted small">Shopping with us? Use your <a href={`${store}/account/login`}>shopper account</a> instead.</p>
      <Notice err={searchParams.err} msg={searchParams.msg} />
      <form action={loginAction} className="form" style={{ marginTop: 16 }}>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
        <label><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="btn" type="submit">Sign in</button>
      </form>
      <p className="small" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/forgot">Forgot password?</Link>
        <Link href="/apply">Not a partner yet? Apply</Link>
      </p>
    </AuthShell>
  );
}
