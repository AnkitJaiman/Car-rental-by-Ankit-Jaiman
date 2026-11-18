import { requireApprovedInfluencer } from '@/lib/auth';
import { q } from '@/lib/db';
import { money, pct, fmtDate } from '@/lib/money';
import { Badge } from '@/components/ui';
export const metadata = { title: 'Orders' };

// Only this influencer's orders, and never any customer details.
export default async function Orders({ searchParams }: { searchParams: { status?: string } }) {
  const u = await requireApprovedInfluencer();
  const statuses = ['pending', 'approved', 'paid', 'cancelled', 'refunded'];
  const st = statuses.includes(searchParams.status || '') ? searchParams.status : null;
  const rows = await q<any>(
    `select order_name, ordered_at, products_summary, order_subtotal, discount_amount, eligible_amount, code_used, commission_rate, commission_amount, status, status_reason
       from affiliate_orders where influencer_id = $1 and ($2::commission_status is null or status = $2) order by ordered_at desc limit 500`,
    [u.influencer_id, st]);
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Order tracking</p><h1>Orders</h1></div></div>
      <div className="filters">
        <a href="/dashboard/orders" aria-current={!st ? 'true' : undefined}>All</a>
        {statuses.map((s) => <a key={s} href={`/dashboard/orders?status=${s}`} aria-current={st === s ? 'true' : undefined}>{s}</a>)}
      </div>
      <div className="tablewrap"><table>
        <thead><tr><th>Order ID</th><th>Date</th><th>Products</th><th className="num">Order amount</th><th className="num">Discount</th><th>Code</th><th className="num">Commission</th><th>Status</th></tr></thead>
        <tbody>{rows.length ? rows.map((o) => (
          <tr key={o.order_name}>
            <td>{o.order_name}</td><td>{fmtDate(o.ordered_at)}</td><td className="small">{o.products_summary}</td>
            <td className="num">{money(o.order_subtotal)}</td><td className="num">−{money(o.discount_amount)}</td><td>{o.code_used}</td>
            <td className="num">{money(o.commission_amount)}<div className="small muted">{pct(o.commission_rate)} of {money(o.eligible_amount)}</div></td>
            <td><Badge status={o.status} />{o.status_reason ? <div className="small muted">{o.status_reason}</div> : null}</td>
          </tr>
        )) : <tr><td colSpan={8} className="empty">No orders{st ? ` with status “${st}”` : ''} yet.</td></tr>}</tbody>
      </table></div>
      <p className="small muted" style={{ marginTop: 12 }}>Commission is calculated on the product value we receive, excluding shipping and taxes. Cancelled, refunded and charged-back orders earn no commission. Commissions stay pending through the return window.</p>
    </>
  );
}
