import { approveMaturedCommissions, processShopifyOrder } from '@/lib/orders';
import { fetchRecentOrders, shopifyConfigured } from '@/lib/shopify';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// Daily job: approve commissions past the return window, and re-check the last 3 days of orders in case a webhook was missed.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new Response('Unauthorized', { status: 401 });
  let scanned = 0;
  if (shopifyConfigured()) {
    const orders = await fetchRecentOrders(new Date(Date.now() - 3 * 86400_000).toISOString());
    for (const o of orders) await processShopifyOrder(o, { source: 'daily-sync' });
    scanned = orders.length;
  }
  const approved = await approveMaturedCommissions();
  await audit({ label: 'system:cron' }, 'cron.ran', 'settings', null, { scanned, approved });
  return Response.json({ scanned, approved });
}
