# Agent 5 — Performance, SEO & Accessibility Audit (Round 1)

Theme: `anima-theme` (Anima Editorial, Shopify OS 2.0). Reviewed against WCAG 2.2 AA, Core Web Vitals practice, Google Search fundamentals and Shopify theme performance guidance.

## Verdict

**Conditional pass. Fix the High items before launch.** The basics are solid. Every page has one H1, `lang` is set, there is a skip link, a global `:focus-visible` outline and labelled dialogs. Drawers trap focus and return it. JS is a single deferred file and images carry width and height. Running axe-core on 10 pages at 2 viewport widths found **no serious or critical violations**.

The real problems are in places automated tools do not check:
- The PDP lightbox does not keep focus inside it (confirmed by keyboard test).
- Hero video has no pause control and ignores reduced motion.
- Some LCP images are hard-coded to lazy-load. On mobile, the hero downloads the hidden desktop image at high priority.
- The search and newsletter inputs have no focus indicator.
- Form borders fail the 3:1 non-text contrast minimum.
- There are a few SEO defects: `<title>` spacing, gaps in Product JSON-LD, and the Article date timezone.

## Measurements actually taken

No Lighthouse runs were done. Images in the harness are placeholder SVGs, so the LCP and CLS numbers below come from a local mock and only show which element is involved. They are not field-representative timings.

**Asset weight** (from the source files; gzip -9):

| File | Raw | gzip |
|---|---|---|
| assets/base.css (render-blocking) | 59,032 B | 11,049 B |
| assets/theme.js (`defer`) | 42,174 B | 9,901 B |

**CSS coverage** (Playwright, 1440px, after a scroll pass): base.css used 32% on `/`, 41% on `/index-demo.html`, 30% on the PDP, 30% on `/collections/rings` and 23% on `/pages/our-story`. Roughly 60–77% of the blocking CSS is unused on any one page.

**PerformanceObserver** (harness, 1440 / 390 px):

| Page | CLS 1440 / 390 | LCP element (harness) | DOM nodes | img with fetchpriority=high |
|---|---|---|---|---|
| / | 0.0087 / 0.0061 | h2.hero__heading | 687 | 1 |
| /index-demo.html | 0.0087 / 0.0061 | h2.hero__heading | 1014 | 1 |
| PDP | 0.0062 / 0.0191 | h1 / gallery li | 468 | 1 |
| /collections/rings | 0.0082 / 0.0022 | first product-card img (eager, high) | 718 | **5** |
| /pages/our-story | **0.0366** / 0.0226 | p (image-with-text image is in the viewport but `loading=lazy`) | 366 | 0 |

No `<img>` was missing width or height on any page tested. One external script (theme.js, deferred). No third-party scripts in the theme.

**axe-core 4.x** (tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice), 10 URLs × 2 viewports:

| Rule | Impact | Pages (nodes) |
|---|---|---|
| heading-order | moderate | /collections/rings, /cart, /search, /pages/faq, /pages/contact (1 node each; at both widths) |
| image-redundant-alt | minor | / and /index-demo.html at 390px (4 nodes: category-grid images) |
| (any serious or critical) | — | **0** |

axe passed color-contrast on every page. It cannot check text over images or video, or focus behaviour.

**Manual contrast** (WCAG relative luminance):

| Pair | Ratio | Result |
|---|---|---|
| text #1C1B1A on #FFF / #F7F4F0 | 17.2 / 15.69 | Pass |
| muted #6B6560 on #FFF / #F7F4F0 | 5.74 / 5.24 | Pass AA |
| accent #9C7F52 on #FFF / #F7F4F0 | 3.77 / 3.44 | Fails 4.5:1 for body text; passes 3:1 for icons. Used for text only on `.dropdown a:hover` |
| sale #8A2F2F on #FFF / #F7F4F0 | 8.31 / 7.58 | Pass |
| line #E6E1DB on #FFF / #F7F4F0 | 1.30 / 1.19 | **Fails 1.4.11** where it is the only boundary of an input or control |

**Keyboard tests** (Playwright `page.keyboard`):

| Test | Result |
|---|---|
| Skip link is the first Tab stop and becomes visible | Pass |
| Focus ring on every Tab stop (first 40 on index-demo) | Pass (2px solid outline). **Search input: `outline:none`** with no replacement |
| Desktop "Rings" dropdown: Enter/Space opens, `aria-expanded` toggles, Tab enters links, Escape closes and returns focus, focus-out closes | Pass. If Tab is pressed during the open transition (<~300ms), the links are still `visibility:hidden` and get skipped |
| Mega menu | Not rendered by the harness menu data; checked in source only (same code path) |
| Cart drawer: opens from the cart icon, focus moves to Close, Tab stays inside, Escape closes, focus returns to #CartIcon | Pass |
| Mobile menu drawer: same checks; `aria-expanded` on the toggle | Pass |
| Closed drawers: focusable children are unreachable | Pass (visibility:hidden) |
| Search modal: focus moves to the input, combobox ARIA present, Escape returns focus to the trigger | Pass |
| Inspiration Station track: focusable (`tabindex=0`), ArrowRight scrolls (scrollLeft 0→259) | Pass |
| **PDP lightbox: Tab moved focus out to "Previous, Next, DIV, SUMMARY Shop"** behind the modal | **Fail** |
| PDP lightbox: Escape closes and returns focus to the zoom button | Pass |
| PDP variant radios / quantity buttons (44×46, labelled with the product name) | Pass |
| Inspiration video play/pause, hero pause | No video in the harness data, so these could not be run; reviewed in source |

## Findings

| ID | Cat | Sev | Location | Evidence | Fix |
|---|---|---|---|---|---|
| P5-01 | A11y | High | assets/theme.js:49-50 (`trapFocus`), affects `[data-lightbox]` (main-product.liquid:230) | The filter `el.offsetParent !== null` drops every lightbox button because they are `position:fixed`, so `items` is empty and the trap returns early. Measured: Tab from the lightbox reached `SUMMARY "Shop"` in the footer. The dialog says `aria-modal="true"` but focus can leave it. The same latent bug hits any fixed-position control inside a drawer or modal. | `var items = $$(FOCUSABLE, container).filter(function (el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; });` Also set `inert` on `#MainContent`, header and footer while a modal is open. |
| P5-02 | A11y | High | sections/hero.liquid:29, 75-77; theme.js:621 | Hero video uses `video_tag autoplay loop` with no pause control. The pause button renders only when `slide_count > 1` and controls the slideshow, not the video. `reduceMotion` is never applied to the hero video. This fails WCAG 2.2.2 (Pause, Stop, Hide: looping motion over 5 s) and ignores `prefers-reduced-motion`. | Render a pause/play button whenever any slide has a video, and have it call `video.pause()`/`play()`. In JS: `if (reduceMotion) $$('.hero__video', hero).forEach(v => { v.pause(); v.removeAttribute('autoplay'); });`. Rename the slideshow button label to `accessibility.pause_slideshow`. |
| P5-03 | Perf | High | sections/hero.liquid:34 + 41-42; base.css:288-289 | When a mobile image is set, the desktop `<img>` is `loading=eager fetchpriority=high` inside a `display:none` wrapper. Eager images are still downloaded when hidden, so mobile visitors fetch the 100vw desktop image at top priority. The visible mobile image (the real mobile LCP) gets no `fetchpriority` and default loading. | Use one `<picture>`: `<picture><source media="(max-width: 749px)" srcset="{{ s.image_mobile \| image_url: width: 750 }} 750w, …" sizes="100vw">{{ s.image \| image_url: width: 2800 \| image_tag: … loading: hero_loading, fetchpriority: hero_priority }}</picture>` |
| P5-04 | Perf | High | sections/image-with-text.liquid:9; editorial-spotlight.liquid:17; category-grid / multicolumn (via image.liquid default `lazy`) | `loading: 'lazy'` is hard-coded. On /pages/our-story the first section's image is in the initial viewport and loads lazily (measured `lazyInView: ph-73`; CLS 0.037 on that section). Any merchant who places these sections first on a template gets a lazy-loaded LCP image. | `{%- liquid assign ld = 'lazy' assign fp = 'auto' if section.index <= 2 assign ld = 'eager' assign fp = 'high' endif -%}` then `loading: ld, fetchpriority: fp`. Do the same for category-grid and multicolumn (pass `lazy: false` when `section.index <= 2`). |
| P5-05 | A11y | High | base.css:274 (`.search-form input:focus{outline:none}`), base.css:465 (`.newsletter__form input:focus{outline:none}`) | No replacement indicator (the border is the same in both states). Measured: `INPUT#SearchInput outline=none`. Fails WCAG 2.4.7. | `.search-form:focus-within, .newsletter__form:focus-within { outline: 2px solid currentColor; outline-offset: 4px; }` or remove the `outline:none` rules. |
| P5-06 | A11y | High | base.css:117 (`.field__input`), 534 (`.variant-option label`), 541 (`.quantity`), 158 (`.slider-button`) | The only control boundary is `--color-line` #E6E1DB, which is 1.30:1 on white and 1.19:1 on soft. This fails WCAG 1.4.11 (3:1) for inputs, selects, variant buttons and the quantity stepper. | Add a token for control borders, e.g. `--color-input-border: #8F8881` (3.5:1 on #FFF), and use it for `.field__input, .select__select, .quantity, .variant-option label, .slider-button`. Keep `--color-line` for decorative rules. |
| P5-07 | Perf | Medium | snippets/image.liquid:14-20; main-collection-product-grid.liquid:35-39 | `lazy:false` always adds `fetchpriority=high`, so /collections/rings has **5** high-priority images (banner + the first row of 4 cards). This dilutes LCP prioritisation, and with a banner image the cards compete with it. | Separate the two params: `if priority == true assign fp = 'high' else assign fp = 'auto'`. Pass `priority: true` only for the first card when there is no banner image. |
| P5-08 | Perf | Medium | sections/main-product.liquid:30-36 | The eager or high-priority choice uses `forloop.first`, but the active slide is `first_media` (the selected variant's media). With `?variant=` deep links (Shopping ads) the visible image loads lazily and a hidden one loads at high priority. | `if media.id == first_media.id` then `l = false`, else `l = true`. Also render the active media first or scroll to it on load. |
| P5-09 | Perf | Medium | layout/theme.liquid:36; assets/base.css | One 59 KB (11 KB gz) render-blocking stylesheet; 60–77% is unused on any given page (coverage measured above). PDP, cart, facets, inspo, lightbox and testimonial rules ship everywhere. | Split per-section CSS into `assets/section-*.css` loaded inside each section (`{{ 'section-main-product.css' \| asset_url \| stylesheet_tag }}`) or `{% stylesheet %}`. Keep the critical header, hero and typography in base.css, and minify. |
| P5-10 | A11y | Medium | snippets/product-card.liquid:64-75 | Every card says "Choose options" or "Add to cart" with no product name in its accessible name (WCAG 2.4.6, and 2.4.4 best practice). The button also comes before the product link in tab order (measured stops 30/31). | `<button … aria-label="{{ 'products.product.choose_options' \| t }}: {{ product.title \| escape }}">`, or add `<span class="visually-hidden"> {{ product.title }}</span>`. Move `.product-card__quick-add` after `.product-card__info` in the DOM and position it with CSS. |
| P5-11 | A11y | Medium | assets/theme.js:131 + base.css:228-231 | The dropdown and mega menu use `visibility` transitions. If Tab is pressed within `--duration` after Enter, the links are still `visibility:hidden` and get skipped. In testing, an immediate Tab after Enter landed on "Necklaces", not the submenu. | `.nav-item.is-open > .dropdown { transition-delay: 0s; visibility: visible; }` (transition only opacity/transform), or set `transition: visibility 0s` when opening. |
| P5-12 | SEO | Medium | layout/theme.liquid:24-26 | Whitespace control strips the space before the separators. Rendered titles: `"Rings\| Anima Jewels"` and `"…925 Silver\| Anima Jewels"`. Tag and page suffixes also render as `"Rings– Page 2"`. | `{%- unless page_title contains shop.name %} \| {{ shop.name }}{% endunless -%}` (no `-` on the right of the opening tag). Same for the `current_tags` and `current_page` lines. |
| P5-13 | SEO | Medium | sections/main-product.liquid:245-267 | Product JSON-LD is missing `gtin`/`mpn` (variant.barcode), `itemCondition`, `seller`, `hasMerchantReturnPolicy` and `shippingDetails` (Google merchant listing fields). It has only one image. `description` comes from `strip_html` and runs words together ("Montana SapphireNumber of Stones…", seen in the rendered output). `availability` uses `http://`. | Add `"image": [{% for m in product.media limit: 5 %}{{ m.preview_image \| image_url: width: 1200 \| prepend: 'https:' \| json }}{% unless forloop.last %},{% endunless %}{% endfor %}]`; per offer, `{% if variant.barcode != blank %}"gtin": {{ variant.barcode \| json }},{% endif %}"itemCondition":"https://schema.org/NewCondition","seller":{"@type":"Organization","name":{{ shop.name \| json }}}`; use `https://schema.org/InStock`; and `product.description \| replace: '</', ' </' \| strip_html \| strip_newlines`. |
| P5-14 | SEO | Medium | sections/main-article.liquid:23 | `date: '%Y-%m-%dT%H:%M:%SZ'` labels shop-local time as UTC, so the timestamp is wrong by the shop's offset. `dateModified`, `mainEntityOfPage` and the publisher logo are missing. | `"datePublished": {{ article.published_at \| date: '%Y-%m-%dT%H:%M:%S%z' \| json }}, "dateModified": {{ article.updated_at \| date: '%Y-%m-%dT%H:%M:%S%z' \| json }}, "mainEntityOfPage": {{ request.origin \| append: article.url \| json }}` |
| P5-15 | SEO | Medium | sections/header.liquid:22,34; hero.liquid:51 | On the homepage the only H1 is the logo image (rendered `<h1><a><img alt="Anima Jewels">`), so the text H1 is just "Anima Jewels". The hero headline, which holds the keywords, is an H2. | Add a hero setting `heading_tag` (h1/h2), defaulting to h1 when `section.index == 1` on index, and make the logo a `<div>` in that case. |
| P5-16 | A11y | Medium | sections/collapsible-content.liquid:15; main-contact / cart / product-card h3 | axe `heading-order` on 5 templates: H1 then H3 (FAQ group titles; product-card titles on collection and search; cart line items; contact columns). | FAQ groups: use `<h2>`. Product cards: add a visually hidden `<h2>` "Products" above the grid, or make the card heading level a param. Cart items: use `h2` or a `<p>` with the name inside the link. |
| P5-17 | A11y | Medium | snippets/inspiration-card.liquid:37; theme.js:536-541 | The button sets **both** `aria-pressed` and a label that swaps between "Play video" and "Pause video" (double state; screen readers announce "Pause video, pressed"). Server markup ships `aria-pressed="true"` with the label "Play video" before JS runs. Labels are hard-coded English in JS. | Keep a static label (`aria-label="{{ 'accessibility.play_video' \| t }}"`) and toggle `aria-pressed`, or drop `aria-pressed` and swap a localized label passed via `window.theme.strings`. |
| P5-18 | A11y | Medium | sections/social-gallery.liquid:25 + theme.js initVideos | Social gallery video tiles reuse `data-inspo-video` and autoplay when visible, but there is **no pause button** in the tile (only Inspiration cards have one). With autoplay, looping motion has no control (WCAG 2.2.2). | Reuse the `inspo-card__play` button markup inside `.social-tile` video tiles (outside the `<a>`), or start these videos only on hover or focus. |
| P5-19 | Perf | Medium | sections/related-products.liquid:4-5 | The empty wrapper keeps `--pt`/`--pb` padding before and without results, which leaves 128px of blank space when there are no recommendations. Content injected later grows the page below the fold. | Add `min-height` with a reserved grid skeleton, and hide the wrapper when the fetch returns nothing: `if (!fresh \|\| !fresh.innerHTML.trim()) el.remove();` |
| P5-20 | A11y | Low | sections/social-gallery.liquid:40 | The link's `aria-label` equals the caption, overrides the overlay text, duplicates the image alt and gives no "opens in new tab" warning (`target=_blank`). | `aria-label="{{ t.caption \| default: t.username \| escape }} – {{ 'accessibility.new_window' \| t }}"` and `alt=""` on the inner image. |
| P5-21 | A11y | Low | sections/category-grid.liquid:48 | The image alt equals the card's `<h3>` title, so names are read twice (axe `image-redundant-alt`, 4 nodes). | `alt: ''` (decorative inside a named link). |
| P5-22 | A11y | Low | snippets/inspiration-card.liquid:24 + 31 | The poster `<img alt=name>` and `<video aria-label=name>` repeat the creator name, which the overlay also shows. | Give the poster `alt=""`. Name the video by content, e.g. "Video: {{ caption \| default: product.title }}". |
| P5-23 | A11y | Low | sections/main-product.liquid:65-66 | Thumbnail buttons reuse `accessibility.zoom` ("Open image N in full screen") but they only select the slide. A `<div>` inside a `<button>` is invalid content. | Use a new string, `accessibility.show_image` ("Show image {{ index }}"), and replace the inner `<div>` with a `<span class="media …">`. |
| P5-24 | SEO | Low | snippets/meta-tags.liquid:16-19 | `og:image` uses `http:`. `og:image:width/height` give the original dimensions, not the 1200px rendition. There is no `twitter:image` and no `og:image:alt`. | `content="https:{{ page_image \| image_url: width: 1200 }}"`, width `1200`, height `{{ 1200 \| divided_by: page_image.aspect_ratio \| round }}`, `<meta property="og:image:alt" content="{{ page_image.alt \| escape }}">` |
| P5-25 | SEO | Low | sitewide (theme.liquid / main-product / main-collection-banner) | There is no Organization or WebSite JSON-LD (logo, sameAs socials) and no BreadcrumbList, although visual breadcrumbs exist on the PDP and collections. | Add an `Organization` block on index with `logo` and `sameAs` from `settings.social_*`, plus a `BreadcrumbList` beside the breadcrumbs `<nav>`. |
| P5-26 | SEO | Low | snippets/product-card.liquid:38,72 | `product.url \| within: collection` emits `/collections/x/products/y` links in every grid. The canonical tag handles it, but it multiplies crawl paths and splits internal link equity. | Use `product.url` (Shopify's own Dawn has dropped `within`). |
| P5-27 | Perf | Low | layout/theme.liquid:11 | Preconnects to `fonts.shopifycdn.com`. Current Shopify serves `font_url` from the shop domain (`/cdn/fonts/…`), so this connection is likely wasted. `font_face` loads 4 faces (heading, body, 500, bold), but only 2 are preloaded. | Drop the fonts preconnect (or verify the host in production). Consider whether weight 500 is needed. |
| P5-28 | A11y | Low | base.css:230 | `.dropdown a:hover { color: var(--color-accent) }`: #9C7F52 on white is 3.77:1, below 4.5:1 (hover state only, so low impact). | Use `text-decoration: underline` on hover, or a darker accent such as #7A6340 (5.4:1). |
| P5-29 | A11y | Low | theme.js:538, 631 | The strings 'Pause video', 'Play video' and 'Play slideshow'/'Pause slideshow' are hard-coded English, so non-English stores announce English labels (3.1.2 language of parts). | Expose them in `window.theme.strings` from locales (theme.liquid:68-76). |

## Top 5 must-fix

1. **P5-01 Lightbox focus trap is broken.** Change the `trapFocus` visibility filter to `getClientRects().length` and make the background `inert` while a modal is open.
2. **P5-02 / P5-18 Auto-playing video has no pause control.** Add pause/play for hero video and social-gallery video tiles, and respect `prefers-reduced-motion` in the hero (WCAG 2.2.2).
3. **P5-03 / P5-04 LCP image loading.** Use `<picture>` for the hero mobile/desktop art direction. Pick `section.index`-based eager/high instead of hard-coded `loading:'lazy'` in image-with-text, editorial-spotlight, category-grid and multicolumn.
4. **P5-05 / P5-06 Focus visibility and control contrast.** Restore a focus indicator on the search and newsletter inputs. Add a 3:1 `--color-input-border` token for inputs, variant buttons and the quantity stepper.
5. **P5-12 / P5-13 SEO correctness.** Fix the `<title>` separator whitespace sitewide. Complete Product JSON-LD (all images, gtin, itemCondition, seller, https availability, clean description).
