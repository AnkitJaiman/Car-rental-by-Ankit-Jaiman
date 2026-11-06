# Agent 5: Performance, SEO & Accessibility (Round 3 verification)

Commits checked: dfc3f5f and 5e04159. Re-run against HEAD 946451c, which adds the size-guide content and Escape-order fixes. Scripts and output are in `scratchpad/audits/round-3/5/` (axe.js/axe.json, borders.js, ld.js, perf.js, kb.js, inert.js, video.js). All figures come from the preview harness; no Lighthouse runs.

## Verdict: SHIP

- Both round-2 launch conditions now pass: control-border contrast and heading order.
- axe-core 4.14 (wcag2a/aa, 21a/aa, 22aa, best-practice) was run on 14 URLs at 1440 and 390 px: the 5 heading-order templates, PDP, /cart, /index-cart, /, /index-demo, rings, search, FAQ and our-story. **0 violations of any impact**, with exactly one H1 on every page.
- No new Critical or High issues and no regressions:
  - All keyboard traps still hold, and the first 70 Tab stops all show a focus ring.
  - Video controls and reduced motion still work.
  - Max CLS is 0.0236, the same as round 2.
  - Every JSON-LD block parses.

## Results

| ID | R2 status | R3 result | Evidence |
|---|---|---|---|
| P5-06 | High, still failing | **PASS** | Unselected `.variant-option` label and `.quantity` (PDP and cart) now use `--color-control`: 3.32:1 on #FFF and 3.02:1 on #F7F4F0. Before, they were 1.30:1. |
| R2-E-01 / P5-16 | Medium | **PASS** | axe heading-order is 0 on contact, jewellery-care, shipping-policy, refund-policy and ring-size-guide. Column titles use `col_tag`/`ct_tag` (h2 when there is no section heading): multicolumn.liquid:29 and contact-form.liquid:2-17. |
| P5-13 | Medium, partly fixed | **PASS** (data-dependent fields deferred) | Description now has spaces between words: "…uniquely personal. About Gemstone Gemstone: Montana Sapphire Number of Stones: 5…" (main-product.liquid:306). `image` lists 3 media (up to 5). Return and shipping schema still wait for owner data. |
| P5-04 | Medium, partly fixed | **PASS** | image-with-text and editorial-spotlight are eager when index ≤2 and use `fetchpriority=high` when index is 1. category-grid and multicolumn are eager when index ≤2. |
| R2-E-03 | Low | **PASS** | /search LCP at 390 is now the first card image, eager. The only lazy images in view are hover (secondary) images. |
| R2-E-04 | Low | **PASS** | /cart LCP (1440 and 390) is an eager line-item image. |
| Size-guide drawer (regression check) | n/a | **PASS** | On the PDP, Enter on "Size guide" opens #SizeGuideDrawer with focus on Close. 20 Tabs all stay inside. The 6 body children are inert. axe finds 0 violations with the drawer open. Escape returns focus to "Size guide" and inert is cleared (sg.js). |
| R2-E-05 | Low | **PARTLY FIXED** | Cart drawer and search modal make the skip link, header, main and footer `inert`, and restore them on close (inert.js). The **lightbox does not**: no body child is inert while it is open, because it sits inside `#MainContent`. Its Tab trap still holds (Next ↔ Close). This remains Low. |
| P5-25 | Low, partly fixed | **PASS** | Organization now has `logo`, and WebSite is present. BreadcrumbList is on /collections/rings and /collections/necklaces as well as the PDP. |
| P5-20 | Low, partly fixed | STILL OPEN (Low) | The social tile `img alt` still equals the caption, so the caption is read twice ("@maya.styles DEMO caption … DEMO caption (opens in a new tab)"). |
| P5-10 | Low (order) | STILL OPEN (Low) | Card DOM order is still media > quick-add button > title link. Its accessible name is fine. |
| P5-22 | Low | Unchanged (cosmetic) | The video `aria-label` is still the creator name. |
| R2-E-02 / P5-09 | Low, deferred | Deferred | Both files grew again. base.css is 70,085 B (13,121 gz), up from 67,839 / 12,777. theme.js is 60,178 B (14,307 gz), up from 54,098 / 12,766. base.css usage is 18–35% per page. |
| R2-E-06 | Low | STILL OPEN (code) | The H1 still renders only when the hero is at `section.index == 1` (hero.liquid:58), and there is no fallback. |
| R2-E-07 | Low | STILL OPEN | The slideshow pause button still swaps both `aria-pressed` and its label (theme.js:843-845). |
| R2-E-08 | Low | STILL OPEN | Article dates still use `%z` (main-article.liquid:39-40). |
| R2-E-09 | Low | STILL OPEN | A visually hidden `<h2>` still repeats the collection title (main-collection-product-grid.liquid:46). |
| R2-E-10 | Low | STILL OPEN (code) | The mobile image on hero video slides still has no loading or fetchpriority setting (hero.liquid:46). The desktop video remains in the DOM on phones. |

## New Critical/High
None.

## Remaining owner items (unchanged)
- Replace the placeholder Shopify shipping policy before adding shipping or return structured data.
- Set real alt text on shop images in Shopify Files.
- Confirm the social profile URLs used for `sameAs`.
