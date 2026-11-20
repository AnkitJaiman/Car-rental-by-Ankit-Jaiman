import Link from 'next/link';
import { q } from '@/lib/db';
import { Badge, Notice, TestTag } from '@/components/ui';
import { pct, fmtDate } from '@/lib/money';
import { decideCodeAction } from '../../actions/admin';
export const metadata = { title: 'Affiliate codes' };

const STATUSES = ['pending_approval', 'active', 'rejected', 'disabled'];
export default async function Codes({ searchParams }: { searchParams: { status?: string; err?: string; msg?: string } }) {
  const st = STATUSES.includes(searchParams.status || '') ? searchParams.status! : null;
  const rows = await q<any>(
    `select ac.*, u.full_name, i.status as inf_status, (select count(*)::int from clicks c where c.code_id = ac.id) as clicks,
            (select count(*)::int from affiliate_orders o where o.code_id = ac.id and o.status not in ('cancelled','refunded')) as orders
       from affiliate_codes ac join influencers i on i.id = ac.influencer_id join users u on u.id = i.user_id
      where ($1::code_status is null or ac.status = $1) order by (ac.status='pending_approval') desc, ac.requested_at desc limit 500`, [st]);
  const Btn = ({ id, d, label, cls }: { id: string; d: string; label: string; cls?: string }) => (
    <form action={decideCodeAction}><input type="hidden" name="code_id" value={id} /><input type="hidden" name="decision" value={d} /><input type="hidden" name="return_to" value={`/admin/codes${st ? `?status=${st}` : ''}`} /><button className={`btn btn--sm ${cls ?? ''}`} type="submit">{label}</button></form>
  );
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Programme</p><h1>Affiliate codes</h1></div></div>
      <Notice err={searchParams.err} msg={searchParams.msg} />
      <div className="filters">
        <a href="/admin/codes" aria-current={!st ? 'true' : undefined}>All</a>
        {STATUSES.map((s) => <a key={s} href={`/admin/codes?status=${s}`} aria-current={st === s ? 'true' : undefined}>{s.replace('_', ' ')}</a>)}
      </div>
      <div className="tablewrap"><table>
        <thead><tr><th>Code</th><th>Influencer</th><th>Discount</th><th>Status</th><th className="num">Clicks</th><th className="num">Orders</th><th>Requested</th><th>Actions</th></tr></thead>
        <tbody>{rows.length ? rows.map((c) => (
          <tr key={c.id}><td><strong>{c.code}</strong><TestTag show={c.is_test} /></td><td><Link href={`/admin/influencers/${c.influencer_id}`}>{c.full_name}</Link> <Badge status={c.inf_status} /></td>
            <td>{pct(c.discount_percent)}</td><td><Badge status={c.status} /></td><td className="num">{c.clicks}</td><td className="num">{c.orders}</td><td className="small">{fmtDate(c.requested_at)}</td>
            <td><div className="actions">
              {c.status === 'pending_approval' && <><Btn id={c.id} d="approve" label="Approve & activate" cls="btn--ok" /><Btn id={c.id} d="reject" label="Reject" cls="btn--danger" /></>}
              {c.status === 'active' && <Btn id={c.id} d="disable" label="Disable" cls="btn--danger" />}
              {c.status === 'disabled' && c.inf_status === 'approved' && <Btn id={c.id} d="enable" label="Re-activate" />}
            </div></td></tr>
        )) : <tr><td colSpan={8} className="empty">No codes.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
