# Agent 3: Shopify Development Review (Round 2)

Scope: commit 6df39f4 against my round-1 findings D3-01 to D3-30. I re-read layout/theme.liquid, layout/password.liquid, the password, quick-view and gift card templates, main-product, the cart sections and snippets, product-card, image, facets, social-gallery, testimonials, main-article, main-list-collections, header, meta-tags, and all of assets/theme.js (992 lines).

Tools and results:
- Theme Check (`tools/tc.js`): **TOTAL 0**.
- Schema lint: **0 problems, 33 sections**.
- Developer regression suite (`qa-r2/regress.js`): **58/58 pass**.
- My own Playwright probe: `audits/round-2/3/probe.js`.

Note: the preview server on 8787 was down when I started. I restarted it with `node tools/serve.js preview`.

## Verdict

**Ship with conditions.** Every round-1 High is fixed and I verified each one. Most Mediums are fixed correctly against real Shopify behaviour.

One condition before the password page goes live: fix R2-C-01. On real Shopify the password page heading prints a "translation missing" string. The LiquidJS harness never renders `password.json`, so nothing caught it.

## Re-verification

| ID | R1 sev | Result | Evidence |
|---|---|---|---|
| D3-01 | High | PASS | product-card.liquid:74-128. `.product-card__media-wrap` now closes at line 128, before `.product-card__info`. Theme Check reports 0 errors. regress A1-02: qaBottom 582.75 < titleTop 608.75. |
| D3-02 | High | PASS | theme.liquid:17 `search.terms \| split \| join \| escape`. regress D3-02 passes. |
| D3-03 | High | PASS | theme.js:465-474. Probe: I forced a non-existent option value and the result was `id:""`, `addDisabled:true`, `payHidden:true`, `payVisible:0`. base.css:798 hides `.shopify-payment-button[hidden]`, and the sticky button is synced as well. |
| D3-04 | High | PASS | Probe on /cart: `POST /cart/change.js` is followed by `GET /cart?sections=cart-drawer,template--cart__main` (theme.js:318). |
| D3-05 | High | PASS | Probe body `{"id":"k0","quantity":2}`, where `data-key="{{ item.key }}"` (cart-line-items:5). `.is-updating{pointer-events:none}` (base.css:668) acts as the in-flight guard. |
| D3-06 | Med | PASS | main-product:123-137 builds the `data-low-stock-json` map from `inventory_quantity` in Liquid. JS reads it at theme.js:484-491. |
| D3-07 | Med | PASS (partial) | main-product:341-351 calls `Shopify.loadFeatures` for `model-viewer-ui`. Two gaps: `shopify-xr` (AR) is not loaded, and quick view never runs this script. Low. |
| D3-08 | Med | PASS | Zoom uses `data-zoom-media-id` matched to `data-lightbox-media-id`, not an index. |
| D3-09 | Med | PASS (partial) | Every init is now guarded with `dataset.ready`. Collection, recommendations and recently viewed are re-initialised on load, and header/search are re-initialised when the header reloads. Still missing: `shopify:section:unload` (see R2-C-05) and block select for announcement slides and the mega menu. |
| D3-10 | Med | PASS | social-gallery renders `@app` blocks through `{% render block %}`, and the section shows when only app blocks exist. |
| D3-11 | Med | PASS | facets.liquid uses `divided_by: 100.0` on cents, so the value is independent of the money format. |
| D3-12 | Med | PASS | theme.js:9 `ROOT = root.replace(/\/?$/, '/')`, used for search and recently viewed. |
| D3-13 | Med | PASS (partial) | `product.quick-view.json` has `"layout": false`. The template is still selectable in Admin (see R2-C-07). |
| D3-14 | Med | PASS | Focus is restored by line key and role, and by facet name+value (theme.js:281-300, 847-871). regress Q6-08 passes. |
| D3-15 | Med | PASS | `returnTo = quickTrigger` (theme.js:351). regress Q6-09 passes. |
| D3-16 | Med | PASS | testimonials uses `slide_i` and `shown_count`. Blank first slides no longer hide the carousel. |
| D3-17 | Med | Partly | Password layout, template and section were added, but see R2-C-01 and R2-C-02. The owner must enable new customer accounts (no `customers/*` templates exist). |
| D3-18 | Med | Owner decision | Unchanged. I agree it needs the owner. |
| D3-19 | Med | PASS | `{% paginate collections by 24 %}` plus pagination. The hard-coded handles remain (acceptable). |
| D3-20 | Med | PASS (one miss) | cart.note, line properties, option values and discount titles are all escaped. `{{ product.vendor }}` at product-card.liquid:132 is still raw. It is merchant-controlled, so Low. |
| D3-21 | Med | PASS | Only `[data-cart-items]` and `[data-cart-totals]` are swapped (theme.js:323-327). `.cart-summary__dynamic` is left alone. |
| D3-22 | Low | PASS | gift_card.liquid:8 now has `{{ content_for_header }}`. |
| D3-23 | Low | PASS | The `new_comment` form is added when `blog.comments_enabled?`. Dates use `%z` (see R2-C-08). |
| D3-24 | Low | Deferred | Agree it is Low. |
| D3-25 | Low | PASS | The `<li>` is only emitted for set products. The section is hidden when there are no items. |
| D3-26 | Low | PASS | `:scope > li` plus `history.replaceState` (theme.js:855, 872). |
| D3-27 | Low | PASS | Strings moved to locales and `window.theme.strings`. |
| D3-28 | Low | Deferred | Agree. |
| D3-29 | Low | PASS | Two cases were added. Small slip: `amount_no_decimals_with_space_separator` passes `''` as the decimal separator, which is harmless because precision is 0. |
| D3-30 | Low | PASS | cart-progress.liquid:176 checks `cart.currency.iso_code == shop.currency`. |

## New findings

| ID | Sev | Location | Evidence | Fix |
|---|---|---|---|---|
| R2-C-01 | **High** | sections/main-password.liquid:8 | `{{ section.settings.heading \| default: 'password.title' \| t \| escape }}`. The heading defaults to "Opening soon", so `t` is applied to the merchant's text as if it were a locale key. On Shopify, a missing key renders `translation missing: en.Opening soon`, so every visitor sees broken text as the H1 of the pre-launch page. The harness does not render password.json, and Theme Check cannot see a dynamic key. | `{%- if section.settings.heading != blank -%}{{ section.settings.heading \| escape }}{%- else -%}{{ 'password.title' \| t }}{%- endif -%}` |
| R2-C-02 | Medium | main-password.liquid:15-23 | The `storefront_password` form sits inside a `<details>` that is closed by default. After a wrong password, Shopify reloads the page and the `form.errors` message is inside the collapsed element, so the shopper gets no visible feedback. | Render `<details{% if form.errors %} open{% endif %}>`. `form` only exists inside the form tag, so either move the form outside `<details>` or put the check on the details element via a `{% form %}` wrapper around it. |
| R2-C-03 | Low | main-product.liquid:11, 116 | `pages['shipping-policy']` is compared with `!= empty`. If that page handle doesn't exist, Shopify returns nil/empty drop semantics that `empty` may not match, and the link can render with an empty `href`. The harness has no `shipping-policy` page, so this path was never exercised. Code-inferred. | Use `{%- if shipping_page.url != blank -%}`. |
| R2-C-04 | Low | layout/theme.liquid:64-87; main-product JSON-LD | Organization JSON-LD has no `logo`. Product `gtin` prints `variant.barcode` unvalidated, and Google flags non-8/12/13/14-digit values. | Add `"logo"` from `settings.logo` (or the header logo). Only emit `gtin` when `barcode.size` is 8, 12, 13 or 14 and it is all digits. |
| R2-C-05 | Low | theme.js:979-991 | There is still no `shopify:section:unload`. When the hero or announcement bar is edited in the Theme Editor, the old `setInterval` keeps running against detached nodes, and slider `resize` listeners pile up. Storefront behaviour is unaffected. | Store the timers on the element and clear them on `shopify:section:unload`. |
| R2-C-06 | Low | snippets/product-card.liquid:115, 121; cart-line-items:29-33 | The product title is pre-escaped and then passed as a `t:` interpolation (`product: product_title_escaped`), or the `t` output is escaped again. Shopify HTML-escapes interpolations for non-`_html` keys, so a title containing `&` would announce "&amp;amp;". No current product title is affected. Code-inferred. | Pass the raw `product.title` to `t` and drop the extra `escape`. |
| R2-C-07 | Low | templates/product.quick-view.json | With `"layout": false`, a merchant who assigns this template to a product gets a bare page with no header, CSS or JSON-LD. | Replace it with `?section_id=` on a static quick-view section, or document it in the editor guide as "never assign". |
| R2-C-08 | Low | main-article.liquid JSON-LD | `%z` outputs `-0500`. That is accepted, but the mixed basic/extended ISO form is non-canonical. | Use `%:z` to output `-05:00`. |
| R2-C-09 | Low | meta-tags.liquid | `og:image:width` is hard-coded to 1200. Shopify does not upscale, so a source image under 1200px reports wrong dimensions. | `assign og_w = page_image.width \| at_most: 1200`, and derive the height from it. |

No other regressions found:
- No double binding: every init has a `dataset.ready` guard, and global listeners have `*Bound` flags.
- The lightbox focus trap works (it uses `getClientRects` instead of `offsetParent`).
- Quick view strips the lightbox and sticky bar, and the form ids are unique per template.
- Escaping is correct in the new header, social and comment markup.
- The gift card, password layout and `window.theme` ordering are fine (the inline script runs before the deferred theme.js).

## Owner decisions I agree with
- D3-18 / B2-14: the $35 threshold and policy copy in templates. Keep them in sync with Settings › Policies, or render `shop.*_policy`.
- D3-17: enable **New customer accounts**. The theme ships no classic `customers/*` templates.
- P5-13: `hasMerchantReturnPolicy` and `shippingDetails` in Product JSON-LD need confirmed store data.
- Confirm that `anima-logo-solid.png` exists in Admin › Files. password.json references it as `shopify://shop_images/anima-logo-solid.png`, and the logo falls back to text if it is missing.
