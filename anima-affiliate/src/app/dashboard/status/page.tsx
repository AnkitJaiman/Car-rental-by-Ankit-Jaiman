import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { one } from '@/lib/db';
import { Badge } from '@/components/ui';
import { fmtDate } from '@/lib/money';
export const metadata = { title: 'Application status' };

const COPY: Record<string, { title: string; text: string }> = {
  pending: { title: 'Your application is under review', text: 'Thank you for applying to the Anima Jewels Influencer Programme. Our team will review your application. You will receive an email once a decision has been made.' },
  rejected: { title: 'Application not approved', text: 'Thank you for your interest. We are unable to offer a partnership at this time. You can still shop with your usual shopper account.' },
  suspended: { title: 'Your affiliate account is paused', text: 'Affiliate features are unavailable while your account is paused. Please contact support@animajewel.store if you have questions.' }
};

export default async function Status({ searchParams }: { searchParams: { applied?: string } }) {
  const u = await requireUser();
  if (u.influencer_status === 'approved') redirect('/dashboard');
  const inf = await one<any>('select status, applied_at, instagram_username from influencers where user_id = $1', [u.id]);
  if (!inf) redirect('/apply');
  const c = COPY[inf.status] ?? COPY.pending;
  const store = process.env.STORE_URL || 'https://animajewel.store';
  return (
    <div className="narrow" style={{ textAlign: 'center', paddingTop: 24 }}>
      {searchParams.applied && <p className="alert alert--ok" role="status">Application submitted.</p>}
      <p className="eyebrow">Application status</p>
      <p><Badge status={inf.status} /></p>
      <h1>{c.title}</h1>
      <p className="muted">{c.text}</p>
      <div className="card card--soft" style={{ textAlign: 'left', marginTop: 24 }}>
        <dl className="kv"><dt>Applied</dt><dd>{fmtDate(inf.applied_at)}</dd><dt>Instagram</dt><dd>@{inf.instagram_username}</dd></dl>
      </div>
      <p style={{ marginTop: 28 }}><a className="btn btn--ghost" href={`${store}/account`}>Go to my shopper account</a></p>
    </div>
  );
}
