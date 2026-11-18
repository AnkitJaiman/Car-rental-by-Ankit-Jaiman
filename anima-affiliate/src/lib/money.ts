export function money(v: number | string | null | undefined, currency = 'USD') {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
}
export function pct(v: number | string) {
  return `${Number(v).toFixed(Number(v) % 1 === 0 ? 0 : 1)}%`;
}
export function fmtDate(d: string | Date | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
