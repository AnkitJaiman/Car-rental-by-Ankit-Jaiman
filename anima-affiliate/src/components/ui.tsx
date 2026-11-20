import Link from 'next/link';

export function TopBar({ links, current, userLabel }: { links: { href: string; label: string }[]; current: string; userLabel?: string }) {
  return (
    <header className="topbar">
      <div className="wrap topbar__in">
        <Link href="/" className="brand"><b>Anima</b> Partners</Link>
        <nav aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current === l.href ? 'page' : undefined}>{l.label}</Link>
          ))}
          <form action="/logout" method="post" style={{ display: 'inline' }}>
            <button className="linkbtn" type="submit" title={userLabel}>Sign out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}

const LABELS: Record<string, string> = { pending_approval: 'Pending approval' };
export function Badge({ status }: { status: string }) {
  return <span className={`badge badge--${status}`}>{LABELS[status] ?? status.replace(/_/g, ' ')}</span>;
}
export function TestTag({ show }: { show?: boolean }) {
  return show ? <> <span className="badge badge--test">Test</span></> : null;
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="card">
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
      {sub ? <div className="stat__sub">{sub}</div> : null}
    </div>
  );
}

export function Notice({ msg, err }: { msg?: string; err?: string }) {
  if (err) return <p className="alert alert--error" role="alert">{err}</p>;
  if (msg) return <p className="alert alert--ok" role="status">{msg}</p>;
  return null;
}

export function BarChart({ data, format }: { data: { label: string; value: number }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="chart" role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(', ')}>
      {data.map((d) => (
        <div className="chart__col" key={d.label}>
          <span className="chart__val">{d.value ? format(d.value) : ''}</span>
          <div className="chart__bar" style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="chart__lbl">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
