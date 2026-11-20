import Link from 'next/link';
import { q } from '@/lib/db';
import { Notice, TestTag } from '@/components/ui';
import { money, fmtDate } from '@/lib/money';
import { createPayoutAction } from '../../actions/admin';
export const metadata = { title: 'Payouts' };

export default async function Payouts({ searchParams }: { searchParams: { err?: string; msg?: string } }) {
  const due = await q<any>(
    `select i.id, u.full_name, i.payment_details_hint, i.is_test,
            coalesce((select sum(commission_amount) from affiliate_orders o where o.influencer_id = i.id and o.status = 'approved' and o.payout_id is null),0)
          + coalesce((select sum(amount) from commission_adjustments a where a.influencer_id = i.id and a.payout_id is null),0) as balance,
            coalesce((select sum(commission_amount) from affiliate_orders o where o.influencer_id = i.id and o.status = 'pending'),0) as pending
       from influencers i join users u on u.id = i.user_id order by balance desc`);
  const history = await q<any>(`select p.*, u.full_name from payouts p join influencers i on i.id = p.influencer_id join users u on u.id = i.user_id order by p.paid_at desc limit 200`);
  const payable = due.filter((d) => Number(d.balance) > 0);
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Commission</p><h1>Payouts</h1></div><a className="btn btn--sm btn--ghost" href="/admin/export/payouts">Export CSV</a></div>
      <Notice err={searchParams.err} msg={searchParams.msg} />
      <p className="muted small">Pay the influencer first (PayPal, Wise or bank), then record the payout here. Recording marks their approved commissions as paid and emails them.</p>
      <div className="tablewrap"><table>
        <thead><tr><th>Influencer</th><th>Pays to</th><th className="num">Pending</th><th className="num">Ready to pay</th><th>Record payout</th></tr></thead>
        <tbody>{payable.length ? payable.map((d) => (
          <tr key={d.id}><td><Link href={`/admin/influencers/${d.id}`}>{d.full_name}</Link><TestTag show={d.is_test} /></td><td className="small">{d.payment_details_hint ?? <span className="muted">No payment details</span>}</td>
            <td className="num">{money(d.pending)}</td><td className="num"><strong>{money(d.balance)}</strong></td>
            <td><form action={createPayoutAction} className="actions"><input type="hidden" name="id" value={d.id} /><input name="method" placeholder="Method" style={{ width: 110, padding: '6px 8px' }} /><input name="reference" placeholder="Transaction ID" style={{ width: 150, padding: '6px 8px' }} /><button className="btn btn--sm" type="submit">Mark paid</button></form></td></tr>
        )) : <tr><td colSpan={5} className="empty">Nothing is ready to pay. Commissions become payable after the return window.</td></tr>}</tbody>
      </table></div>
      <h2 className="section">History</h2>
      <div className="tablewrap"><table>
        <thead><tr><th>Date</th><th>Influencer</th><th>Method</th><th>Reference</th><th className="num">Amount</th></tr></thead>
        <tbody>{history.length ? history.map((p) => <tr key={p.id}><td>{fmtDate(p.paid_at)}</td><td>{p.full_name}<TestTag show={p.is_test} /></td><td>{p.method}</td><td>{p.reference}</td><td className="num">{money(p.amount)}</td></tr>)
          : <tr><td colSpan={5} className="empty">No payouts yet.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
