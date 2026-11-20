import { requireApprovedInfluencer } from '@/lib/auth';
import { q, one } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { Badge, Notice } from '@/components/ui';
import { pct, fmtDate } from '@/lib/money';
import { requestCodeAction } from '../../actions/influencer';
export const metadata = { title: 'My code' };

export default async function CodePage({ searchParams }: { searchParams: { err?: string; msg?: string } }) {
  const u = await requireApprovedInfluencer();
  const [codes, inf, s] = await Promise.all([
    q<any>('select id, code, status, discount_percent, requested_at, decided_at from affiliate_codes where influencer_id = $1 order by requested_at desc', [u.influencer_id]),
    one<any>('select discount_percent, commission_rate from influencers where id = $1', [u.influencer_id]),
    getSettings()
  ]);
  const active = codes.find((c) => c.status === 'active');
  const pending = codes.find((c) => c.status === 'pending_approval');
  const store = process.env.STORE_URL || 'https://animajewel.store';
  const app = process.env.APP_URL || '';
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Affiliate code</p><h1>My code</h1></div></div>
      <Notice err={searchParams.err} msg={searchParams.msg} />
      {active ? (
        <div className="card card--soft" style={{ textAlign: 'center', padding: 36 }}>
          <p className="stat__label">Your active code</p>
          <p className="code-display" style={{ margin: '8px 0' }}>{active.code}</p>
          <p className="muted">Gives your followers <strong>{pct(active.discount_percent)} off</strong> · you earn <strong>{pct(inf.commission_rate)}</strong> commission</p>
          <p className="small" style={{ marginTop: 16 }}>Share link (applies the code automatically):<br /><code>{app}/r/{active.code}</code></p>
          <p className="small muted">Or customers enter <strong>{active.code}</strong> at checkout on {store.replace(/^https?:\/\//, '')}.</p>
        </div>
      ) : pending ? (
        <div className="card card--soft" style={{ textAlign: 'center', padding: 36 }}>
          <p className="stat__label">Waiting for approval</p>
          <p className="code-display" style={{ margin: '8px 0' }}>{pending.code}</p>
          <p className="muted">Our team will activate your code shortly. We will email you when it is live.</p>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 620 }}>
          <h2>Create your code</h2>
          <p className="muted small">Choose a memorable code ({s.code_min_length}–{s.code_max_length} letters and numbers), for example your name: <strong>ANNA10</strong>. Your followers get <strong>{pct(inf.discount_percent)} off</strong>; the discount and your commission are set by Anima Jewels. Codes go live after approval.</p>
          <form action={requestCodeAction} className="form" style={{ marginTop: 12 }}>
            <label><span>Code</span><input name="code" required minLength={s.code_min_length} maxLength={s.code_max_length} pattern="[A-Za-z0-9]+" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }} /></label>
            <button className="btn" type="submit">Submit for approval</button>
          </form>
        </div>
      )}
      <div className="section">
        <h2>Code history</h2>
        <div className="tablewrap"><table>
          <thead><tr><th>Code</th><th>Discount</th><th>Status</th><th>Requested</th><th>Decided</th></tr></thead>
          <tbody>{codes.length ? codes.map((c) => (
            <tr key={c.id}><td><strong>{c.code}</strong></td><td>{pct(c.discount_percent)}</td><td><Badge status={c.status} /></td><td>{fmtDate(c.requested_at)}</td><td>{fmtDate(c.decided_at)}</td></tr>
          )) : <tr><td colSpan={5} className="empty">No codes yet.</td></tr>}</tbody>
        </table></div>
      </div>
    </>
  );
}
