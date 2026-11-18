import { createHmac, timingSafeEqual } from 'crypto';

const version = () => process.env.SHOPIFY_API_VERSION || '2026-10';
const domain = () => process.env.SHOPIFY_STORE_DOMAIN;
export const shopifyConfigured = () => Boolean(domain() && process.env.SHOPIFY_ADMIN_TOKEN);

async function gql<T = any>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!shopifyConfigured()) throw new Error('Shopify is not connected (SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_TOKEN).');
  const res = await fetch(`https://${domain()}/admin/api/${version()}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN! },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`Shopify error: ${JSON.stringify(json.errors ?? res.status)}`);
  return json.data as T;
}

// Creates the real Shopify discount code that followers use at checkout.
export async function createDiscountCode(code: string, percent: number, influencerName: string): Promise<string> {
  const data = await gql(
    `mutation($d: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $d) { codeDiscountNode { id } userErrors { field message } }
    }`,
    {
      d: {
        title: `Affiliate ${code} – ${influencerName}`,
        code,
        startsAt: new Date().toISOString(),
        context: { all: 'ALL' },
        customerGets: { value: { percentage: percent / 100 }, items: { all: true } },
        combinesWith: { productDiscounts: false, orderDiscounts: false, shippingDiscounts: true },
        appliesOncePerCustomer: false,
        tags: ['anima-affiliate']
      }
    }
  );
  const r = data.discountCodeBasicCreate;
  if (r.userErrors?.length) throw new Error(r.userErrors.map((e: any) => e.message).join('; '));
  return r.codeDiscountNode.id as string;
}

export async function setDiscountActive(discountId: string, active: boolean) {
  const m = active
    ? `mutation($id: ID!) { discountCodeActivate(id: $id) { userErrors { message } } }`
    : `mutation($id: ID!) { discountCodeDeactivate(id: $id) { userErrors { message } } }`;
  const data = await gql(m, { id: discountId });
  const r = active ? data.discountCodeActivate : data.discountCodeDeactivate;
  if (r.userErrors?.length) throw new Error(r.userErrors.map((e: any) => e.message).join('; '));
}

// Fallback sync: recent orders in the same JSON shape that webhooks send.
export async function fetchRecentOrders(sinceISO: string): Promise<any[]> {
  if (!shopifyConfigured()) throw new Error('Shopify is not connected.');
  const out: any[] = [];
  let url: string | null =
    `https://${domain()}/admin/api/${version()}/orders.json?status=any&limit=250&updated_at_min=${encodeURIComponent(sinceISO)}`;
  while (url && out.length < 5000) {
    const res: Response = await fetch(url, { headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN! }, cache: 'no-store' });
    if (!res.ok) throw new Error(`Shopify orders request failed (${res.status})`);
    const json = await res.json();
    out.push(...json.orders);
    const link = res.headers.get('link') || '';
    const next = link.split(',').find((p) => p.includes('rel="next"'));
    url = next ? next.slice(next.indexOf('<') + 1, next.indexOf('>')) : null;
  }
  return out;
}

export function verifyWebhook(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) return false;
  const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(digest), b = Buffer.from(hmacHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}
