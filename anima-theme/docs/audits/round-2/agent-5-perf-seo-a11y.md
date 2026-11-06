# Agent 5: Performance, SEO & Accessibility (Round 2)

Theme: `anima-theme` at commit 6df39f4. Preview harness at http://127.0.0.1:8787. Scripts and raw output are in `scratchpad/audits/round-2/5/` (axe.js/axe.json, perf.js/perf.txt, kb.js/kb.txt, borders.js, video.js plus screenshots, ld.js, hero.js, rec.js).

## Verdict: ship with conditions

Most round-1 items are fixed, and I reproduced the fixes:
- The lightbox focus trap now works.
- Hero and social videos have working pause controls and respect reduced motion.
- The hero uses `<picture>`.
- The search and newsletter inputs show focus.
- Titles are fixed.
- Collections have one high-priority image.
- Theme Check reports 0 offences.
- axe-core 4.14 (wcag2a/aa, 21a/aa, 22aa, best-practice) found **0 serious or critical** issues on 18 URLs × 2 widths.

Two conditions before launch:
1. **P5-06 is still failing for unselected variant buttons and the quantity stepper.** Their border is 1.30:1 against the required 3:1 (WCAG 1.4.11).
2. **heading-order still fails on 5 templates** (contact, plus 4 info pages that use multicolumn).

The remaining items are Medium or Low SEO and performance polish.

## Measurements (all taken in the harness; no Lighthouse runs)

Images are placeholder SVGs, so the LCP and CLS figures only show which element is involved. They are not field timings.

| Metric | Round 1 | Round 2 |
|---|---|---|
| base.css raw / gzip -9 | 59,032 / 11,049 B | **67,839 / 12,777 B** (+15%) |
| theme.js raw / gzip -9 | 42,174 / 9,901 B | **54,098 / 12,766 B** (+28%) |
| base.css used (coverage, 1440) | 23–41% | 18% (shipping) to 37% (index-demo); 27–29% on home, PDP and collection |
| `fetchpriority=high` images on /collections/rings | 5 | **1** (banner) |
| /pages/our-story CLS 1440 / 390 | 0.0366 / 0.0226 | 0.0196 / 0.0236 (source is still `section-image-with-text`) |
| Max CLS on the other pages (9 URLs × 2) | ≤0.019 | ≤0.0069 |
| `<img>` without width/height | 0 | 0 |
| External scripts | theme.js (defer) | theme.js (defer); no third-party scripts |

Harness LCP elements:
- Home: the H1 hero heading.
- PDP: the H1. The eager, high-priority image is gallery `ph-1`.
- Collection: the first card image (eager, `fp=auto`).
- /search at 390: a **lazy** card image.
- /cart: a **lazy** line-item image.

**axe-core violations** (all others were 0):

| Rule | Impact | Pages (nodes) |
|---|---|---|
| heading-order | moderate | /pages/contact (`div:nth-child(2) > h3`), /pages/jewellery-care, /pages/shipping-policy, /pages/refund-policy, /pages/ring-size-guide (`li[data-block-id="c0"] > h3`), 1 node each at both widths |

`image-redundant-alt` (round 1, 4 nodes) is now 0. FAQ, collection, search and cart no longer fail heading-order.

**JSON-LD**: every block on all 18 URLs parsed with `JSON.parse` without errors.
- Home: Organization and WebSite (with SearchAction).
- PDP: Product and BreadcrumbList.
- FAQ: FAQPage.
- No other page has structured data.

**Keyboard tests** (Playwright):

| Test | Result |
|---|---|
| Lightbox: 8× Tab and 3× Shift+Tab | All stayed inside (cycling Next ↔ Close). Escape returns focus to the zoom button. |
| Cart drawer (index-cart), facets drawer (rings), mobile menu (390) | 25 or 30 Tabs all stayed inside. Escape returns focus to the trigger. |
| Dropdown: Enter, then an immediate Tab | Lands on "Moissanite Engagement Rings" inside the dropdown. Escape returns focus to "Rings". |
| First 70 Tab stops on index-demo | All have a visible 2px outline. None are hidden. |

Videos were tested by injecting the theme's own hero and social video markup into index-demo; the harness data has no video:

| Mode | Hero video | Social video tile |
|---|---|---|
| no-preference | Autoplays. The 44×44 toggle says "Pause video", and Enter pauses it. | Same, with a 34×34 button |
| `reducedMotion: reduce` | Paused, `autoplay` removed, label "Play video" | Paused, label "Play video" |

## Re-verification of round-1 findings

| ID | R1 sev | Result | Evidence |
|---|---|---|---|
| P5-01 | High | PASS | Tab sequence stays IN the lightbox (kb.txt). `trapFocus` filters with `getClientRects` (theme.js:53-56). The background is not made `inert`; see R2-E-05. |
| P5-02 | High | PASS | Hero toggle pauses and plays; reduced motion pauses the video and strips `autoplay` (theme.js:757-768; video.js output). |
| P5-03 | High | PASS | Single `<picture>` with a mobile `<source>` (hero.liquid:35-42). At 390 and 1440 only one hero image is requested. |
| P5-04 | High | PARTLY FIXED (now Medium) | image-with-text and editorial-spotlight are eager when `section.index <= 2`; the our-story `ph-73` image is now `loading=eager` with no lazy images in view. Still open: (a) neither sets `fetchpriority=high`; (b) category-grid and multicolumn ignore `section.index` and still lazy-load via image.liquid. |
| P5-05 | High | PASS | `#SearchInput` and the newsletter input both show a 2px solid outline on focus, and the form gets a 1px underline shadow (base.css:281-283, 474-476). |
| P5-06 | High | **STILL FAILING (partly)** | Fixed: `.field__input` 3.32:1 on #FFF and 3.02:1 on #F7F4F0; `.slider-button` 3.32:1 (`--color-control`). **Not fixed**: `.variant-option input:not(:checked)+label` is rgb(230,225,219) = **1.30:1** (base.css:545), and `.quantity` on the PDP and cart is **1.30:1** (base.css:552). Both still use `--color-line`. |
| P5-07 | Med | PASS | 1 high-priority image on rings (image.liquid:19-24 separates `priority` from `lazy`). |
| P5-08 | Med | PASS (code-inferred) | main-product.liquid:43 keys on `media.id == first_media.id`. The harness cannot deep-link a variant with its own media. |
| P5-09 | Med | Deferred (agree) | Both files have grown (table above). Unused CSS per page is now 63–82%. |
| P5-10 | Med | PASS (name) / order unchanged | Names read e.g. "Choose options: Five Stone Montana Sapphire…". DOM order is still media > quick-add button > link (Low). |
| P5-11 | Med | PASS | Immediate Tab enters the dropdown; visibility is no longer transitioned when open (base.css:235-237). |
| P5-12 | Med | PASS | Rendered titles: "Rings \| Anima Jewels" and "Five Stone Montana Sapphire Engagement Ring \| 925 Silver \| Anima Jewels". |
| P5-13 | Med | PARTLY FIXED | Present now: `gtin`, `itemCondition`, `seller` and https `availability`. Still open: `image` is only `featured_media` (main-product.liquid:304), and `description` still runs words together. Measured: "uniquely personal.About GemstoneGemstone: Montana SapphireNumber of Stones: 5…" (line 305: `strip_html` with no tag-to-space replace). No return or shipping schema. |
| P5-14 | Med | PASS (code-inferred) | main-article.liquid:39-41 uses `%z`, `dateModified` and `mainEntityOfPage`. Minor: `%z` emits "+0000"; see R2-E-08. |
| P5-15 | Med | PASS | Home H1 is "Montana sapphire, made for every day" (the hero). The logo is a `<div>`. See R2-E-06 for the edge case. |
| P5-16 | Med | PARTLY FIXED | FAQ (now h2 groups), collection, search and cart pass axe. **Contact still fails** (contact-form.liquid:7-11, h3). See R2-E-01. |
| P5-17 | Med | PASS | Static localized label, no `aria-pressed`, `data-state` toggles; the label updates on click. |
| P5-18 | Med | PASS | The social video tile has a play/pause button (social-gallery.liquid:47-49), 34×34 and inside the tile; it works with the keyboard. |
| P5-19 | Med | PASS | Empty `[data-recommendations]` measures height 0 with padding 0 (base.css:761). |
| P5-20 | Low | PARTLY FIXED | The link `aria-label` was removed and "(opens in a new tab)" added. But the inner image still has `alt=caption`, so the name reads the caption twice ("@maya.styles DEMO caption … DEMO caption (opens in a new tab)") (social-gallery.liquid:31). Use `alt: ''`. |
| P5-21 | Low | PASS | Category images `alt=""`; axe image-redundant-alt is 0. |
| P5-22 | Low | PASS (poster) | Poster `alt=""`. The video `aria-label` is still the creator name (inspiration-card.liquid:18,31). Cosmetic. |
| P5-23 | Low | PASS | Thumbnails read "Show image N" and contain no inner `<div>`. |
| P5-24 | Low | PASS (code-inferred) | meta-tags.liquid:15-22 has https, 1200 width, computed height, `og:image:alt` and `twitter:image`. The harness has no `page_image`, so none of these render here. |
| P5-25 | Low | PARTLY FIXED | Organization and WebSite are on the home page, and BreadcrumbList is on the PDP. Organization has **no `logo`** (theme.liquid:66-79). Collections show visual breadcrumbs (main-collection-banner.liquid:14-15) but have **no BreadcrumbList**. |
| P5-26 | Low | Won't fix (accept) | The canonical tag consolidates URLs, as in Dawn. |
| P5-27 | Low | PASS | Only the `cdn.shopify.com` preconnect remains (theme.liquid:9). |
| P5-28 | Low | PASS | `.dropdown a:hover { text-decoration: underline }`. |
| P5-29 | Low | PASS | `window.theme.strings.playVideo`, `pauseVideo`, `playSlideshow` and `pauseSlideshow` come from locales (theme.liquid:114-117). |

## New findings

| ID | Sev | Location | Evidence | Fix |
|---|---|---|---|---|
| R2-E-01 | Medium | sections/multicolumn.liquid:19; sections/contact-form.liquid:7-11 | axe heading-order on 5 templates. Column titles are hard-coded `<h3>` even when the section has no heading, so the outline jumps H1 to H3 (care, shipping, refund and ring-size pages; contact). | `{% if section.settings.heading != blank %}h3{% else %}h2{% endif %}` for the column and block titles in both sections. |
| R2-E-02 | Low | assets/theme.js, assets/base.css | Payload grew in this commit: CSS +8.8 KB raw (+1.7 KB gz), JS +11.9 KB raw (+2.9 KB gz). base.css is still a single render-blocking file, now 18–37% used per page. | Track under P5-09. At minimum, minify both files; per-section CSS is the real fix. |
| R2-E-03 | Low | sections/main-search.liquid:29 | Search results render `product-card` without `lazy: false`, so first-row cards are `loading=lazy`. Measured: the LCP at 390 is a lazy card image, and 8 lazy images are in the viewport at 1440. | Pass `lazy: false` for `forloop.index <= 4`, as main-collection-product-grid.liquid:50-54 does. |
| R2-E-04 | Low | snippets/cart-line-items.liquid:8 | /cart line images are hard-coded `loading: 'lazy'`. They are the LCP element on /cart at both widths. | Eager for the first 2 items (`forloop.index <= 2`). |
| R2-E-05 | Low | assets/theme.js openDrawer / lightbox open | While a drawer, the search modal or the lightbox is open, `#MainContent`, header and footer have `inert=false` (measured). The Tab trap works, but a screen reader's virtual cursor can still read the page behind the dialog. `aria-modal` only partly mitigates this. | Set `inert` on siblings of the open dialog and remove it on close. |
| R2-E-06 | Low | sections/hero.liquid:56-60; header.liquid:22 | The H1 renders only when the hero is `section.index == 1`, and the logo is never an H1. If the merchant reorders the home page or leaves the heading blank, the home page has **no H1** (code-inferred). | Fall back to a visually hidden `<h1>{{ shop.name }}</h1>` on index when the hero is not first. |
| R2-E-07 | Low | assets/theme.js:790-792 | The hero slideshow pause button sets **both** `aria-pressed` and a swapping label ("Play slideshow", pressed). This is the double-state pattern that P5-17 removed from video buttons. | Keep a static "Pause slideshow" label with `aria-pressed`, or drop `aria-pressed`. |
| R2-E-08 | Low | sections/main-article.liquid:39-40 | `%z` outputs "+0000" (basic offset) inside an extended ISO date (code-inferred). Google usually accepts it, but it is not strict ISO 8601. | Use `'%Y-%m-%dT%H:%M:%S%:z'`. |
| R2-E-09 | Low | sections/main-collection-product-grid.liquid:47 | A visually hidden `<h2>` repeats the collection title, so screen readers hear "Rings" (H1) then "Rings" (H2). | Use a "Products" string (`templates.search.products`-style) for the hidden H2. |
| R2-E-10 | Low | sections/hero.liquid:28-30, 46-50 | On a video slide with a mobile image, the desktop `<video autoplay preload="metadata">` stays in a `display:none` wrapper on phones and may still fetch metadata (code-inferred). The mobile image gets no `fetchpriority`. | Use `media`-gated rendering (only attach `src` above 749px via JS), and give the mobile image `fetchpriority: hero_priority` and `loading: hero_loading`. |

## Owner decisions I agree need the owner

1. **Return and shipping structured data (P5-13).** The refund policy confirms a 30-day return window and free return shipping (policies.txt:103-105). However, the Shopify shipping policy is still placeholder text ("hey there this is my shipping policy", policies.txt:158). The owner should finalise the shipping policy in Shopify admin first. Then add `hasMerchantReturnPolicy`, or configure returns and shipping in Merchant Center.
2. **Image alt text.** Section images such as image-with-text use the file's alt from Shopify Files. The harness shows file names ("Our_Story_Page.jpg") because it fills alt from file names. The owner should set real alt text on the shop images in admin.
3. **Organization logo and social URLs.** `sameAs` is empty unless `settings.social_*` are filled in, and no logo is output. The owner should confirm the social profile URLs; the developer should add `logo` from `settings.logo` in the header section, or add a theme setting for it.
4. **P5-09 CSS splitting.** I accept the deferral for launch, given 12.8 KB gz.

## Top 5 to fix

1. **P5-06**: give `.variant-option label` and `.quantity` the `--color-control` border (currently 1.30:1; target ≥3:1).
2. **R2-E-01 / P5-16**: heading level for multicolumn and contact-form column titles (5 templates fail axe).
3. **P5-13**: tag-safe description (`replace: '<', ' <' | strip_html | strip_newlines`) and all product images in the Product JSON-LD.
4. **P5-04 / R2-E-03 / R2-E-04**: `fetchpriority=high` on first-section image-with-text and editorial images; eager first images for category-grid, multicolumn, search results and cart lines.
5. **P5-25 / R2-E-05**: Organization `logo` plus collection BreadcrumbList; `inert` background while dialogs are open.
