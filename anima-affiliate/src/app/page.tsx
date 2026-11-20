import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const u = await currentUser();
  redirect(!u ? '/login' : u.role === 'admin' ? '/admin' : '/dashboard');
}
