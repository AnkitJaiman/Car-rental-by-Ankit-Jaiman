# Agent 6: Extreme QA, round 2 (Anima Editorial, commit 6df39f4)

## Verdict: SHIP WITH CONDITIONS

The round-1 blockers are fixed: the dropdown is visible and clickable, the header sticks, the band under the header is gone, there is no horizontal scroll, and focus is managed in the drawer, quick add, filters and lightbox. 25 of the 27 fixed items pass. The developer's 58 regression tests pass, and there were 0 console errors across 92 route/width loads.

**Condition (blocking):** fix R2-Q-01. The fix for Q6-04 (fitting the nav) brought in a new bug. Once the header collapses to the hamburger, it never expands again. Shrink the window below about 1340px once and the desktop nav is gone, even at 1920px. On a fresh load, 990–1300px also collapses, although the nav fits from about 1280px.

**Should fix before launch:** R2-Q-02 (pressing Enter in a cart quantity box submits to checkout) and R2-Q-03 (footer links cannot be reached after rotating a phone).

Scripts, logs and screenshots are in `scratchpad/audits/round-2/6/`:
- Scripts: `t-header.js`, `t-header2.js`, `t-collapse*.js`, `t-cart*.js`, `t-enter.js`, `t-pdp*.js`, `t-sticky.js`, `t-coll.js`, `t-misc.js`, `t-footer.js`, `t-sweep.js`, `t-obscure.js`
- Logs: `*.log`
- Screenshots: `*.png`

**Harness notes (not theme defects):**
- The preview's `base.css` is missing the last 2 lines of the theme file (`.inspo-card__creator`).
- `/cart.js` GET is not mocked, so it returns 404 after each add. Those 404s are filtered out of the sweep.
- The mock `/cart/change.js` always returns quantity 1, so cart race outcomes are code-inferred.

## Test log

| # | Test | Viewports | Result |
|---|---|---|---|
| 1 | Console errors, failed requests, overflow, duplicate IDs, one H1: 18 routes × 390/768/1024/1440, plus 5 key routes × 990/1100/1200/1280, with full scroll | 12 widths | PASS (92 loads; 0 errors; scrollWidth equals viewport everywhere; the trust strip is an intended `overflow-x:auto` scroller) |
| 2 | Sticky header with announcement bar: 5 routes, scroll 1600px; `--header-bottom`; header is hit-testable | 390/768/1024/1440 | PASS. Header top is 0 and the bar scrolls away. Section height equals header height (65/81) |
| 3 | Resize sweep 980→1440→980 in 10px steps, plus rapid resizes | desktop | **FAIL**: collapses at 990 and never expands (R2-Q-01) |
| 4 | Fresh load at 990–1440: collapsed or not, versus whether the nav actually fits | desktop | **FAIL**: collapsed up to 1300; the nav fits from 1280 (R2-Q-01) |
| 5 | Collapsed header: menu drawer at 1100 has all 10 items, focus moves to Close | 1100 | PASS |
| 6 | Rings dropdown: hover, diagonal move to last link, click, also scrolled 1500px | 1440/1366 | PASS. The panel sits under the header and the last link is hit-testable. "View all" goes to `/collections/rings` |
| 7 | Hover then click after 50/300/590/650/1200ms; click again; leave and re-hover | 1440 | PASS ≤ about 550ms; closes at ≥ 590ms (R2-Q-12, Low) |
| 8 | Keyboard: Tab order; Enter/Space open; Tab through 4 links and out closes; Escape returns to toggle; Shift+Tab out closes; focus ring | 1440 | PASS |
| 9 | Focus hidden under the sticky header (Shift+Tab ×60 up the collection page) | 1440/390 | PASS (0 obscured) |
| 10 | Editor: `section:load` on header, then Enter, hover, search, cart | 1440 | PASS (Q6-17 fixed) |
| 11 | Editor: `section:load` ×5 on slider and ×3 on announcement; count intervals; slider still works | 1440 | PASS functionally. Intervals from replaced sections leak (R2-Q-13) |
| 12 | Editor: `block:select` on an Inspiration card (centred ±24px); `section:load` on Inspiration | 390/768/1440 | PASS |
| 13 | Editor: `block:select` on hero slide 3 of a 3-slide slideshow with autoplay | 1440 | **FAIL** (R2-Q-04) |
| 14 | Quick add ×3 products: open by keyboard, focus, Tab trap ×25, image click, variant, add, drawer, Escape → focus | 1440/390 | PASS. Focus returns to the exact trigger. Label "Cart, 1 item"; 1 H1; 0 zoom buttons; no `?variant` in URL |
| 15 | Quick add opened on the PDP (same product): duplicate IDs; posted variant | 1440 | PASS (0 duplicate IDs; posts the modal's variant 1006) |
| 16 | Quick add close: overlay at 1440; tap above the sheet at 390 | both | PASS |
| 17 | Drawer +/− by keyboard ×6, Enter ×4, rapid clicks ×3 at 600ms latency, remove | 1440/390 | PASS (focus kept; pointer blocked by `.is-updating`). Keyboard is not blocked (R2-Q-07) |
| 18 | Drawer typed quantity -5 / abc / 9999 / 1.5, then Tab | 1440/390 | -5 and abc post `quantity:0` (removes the line); focus goes to Close (R2-Q-06, R2-Q-08) |
| 19 | Typed quantity, then **Enter**, in the drawer and on the cart page | 1440 | **FAIL**: posts `/cart … checkout=` (R2-Q-02) |
| 20 | Cart page +/−/remove by keyboard, focus after re-render | 1440 | PASS |
| 21 | PDP buy box sticky at 1024/1280/1440 | desktop | PARTLY (Q6-06 below) |
| 22 | Lightbox: Tab ×8 / Shift+Tab ×8 trapped; ArrowRight ×4 stops at the end with Next disabled; rapid arrows land on whole slides (scrollLeft mod width = 0); Escape returns to the zoom button; opens the 3rd image at index 2 | 1440/390 | PASS |
| 23 | PDP quantity typed -3 (click) / 0 and -7 (Enter) / 2 / 999 | 1440 | PASS: clamped to 1 and posted 1; 2 and 999 posted as typed |
| 24 | Sticky ATC: hidden at top, shown past the main ATC, hidden when the ATC is back in view, shown at the bottom; aria-hidden and tabindex in sync; body padding 72px; footer not covered; tap posts the selected variant | 390/768 | PASS. Focus after closing the drawer goes off-screen (R2-Q-09). Hidden at 1024 by design |
| 25 | Low stock: inject JSON, switch variant, switch back | 1440 | PASS ("Only 2 left" with `--low` set, then "In stock") |
| 26 | Filters: open; Space on a checkbox ×3 keeps focus; groups stay open; price input; 4 rapid toggles → 1 fetch; close returns focus; sort | 1440/390 | PASS |
| 27 | Load more (link injected; page 2 routed): appends, focuses first new card, URL updated | 1440/390 | PASS. Numbered-page link drops focus (R2-Q-10) |
| 28 | Empty collection | 390/1440 | PASS on copy and CTA; sort still shown (R2-Q-11) |
| 29 | Inspiration arrows to both ends; progress bar width (358px at 390); no `#` links; reviews `aria-live=polite` with "2 / 2" announced | 390/768/1440 | PASS |
| 30 | Mobile menu: 48px scrim, tap closes, focus back to Menu | 390 | PASS |
| 31 | Footer: collapsed on load at 390, open at 1024. Load at 390, rotate to 844×390 | phone | **FAIL** after rotation (R2-Q-03) |
| 32 | Contact form required fields; search modal focus, trap, Escape and lock | 390/1440 | PASS |

## Re-verification of round-1 findings

| ID | R1 sev | Result | Evidence |
|---|---|---|---|
| Q6-01 | Critical | PASS | Dropdown height 203px, last link hit-testable at top 0 and scrolled; click goes to `/collections/rings` |
| Q6-02 | High | PASS | Header top 0 after a 1600px scroll on 5 routes × 4 widths |
| Q6-03 | High | PASS | Header width equals viewport; section height equals header height (81/65) |
| Q6-04 | High | **PASS, with regression** | No clipped items at any width (the hamburger is used instead), but see R2-Q-01 |
| Q6-05 | High | PASS | scrollWidth equals viewport at 990/1024/1100/1200/1280 |
| Q6-06 | High | **PARTLY**, now Medium | Sticky does engage: `align-items:stretch`, wrapper 1328px, info 1038px. But at 1440 the buy box is 1038px tall, taller than the 900px viewport, and the 3-image gallery is only 290px taller than it, so the ATC is off-screen from y≈1256. At 1024 the info column (1021px) is taller than the gallery (916px), so nothing sticks. There is no desktop sticky ATC (`.sticky-atc{display:none}` at ≥990). Suggested fix: keep only title, price, variants and ATC inside `.product__info-sticky`, or show the sticky ATC bar at desktop too |
| Q6-07 | Medium | PASS (Low residue R2-Q-12) | Stays open when clicked ≤ 550ms after hover |
| Q6-08 | Medium | PASS for buttons | Focus stays on +/−/Remove. Typed quantity is a residue (R2-Q-06) |
| Q6-09 | Medium | PASS | `isTrigger true` on 3 products × 2 widths |
| Q6-10 | Medium | PASS | Checkbox keeps focus; groups stay open |
| Q6-11 | Medium | PASS | "Cart, 1 item" |
| Q6-12 | Medium | PASS | 0 `[data-zoom-media-id]` in the modal; image is `aria-hidden` with tabindex -1 |
| Q6-13 | Medium | PASS | Trap, arrows and disabled ends verified at 1440/390 |
| Q6-14 | Medium | PASS | 0 `href="#"` on demo/home at 3 widths |
| Q6-15 | Medium | PASS | Track 358px at 390 |
| Q6-16 | Medium | PASS (Low residue R2-Q-11) | "This collection is empty right now." plus a Shop all link |
| Q6-17 | Medium | PASS | Header works after `section:load` |
| Q6-18 | Low | PASS | Panel 342px, 48px scrim, tap closes |
| Q6-19 | Low | PASS, with regression | Closed at 390 on load. See R2-Q-03 |
| Q6-20 | Low | PASS | -3, 0 and -7 clamp to 1 for click and Enter |
| Q6-21 | Low | PASS | 1 H1 with quick add open (`main-product.liquid:105-108`) |
| Q6-22 | Low | PASS | `aria-live=polite` on the reviews counter; blank reviews skipped (`testimonials.liquid:8,23`) |
| Q6-23 | Low | PASS | Verified with injected low-stock JSON |
| Q6-24 | Low | PASS (code) | `theme.js:9` adds a trailing slash to `ROOT` |
| Q6-25 | Medium | PASS (code) | `featured-products.liquid:22,30` guards blank blocks and `has_items or design_mode` |
| Q6-27 | Low | PASS | `contact[body]` is required |
| Q6-28 | Low | PARTLY (needs device) | `body.scroll-lock` has `touch-action:none; overscroll-behavior:none` (`base.css:271`). `html` is not locked. Verify on a real iPhone |

## New findings

| ID | Sev | Location | Evidence | Fix |
|---|---|---|---|---|
| R2-Q-01 | **High** | `theme.js:118-135` `fitNav`; `base.css:705-710` | When collapsed, the grid is `1fr auto 1fr`, so `.header__icons` stretches to fill a 1fr column. `fitNav` subtracts that stretched width (392px at 1100, 562 at 1440, 610 at 1920 versus 132 when expanded), so the nav "never fits" again. Steps: 1440 → 1100 → 1440 or 1920 stays `is-collapsed`; only going below 990 resets it. A fresh load at 990–1300 is also collapsed (the first measurement runs while `document.fonts` is loading, then latches), although with the class removed the nav fits at 1280/1300/1340 with 0 clipped items. Screenshot: `collapsed-stuck-1440.png` | Measure without the collapsed layout: remove `is-collapsed`, measure, then toggle. Or add `justify-self:end` to `.header__icons` and `justify-self:start` to `.header__left` in the collapsed CSS so they keep their intrinsic width. Re-run the 980↔1440 sweep |
| R2-Q-02 | Medium | `snippets/cart-summary.liquid:12`; `cart-drawer.liquid:14`; `main-cart.liquid:9` | Pressing Enter in a line quantity input triggers implicit form submission. The only submit button tied to the form is `name="checkout"`, so the browser POSTs `/cart updates[]=3&note=&checkout=`. On Shopify that redirects to **checkout**. The AJAX change also fires. Reproduced in the drawer and on the cart page (`t-enter.js`) | In theme.js, `keydown` Enter on `[data-line-qty]` → `preventDefault()` then `blur()` so the change runs. Or put a hidden first `<button type="submit" name="update">` in each cart form |
| R2-Q-03 | Medium | `theme.js:955-958` `initFooter`; `base.css:508` | The JS closes `<details>` at <750px. Rotate a phone to 844×390 and they stay closed while ≥750px CSS sets `summary{pointer-events:none}` and hides the chevron. The Shop, Help and Contact links are invisible and cannot be opened by tapping (`footer-rotated-844.png`) | Listen to `matchMedia('(min-width:750px)')` changes and set `open=true` at ≥750. Or force the content visible with CSS at ≥750 |
| R2-Q-04 | Medium (editor) | `theme.js:986-991` vs `initHero` `:781-797` | `block:select` toggles `is-active` but not the closure index `i`, and autoplay keeps running. Selecting slide 3, then waiting one tick, gives "1+2" (two active slides at once); the next tick jumps away from the selected slide. Merchants cannot keep the slide they are editing on screen | Expose `hero._goTo(n)` and `hero._pause()`; on `block:select` call them, and resume on `block:deselect` |
| R2-Q-05 | Medium | Q6-06 residue | See the re-verification table | As above |
| R2-Q-06 | Low | `theme.js:281-288` `focusKey` | Type a quantity in the drawer, then Tab. `change` fires with `activeElement` not on the line, so the fallback sends focus to the drawer's **Close** button at the top | Record the key on `focusin` of the line controls, or use `e.target` from the change event |
| R2-Q-07 | Low (code-inferred) | `theme.js:370-399` | Keyboard Enter ×4 on + at 500ms latency sends 4 concurrent `/cart/change.js` requests (2, 3, 4, 5). `.is-updating` blocks the pointer only. Out-of-order responses can render a stale quantity | Queue changes per line, or ignore clicks while `container.classList.contains('is-updating')` |
| R2-Q-08 | Low | `theme.js:404` | Typing `-5` or clearing the field posts `quantity:0` and silently removes the line. 9999 shows a browser `alert()` on 422 | Treat NaN or negative as "revert to the previous value". Show errors inline in the drawer, not with `alert` |
| R2-Q-09 | Low | `theme.js:577-580` | After adding from the sticky ATC, closing the drawer sends focus to the main Add to bag button, which is off-screen at scrollY 1511 with `preventScroll` | Pass the sticky button as the return target |
| R2-Q-10 | Low | `theme.js:868-871` | A numbered pagination link (`data-facet-link`) re-renders the results and focus falls to BODY. The default style is `load_more`, which passes | Focus the results heading or first card after a non-append render |
| R2-Q-11 | Low | `main-collection-product-grid.liquid` | The empty collection still shows the sort select (part of the round-1 Q6-16 fix) | Wrap the sort control in `collection.all_products_count > 0` |
| R2-Q-12 | Low | `theme.js:183` | A click ≥ 600ms after hover-open closes the menu. Slower clickers still see it flash shut | On `(hover:hover)` devices, have the click open and never toggle closed (let mouseleave close it) |
| R2-Q-13 | Low | `theme.js:979-985` | There is no `shopify:section:unload` handler. 3 announcement reloads leave 3 orphaned `setInterval` timers running against detached nodes (counted with an instrumented `setInterval`) | Store the timer on the element and clear it on unload |

## Owner decisions I agree with

- **Q6-26:** `/collections/necklace` versus `necklaces`. Confirm the handle in the store navigation.
- **Q6-28:** iOS background scroll needs a real-device check.
- **Q6-06 / R2-Q-05:** whether desktop should get a sticky add-to-bag bar, or a shorter sticky buy box.
