import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { one } from '@/lib/db';
import { Notice } from '@/components/ui';
import { pct } from '@/lib/money';
import { updateProfileAction, updatePaymentAction, changePasswordAction } from '../../actions/influencer';
export const metadata = { title: 'Profile' };

export default async function Profile({ searchParams }: { searchParams: { err?: string; msg?: string } }) {
  const u = await requireUser();
  const p = await one<any>(
    `select u.full_name, u.email, u.phone, u.country, i.instagram_username, i.instagram_url, i.tiktok_url, i.youtube_url,
            i.payment_details_hint, i.commission_rate, i.discount_percent, i.status
       from users u join influencers i on i.user_id = u.id where u.id = $1`, [u.id]);
  if (!p) return <p>No profile.</p>;
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Settings</p><h1>Profile</h1></div></div>
      <Notice err={searchParams.err} msg={searchParams.msg} />
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <form action={updateProfileAction} className="card form">
          <h2>Contact & social</h2>
          <label><span>Full name</span><input name="full_name" defaultValue={p.full_name} required /></label>
          <label><span>Email</span><input value={p.email} disabled /></label>
          <div className="row">
            <label><span>Phone</span><input name="phone" defaultValue={p.phone ?? ''} required /></label>
            <label><span>Country</span><input name="country" defaultValue={p.country ?? ''} required /></label>
          </div>
          <label><span>Instagram username</span><input name="instagram_username" defaultValue={p.instagram_username} required /></label>
          <label><span>Instagram URL</span><input name="instagram_url" type="url" defaultValue={p.instagram_url} required /></label>
          <label><span>TikTok URL</span><input name="tiktok_url" type="url" defaultValue={p.tiktok_url ?? ''} /></label>
          <label><span>YouTube URL</span><input name="youtube_url" type="url" defaultValue={p.youtube_url ?? ''} /></label>
          <button className="btn" type="submit">Save profile</button>
        </form>
        <div className="grid">
          {p.status === 'approved' && (
            <form action={updatePaymentAction} className="card form">
              <h2>Payment details</h2>
              <p className="small muted">Stored encrypted. Currently: <strong>{p.payment_details_hint ?? 'not set'}</strong></p>
              <label><span>Method</span><select name="method" defaultValue="paypal"><option value="paypal">PayPal</option><option value="wise">Wise</option><option value="bank">Bank transfer</option></select></label>
              <label><span>Account holder name</span><input name="account_name" required /></label>
              <label><span>PayPal / Wise email, or bank account number</span><input name="account" required autoComplete="off" /></label>
              <label><span>Bank details (routing / SWIFT, if bank)</span><input name="extra" autoComplete="off" /></label>
              <button className="btn" type="submit">Save payment details</button>
            </form>
          )}
          <div className="card card--soft">
            <h2>Your programme terms</h2>
            <dl className="kv"><dt>Commission rate</dt><dd>{pct(p.commission_rate)}</dd><dt>Follower discount</dt><dd>{pct(p.discount_percent)}</dd></dl>
            <p className="small muted">Rates are set by Anima Jewels. <Link href="/terms">Read the full program terms</Link>.</p>
          </div>
          <form action={changePasswordAction} className="card form">
            <h2>Password</h2>
            <label><span>Current password</span><input name="current" type="password" required autoComplete="current-password" /></label>
            <label><span>New password (10+ characters)</span><input name="next" type="password" minLength={10} required autoComplete="new-password" /></label>
            <button className="btn btn--ghost" type="submit">Change password</button>
          </form>
        </div>
      </div>
    </>
  );
}
