import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { Notice } from '@/components/ui';
import { forgotAction } from '../actions/auth';
export const metadata = { title: 'Reset password' };
export default function Forgot({ searchParams }: { searchParams: { err?: string; msg?: string } }) {
  return (
    <AuthShell>
      <h1>Reset your password</h1>
      <Notice err={searchParams.err} msg={searchParams.msg} />
      <form action={forgotAction} className="form" style={{ marginTop: 16 }}>
        <label><span>Email</span><input name="email" type="email" required /></label>
        <button className="btn" type="submit">Send reset link</button>
      </form>
      <p className="small" style={{ marginTop: 18 }}><Link href="/login">Back to sign in</Link></p>
    </AuthShell>
  );
}
