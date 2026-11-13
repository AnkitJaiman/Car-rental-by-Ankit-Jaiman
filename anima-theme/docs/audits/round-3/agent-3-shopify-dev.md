# Agent 3: Shopify Development, Round 3 verification

Scope: commits dfc3f5f and 5e04159. I re-checked my round-2 items and reviewed the new JS (size-guide drawer, setInert, cart queue, fitNav, hero editor select).

Automated checks:
- Theme Check: **0**.
- Schema lint: **0 problems / 33 sections**.
- Developer regression suite: **62/62 pass**.

Probes are in `audits/round-3/3/`: probe3.js covers the size guide, inert and Escape; cartq.js covers the cart queue. JSON-LD was parsed from the preview with Python.

## Verdict
**Ship.** No Critical or High remains. The round-2 High (password heading) and Medium (hidden password error) are both fixed.

I found one new keyboard regression in the size guide, rated Medium (R3-C-01). Fix it soon; it does not block launch.

## Re-verification

| ID | R2 sev | Result | Evidence |
|---|---|---|---|
| R2-C-01 | High | PASS | main-password.liquid:8 prints `section.settings.heading \| escape` and falls back to `'password.title' \| t` only when blank. No merchant text goes through `t` any more. |
| R2-C-02 | Med | PASS | The `{% form 'storefront_password' %}` now wraps the `<details{% if form.errors %} open{% endif %}>`, so the error is visible after a failed attempt. |
| R2-C-03 | Low | PASS | main-product.liquid:116 adds `and shipping_page.url != blank`. |
| R2-C-04 | Low | PASS | Organization `logo` comes from the new `settings.seo_logo` (rendered and parsed, logo=True). The GTIN is only output when it is all digits with length 8, 12, 13 or 14; per-offer GTIN was removed. Product, BreadcrumbList, Organization and WebSite all parse as valid JSON. |
| R2-C-05 | Low | Not fixed | There is no `shopify:section:unload`, so old timers keep running in the Theme Editor only. Hero now pauses on block select and resumes on deselect (theme.js `_select`/`_deselect`), which is correct. |
| R2-C-06 | Low | Not fixed | product-card.liquid:78/84 still passes a pre-escaped title into `t`. No current product title contains `&`, so nothing visible today. |
| R2-C-07 | Low | Not fixed | `product.quick-view` is still assignable in Admin and is not documented. |
| R2-C-08 | Low | Not fixed | main-article.liquid:39-40 still uses `%z`. It is valid; `%:z` is preferred. |
| R2-C-09 | Low | Not fixed | meta-tags.liquid:19 still hard-codes `og:image:width` to 1200. |
| D3-20 rest | Low | PASS | `product.vendor \| escape` in product-card.liquid. |

## New JS review

| Area | Result | Evidence |
|---|---|---|
| setInert | OK | With the PDP size guide open, header, MainContent, footer and cart drawer are inert, focus is inside the drawer, and 6 Tabs stay inside. Escape restores everything: inert cleared, scroll-lock off, focus back on the Size guide link. |
| Cart queue | OK | `-3` reverts to the default value with no request sent. Enter in the quantity box sends `POST /cart/change.js {"id":"k0","quantity":3}` and then `/cart?sections=…`, with no navigation to checkout. Focus stays on the quantity box. `doChangeLine` catches errors, so a failed request cannot stall the queue. |
| `settings.cart_empty_menu` | OK | It is a `link_list` setting, so on Shopify it returns the linklist object. This replaces the old `linklists[...]` lookup, which was wrong. |
| fitNav | OK | It removes `is-collapsed` and re-measures synchronously (no paint in between), then updates the header CSS vars only when the state flips. |
| Hero editor select | OK | `_select` stops autoplay and moves to the selected slide; deselect resumes. |

## New finding

| ID | Sev | Location | Evidence | Fix |
|---|---|---|---|---|
| R3-C-01 | **Medium** | theme.js keydown handler (~line 105) with the size-guide click handler | Repro: open quick add, click Size guide, press Escape. The handler checks `.quick-add-modal.is-open` before `.drawer.is-open`, and the quick-add modal keeps `is-open` while only visually hidden. Escape therefore closes the hidden quick add, not the size guide. Probe result after Escape: `qa:false, sg:true, lock:true, inert:""`, with focus on the product card behind. The size drawer stays open and nothing behind it is inert. The Close button still works. | Check `#SizeGuideDrawer.is-open` (or any `.drawer.is-open` above a quick add whose visibility is hidden) first in the Escape and Tab lookup. Alternatively, remove `is-open` from the quick add while it is hidden and restore it on close. |

## Owner decisions
These are unchanged from round 2: hard-coded policy copy and the $35 threshold, enabling New customer accounts, return and shipping JSON-LD data, and confirming the `seo_logo` / password logo images exist in Files.
