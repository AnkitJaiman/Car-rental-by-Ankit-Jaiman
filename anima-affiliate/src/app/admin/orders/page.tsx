import Link from 'next/link';
import { q } from '@/lib/db';
import { Badge, Notice, TestTag } from '@/components/ui';
import { money, pct, fmtDate } from '@/lib/money';
import { setOrderStatusAction } from '../../actions/admin';
export const metadata = { title: 'Affiliate orders' };

const STATUSES = ['pending', 'approved', 'paid', 'cancelled', 'refunded'];
export default async function Orders({ searchParams }: { searchParams: { status?: string; q?: string; err?: string; msg?: string } }) {
  const st = STATUSES.includes(searchParams.status || '') ? searchParams.status! : null;
  const term = (searchParams.q || '').trim().slice(0, 60);
  const rows = await q<any>(
    `select o.*, u.full_name from affiliate_orders o join influencers i on i.id = o.influencer_id join users u on u.id = i.user_id
      where ($1::commission_status is null or o.status = $1) and ($2 = '' or o.order_name ilike '%'||$2||'%' or o.code_used ilike '%'||$2||'%' or u.full_name ilike '%'||$2||'%')
      order by o.ordered_at desc limit 500`, [st, term]);
  const self = `/admin/orders${st ? `?status=${st}` : ''}`;
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Tracking</p><h1>Affiliate orders</h1></div><a className="btn btn--sm btn--ghost" href={`/admin/export/orders${st ? `?status=${st}` : ''}`}>Export CSV</a></div>
      <Notice err={searchParams.err} msg={searchParams.msg} />
      <div className="filters">
        <a href="/admin/orders" aria-current={!st ? 'true' : undefined}>All</a>
        {STATUSES.map((s) => <a key={s} href={`/admin/orders?status=${s}`} aria-current={st === s ? 'true' : undefined}>{s}</a>)}
        <form method="get">{st && <input type="hidden" name="status" value={st} />}<input name="q" defaultValue={term} placeholder="Order #, code or influencer" /><button className="btn btn--sm" type="submit">Search</button></form>
      </div>
      <div className="tablewrap"><table>
        <thead><tr><th>Order</th><th>Date</th><th>Influencer / code</th><th className="num">Subtotal</th><th className="num">Discount</th><th className="num">Eligible</th><th className="num">Commission</th><th>Status</th><th>Change</th></tr></thead>
        <tbody>{rows.length ? rows.map((o) => (
          <tr key={o.id}><td>{o.order_name}<TestTag show={o.is_test} /></td><td className="small">{fmtDate(o.ordered_at)}</td>
            <td><Link href={`/admin/influencers/${o.influencer_id}`}>{o.full_name}</Link><div className="small muted">{o.code_used}</div></td>
            <td className="num">{money(o.order_subtotal)}</td><td className="num">−{money(o.discount_amount)}</td><td className="num">{money(o.eligible_amount)}</td>
            <td className="num">{money(o.commission_amount)}<div className="small muted">{pct(o.commission_rate)}</div></td>
            <td><Badge status={o.status} />{o.status_reason && <div className="small muted">{o.status_reason}</div>}</td>
            <td>{o.status !== 'paid' && <form action={setOrderStatusAction} className="actions"><input type="hidden" name="order_id" value={o.id} /><input type="hidden" name="return_to" value={self} />
              <select name="status" defaultValue={o.status} style={{ width: 'auto', padding: '6px 8px' }}>{['pending', 'approved', 'cancelled', 'refunded'].map((s) => <option key={s}>{s}</option>)}</select>
              <button className="btn btn--sm btn--ghost" type="submit">Set</button></form>}</td></tr>
        )) : <tr><td colSpan={9} className="empty">No affiliate orders yet. They appear automatically when a customer uses an affiliate code.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
