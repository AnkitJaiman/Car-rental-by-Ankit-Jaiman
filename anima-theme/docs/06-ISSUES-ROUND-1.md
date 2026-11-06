# Round 1: combined issue list and status

Six independent reviewers (UI/UX, Brand & content, Shopify development, Conversion, Performance/SEO/accessibility, Extreme QA) audited the first build. Their full reports are in `docs/audits/round-1/`. Every finding is listed below with what happened to it.

**Status:** Fixed (changed and re-tested), Partly fixed, Owner decision (needs your input; not changed), Deferred (low priority), Won’t fix (with reason).

**Totals:** Fixed 127, Deferred 14, Owner decision 12, Partly fixed 7, Won’t fix 1, of 161 findings.

**Critical and High:** Critical/Fixed: 2, High/Fixed: 28, High/Owner decision: 1, High/Partly fixed: 1.

Re-test evidence: `docs/07-TEST-REPORT.md`.

| ID | Severity | Finding | Status | Note |
| --- | --- | --- | --- | --- |
| A1-01 | High | The header bottom rule stops at x=1245 on desktop (hdr.png, every desktop-*.png) | Fixed |  |
| A1-02 | High | On hover (verified with Playwright on /collections/rings, card 5) the quick-add bar spans y 648–690 | Fixed |  |
| A1-03 | High | At 390px each card shows a full-width bordered "CHOOSE OPTIONS" button between the image and the title (mobile-collection-0, mobile-home-demo-3) | Fixed |  |
| A1-04 | High | The pattern runs sm, md, lg, md, sm and then sm again | Fixed |  |
| A1-05 | High | Every image has a dark bottom gradient with a white creator name and @handle (inspo-desk.png, inspo-mob.png) | Fixed | Gradient removed; creator name off by default, shown as a small pill when enabled. |
| A1-06 | Medium | The product strip is a 1px-bordered, radius ~8px box (inspo-desk.png) | Fixed |  |
| A1-07 | Medium | The scroll progress bar is 41px wide, squeezed beside the "Follow us on Instagram" link and the arrows (inspo-mob.png bottom left) | Fixed |  |
| A1-08 | Medium | The image runs 26px past the bottom of the cream band into the next white section (media bottom 5449 vs section bottom 5423) | Fixed |  |
| A1-09 | Medium | The two product rows show the same four products in the same order (Five Stone, Four Stone, Oval Five Stone, Eight Stone; desktop-home-demo-1 vs -4) | Fixed |  |
| A1-10 | Medium | 10 top-level items (Home, Catalog, Rings, Necklaces, Earrings, Bracelets, Gifts, Journal, Contact, About Us) in 11.5px uppercase tracking (hdr.png) | Owner decision | Menu is set in Shopify Navigation (see Theme Editor guide §2). Long menus now collapse to the menu drawer instead of being cut off. |
| A1-11 | Medium | The nav links to an empty collection | Partly fixed | New empty-collection state with a “Shop all” button. Removing the empty Necklaces/Earrings links is a menu change for you. |
| A1-12 | Medium | The breadcrumbs are left-aligned while the title and description are centred (desktop-collection-0.png, Home / Collections / Rings at x≈48, "Rings" centred). | Fixed |  |
| A1-13 | Medium | "Shop" repeats the entire main menu (Home, Contact, About Us…) | Fixed | Help column also lists the existing FAQ, Shipping, Returns, Ring size, Care and Contact pages. |
| A1-14 | Medium | All footer accordions render expanded (mobile-home-demo-5.png), making the footer about 1,100px tall | Fixed |  |
| A1-15 | Medium | The Related products section renders 96px of empty padding before the footer (measured template--product__related height 96) | Fixed |  |
| A1-16 | Medium | There is no sticky add-to-bag | Fixed |  |
| A1-17 | Medium | Assistant (body) is Shopify Dawn's default font, and Playfair Display is the most common "luxury template" serif | Deferred | Fonts are selectable in Theme settings › Typography; changing the default pairing is a brand decision. |
| A1-18 | Low | The breadcrumb wraps so that the second line starts with "/" (mobile-product-0.png: "Home" then "/ Five Stone Montana…"). | Fixed |  |
| A1-19 | Low | The mobile gallery shows dot pagination and a thumbnail strip, which is redundant (mobile-product-0.png). | Fixed |  |
| A1-20 | Low | The "SALE" badge is solid burgundy (#8A2F2F) with white caps, and the sale price is also red | Fixed |  |
| A1-21 | Low | Five uppercase claims with vertical dividers repeat the announcement bar ("Free US shipping over $35" appears in both, plus again in PDP benefits) | Deferred | Sentence case fixed; trust-strip items are editable blocks. |
| A1-22 | Low | "SHOP SAPPHIRE" ends at x=1376 while the grid edge is 1392 | Fixed |  |
| A1-23 | Low | The two stacked CTAs have different widths (solid "Shop the collection" is wider than outline "Our story"), so the left alignment looks accidental (mobile-home-demo-0.png… | Fixed |  |
| A1-24 | Low | The preview renders a narrow, content-width outline button under the full-width ATC (desktop-product-0.png) | Fixed |  |
| B2-01 | Critical | "Shipping calculated at checkout." links to shop.shipping_policy.url | Fixed |  |
| B2-02 | High | "Every Anima piece pairs natural gemstones such as Montana sapphire and emerald with genuine 925 sterling silver." / "Natural gemstones, hand-set in 925 sterling silver." | Fixed |  |
| B2-03 | High | "All our jewelry is nickel-free and hypoallergenic." | Fixed |  |
| B2-04 | High | "contact us within 48 hours of delivery … we'll arrange a replacement at no additional cost" | Fixed |  |
| B2-05 | High | animajewels@animajewel.in | Partly fixed | Hard-coded emails removed from pages (they link to the contact page). The footer email comes from Theme settings: confirm the right inbox. |
| B2-06 | High | "US 6 … US 10 … Available sizes are shown on each product page." | Fixed |  |
| B2-07 | Medium | "exchanges are free within 30 days" | Fixed |  |
| B2-08 | Medium | "We reply within 24 hours, Monday to Saturday." / "Our team replies within 24 hours, Monday to Saturday." | Fixed |  |
| B2-09 | Medium | "We also include care instructions with every order." | Fixed |  |
| B2-10 | Medium | "Our moissanite rings are set with lab-created moissanite, as stated on each product page." | Fixed |  |
| B2-11 | Medium | "Jewellery care" | Fixed |  |
| B2-12 | Medium | "92.5% pure silver, the global standard for fine silver jewelry" | Fixed |  |
| B2-13 | Medium | Moissanite spotlight and "Engagement Rings" tile | Owner decision |  |
| B2-14 | Medium | "Free US shipping on orders over $35" (and the cart progress bar) | Owner decision |  |
| B2-15 | Low | "Every ring is set and finished by hand, so no two pieces are ever exactly alike." / "Every piece is hand-finished and stone-set." | Owner decision |  |
| B2-16 | Low | "natural, earth-mined gemstones" | Owner decision |  |
| B2-17 | Low | Return terms | Fixed |  |
| B2-18 | Low | "…custom-engraved pieces, and Final Sale items… Original shipping fees are non-refundable." | Fixed |  |
| B2-19 | Low | "As worn by you" / "See how our community styles Anima Jewels." / "Follow us on Instagram" | Partly fixed | Copy reworded, no “#” links. Real media and post products are your content. |
| B2-20 | Low | "@animajewels" | Fixed |  |
| B2-21 | Low | "New arrivals, styling notes and members-only offers." | Fixed |  |
| B2-22 | Low | Necklace-36_1.jpg, WhiteDiamonds-EARRING.jpg | Owner decision |  |
| B2-23 | Low | "Free US Shipping Over $35", "Nickel & Lead Free" (Title Case) vs "Free US shipping on orders over $35", "Shop by category" (sentence case) | Fixed |  |
| B2-24 | Low | "…original packaging — we cover the return shipping." | Fixed |  |
| B2-25 | Low | "How do I find my ring size?" | Deferred | Low priority. |
| B2-26 | Low | "Tax included.", "calculated at checkout.", "Home", "Email/Phone/Hours" | Fixed |  |
| B2-27 | Low | "Tell your brand story here.", "Share information about your brand.", "Question" / "Answer", "Column" | Deferred | Low priority. |
| B2-28 | Low | "The new theme defaults to 'Ships from the USA' only" | Fixed |  |
| D3-01 | High | <div class="product-card"> then <div class="product-card__media-wrap"> (38) | Fixed |  |
| D3-02 | High | {{ search.terms \ split: '+' \ | Fixed |  |
| D3-03 | High | if (!variant) { btn.disabled = true; …; return; } runs before idInput.value = variant.id | Fixed |  |
| D3-04 | High | fetch((T.routes.root \ \ | Fixed |  |
| D3-05 | High | data-line="{{ forloop.index }}", then changeLine(parseInt(item.dataset.line,10), …) Line indexes shift as soon as a line is removed | Fixed |  |
| D3-06 | Medium | Liquid prints low_stock ("Only X left") using block.settings.threshold | Fixed |  |
| D3-07 | Medium | {{ media \ model_viewer_tag: reveal: 'interaction', toggleable: true }} | Fixed |  |
| D3-08 | Medium | Zoom button: data-zoom-index="{{ forloop.index0 }}" counted over all media | Fixed |  |
| D3-09 | Medium | shopify:section:load → initSliders(); initAnnouncement(); (global, unguarded), initHeader() (adds window/document listeners again) | Fixed |  |
| D3-10 | Medium | Schema declares { "type": "@app" }, but the markup only loops section.blocks \ where: 'type', 'tile'. | Fixed |  |
| D3-11 | Medium | filter.min_value.value \ money_without_currency \ | Fixed |  |
| D3-12 | Medium | (T.routes.root \ \ | Fixed |  |
| D3-13 | Medium | fetchHTML(url + '?view=quick-view') 1 | Fixed |  |
| D3-14 | Medium | $('.drawer__panel', drawer).innerHTML = fresh.innerHTML; / a.innerHTML = b.innerHTML for [data-facets-drawer-body] The focused +/−/remove button or filter checkbox is des… | Fixed |  |
| D3-15 | Medium | closeQuickAdd(); openDrawer(cartDrawer(), button); button is inside the quick-add modal that was just hidden | Fixed |  |
| D3-16 | Medium | {% unless forloop.first %} is-hidden{% endunless %} combined with a continue for blank quotes On the live storefront, if the first review block has an empty quote, it is … | Fixed |  |
| D3-17 | Medium | Only layout/theme.liquid exists | Partly fixed | Password template added. Account pages use Shopify’s hosted customer accounts. |
| D3-18 | Medium | Policy text, the "$35" threshold and "30-day returns" are hard-coded in JSON template blocks and announcement links (/pages/shipping-policy) | Owner decision | Policy text is editable in the page templates; keep it in line with Settings › Policies. |
| D3-19 | Medium | {%- for collection in collections -%} with no paginate, plus hard-coded handles frontpage, for-shopify-performance-tracking An unpaginated collections loop is capped by S… | Fixed |  |
| D3-20 | Medium | {{ cart.note }}, {{ property.first }}: {{ property.last }}, {{ option.value }}, {{ discount.discount_application.title }}, {{ product.vendor }} Line-item properties and t… | Fixed |  |
| D3-21 | Medium | {{ content_for_additional_checkout_buttons }} is inside [data-cart-page], which is replaced with page.innerHTML = fresh.innerHTML Accelerated checkout buttons (Shop Pay, … | Fixed |  |
| D3-22 | Low | {%- layout none -%} page has no {{ content_for_header }} Shopify scripts (analytics, web pixels, wallet, the Shopify global) are not injected on the gift card page | Fixed |  |
| D3-23 | Low | No {% form 'new_comment', article %}. date: '%Y-%m-%dT%H:%M:%SZ' When blog comments are enabled in admin, shoppers cannot comment | Fixed |  |
| D3-24 | Low | The mega menu is matched by block.settings.menu_item \ downcase == link.title \ | Deferred | Low priority. |
| D3-25 | Low | A product block with an empty product renders <li {{ block.shopify_attributes }}></li> on the live storefront Empty grid cells and carousel gaps appear on the live store … | Fixed |  |
| D3-26 | Low | Load more: $$('li', newGrid).forEach(grid.appendChild), and the URL is never updated 'li' matches descendants, so any future list inside a card (swatches, badges) gets ho… | Fixed |  |
| D3-27 | Low | Home, Tax included., Shipping calculated at checkout., Email/Phone/Hours, aria-label="Close", 'Pause video' Hard-coded English bypasses locales/, so it can't be translate… | Fixed |  |
| D3-28 | Low | Unavailable options only get the is-unavailable class Screen readers get no "sold out / unavailable" state for option values. | Deferred | Low priority. |
| D3-29 | Low | formatMoney handles 5 placeholders amount_with_space_separator and amount_no_decimals_with_space_separator (e.g | Fixed |  |
| D3-30 | Low | threshold_text \ times: 100 compared against cart.total_price | Fixed |  |
| C4-01 | High | On /collections/rings at 390px, the visible "CHOOSE OPTIONS" button (173x40) is covered | Fixed |  |
| C4-02 | High | At 390x844: the gallery spans 208–756px and the thumbnails come after it | Fixed |  |
| C4-03 | High | The forced-open modal at 390px: a full image (≈370px) and thumbnails come first | Fixed |  |
| C4-04 | High | The menu links to /collections/necklace (singular; the collection handle is necklaces) and /collections/earrings | Owner decision |  |
| C4-05 | Medium | The top level has 10 items: Home, Catalog, Rings, Necklaces, Earrings, Bracelets, Gifts, Journal, Contact, About Us | Owner decision |  |
| C4-06 | Medium | "Size guide" (53x21px tap target) opens /pages/ring-size-guide with target="_blank" | Fixed |  |
| C4-07 | Medium | The benefits list (shipping $35+, 30-day returns, 925 silver) is good, but: no delivery estimate on the PDP (it's only inside the collapsed accordion: "dispatched 1–2 day… | Deferred | Enhancement rather than a defect. |
| C4-08 | Medium | cart_show_note defaults to false in config/settings_schema.json, so neither the drawer nor /cart has a gift note or "This is a gift" option | Fixed |  |
| C4-09 | Medium | After adding, the drawer shows one line, then ≈420px of empty white space down to the subtotal (a4-d-drawer-after-quick.png, a4-m-drawer.png) | Fixed |  |
| C4-10 | Medium | Shows "Your bag is empty." + "Continue shopping" only, with no categories or bestsellers. | Fixed |  |
| C4-11 | Medium | The hero headline is "Montana sapphire, made for every day", but the primary CTA "Shop the collection" goes to /collections/all, a generic catalog. | Fixed |  |
| C4-12 | Medium | Order: Hero → Trust → Categories → New arrivals (10) → Story → Inspiration (hidden live) → Moissanite spotlight → Sapphire grid (4, repeats the first 4 New-arrivals cards… | Partly fixed | Duplicate product row replaced with Bracelets; section order is editable. |
| C4-13 | Medium | The collection banner takes ≈380px (130–510) on a 844px screen | Deferred | Enhancement rather than a defect. |
| C4-14 | Medium | Each card has a product chip (thumbnail, title, price) that links to the PDP, which works (tap → PDP) | Fixed |  |
| C4-15 | Medium | The "Help" column has only Search and Your Privacy Choices | Fixed |  |
| C4-16 | Medium | The footer and mobile menu show animajewels@animajewel.in (a .in domain) for a US-only store whose site domain is animajewel.store. | Owner decision |  |
| C4-17 | Low | All 10 combinations are available in the data, so the unavailable states can't be checked here | Deferred | Needs the live store to verify. |
| C4-18 | Low | On mobile the breadcrumb is "Home / [full product title]" and wraps to two lines | Deferred | Enhancement rather than a defect. |
| C4-19 | Low | Sort options: Featured, price ↑↓, newest | Owner decision |  |
| C4-20 | Low | Cards show title, price and "2 colors", with no swatches and no stone or carat summary | Deferred | Enhancement rather than a defect. |
| C4-21 | Low | The related-products and recently-viewed sections are present but rendered empty here (the recommendations endpoint is mocked) | Deferred | Needs the live store to verify. |
| C4-22 | Low | Opens with a "Search jewelry" input only | Deferred | Enhancement rather than a defect. |
| P5-01 | High | The filter el.offsetParent !== null drops every lightbox button because they are position:fixed, so items is empty and the trap returns early | Fixed |  |
| P5-02 | High | Hero video uses video_tag autoplay loop with no pause control | Fixed |  |
| P5-03 | High | When a mobile image is set, the desktop <img> is loading=eager fetchpriority=high inside a display:none wrapper | Fixed |  |
| P5-04 | High | loading: 'lazy' is hard-coded | Fixed |  |
| P5-05 | High | No replacement indicator (the border is the same in both states) | Fixed |  |
| P5-06 | High | The only control boundary is --color-line #E6E1DB, which is 1.30:1 on white and 1.19:1 on soft | Fixed |  |
| P5-07 | Medium | lazy:false always adds fetchpriority=high, so /collections/rings has 5 high-priority images (banner + the first row of 4 cards) | Fixed |  |
| P5-08 | Medium | The eager or high-priority choice uses forloop.first, but the active slide is first_media (the selected variant's media) | Fixed |  |
| P5-09 | Medium | One 59 KB (11 KB gz) render-blocking stylesheet; 60–77% is unused on any given page (coverage measured above) | Deferred | Splitting base.css per template is a later optimisation (about 11 KB gzipped today). |
| P5-10 | Medium | Every card says "Choose options" or "Add to cart" with no product name in its accessible name (WCAG 2.4.6, and 2.4.4 best practice) | Fixed |  |
| P5-11 | Medium | The dropdown and mega menu use visibility transitions | Fixed |  |
| P5-12 | Medium | Whitespace control strips the space before the separators | Fixed |  |
| P5-13 | Medium | Product JSON-LD is missing gtin/mpn (variant.barcode), itemCondition, seller, hasMerchantReturnPolicy and shippingDetails (Google merchant listing fields) | Partly fixed | Added gtin, itemCondition and seller. Return and shipping schema need confirmed store data. |
| P5-14 | Medium | date: '%Y-%m-%dT%H:%M:%SZ' labels shop-local time as UTC, so the timestamp is wrong by the shop's offset | Fixed |  |
| P5-15 | Medium | On the homepage the only H1 is the logo image (rendered <h1><a><img alt="Anima Jewels">), so the text H1 is just "Anima Jewels" | Fixed |  |
| P5-16 | Medium | axe heading-order on 5 templates: H1 then H3 (FAQ group titles; product-card titles on collection and search; cart line items; contact columns). | Fixed |  |
| P5-17 | Medium | The button sets both aria-pressed and a label that swaps between "Play video" and "Pause video" (double state; screen readers announce "Pause video, pressed") | Fixed |  |
| P5-18 | Medium | Social gallery video tiles reuse data-inspo-video and autoplay when visible, but there is no pause button in the tile (only Inspiration cards have one) | Fixed |  |
| P5-19 | Medium | The empty wrapper keeps --pt/--pb padding before and without results, which leaves 128px of blank space when there are no recommendations | Fixed |  |
| P5-20 | Low | The link's aria-label equals the caption, overrides the overlay text, duplicates the image alt and gives no "opens in new tab" warning (target=_blank). | Fixed |  |
| P5-21 | Low | The image alt equals the card's <h3> title, so names are read twice (axe image-redundant-alt, 4 nodes). | Fixed |  |
| P5-22 | Low | The poster <img alt=name> and <video aria-label=name> repeat the creator name, which the overlay also shows. | Fixed |  |
| P5-23 | Low | Thumbnail buttons reuse accessibility.zoom ("Open image N in full screen") but they only select the slide | Fixed |  |
| P5-24 | Low | og:image uses http:. og:image:width/height give the original dimensions, not the 1200px rendition | Fixed |  |
| P5-25 | Low | There is no Organization or WebSite JSON-LD (logo, sameAs socials) and no BreadcrumbList, although visual breadcrumbs exist on the PDP and collections. | Fixed |  |
| P5-26 | Low | product.url \ | Won’t fix | Same as Dawn; the canonical tag consolidates URLs. |
| P5-27 | Low | Preconnects to fonts.shopifycdn.com | Fixed |  |
| P5-28 | Low | .dropdown a:hover { color: var(--color-accent) }: #9C7F52 on white is 3.77:1, below 4.5:1 (hover state only, so low impact). | Fixed |  |
| P5-29 | Low | The strings 'Pause video', 'Play video' and 'Play slideshow'/'Pause slideshow' are hard-coded English, so non-English stores announce English labels (3.1.2 language of pa… | Fixed |  |
| Q6-01 | Critical | the item shows as open (is-open, aria-expanded=true, opacity 1), but the dropdown is clipped and invisible | Fixed |  |
| Q6-02 | High | it scrolls away; header top is −1462px at 1440 and −1162px at 390. | Fixed |  |
| Q6-03 | High | there is a 40px empty white band (28px on mobile) | Fixed |  |
| Q6-04 | High | the nav is 576px wide with 686px of content | Fixed |  |
| Q6-05 | High | document scrollWidth is 1347 @990, 1358 @1024, 1383 @1100 and 1294 @1200, so the whole page scrolls sideways | Fixed |  |
| Q6-06 | High | the info column scrolls away (top = −681px), and Add to bag is gone while the user looks at images. | Fixed |  |
| Q6-07 | Medium | the click closes the menu that hover just opened (aria-expanded=false) | Fixed |  |
| Q6-08 | Medium | after every update document.activeElement is <body>. Keyboard and screen-reader users lose their place, and repeated + needs re-tabbing through the whole drawer. | Fixed |  |
| Q6-09 | Medium | focus lands on <body>. | Fixed |  |
| Q6-10 | Medium | focus goes to <body> and the whole drawer body is re-rendered | Fixed |  |
| Q6-11 | Medium | the badge shows 1, but #CartIcon aria-label still says "Cart, 0 items". | Fixed |  |
| Q6-12 | Medium | nothing happens | Fixed |  |
| Q6-13 | Medium | Tab leaves the aria-modal dialog and focus reaches the hidden breadcrumb "Rings" behind it | Fixed |  |
| Q6-14 | Medium | href="#" | Fixed |  |
| Q6-15 | Medium | the progress track is 41px wide | Fixed |  |
| Q6-16 | Medium | "No products match these filters." when no filters exist | Fixed |  |
| Q6-17 | Medium | it stays closed | Fixed |  |
| Q6-18 | Low | the panel is min(420px,100%), i.e | Fixed |  |
| Q6-19 | Low | All three footer accordions start open (<details open>), so the mobile footer is long and the accordion adds nothing. | Fixed |  |
| Q6-20 | Low | the value is accepted and posted as is (Shopify then returns a 422 error). | Fixed |  |
| Q6-21 | Low | The page now has 2 <h1> elements (the quick-view product title). | Fixed |  |
| Q6-22 | Low | Slides change with no aria-live announcement | Fixed |  |
| Q6-23 | Low | The server renders "Only N left"; after any JS variant change it says "In stock" | Fixed |  |
| Q6-24 | Low | routes.root_url is /fr with no trailing slash, so the JS builds /frsearch (theme.js:167) and /frproducts/<handle> (recently viewed, theme.js:761) | Fixed |  |
| Q6-25 | Medium | the heading, "View all" and carousel arrows render over an empty <ul>. Blank product blocks render empty <li> gaps | Fixed |  |
| Q6-26 | Low | The menu points to /collections/necklace (singular), while templates/index.json:131 and the theme use necklaces | Owner decision | Menu links to /collections/necklace while the theme uses necklaces (both empty). |
| Q6-27 | Low | Submits with an empty message (contact[body] not required). | Fixed |  |
| Q6-28 | Low | body.scroll-lock{overflow:hidden} alone does not stop background scroll on iOS. The page behind the drawer or modal can scroll. | Partly fixed | Added overscroll and touch-action lock; verify on a real iPhone. |
