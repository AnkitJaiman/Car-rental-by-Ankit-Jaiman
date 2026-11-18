import Link from 'next/link';
import { one, q } from '@/lib/db';
import { monthlySeries } from '@/lib/stats';
import { money } from '@/lib/money';
import { Stat, BarChart } from '@/components/ui';
export const metadata = { title: 'Admin overview' };

export default async function AdminHome() {
  const [i, o, p, codes, series, top] = await Promise.all([
    one<any>(`select count(*)::int total, count(*) filter (where status='pending')::int pending, count(*) filter (where status='approved')::int approved,
                     count(*) filter (where status='rejected')::int rejected, count(*) filter (where status='suspended')::int suspended from influencers`),
    one<any>(`select count(*) filter (where status not in ('cancelled','refunded'))::int orders,
                     coalesce(sum(eligible_amount) filter (where status not in ('cancelled','refunded')),0) revenue,
                     coalesce(sum(commission_amount) filter (where status in ('pending','approved')),0) payable,
                     coalesce(sum(commission_amount) filter (where status='approved'),0) approved,
                     coalesce(sum(commission_amount) filter (where status='pending'),0) pending from affiliate_orders`),
    one<any>(`select coalesce(sum(amount),0) paid from payouts`),
    one<any>(`select count(*) filter (where status='pending_approval')::int pending, count(*) filter (where status='active')::int active from affiliate_codes`),
    monthlySeries(null, 6),
    q<any>(`select i.id, u.full_name, count(o.id) filter (where o.status not in ('cancelled','refunded'))::int orders,
                   coalesce(sum(o.eligible_amount) filter (where o.status not in ('cancelled','refunded')),0) revenue
              from influencers i join users u on u.id = i.user_id left join affiliate_orders o on o.influencer_id = i.id
             where i.status = 'approved' group by i.id, u.full_name order by revenue desc limit 5`)
  ]);
  const adj = await one<any>('select coalesce(sum(amount) filter (where payout_id is null),0) unpaid from commission_adjustments');
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Anima Jewels</p><h1>Affiliate programme</h1></div>
        <div className="actions"><a className="btn btn--sm btn--ghost" href="/admin/export/influencers">Export influencers</a><a className="btn btn--sm btn--ghost" href="/admin/export/orders">Export orders</a></div>
      </div>
      {(i.pending > 0 || codes.pending > 0) && (
        <p className="alert">Waiting for you: {i.pending > 0 && <Link href="/admin/influencers?status=pending"><strong>{i.pending}</strong> application{i.pending > 1 ? 's' : ''}</Link>}{i.pending > 0 && codes.pending > 0 ? ' · ' : ''}{codes.pending > 0 && <Link href="/admin/codes"><strong>{codes.pending}</strong> code request{codes.pending > 1 ? 's' : ''}</Link>}</p>
      )}
      <div className="grid grid-4">
        <Stat label="Registered influencers" value={i.total} sub={`${i.pending} pending · ${i.approved} approved`} />
        <Stat label="Rejected / suspended" value={`${i.rejected} / ${i.suspended}`} />
        <Stat label="Affiliate orders" value={o.orders} sub={`${codes.active} active codes`} />
        <Stat label="Affiliate revenue" value={money(o.revenue)} sub="Eligible product value" />
      </div>
      <div className="grid grid-3" style={{ marginTop: 16 }}>
        <Stat label="Commission payable" value={money(Number(o.payable) + Number(adj.unpaid))} sub={`${money(o.pending)} pending · ${money(o.approved)} approved`} />
        <Stat label="Ready to pay now" value={money(Number(o.approved) + Number(adj.unpaid))} sub={<Link href="/admin/payouts">Go to payouts</Link>} />
        <Stat label="Commission paid" value={money(p.paid)} />
      </div>
      <div className="grid grid-2 section" style={{ alignItems: 'start' }}>
        <div className="card"><h2>Affiliate revenue by month</h2><BarChart data={series.map((s: any) => ({ label: s.label, value: s.revenue }))} format={(n) => money(n)} /></div>
        <div className="card"><h2>Top influencers</h2>
          {top.length ? <table><tbody>{top.map((t: any) => <tr key={t.id}><td><Link href={`/admin/influencers/${t.id}`}>{t.full_name}</Link></td><td className="num">{t.orders} orders</td><td className="num">{money(t.revenue)}</td></tr>)}</tbody></table>
            : <p className="muted">No approved influencers yet.</p>}
        </div>
      </div>
      <p className="small muted section">Shopper (customer) accounts are managed in Shopify admin › Customers.</p>
    </>
  );
}
