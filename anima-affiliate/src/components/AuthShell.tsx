import Link from 'next/link';
export default function AuthShell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  const store = process.env.STORE_URL || 'https://animajewel.store';
  return (
    <>
      <header className="topbar"><div className="wrap topbar__in"><Link href="/login" className="brand"><b>Anima</b> Partners</Link><nav><a href={store}>Back to store</a></nav></div></header>
      <div className={`auth${wide ? ' auth--wide' : ''}`}><div className="card">{children}</div></div>
    </>
  );
}
