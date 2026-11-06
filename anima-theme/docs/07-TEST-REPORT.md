# Final testing report

**Theme:** Anima Editorial 1.0.0 (Shopify Online Store 2.0)
**Build tested:** commit 946451c on branch `claude/jewelry-website-usa-xzeimv`
**Status:** uploaded to the store as the **unpublished** theme “Anima Editorial 1.0” (theme ID 154464190660). Not published; the live theme is unchanged.

## Tested on the real store (unpublished preview)
- Upload found three things the local tools could not: two Liquid constructs Shopify’s parser rejects, and five range settings with fewer than 3 steps. All are fixed; the schema lint now checks the 3-step rule.
- 17 page types (home, collections incl. Necklaces, product, cart, search, all pages, collections list, blog, 404) return 200 with the new theme and **no Liquid errors or missing translations**.
- Screenshots with real product photos at 1440 and 390 px (home, product, collection) render correctly. The only browser error comes from Shopify’s own web-pixel script, not the theme.
- Preview: `https://ue0p3y-m5.myshopify.com/?preview_theme_id=154464190660`

## How it was tested
Shopify's CDN and your live store pages could not be reached from the build environment. The theme was therefore tested in three ways:

1. **Shopify Theme Check** (the official linter, `@shopify/theme-check-node`): **0 errors, 0 warnings.** The same result on the final ZIP after unpacking it.
2. **Schema lint** (custom script for all section settings, blocks and presets): **0 problems across 33 sections.**
3. **Rendered preview.** A local renderer (LiquidJS) rendered every template using your real catalogue data (product titles, prices, variants, collections) exported read-only from your Shopify admin. Pages were then driven in Chromium with Playwright at 390, 768, 1024, 1280, 1440 and 1920 px.

Things this preview **cannot** prove, and which you should check on Shopify (see `05-INSTALLATION.md` §D):
- Real checkout, accelerated buttons (Shop Pay, Apple Pay), discount codes.
- Predictive search and product recommendation results (served by Shopify).
- Images and videos from Shopify's CDN; filters from the Search & Discovery app.
- Menu link types (used by the footer "collections only" option and empty-bag links).
- iOS Safari background-scroll lock (needs a real iPhone).

**No Lighthouse scores are reported.** They can only be measured honestly on the real store with real images.

## Automated regression suite
`62 / 62 tests pass` (script kept with the review files). Every Critical and High bug found by the reviewers has a test that reproduces the original problem:

| Area | What is checked |
| --- | --- |
| Header | Full width, no gap under it, sticks while scrolling. Dropdown is visible and clickable, with a "View all" link, and stays open after hover-then-click. The menu collapses to the menu icon when it doesn't fit and expands again when the window widens. |
| Layout | No sideways scrolling at 390, 768, 990, 1024, 1100, 1200, 1280, 1440 px on home, demo home, product, collection, FAQ |
| Product page | Buy box sticks and stays fully reachable. Shipping link does not point at the placeholder Shopify policy. Valid Product and Breadcrumb data for Google. Zoom keeps keyboard focus inside and returns it on close. Quantity cannot go below 1. **Buy it now and Add to bag are disabled for sold-out options.** Mobile add-to-bag bar. |
| Product cards | The mobile "+" button can be tapped and is named with the product. On desktop, quick add never covers the title. |
| Quick add | Add to bag is visible on a phone screen. Only one main heading on the page. Cart icon count updates. Focus returns to the card button after closing. |
| Cart | Focus stays put after + / −. Enter in a quantity box updates the line instead of going to checkout. Focus returns after a typed change. |
| Inspiration Station | No equal cards side by side, no dark gradient, no "#" links. Mobile progress bar is usable. |
| Other | Empty collection message with a way forward. Mobile footer starts collapsed and reopens on rotation. Contact message required. Search terms escaped in the page title. No JavaScript errors. |

## Accessibility (axe-core 4.14, final round)
- 14 pages × 2 widths (1440 and 390 px): **0 violations of any impact.** Exactly one H1 per page.
- Keyboard: focus stays inside the lightbox, cart drawer, filter drawer, mobile menu, search and size guide. Escape returns focus to the button that opened each one. Every Tab stop shows a visible focus ring.
- Form controls and option buttons have at least 3:1 border contrast (3.32:1 on white).
- Video: pause controls for hero and social videos, and autoplay stops for visitors who turn off animations.
- The page behind any open drawer or modal is hidden from screen readers (`inert`).

## Performance (measured in the preview)
| Measure | Result |
| --- | --- |
| Layout shift (CLS), worst page | 0.024 (good is under 0.1) |
| `base.css` | 70 KB, **13.2 KB gzipped**, render-blocking (one file) |
| `theme.js` | **14.4 KB gzipped**, deferred, no libraries, no jQuery |
| Third-party scripts added by the theme | none |
| First image | eager with `fetchpriority=high`. Phones download only the mobile hero image (`<picture>`). |
| Videos | load only when scrolled into view, pause when off screen |

## Console and network sweep (final round)
17 routes × 5 widths (77 page loads): **0 console errors, 0 failed requests.**

## Review cycle
Six independent reviewers audited the theme: UI/UX, Brand & content, Shopify development, Conversion, Performance/SEO/accessibility, and Extreme QA. Each round followed the same loop: review, fix, re-test, review again.

| Round | Findings | Critical | High | Verdicts |
| --- | --- | --- | --- | --- |
| 1 | 161 | 2 | 30 | 6 × do not ship / conditional |
| 2 | 38 new + re-checks | 0 | 4 (all fixed) | 6 × ship with conditions |
| 3 | 2 new (both fixed and re-tested) | 0 | 1 (fixed) | **Ship:** UI/UX, Shopify dev, Perf/SEO/A11y, QA. **Ship with conditions (owner items):** Brand, Conversion |

Status of every round-1 finding: `06-ISSUES-ROUND-1.md`. Rounds 2–3: `08-REVIEW-ROUNDS-2-3.md`. Full reports: `docs/audits/round-1`, `round-2`, `round-3`.

## Known issues left open (all Low)
- On desktop screens 1024–1280 px wide, the buy box scrolls away once the gallery ends. A desktop sticky add-to-bag bar is optional.
- Numbered collection pagination does not move keyboard focus to the new results.
- Clicking a menu item about 0.7 s after hovering can close the dropdown.
- Theme Editor only: slideshow timers from removed sections keep running until the editor reloads.
- Cart errors use the browser's `alert()` box.
- On product cards, quick add comes before the title link in the keyboard order.
- The lightbox does not set the page behind it to `inert`. Focus is still trapped, so keyboard users can't leave it.
- `base.css` could be split per template later.

## Needs your decision before launch
1. **Replace the placeholder Shopify shipping policy** ("hey there this is my shipping policy") in *Settings › Policies*. It is still reachable from Shopify's checkout, which a theme cannot change. **This is the main launch blocker.**
2. **Support email:** the theme shows `animajewels@animajewel.in`, but your Shopify policies say `bohosoulart@animajewel.in`. Choose one (*Theme settings › Store information*).
3. **Menu:** "Necklaces" in the main menu links to `/collections/necklace` (the collection with products is `/collections/necklaces`). The menu also has 10 top-level items.
4. **Free shipping over $35:** confirm your shipping rates match.
5. **Bracelets row** on the home page: confirm the products in the Bracelets collection.
6. **Moissanite rings show 0 stock.** The engagement spotlight will show them as sold out.
7. **Origin claim** ("handcrafted in the USA" vs. Jaipur address): the theme makes no origin claim until you confirm one.
8. **Real, permissioned photos and videos** for Inspiration Station and genuine reviews. Both sections stay hidden until you add content.
9. **Image ownership:** confirm images such as `WhiteDiamonds-EARRING.jpg` are yours.
