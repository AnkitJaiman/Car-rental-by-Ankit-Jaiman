# Anima Jewels – Influencer Affiliate Portal

A separate partner portal for Anima Jewels influencers: applications, admin approval, affiliate codes (real Shopify discount codes),
automatic order tracking from Shopify, commissions, payouts, emails, an audit log, and CSV exports.

Shopper accounts stay in Shopify (customer accounts). The store's **Sign in** page offers *Shopper account* or *Influencer portal*.

## Roles and access (enforced on the server)
| Role | Can do |
|---|---|
| Admin | Everything in `/admin` |
| Approved influencer | Own dashboard, code, orders, commissions, profile |
| Pending / rejected / suspended influencer | Application status and profile only (no codes, orders or commissions) |
| Shopper | Uses the Shopify store account, not this portal |

Influencers only ever see their own orders and never any customer details. Discount and commission rates can only be changed by an admin.

## Commission rules
Default 10% of the product subtotal Anima Jewels actually receives (after discounts and refunds), excluding shipping and taxes.
Cancelled, refunded, voided and charged-back orders earn nothing. Commissions are *pending* for the return window (default 30 days),
then *approved*, then *paid* when an admin records a payout. Paid commissions are never changed automatically; use a manual adjustment
(every adjustment needs a reason and is logged).

## Setup (one time)
1. **Database – Supabase** (free): create a project, copy the *Session pooler* connection string into `DATABASE_URL`, then run `npm run migrate`.
2. **Email – Resend** (free tier): verify the domain `animajewel.store`, create an API key → `RESEND_API_KEY`. Without a key, emails are only logged in Admin › Settings.
3. **Shopify custom app**: Shopify admin › Settings › Apps and sales channels › Develop apps › Create app.
   - Admin API scopes: `read_orders`, `write_discounts`, `read_discounts`.
   - Install, copy the Admin API access token → `SHOPIFY_ADMIN_TOKEN`; store domain → `SHOPIFY_STORE_DOMAIN`.
   - Webhooks (Settings › Notifications › Webhooks, JSON format) to `https://<portal>/api/webhooks/shopify` for:
     Order creation, Order update, Order payment, Order cancellation, Dispute creation. Copy the signing secret → `SHOPIFY_WEBHOOK_SECRET`.
4. **Hosting – Vercel** (free): import this folder, add every variable from `.env.example`, deploy. Optional: add the domain `partners.animajewel.store`.
   The daily job (`vercel.json`) approves matured commissions and re-checks recent orders.
5. **First admin**: `ADMIN_PASSWORD='<12+ chars>' DATABASE_URL=... node scripts/create-admin.mjs you@animajewel.store "Your Name"`.
6. **Store links**: in the Shopify theme editor, set the Sign in page and Influencer Program page links to `https://<portal>/login` and `https://<portal>/apply`.

Generate secrets with `openssl rand -base64 48` (SESSION_SECRET, PAYMENT_ENCRYPTION_KEY, CRON_SECRET). Never change PAYMENT_ENCRYPTION_KEY after
influencers have saved payment details.

## Test data
`npm run seed:test` adds clearly marked sample data (names start with "Test ·", emails end with `@example.test`, codes start with `TEST`,
and a "Test" tag in the admin). Remove it with `node scripts/seed-test.mjs --remove`. Never run the seed on the live database once real influencers exist.

## Development
```
npm install
cp .env.example .env.local   # fill in
npm run migrate && npm run dev   # http://localhost:3100
npm test                         # commission rule tests
```
