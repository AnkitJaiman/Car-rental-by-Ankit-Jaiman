import { one, q } from '@/lib/db';

// Share link: counts the click, then opens the store with the code already applied.
export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const store = process.env.STORE_URL || 'https://animajewel.store';
  const code = decodeURIComponent(params.code).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 30);
  const row = await one<{ id: string; code: string }>(`select ac.id, ac.code from affiliate_codes ac join influencers i on i.id = ac.influencer_id where upper(ac.code) = $1 and ac.status = 'active' and i.status = 'approved'`, [code]);
  if (!row) return Response.redirect(store, 302);
  await q('insert into clicks (code_id) values ($1)', [row.id]);
  return Response.redirect(`${store}/discount/${encodeURIComponent(row.code)}?redirect=%2F`, 302);
}
