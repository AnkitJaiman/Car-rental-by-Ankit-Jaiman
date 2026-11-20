import { requireAdmin } from '@/lib/auth';
import { q } from '@/lib/db';
import { audit } from '@/lib/audit';

// CSV opens directly in Excel and Google Sheets. Cells are guarded against spreadsheet formula injection.
function csv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
}

export async function GET(req: Request, { params }: { params: { kind: string } }) {
  const admin = await requireAdmin();
  const url = new URL(req.url);
  const inf = url.searchParams.get('influencer');
  const status = url.searchParams.get('status');
  let rows: any[] = [];
  if (params.kind === 'influencers') {
    rows = await q(`select u.full_name, u.email, u.phone, u.country, i.status, i.instagram_username, i.instagram_url, i.tiktok_url, i.youtube_url, i.total_followers,
        i.audience_country, i.content_category, i.commission_rate, i.discount_percent, i.applied_at, i.approved_at, i.is_test,
        (select string_agg(code || ':' || status, ' ') from affiliate_codes ac where ac.influencer_id = i.id) as codes,
        (select count(*) from affiliate_orders o where o.influencer_id = i.id and o.status not in ('cancelled','refunded')) as orders,
        (select coalesce(sum(eligible_amount),0) from affiliate_orders o where o.influencer_id = i.id and o.status not in ('cancelled','refunded')) as revenue,
        (select coalesce(sum(commission_amount),0) from affiliate_orders o where o.influencer_id = i.id and o.status in ('pending','approved','paid')) as commission
      from influencers i join users u on u.id = i.user_id order by i.applied_at desc`);
  } else if (params.kind === 'orders') {
    rows = await q(`select o.order_name, o.ordered_at, u.full_name as influencer, o.code_used, o.products_summary, o.order_subtotal, o.discount_amount, o.eligible_amount,
        o.commission_rate, o.commission_amount, o.status, o.status_reason, o.is_test
      from affiliate_orders o join influencers i on i.id = o.influencer_id join users u on u.id = i.user_id
      where ($1::uuid is null or o.influencer_id = $1) and ($2::commission_status is null or o.status = $2) order by o.ordered_at desc`,
      [inf && /^[0-9a-f-]{36}$/.test(inf) ? inf : null, ['pending', 'approved', 'paid', 'cancelled', 'refunded'].includes(status || '') ? status : null]);
  } else if (params.kind === 'payouts') {
    rows = await q(`select p.paid_at, u.full_name as influencer, p.amount, p.method, p.reference, p.is_test from payouts p join influencers i on i.id = p.influencer_id join users u on u.id = i.user_id order by p.paid_at desc`);
  } else {
    return new Response('Unknown export', { status: 404 });
  }
  await audit({ id: admin.id, label: `admin:${admin.email}` }, 'export.downloaded', 'export', params.kind, { rows: rows.length });
  return new Response(csv(rows) || 'No data\n', {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="anima-${params.kind}-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' }
  });
}
