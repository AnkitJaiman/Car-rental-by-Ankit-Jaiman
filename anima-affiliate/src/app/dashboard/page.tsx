import Link from 'next/link';
import { requireApprovedInfluencer } from '@/lib/auth';
import { one, q } from '@/lib/db';
import { influencerTotals, monthlySeries } from '@/lib/stats';
import { money, pct, fmtDate } from '@/lib/money';
import { Stat, Badge, BarChart } from '@/components/ui';
export const metadata = { title: 'Dashboard' };

export default async function Overview() {
  const u = await requireApprovedInfluencer();
  const [t, series, inf, code, recent] = await Promise.all([
    influencerTotals(u.influencer_id),
    monthlySeries(u.influencer_id, 6),
    one<any>('select commission_rate from influencers where id = $1', [u.influencer_id]),
    one<any>(`select code, status, discount_percent from affiliate_codes where influencer_id = $1 order by (status='active') desc, requested_at desc limit 1`, [u.influencer_id]),
    q<any>(`select order_name, ordered_at, eligible_amount, commission_amount, status from affiliate_orders where influencer_id = $1 order by ordered_at desc limit 5`, [u.influencer_id])
  ]);
  return (
    <>
      <div className="pagehead">
        <div><p className="eyebrow">Welcome back</p><h1>{u.full_name}</h1></div>
        <div className="card card--soft" style={{ padding: '14px 18px' }}>
          <div className="stat__label">Active code</div>
          {code ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="code-display" style={{ fontSize: 22 }}>{code.code}</span><Badge status={code.status} /></div>
                : <Link href="/dashboard/code">Create your code →</Link>}
        </div>
      </div>
      <div className="grid grid-4">
        <Stat label="Orders" value={t.valid_orders} sub={`${t.orders} total incl. cancelled`} />
        <Stat label="Sales generated" value={money(t.sales)} sub="Eligible product value" />
        <Stat label="Commission earned" value={money(Number(t.earned) + t.adjustments)} sub={`At ${pct(inf.commission_rate)}`} />
        <Stat label="Conversion rate" value={t.conversion == null ? '—' : `${t.conversion.toFixed(1)}%`} sub={`${t.clicks} link clicks`} />
      </div>
      <div className="grid grid-3 section" style={{ marginTop: 16 }}>
        <Stat label="Pending" value={money(t.pending)} sub="Inside the return window" />
        <Stat label="Approved" value={money(t.approved)} sub="Ready for the next payout" />
        <Stat label="Paid" value={money(t.paid)} />
      </div>
      <div className="card section">
        <h2>Monthly performance</h2>
        <p className="muted small">Commission per month (last 6 months)</p>
        <BarChart data={series.map((s: any) => ({ label: s.label, value: s.commission }))} format={(n) => money(n)} />
      </div>
      <div className="section">
        <div className="pagehead"><h2 style={{ margin: 0 }}>Recent orders</h2><Link href="/dashboard/orders" className="small">View all</Link></div>
        <div className="tablewrap"><table>
          <thead><tr><th>Order</th><th>Date</th><th className="num">Eligible amount</th><th className="num">Commission</th><th>Status</th></tr></thead>
          <tbody>{recent.length ? recent.map((o: any) => (
            <tr key={o.order_name}><td>{o.order_name}</td><td>{fmtDate(o.ordered_at)}</td><td className="num">{money(o.eligible_amount)}</td><td className="num">{money(o.commission_amount)}</td><td><Badge status={o.status} /></td></tr>
          )) : <tr><td colSpan={5} className="empty">No orders yet. Share your code to get started.</td></tr>}</tbody>
        </table></div>
      </div>
    </>
  );
}
