import Link from 'next/link';
import { q } from '@/lib/db';
import { Badge, TestTag } from '@/components/ui';
import { fmtDate, pct, money } from '@/lib/money';
export const metadata = { title: 'Influencers' };

const STATUSES = ['pending', 'approved', 'rejected', 'suspended'];
export default async function Influencers({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const st = STATUSES.includes(searchParams.status || '') ? searchParams.status! : null;
  const term = (searchParams.q || '').trim().slice(0, 80);
  const rows = await q<any>(
    `select i.id, i.status, i.instagram_username, i.total_followers, i.content_category, i.commission_rate, i.applied_at, i.is_test,
            u.full_name, u.email, u.country,
            (select code from affiliate_codes ac where ac.influencer_id = i.id and ac.status = 'active' limit 1) as code,
            (select coalesce(sum(eligible_amount),0) from affiliate_orders o where o.influencer_id = i.id and o.status not in ('cancelled','refunded')) as revenue
       from influencers i join users u on u.id = i.user_id
      where ($1::influencer_status is null or i.status = $1)
        and ($2 = '' or u.full_name ilike '%'||$2||'%' or u.email ilike '%'||$2||'%' or i.instagram_username ilike '%'||$2||'%')
      order by (i.status='pending') desc, i.applied_at desc limit 500`, [st, term]);
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Programme</p><h1>Influencers</h1></div><a className="btn btn--sm btn--ghost" href="/admin/export/influencers">Export CSV</a></div>
      <div className="filters">
        <a href="/admin/influencers" aria-current={!st ? 'true' : undefined}>All</a>
        {STATUSES.map((s) => <a key={s} href={`/admin/influencers?status=${s}`} aria-current={st === s ? 'true' : undefined}>{s}</a>)}
        <form method="get">{st && <input type="hidden" name="status" value={st} />}<input name="q" defaultValue={term} placeholder="Search name, email, @handle" /><button className="btn btn--sm" type="submit">Search</button></form>
      </div>
      <div className="tablewrap"><table>
        <thead><tr><th>Influencer</th><th>Instagram</th><th className="num">Followers</th><th>Category</th><th>Status</th><th>Code</th><th className="num">Commission</th><th className="num">Revenue</th><th>Applied</th></tr></thead>
        <tbody>{rows.length ? rows.map((r) => (
          <tr key={r.id}>
            <td><Link href={`/admin/influencers/${r.id}`}><strong>{r.full_name}</strong></Link><TestTag show={r.is_test} /><div className="small muted">{r.email}</div></td>
            <td>@{r.instagram_username}</td><td className="num">{Number(r.total_followers).toLocaleString('en-US')}</td><td className="small">{r.content_category}</td>
            <td><Badge status={r.status} /></td><td>{r.code ?? '—'}</td><td className="num">{pct(r.commission_rate)}</td><td className="num">{money(r.revenue)}</td><td className="small">{fmtDate(r.applied_at)}</td>
          </tr>
        )) : <tr><td colSpan={9} className="empty">No influencers found.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
