import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth';
import { TopBar } from '@/components/ui';
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const a = await requireAdmin();
  const path = headers().get('x-pathname') || '';
  const links = [
    { href: '/admin', label: 'Overview' }, { href: '/admin/influencers', label: 'Influencers' }, { href: '/admin/codes', label: 'Codes' },
    { href: '/admin/orders', label: 'Orders' }, { href: '/admin/payouts', label: 'Payouts' }, { href: '/admin/audit', label: 'Activity' }, { href: '/admin/settings', label: 'Settings' }
  ];
  const current = links.map((l) => l.href).filter((h) => path === h || (h !== '/admin' && path.startsWith(h))).pop() || path;
  return (<><TopBar links={links} current={current} userLabel={a.email} /><main><div className="wrap">{children}</div></main></>);
}
