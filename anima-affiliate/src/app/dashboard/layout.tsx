import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { requireUser } from '@/lib/auth';
import { TopBar } from '@/components/ui';
export const dynamic = 'force-dynamic';

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  if (u.role === 'admin') redirect('/admin');
  const path = headers().get('x-pathname') || '';
  const links = u.influencer_status === 'approved'
    ? [{ href: '/dashboard', label: 'Overview' }, { href: '/dashboard/code', label: 'My code' }, { href: '/dashboard/orders', label: 'Orders' }, { href: '/dashboard/profile', label: 'Profile' }]
    : [{ href: '/dashboard/status', label: 'Application' }, { href: '/dashboard/profile', label: 'Profile' }];
  return (
    <>
      <TopBar links={links} current={path} userLabel={u.email} />
      <main><div className="wrap">{children}</div></main>
    </>
  );
}
