import Link from 'next/link';
import { notFound } from 'next/navigation';
import { one, q } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { influencerTotals } from '@/lib/stats';
import { decrypt } from '@/lib/crypto';
import { audit } from '@/lib/audit';
import { money, pct, fmtDate } from '@/lib/money';
import { Badge, Notice, Stat, TestTag } from '@/components/ui';
import {
  setInfluencerStatusAction, updateInfluencerTermsAction, saveNotesAction, decideCodeAction,
  assignCodeAction, setOrderStatusAction, addAdjustmentAction, createPayoutAction
} from '../../../actions/admin';
export const metadata = { title: 'Influencer' };

export default async function InfluencerDetail({ params, searchParams }: { params: { id: string }; searchParams: { err?: string; msg?: string; reveal?: string } }) {
  const admin = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const i = await one<any>(`select i.*, u.full_name, u.email, u.phone, u.country, u.created_at, u.last_login_at from influencers i join users u on u.id = i.user_id where i.id = $1`, [params.id]);
  if (!i) notFound();
  const [t, codes, orders, adjs, payouts, log] = await Promise.all([
    influencerTotals(i.id),
    q<any>('select * from affiliate_codes where influencer_id = $1 order by requested_at desc', [i.id]),
    q<any>('select * from affiliate_orders where influencer_id = $1 order by ordered_at desc limit 200', [i.id]),
    q<any>('select a.*, u.email as by_email from commission_adjustments a join users u on u.id = a.created_by where influencer_id = $1 order by created_at desc', [i.id]),
    q<any>('select * from payouts where influencer_id = $1 order by paid_at desc', [i.id]),
    q<any>(`select * from audit_log where (entity='influencer' and entity_id=$1) or (entity='affiliate_code' and entity_id = any($2::text[])) or (entity='affiliate_order' and entity_id = any($3::text[])) order by created_at desc limit 100`,
      [i.id, (await q<any>('select id::text from affiliate_codes where influencer_id=$1', [i.id])).map((r) => r.id), (await q<any>('select id::text from affiliate_orders where influencer_id=$1', [i.id])).map((r) => r.id)])
  ]);
  let payment: any = null;
  if (searchParams.reveal === '1' && i.payment_details_enc) {
    try { payment = JSON.parse(decrypt(i.payment_details_enc)); } catch { payment = { error: 'Could not decrypt (check PAYMENT_ENCRYPTION_KEY).' }; }
    await audit({ id: admin.id, label: `admin:${admin.email}` }, 'payment_details.viewed', 'influencer', i.id);
  }
  const balance = Number(t.approved) + Number(t.adjustments_unpaid);
  const self = `/admin/influencers/${i.id}`;
  const StatusBtn = ({ to, label, cls }: { to: string; label: string; cls?: string }) => (
    <form action={setInfluencerStatusAction}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="status" value={to} /><button className={`btn btn--sm ${cls ?? ''}`} type="submit">{label}</button></form>
  );
  return (
    <>
      <p className="small"><Link href="/admin/influencers">← All influencers</Link></p>
      <div className="pagehead">
        <div><p className="eyebrow">Influencer</p><h1>{i.full_name}<TestTag show={i.is_test} /></h1><p className="muted" style={{ margin: 0 }}><Badge status={i.status} /> · applied {fmtDate(i.applied_at)}{i.approved_at ? ` · approved ${fmtDate(i.approved_at)}` : ''}</p></div>
        <div className="actions">
          {i.status === 'pending' && <><StatusBtn to="approved" label="Approve" cls="btn--ok" /><StatusBtn to="rejected" label="Reject" cls="btn--danger" /></>}
          {i.status === 'approved' && <StatusBtn to="suspended" label="Suspend" cls="btn--danger" />}
          {i.status === 'suspended' && <StatusBtn to="approved" label="Reactivate" cls="btn--ok" />}
          {i.status === 'rejected' && <StatusBtn to="approved" label="Approve after all" cls="btn--ghost" />}
        </div>
      </div>
      <Notice err={searchParams.err} msg={searchParams.msg} />

      <div className="grid grid-4">
        <Stat label="Orders" value={t.valid_orders} sub={`${t.clicks} clicks`} />
        <Stat label="Revenue" value={money(t.sales)} />
        <Stat label="Commission earned" value={money(Number(t.earned) + t.adjustments)} sub={`${money(t.pending)} pending`} />
        <Stat label="Ready to pay" value={money(balance)} sub={`${money(t.paid)} paid so far`} />
      </div>

      <div className="grid grid-2 section" style={{ alignItems: 'start' }}>
        <div className="card">
          <h2>Application</h2>
          <dl className="kv">
            <dt>Email</dt><dd>{i.email}</dd><dt>Phone</dt><dd>{i.phone}</dd><dt>Country</dt><dd>{i.country}</dd>
            <dt>Instagram</dt><dd><a href={i.instagram_url} target="_blank" rel="noopener noreferrer">@{i.instagram_username} ↗</a></dd>
            <dt>TikTok</dt><dd>{i.tiktok_url ? <a href={i.tiktok_url} target="_blank" rel="noopener noreferrer">{i.tiktok_url} ↗</a> : '—'}</dd>
            <dt>YouTube</dt><dd>{i.youtube_url ? <a href={i.youtube_url} target="_blank" rel="noopener noreferrer">{i.youtube_url} ↗</a> : '—'}</dd>
            <dt>Followers</dt><dd>{Number(i.total_followers).toLocaleString('en-US')}</dd><dt>Audience country</dt><dd>{i.audience_country}</dd>
            <dt>Category</dt><dd>{i.content_category}</dd><dt>Introduction</dt><dd>{i.introduction}</dd><dt>Why Anima</dt><dd>{i.why_collaborate}</dd>
            <dt>Last sign-in</dt><dd>{fmtDate(i.last_login_at)}</dd>
            <dt>Payment details</dt><dd>{i.payment_details_hint ?? 'Not provided'}{i.payment_details_enc && !payment && <> · <Link href={`${self}?reveal=1`}>Reveal (logged)</Link></>}
              {payment && <pre className="small" style={{ whiteSpace: 'pre-wrap', background: 'var(--soft)', padding: 10, margin: '8px 0 0' }}>{JSON.stringify(payment, null, 2)}</pre>}</dd>
          </dl>
        </div>
        <div className="grid">
          <form action={updateInfluencerTermsAction} className="card form">
            <h2>Rates (admin only)</h2>
            <input type="hidden" name="id" value={i.id} />
            <div className="row">
              <label><span>Commission rate %</span><input name="commission_rate" type="number" step="0.5" min="0" max="50" defaultValue={Number(i.commission_rate)} required /></label>
              <label><span>Follower discount %</span><input name="discount_percent" type="number" step="0.5" min="0" max="90" defaultValue={Number(i.discount_percent)} required /></label>
            </div>
            <label><span>Maximum discount allowed %</span><input name="max_discount_percent" type="number" step="0.5" min="0" max="90" defaultValue={Number(i.max_discount_percent)} required /></label>
            <p className="small muted" style={{ margin: 0 }}>A new commission rate applies to new orders. A new discount applies to the next code created.</p>
            <button className="btn btn--sm" type="submit">Save rates</button>
          </form>
          <form action={saveNotesAction} className="card form">
            <h2>Internal notes</h2>
            <input type="hidden" name="id" value={i.id} />
            <textarea name="admin_notes" defaultValue={i.admin_notes ?? ''} placeholder="Only visible to admins" />
            <button className="btn btn--sm btn--ghost" type="submit">Save notes</button>
          </form>
        </div>
      </div>

      <div className="section">
        <h2>Affiliate codes</h2>
        <div className="tablewrap"><table>
          <thead><tr><th>Code</th><th>Discount</th><th>Status</th><th>Requested</th><th>Shopify</th><th>Actions</th></tr></thead>
          <tbody>{codes.length ? codes.map((c) => (
            <tr key={c.id}><td><strong>{c.code}</strong><TestTag show={c.is_test} /></td><td>{pct(c.discount_percent)}</td><td><Badge status={c.status} /></td><td>{fmtDate(c.requested_at)}</td><td className="small">{c.shopify_discount_id ? 'Linked' : '—'}</td>
              <td><div className="actions">
                {c.status === 'pending_approval' && <><CodeBtn id={c.id} d="approve" label="Approve" ret={self} cls="btn--ok" /><CodeBtn id={c.id} d="reject" label="Reject" ret={self} cls="btn--danger" /></>}
                {c.status === 'active' && <CodeBtn id={c.id} d="disable" label="Disable" ret={self} cls="btn--danger" />}
                {c.status === 'disabled' && i.status === 'approved' && <CodeBtn id={c.id} d="enable" label="Re-activate" ret={self} />}
              </div></td></tr>
          )) : <tr><td colSpan={6} className="empty">No codes.</td></tr>}</tbody>
        </table></div>
        {i.status === 'approved' && (
          <form action={assignCodeAction} className="card form" style={{ marginTop: 12, maxWidth: 560 }}>
            <h3>Create or assign a code</h3>
            <input type="hidden" name="id" value={i.id} />
            <div className="row">
              <label><span>Code</span><input name="code" required style={{ textTransform: 'uppercase' }} /></label>
              <label><span>Discount % (max {pct(i.max_discount_percent)})</span><input name="discount_percent" type="number" step="0.5" min="0" max={Number(i.max_discount_percent)} defaultValue={Number(i.discount_percent)} /></label>
            </div>
            <button className="btn btn--sm" type="submit">Create active code</button>
          </form>
        )}
      </div>

      <div className="section">
        <div className="pagehead"><h2 style={{ margin: 0 }}>Orders</h2><a className="small" href={`/admin/export/orders?influencer=${i.id}`}>Export CSV</a></div>
        <div className="tablewrap"><table>
          <thead><tr><th>Order</th><th>Date</th><th>Products</th><th className="num">Eligible</th><th className="num">Commission</th><th>Status</th><th>Change status</th></tr></thead>
          <tbody>{orders.length ? orders.map((o) => (
            <tr key={o.id}><td>{o.order_name}<TestTag show={o.is_test} /><div className="small muted">{o.code_used}</div></td><td>{fmtDate(o.ordered_at)}</td><td className="small">{o.products_summary}</td>
              <td className="num">{money(o.eligible_amount)}</td><td className="num">{money(o.commission_amount)}<div className="small muted">{pct(o.commission_rate)}</div></td>
              <td><Badge status={o.status} />{o.status_reason && <div className="small muted">{o.status_reason}</div>}</td>
              <td>{o.status !== 'paid' && <form action={setOrderStatusAction} className="actions"><input type="hidden" name="order_id" value={o.id} /><input type="hidden" name="return_to" value={self} />
                <select name="status" defaultValue={o.status} style={{ width: 'auto', padding: '6px 8px' }}>{['pending', 'approved', 'cancelled', 'refunded'].map((s) => <option key={s}>{s}</option>)}</select>
                <button className="btn btn--sm btn--ghost" type="submit">Set</button></form>}</td></tr>
          )) : <tr><td colSpan={7} className="empty">No orders yet.</td></tr>}</tbody>
        </table></div>
      </div>

      <div className="grid grid-2 section" style={{ alignItems: 'start' }}>
        <div className="card">
          <h2>Manual adjustments</h2>
          <form action={addAdjustmentAction} className="form">
            <input type="hidden" name="id" value={i.id} />
            <div className="row">
              <label><span>Amount (USD, negative to deduct)</span><input name="amount" type="number" step="0.01" required /></label>
              <label><span>Reason (required)</span><input name="reason" required minLength={3} /></label>
            </div>
            <button className="btn btn--sm btn--ghost" type="submit">Add adjustment</button>
          </form>
          <table style={{ marginTop: 12 }}><tbody>{adjs.length ? adjs.map((a) => <tr key={a.id}><td>{fmtDate(a.created_at)}</td><td>{a.reason}<div className="small muted">by {a.by_email}{a.payout_id ? ' · paid' : ''}</div></td><td className="num">{money(a.amount)}</td></tr>)
            : <tr><td className="empty">No adjustments.</td></tr>}</tbody></table>
        </div>
        <div className="card">
          <h2>Pay commission</h2>
          <p className="muted small">Approved, unpaid balance: <strong>{money(balance)}</strong>. Send the money (PayPal/Wise/bank) first, then record it here.</p>
          <form action={createPayoutAction} className="form">
            <input type="hidden" name="id" value={i.id} /><input type="hidden" name="return_to" value={self} />
            <div className="row">
              <label><span>Method</span><input name="method" placeholder="PayPal" /></label>
              <label><span>Reference / transaction ID</span><input name="reference" /></label>
            </div>
            <button className="btn btn--sm" type="submit" disabled={balance <= 0}>Record payout of {money(balance)}</button>
          </form>
          <table style={{ marginTop: 12 }}><tbody>{payouts.length ? payouts.map((p) => <tr key={p.id}><td>{fmtDate(p.paid_at)}</td><td>{p.method} {p.reference}</td><td className="num">{money(p.amount)}</td></tr>)
            : <tr><td className="empty">No payouts yet.</td></tr>}</tbody></table>
        </div>
      </div>

      <div className="section">
        <h2>Activity</h2>
        <div className="tablewrap"><table>
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>{log.map((l) => <tr key={l.id}><td className="small">{new Date(l.created_at).toLocaleString('en-US')}</td><td className="small">{l.actor_label}</td><td>{l.action}</td><td className="small" style={{ maxWidth: 420 }}>{l.details ? JSON.stringify(l.details) : ''}</td></tr>)}</tbody>
        </table></div>
      </div>
    </>
  );
}

function CodeBtn({ id, d, label, ret, cls }: { id: string; d: string; label: string; ret: string; cls?: string }) {
  return (
    <form action={decideCodeAction}><input type="hidden" name="code_id" value={id} /><input type="hidden" name="decision" value={d} /><input type="hidden" name="return_to" value={ret} />
      <button className={`btn btn--sm ${cls ?? ''}`} type="submit">{label}</button></form>
  );
}
