import { q } from '@/lib/db';
export const metadata = { title: 'Activity log' };
export default async function Audit({ searchParams }: { searchParams: { q?: string } }) {
  const term = (searchParams.q || '').trim().slice(0, 60);
  const rows = await q<any>(`select * from audit_log where ($1 = '' or action ilike '%'||$1||'%' or actor_label ilike '%'||$1||'%' or details::text ilike '%'||$1||'%') order by created_at desc limit 300`, [term]);
  return (
    <>
      <div className="pagehead"><div><p className="eyebrow">Audit</p><h1>Activity log</h1></div></div>
      <div className="filters"><form method="get" style={{ marginLeft: 0 }}><input name="q" defaultValue={term} placeholder="Search actions, people, codes" /><button className="btn btn--sm" type="submit">Search</button></form></div>
      <div className="tablewrap"><table>
        <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Record</th><th>Details</th></tr></thead>
        <tbody>{rows.map((l) => <tr key={l.id}><td className="small">{new Date(l.created_at).toLocaleString('en-US')}</td><td className="small">{l.actor_label}</td><td>{l.action}</td><td className="small">{l.entity}</td><td className="small" style={{ maxWidth: 460, wordBreak: 'break-word' }}>{l.details ? JSON.stringify(l.details) : ''}</td></tr>)}</tbody>
      </table></div>
    </>
  );
}
