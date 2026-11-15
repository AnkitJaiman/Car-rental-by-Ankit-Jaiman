# Anima Jewels: live website audit (animajewel.store)

Five specialist agents audited the live site on 14–15 November 2026:
1. UI/UX and visual design
2. Brand trust
3. Creator and social commerce
4. SEO, technical and e-commerce
5. A real US customer

They used Playwright on mobile (390px), tablet (768px) and desktop (1440px), the public product JSON, the theme source, and the checkout up to its first page. No orders were placed and no payment details were entered.

The full reports are in `docs/audits/site-audit/`, one per agent. They include every issue's evidence, impact, fix, effort and how to verify it.

---

## 1. Executive summary

The theme is close to premium. The agents found no broken links or images and no horizontal scroll on phone, tablet or desktop. The only console error comes from Shopify's own Shop Pay frame.

The store is still not ready to sell. Four store-level problems block or damage every sale:

1. **Checkout cannot take payment.** Checkout shows "This store can't accept payments right now". No one can buy.
2. **A hidden 70%-off automatic discount appears only in the cart.** The product page shows $259.24 and the cart shows $77.78. Shoppers leave at the higher price before they ever see the real one. The setup also looks like fictitious pricing, which carries FTC risk and causes Google Merchant Center price mismatches.
3. **Legal policies are missing.** The Shopify refund, shipping, terms and contact policies all return 404, and the checkout footer shows only Privacy.
4. **Claims that can mislead customers:**
   - "Only 3 left" on every one of 12,648 variants.
   - Products titled "Diamond" whose descriptions say "or Diamond-like CZ".
   - Etsy-era copy that contradicts the site's own shipping and return terms.
   - "Tax included." shown to US shoppers.

After those come the biggest conversion gaps:
- There are no reviews anywhere.
- Most listings give no stone size, carat or plating thickness.
- Choosing a metal never changes the photo.
- The product photos are inconsistent Etsy exports.
- The logo misspells "ACESSORIES" and reads as clip-art.
- There is no named business, person or place behind the store.

**What I fixed in the theme** (draft "Anima Editorial 1.5 (audit fixes)", not yet live):
- Ring size is no longer pre-selected.
- The tablet category grid has side margins.
- The checkout button stays solid.
- Search pages are hidden from Google.
- The "Styled by you" label is now honest.

Everything else on the critical list needs your action in Shopify admin, or content from you.

## 2. Scores

| Category | Score | Why |
|---|---|---|
| Design and UI/UX | **62/100** | The layout, type and spacing are at a premium level. The logo, inconsistent photography, metal choice not changing the image, and odd prices drag it down. |
| Brand trust | **24/100** | Payments are off, policies are missing, there is no business identity, scarcity is false, Diamond/CZ is unclear, and there are no reviews. |
| Social commerce and creators | **34/100** | No reviews, no pixels, reels tagged to the wrong products, no product video, no creator or affiliate path, Instagram only. |
| SEO and technical | **48/100** | Clean structure and fast enough (mobile LCP 2.3–3.5s, CLS 0). Missing a home meta description, policies, analytics and full merchant schema; Etsy boilerplate copy; empty blog. |
| Customer journey (would a US shopper buy?) | **38/100** | They cannot pay today. Even with payment fixed, there are no specs, no reviews, no identity and confusing tax/price messages. |
| **Overall launch readiness** | **41/100** | It would reach about 70 once payments, policies, pricing honesty and scarcity are fixed (all admin settings, roughly half a day). It would reach the 80s with reviews, specs and better photos. |

## 3. Critical bugs (fix before spending anything on ads)

| ID | Problem | Owner | What to do |
|---|---|---|---|
| C-1 (A2-01, A4-01, A5-01) | Checkout: "This store can't accept payments right now" | **You** (Settings → Payments) | Finish Shopify Payments activation (identity, bank, tax info), or add PayPal. Then place a test order with Shopify's test mode, not a real card. |
| C-2 (A1-01, A4-02) | A 70%-off automatic discount appears only in the cart; there are no compare-at prices | **You** (Discounts, Products) | Pick one honest pricing strategy. **(a) Recommended:** delete the permanent discount and set real everyday prices. **(b)** If the sale is real and time-limited, set compare-at prices so the sale shows everywhere, and name the end date. |
| C-3 (A2-02, A4-03, A5-09) | Refund, shipping, terms and contact policies are 404 | **You** (Settings → Policies) | Fill in the four policies. I can draft the text to match your 30-day returns, free US shipping over $35 and 24-hour cancellation rule. |
| C-4 (A2-03) | "Diamond" titles where the stone may be CZ | **You** / content | Name the real stone in the title and variant ("Cubic Zirconia", "Moissanite", "Lab-grown diamond"). Never use "Diamond" for CZ. |
| C-5 (A2-06, A5-05) | "Only 3 left" on every variant | **You** (inventory) | Set real stock levels. For made-to-order items, set "Continue selling when out of stock" and track nothing, so the low-stock line disappears. |

## 4. Issue register (de-duplicated, ranked)

Each agent's file has the full fields for every issue: evidence, impact, solution, effort and verification. Owner key:
- **THEME**: I can fix it in the theme.
- **STORE**: a Shopify admin setting or data.
- **CONTENT**: you supply it.

| # | Issue | Agents | Priority | Effort | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | Payments disabled | 2,4,5 | Critical | S | STORE | Open: needs you |
| 2 | Hidden 70% cart discount / fictitious list price | 1,4 | Critical | S | STORE | Open: needs your decision |
| 3 | Policies missing (404) | 2,4,5 | Critical | S | STORE | Open: I can draft them |
| 4 | Diamond vs CZ naming | 2 | Critical | M | STORE/CONTENT | Open |
| 5 | "Only 3 left" everywhere | 2,5 | High | S | STORE | Open |
| 6 | No reviews or ratings | 1,2,3,4,5 | High | M | STORE (app) + CONTENT | Open: install Judge.me or Shopify Product Reviews and ask real past buyers |
| 7 | Ring size pre-selected (size 2) | 1,3,5 | High | S | THEME | **Fixed in 1.5** |
| 8 | Metal choice doesn't change the photo (0 variant images) | 1,5 | High | M | STORE/CONTENT | Open: assign an image per metal |
| 9 | Stone size, carat and plating thickness missing on 122/157 products | 2,5 | High | M | CONTENT | Open |
| 10 | Etsy copy and "Introductory Statement" boilerplate | 2,3,4,5 | High | M | CONTENT | Open |
| 11 | Odd-cent prices ($259.24) | 1,2,3,4 | High | S | STORE | Open (decide together with #2) |
| 12 | "Tax included." on a US store | 1,2,3,4,5 | High | S | STORE | Open: Settings → Taxes → turn off "Include tax in prices" |
| 13 | Logo typo and clip-art look | 1,2,3,5 | High | M | CONTENT | Open: new wordmark |
| 14 | No named business or founder | 2,3,5 | High | S | CONTENT | Open: add a name, city and photo to Our Story |
| 15 | Inconsistent Etsy photography, 405 images under 1200px | 1,3,5 | High | L | CONTENT | Open |
| 16 | No GA4, Meta or TikTok pixels | 3,4 | High | S | STORE | Open: install the Google & YouTube, Facebook & Instagram and TikTok apps |
| 17 | Reels tagged to the wrong products | 3 | High | S | STORE (theme editor) | Open: tell me which product goes with each reel |
| 18 | "Styled by you" label on brand-only content | 3 | High | S | THEME | **Fixed in 1.5** ("From our studio") |
| 19 | No home meta description | 4 | High | S | STORE | Open: Online Store → Preferences |
| 20 | Gem treatment and plating disclosures | 2,5 | High | M | CONTENT | Open |
| 21 | UK and Canada can't buy | 2,4,5 | Medium | S | STORE | Open: Settings → Markets |
| 22 | Tablet category grid runs edge to edge | 1 | Medium | S | THEME | **Fixed in 1.5** |
| 23 | Checkout button looks outlined (touch hover state) | 1 | Medium | S | THEME | **Fixed in 1.5** |
| 24 | Search result pages indexable | 4 | Medium | S | THEME | **Fixed in 1.5** (noindex) |
| 25 | Filters are only Availability and Price | 1 | Medium | S | STORE | Open: Search & Discovery app → add Metal, Stone, Size filters |
| 26 | Duplicate products ("-2" handles) | 2,4,5 | Medium | S | STORE | Open |
| 27 | Product schema: SKU, shipping and return details | 4 | Medium | S | STORE + THEME | The theme already outputs SKU when it exists; add SKUs. Shipping and return schema comes after the policies (#3). |
| 28 | Share: no copy-link or native share | 3 | Medium | S | THEME | Next theme batch |
| 29 | Sticky add-to-bag shows on page load | 1 | Medium | S | THEME | Next theme batch |
| 30 | 7.4 MB of reel video on phones | 3,4 | Medium | S | THEME | Next theme batch (load the poster first, video on tap or when visible) |
| 31 | Category tiles: orphan row and duplicate photo | 1 | Medium | S | THEME setting + CONTENT | Open: use 4 or 8 tiles with different images |
| 32 | Inspiration reels in mismatched sizes and burned-in IG text | 1 | Medium | S | CONTENT | Open: use clean 9:16 exports |
| 33 | Pre-ticked marketing opt-in at checkout | 2,4,5 | Low | S | STORE | Open: Settings → Checkout → uncheck by default |
| 34 | "24*7 Support" wording | 1,2 | Low | S | STORE (theme setting) | Open: suggest "Replies within 24 hours" |
| 35 | Empty blog | 3,4 | Low | M | CONTENT | Open |
| 36 | Empty alt text on images | 1,2,4 | Low | M | STORE | Open: add alt text in Products → media |
| 37 | Unbranded checkout and account pages | 5 | Medium | S | STORE | Open: follow `docs/09-CHECKOUT-AND-ACCOUNT-BRANDING.md` |

## 5. Competitor benchmark (Mejuri, Catbird, Monica Vinader, Aurate)

| What they all do | Anima today |
|---|---|
| One consistent product shot first, lifestyle or on-body shot second | Mixed Etsy props, no consistent first image |
| Photo changes with metal; metal swatches on cards | Photo never changes |
| Stone size, carat, plating or vermeil thickness on the product page | Missing on most products |
| Honest everyday prices, no permanent markdown | Hidden 70% discount, odd cents |
| Hundreds of real reviews, plus UGC | None |
| Named founders, studio and city | Anonymous |
| Clear warranty, repair and resizing promise | None |
| Filters for metal, stone and size | Price and availability only |

The theme's layout already matches this tier. The gap is data, content and honesty signals.

## 6. Prioritised action plan

**Today (you, in Shopify admin, about 3–4 hours):**
1. Activate payments.
2. Decide on pricing (#2) and remove or reprice the discount.
3. Fill in the four policies (I can draft them).
4. Fix the "Only 3 left" inventory.
5. Turn off "Include tax in prices".
6. Add a home meta description.
7. Uncheck the marketing opt-in.

**This week:**
- Fix the Diamond/CZ titles.
- Rewrite the Etsy descriptions on the top 20 products.
- Assign a photo to each metal variant.
- Install a reviews app and ask real buyers.
- Install the GA4 and Meta pixels.
- Add the UK and Canada markets.
- Retag the reels.
- Publish theme 1.5.

**This month:**
- New logo.
- Consistent photography for the bestsellers.
- Stone and plating specs on every product.
- Founder story.
- Metal, stone and size filters.
- First 4 blog posts.

## 7. Implementation log (Phase 5)

All theme work is done on an unpublished copy of the live theme, with one fix at a time. Each fix is tested on mobile and desktop in preview before you publish.

| Fix | Files | Test result |
|---|---|---|
| Ring size must be chosen. No size is ticked unless the link names a variant. The button reads "Select a size". Clicking it without a size shows "Please choose your size first." and adds nothing. | sections/main-product.liquid, snippets/ring-size-dropdown.liquid, assets/theme.js, layout/theme.liquid, locales/en.default.json | Mobile and desktop: dropdown starts on "Select a size"; cart stays at 0 items until a size is picked; choosing 2 3/4 sets the variant and "Add to bag"; no JS errors |
| Tablet category grid gets page margins (3 columns at 750–989px) | sections/category-grid.liquid | At 768px the first tile starts at 16px (it was 0) |
| Checkout button stays solid; touch screens never get stuck in the outlined hover style | assets/base.css | Checked |
| Search pages noindex | layout/theme.liquid | `<meta name="robots" content="noindex, follow">` present on /search |
| "Styled by you" → "From our studio" | templates/index.json, sections/inspiration-station.liquid | Shows on the home page |

Draft theme: **Anima Editorial 1.5 (audit fixes)**, ID 199683276983. To publish: Online Store → Themes → 1.5 → Publish. The live 1.4 stays as a backup.

## 8. Not verified

- Lighthouse scores (LCP and CLS were measured with Playwright instead).
- Checkout beyond page 1, because payments are off.
- Search Console, Analytics and Merchant Center.
- Real iPhone or Safari.
- Whether the Etsy photos are your own.
- Whether the 70% discount is intentional.
