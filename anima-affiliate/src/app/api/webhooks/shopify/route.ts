import { verifyWebhook } from '@/lib/shopify';
import { processShopifyOrder } from '@/lib/orders';
import { q, one } from '@/lib/db';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// Shopify → portal. Subscribe these topics: orders/create, orders/updated, orders/paid, orders/cancelled, disputes/create.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get('x-shopify-hmac-sha256'))) return new Response('Invalid signature', { status: 401 });
  const topic = req.headers.get('x-shopify-topic') || '';
  const eventId = req.headers.get('x-shopify-webhook-id') || req.headers.get('x-shopify-event-id');
  if (eventId) {
    const fresh = await q('insert into webhook_events (id, topic) values ($1,$2) on conflict do nothing returning id', [eventId, topic]);
    if (!fresh.length) return new Response('Duplicate', { status: 200 });
  }
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new Response('Bad JSON', { status: 400 }); }

  try {
    if (topic.startsWith('orders/')) {
      await processShopifyOrder(payload, { source: `shopify-webhook:${topic}` });
    } else if (topic === 'disputes/create' || topic === 'disputes/update') {
      const row = await one<any>('select id, status, order_name from affiliate_orders where shopify_order_id = $1', [payload.order_id]);
      if (row && row.status !== 'paid' && payload.status !== 'won') {
        await q(`update affiliate_orders set status='refunded', status_reason='Chargeback', eligible_amount=0, commission_amount=0, updated_at=now() where id=$1`, [row.id]);
        await audit({ label: `system:shopify-webhook:${topic}` }, 'order.chargeback', 'affiliate_order', row.id, { order: row.order_name, dispute: payload.id });
      } else if (row && row.status === 'paid') {
        await audit({ label: `system:shopify-webhook:${topic}` }, 'order.chargeback_after_payout', 'affiliate_order', row.id, { order: row.order_name, dispute: payload.id });
      }
    }
  } catch (e: any) {
    // Let Shopify retry by forgetting this event id.
    if (eventId) await q('delete from webhook_events where id = $1', [eventId]);
    console.error('webhook failed', topic, e?.message);
    return new Response('Error', { status: 500 });
  }
  return new Response('OK', { status: 200 });
}
