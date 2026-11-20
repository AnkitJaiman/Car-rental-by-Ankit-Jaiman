# Agent 6: Extreme QA, round 3 (verification at 946451c)

**Verdict: SHIP.** No Critical or High findings remain.

- R2-Q-01, the blocker (the header stuck on the hamburger menu), is fixed. On a fresh load the header collapses at 990–1240 and expands at 1280 and above.
- In a resize sweep from 1920 down to 980 and back in 20px steps (plus jumps between 1100, 1920, 1000 and 1440), there were 0 bad states: no clipped items, no case with neither nav nor hamburger, no sideways scroll. The header re-expands every time.
- Developer regression suite: 62/62 pass.
- Console sweep: 17 routes at 390/768/1024/1440/1920 (77 loads), 0 console errors and 0 failed requests.

Scripts and logs are in `scratchpad/audits/round-3/6/` (`r3.js`, `r3b.js`, `r3c.js`, `sweep.js`, `*.log`).

The preview's `theme.js` matches the theme. `/cart.js` is now mocked. Some steps were first run on 5e04159 and re-run on 946451c where that commit touched them (Escape order, sticky bar, empty-collection toolbar).

| ID | R2 sev | Result | Evidence |
|---|---|---|---|
| R2-Q-01 | High | **PASS** | See the sweep above. `fitNav` now measures with `is-collapsed` removed |
| R2-Q-02 | Medium | **PASS** | Enter in the quantity box: drawer posts only `/cart/change.js` (no `checkout=`) and stays on the page; cart page posts once. Focus stays on Quantity. Low residue: the drawer sends the same change request twice (harmless, same quantity) |
| R2-Q-03 | Medium | **PASS** | Load at 390, rotate to 844×390: footer details are `true,true,true`. Back in portrait, tapping toggles them |
| R2-Q-04 | Medium | **PASS** | 3-slide hero, autoplay 800ms. Selecting slide 3 shows slide 3 only, still slide 3 after 1.8s; deselecting resumes autoplay |
| R2-Q-05 / Q6-06 | Medium | **PARTLY** (owner decision) | The tall buy box now sticks by its bottom edge. ATC stays in view to y=900 at 1440, but is out at y=900 at 1280 (the gallery ends). At 1024 the info column is taller than the gallery, so nothing sticks. There is no desktop sticky bar |
| R2-Q-06 | Low | **PASS** | Type a quantity, then Tab: focus is on Quantity (drawer) or the next + (cart page), not Close |
| R2-Q-07 | Low | **PASS** | Enter ×4 at 400ms latency sends requests one at a time (gaps 416–423ms, equal to the latency) |
| R2-Q-08 | Low | **PASS** | `-5` and blank revert to the previous value with no request sent. `alert()` is still used for 422 errors (`theme.js:369,406,409`), code-inferred Low |
| R2-Q-09 | Low | **PASS** | After adding from the sticky bar, closing the drawer focuses the sticky button (`isSticky:true`) |
| R2-Q-10 | Low | NOT CHANGED | The numbered-pagination re-render path is unchanged; the default is `load_more`, which passes |
| R2-Q-11 | Low | **PASS** | Sort control hidden on the empty collection |
| R2-Q-12 | Low | NOT CHANGED | A click 700ms after hover-open still closes the menu (design trade-off) |
| R2-Q-13 | Low | NOT CHANGED | Still no `shopify:section:unload` handler; orphaned timers only (editor) |
| Q6-28 | Low | PARTLY (device) | Needs a real iPhone |

## Regression checks on the new behaviour (inert background, size-guide drawer, sticky bar)

All of these pass:
- **Inert background:** quick add, cart drawer, filters, search, mobile menu and size guide each mark 5–7 background body children `inert`, and the open dialog is never inside an inert element. After each close, `[inert]` = 0, scroll lock is released, and focus returns to the trigger.
- **Lightbox:** it is not caught by inert. Tab is trapped, ArrowRight moves to index 1, and Escape returns focus to the zoom button.
- **Size guide over quick add:** Escape (and X) now closes the size guide first and brings the quick add back. Focus goes to the "Size guide" link. A second Escape closes quick add and focus returns to the card trigger. Add from quick add, drawer, close: focus returns to the trigger.
- **Size guide on the PDP:** it opens, traps focus, and Escape returns focus to the link.
- **Sticky bar (new trigger):** it now shows whenever the main Add to bag is not in view, including at page top on 390/768 where the ATC is below the fold. It hides when the ATC is in view. This looks intentional.
- **Filters:** focus stays on the checkbox.

## New findings

None at Critical or High.

One Low cosmetic issue: at 360–390 an inner block of `.cart-page` is 376px wide inside a 358px column. Document `scrollWidth` reads 392, but the page does not scroll sideways (`scrollTo(50,0)` leaves scrollX at 0).
