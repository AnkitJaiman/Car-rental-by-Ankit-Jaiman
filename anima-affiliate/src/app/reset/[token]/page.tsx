import AuthShell from '@/components/AuthShell';
import { Notice } from '@/components/ui';
import { resetAction } from '../../actions/auth';
export const metadata = { title: 'Choose a new password' };
export default function Reset({ params, searchParams }: { params: { token: string }; searchParams: { err?: string } }) {
  return (
    <AuthShell>
      <h1>Choose a new password</h1>
      <Notice err={searchParams.err} />
      <form action={resetAction} className="form" style={{ marginTop: 16 }}>
        <input type="hidden" name="token" value={params.token} />
        <label><span>New password (10+ characters)</span><input name="password" type="password" minLength={10} autoComplete="new-password" required /></label>
        <button className="btn" type="submit">Save password</button>
      </form>
    </AuthShell>
  );
}
