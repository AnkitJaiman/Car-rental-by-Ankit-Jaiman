# Agent 4: Conversion, Round 3 verification (commits dfc3f5f, 5e04159)

**Method:** Playwright with real taps at 390x844 (`hasTouch`/`isMobile`) and clicks at 1440x900, against the re-rendered preview.
**Files:** scripts and screenshots are in `/tmp/claude-0/-home-user-Car-rental-by-Ankit-Jaiman/fdadd1fb-8cbc-5ec2-9d60-60529d96a2a6/scratchpad/audits/round-3/4/` (`r3.js`, `sg.js`, `m-*.png`, `d-*.png`). No JS page errors.

## Verdict: **Do not ship until R3-C-01 is fixed.**

R3-C-01 is a one-line fix. Most round-2 items now pass. But the new size-guide drawer opens with the sizing methods and the size chart **invisible**, which is worse than round 2's same-tab page. With that fixed, my verdict becomes ship with conditions; the conditions are the owner menu items below.

## Re-check of round-2 items

| ID | Result | Evidence |
|---|---|---|
| R2-C-01 empty-bag links (High) | **PASS (partly)** | `cart-drawer.liquid` and `main-cart.liquid` now use `settings.cart_empty_menu` directly. `/cart-empty.html` renders "Popular categories: Catalog, Rings, Necklaces, Earrings, Bracelets". The new filter skips collection links with 0 products and drops page and blog links. The preview menu has no link `type`/`object` data, so the empty-collection filter can't be exercised here. Remaining risks (code-inferred): (1) Necklaces points to `/collections/necklace`, a handle that doesn't exist, so that link likely isn't a `collection_link` and would still show; (2) `limit: 6` is still applied before filtering. Owner fix: C4-04 menu. |
| R2-C-02 sticky bar variant (Medium) | **PARTLY** | The bar now shows the variant: "Gold / 6" by default and "Gold / 9" after a tap on 9 (`data-sticky-atc-variant`, updated by JS). The tap still adds the pre-selected size 6 with no prompt. The rest depends on the C4-17 owner decision. |
| R2-C-03 sticky trigger (Low) | STILL FAILING (accepted Low) | `initStickyAtc` is unchanged: the bar is hidden at load (`is-visible=false`) while Add to bag sits below the fold. |
| R2-C-04 "+" size (Low) | **PASS** | 44x44 (`base.css` round-2 block). A tap opens quick add with no navigation. |
| R2-C-05 empty collection (Low) | STILL FAILING (Low) | The `/collections/necklaces` toolbar ("0 products" + sort) is still visible. Copy and the Shop-all button are fine. |
| R2-C-06 modal over announcement bar (Low) | **PASS** | `elementFromPoint(200,30)` with quick add open hits the modal overlay. The size-guide link inside quick add now opens the drawer, hides the modal, and the modal comes back when the drawer closes. |
| C4-06 size guide | **STILL FAILING, new defect** | The drawer replaces navigation: the URL stays on the PDP, the panel is 560px on desktop, Esc returns focus to the link, and the tap target is 61x44. But the content is blank; see R3-C-01. No size-confidence copy near the picker yet. |
| C4-08 gift note | **PASS** | Label is now "Gift message or order note" in the drawer and on `/cart`. The summary is 44px tall. |
| C4-09 drawer | **PARTLY** | Tap sizes are fixed: qty buttons 40x42 inside a 44px control, Remove 48x44, note 44px tall, View bag `min-height:44px`. Empty gap after one line: 311px mobile, 367px desktop. Still no cross-sell, which I accept as an enhancement. |
| C4-10 empty bag | **PASS (partly)** | Same as R2-C-01. |

## New Critical/High

| ID | Severity | Location | Evidence | Fix |
|---|---|---|---|---|
| R3-C-01 | **High** | `assets/theme.js` size-guide handler (dfc3f5f). It injects `main.innerHTML` into `[data-size-guide-body]`. | The injected page content contains `.icon-list__item.reveal` items. `.js .reveal { opacity:0 }` (`base.css:141`) applies until JS adds `.is-visible`, and the reveal observer (`theme.js` ~874) never sees the injected nodes. In the drawer, all 4 content blocks stay at **opacity 0**, even after scrolling the drawer body: "Method 1: measure a ring you own", "Method 2: measure your finger", "US ring size chart", "Fit tips". The shopper sees only the heading and intro, then a blank panel (`m-sizeguide-pdp.png`, `m-sizeguide-scrolled.png`). The text is in the DOM, so screen readers hear it, but sighted users get nothing. This affects both the PDP and quick add, on mobile and desktop. | After injecting, add `.is-visible` to every `.reveal` (`$$('.reveal', body).forEach(e => e.classList.add('is-visible'))`), or call the reveal init on `body`. Re-test that the chart is visible without scrolling the page. |

No other regressions seen in these areas:
- Quick add → drawer works, and the drawer makes `main` inert.
- The sticky tap opens the drawer.
- Quick add focus and modal restore work.

## Owner decisions still open (unchanged)

- C4-04: remove Necklaces (`/collections/necklace`) and Earrings from the menus. They also feed "Popular categories" in the empty bag.
- C4-17: whether rings should have no default size. This finishes R2-C-02.
- C4-05: menu IA.
- C4-16: support email on the store domain.
- C4-07: installments and a delivery estimate.
