import { one, q } from './db';

// All influencer numbers are always filtered by influencer_id on the server.
export async function influencerTotals(influencerId: string) {
  const t = await one<any>(
    `select count(*)::int as orders,
            count(*) filter (where status not in ('cancelled','refunded'))::int as valid_orders,
            coalesce(sum(eligible_amount) filter (where status not in ('cancelled','refunded')),0) as sales,
            coalesce(sum(commission_amount) filter (where status in ('pending','approved','paid')),0) as earned,
            coalesce(sum(commission_amount) filter (where status='pending'),0) as pending,
            coalesce(sum(commission_amount) filter (where status='approved'),0) as approved,
            coalesce(sum(commission_amount) filter (where status='paid'),0) as paid
       from affiliate_orders where influencer_id = $1`, [influencerId]);
  const adj = await one<any>(`select coalesce(sum(amount),0) as total, coalesce(sum(amount) filter (where payout_id is null),0) as unpaid from commission_adjustments where influencer_id = $1`, [influencerId]);
  const clicks = await one<any>(`select count(*)::int as n from clicks c join affiliate_codes ac on ac.id = c.code_id where ac.influencer_id = $1`, [influencerId]);
  return { ...t, adjustments: Number(adj.total), adjustments_unpaid: Number(adj.unpaid), clicks: clicks.n,
    conversion: clicks.n > 0 ? (t.valid_orders / clicks.n) * 100 : null };
}

// Pass an influencer id, or the explicit string 'ALL_INFLUENCERS' (admin overview only). Anything else is refused.
export async function monthlySeries(scope: string, months = 6) {
  const all = scope === 'ALL_INFLUENCERS';
  if (!all && !/^[0-9a-f-]{36}$/.test(scope)) throw new Error('monthlySeries: an influencer id is required');
  const influencerId = all ? null : scope;
  const rows = await q<any>(
    `with m as (select generate_series(date_trunc('month', now()) - ($2::int - 1) * interval '1 month', date_trunc('month', now()), interval '1 month') as month)
     select to_char(m.month, 'Mon') as label,
            coalesce(sum(o.eligible_amount) filter (where o.status not in ('cancelled','refunded')),0)::float as revenue,
            coalesce(sum(o.commission_amount) filter (where o.status not in ('cancelled','refunded')),0)::float as commission,
            count(o.id) filter (where o.status not in ('cancelled','refunded'))::int as orders
       from m left join affiliate_orders o on date_trunc('month', o.ordered_at) = m.month and ($1::uuid is null or o.influencer_id = $1)
      group by m.month order by m.month`, [influencerId, months]);
  return rows;
}
