import { createHmac, timingSafeEqual } from 'crypto';

const version = () => process.env.SHOPIFY_API_VERSION || '2026-10';
const domain = () => process.env.SHOPIFY_STORE_DOMAIN;
const hasClientCreds = () => Boolean(process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET);
export const shopifyConfigured = () => Boolean(domain() && (process.env.SHOPIFY_ADMIN_TOKEN || hasClientCreds()));

// Two ways to connect: a fixed Admin API token (legacy custom app), or a Dev Dashboard app's
// Client ID + secret, exchanged for a short-lived token (client credentials grant) and cached.
let cached: { token: string; expires: number } | null = null;
export async function accessToken(): Promise<string> {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  if (!hasClientCreds()) throw new Error('Shopify is not connected (set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET).');
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const res = await fetch(`https://${domain()}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.SHOPIFY_CLIENT_ID!, client_secret: process.env.SHOPIFY_CLIENT_SECRET! }),
    cache: 'no-store'
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) throw new Error(`Shopify sign-in failed (${res.status}). Check that the app is installed on the store and the Client ID/secret are correct.`);
  cached = { token: json.access_token, expires: Date.now() + (Number(json.expires_in) || 3600) * 1000 };
  return cached.token;
}

async function gql<T = any>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!shopifyConfigured()) throw new Error('Shopify is not connected (SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_TOKEN).');
  const res = await fetch(`https://${domain()}/admin/api/${version()}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await accessToken() },
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
    const res: Response = await fetch(url, { headers: { 'X-Shopify-Access-Token': await accessToken() }, cache: 'no-store' });
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
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_CLIENT_SECRET;
  if (!secret || !hmacHeader) return false;
  const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(digest), b = Buffer.from(hmacHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}
