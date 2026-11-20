import { q } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { shopifyConfigured } from '@/lib/shopify';
import { Notice } from '@/components/ui';
import { updateSettingsAction, syncOrdersAction } from '../../actions/admin';
export const metadata = { title: 'Settings' };

export default async function Settings({ searchParams }: { searchParams: { err?: string; msg?: string } }) {
  const s = await getSettings();
  const emails = await q<any>('select * from email_log order by created_at desc limit 25');
  const connected = shopifyConfigured();
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Admin</p><h1>Settings</h1></div></div>
      <Notice err={searchParams.err} msg={searchParams.msg} />
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <form action={updateSettingsAction} className="card form">
          <h2>Program rules</h2>
          <div className="row">
            <label><span>Default commission %</span><input name="default_commission_rate" type="number" step="0.5" defaultValue={Number(s.default_commission_rate)} /></label>
            <label><span>Default follower discount %</span><input name="default_discount_percent" type="number" step="0.5" defaultValue={Number(s.default_discount_percent)} /></label>
          </div>
          <div className="row">
            <label><span>Maximum discount %</span><input name="max_discount_percent" type="number" step="0.5" defaultValue={Number(s.max_discount_percent)} /></label>
            <label><span>Return window (days before approval)</span><input name="hold_days" type="number" defaultValue={s.hold_days} /></label>
          </div>
          <div className="row">
            <label><span>Code min length</span><input name="code_min_length" type="number" defaultValue={s.code_min_length} /></label>
            <label><span>Code max length</span><input name="code_max_length" type="number" defaultValue={s.code_max_length} /></label>
          </div>
          <button className="btn btn--sm" type="submit">Save rules</button>
        </form>
        <div className="grid">
          <div className="card">
            <h2>Shopify</h2>
            <p>{connected ? <span className="badge badge--active">Connected</span> : <span className="badge badge--pending">Not connected</span>} <span className="small muted">{process.env.SHOPIFY_STORE_DOMAIN}</span></p>
            <p className="small muted">Orders arrive automatically by webhook. Use sync to catch up on anything missed.</p>
            <form action={syncOrdersAction} className="actions"><select name="days" defaultValue="30" style={{ width: 'auto' }}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><button className="btn btn--sm btn--ghost" type="submit" disabled={!connected}>Sync orders now</button></form>
          </div>
          <div className="card">
            <h2>Email</h2>
            <p className="small">{process.env.RESEND_API_KEY ? <span className="badge badge--active">Sending</span> : <span className="badge badge--pending">Logging only</span>} <span className="muted">from {process.env.EMAIL_FROM || 'not set'}</span></p>
            <table><tbody>{emails.map((e) => <tr key={e.id}><td className="small">{new Date(e.created_at).toLocaleString('en-US')}</td><td className="small">{e.to_email}<div className="muted">{e.subject}</div></td><td><span className={`badge badge--${e.status === 'failed' ? 'rejected' : e.status === 'sent' ? 'active' : 'pending'}`}>{e.status}</span></td></tr>)}</tbody></table>
          </div>
        </div>
      </div>
    </>
  );
}
