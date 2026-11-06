# Anima Jewels — Research & Asset Audit (Phase 1–2)

Date: 2026-11-03. Sources actually used are listed for every finding. Nothing here is invented.

## 0. What could and could not be accessed

| Source | Status | Notes |
| --- | --- | --- |
| Shopify Admin API (Anima Jewels, www.animajewel.store) | ✅ Read access | Products, collections, pages, menus, policies, theme files of the live theme. |
| https://www.animajewel.store/ (storefront) | ❌ Blocked by session network policy | Could not screenshot. Content was read from the live theme files instead. |
| cdn.shopify.com (product / lifestyle image files) | ❌ Blocked | Image files could not be downloaded or viewed. The theme references them through Shopify (`image_url`, `shopify://shop_images/...`), so this does not block the theme. |
| https://www.sarahojewelry.com/ (design reference) | ❌ Blocked | Live layout could not be inspected. See §3. |
| Attached screenshots (Inspiration Station + others) | ❌ Not received | No image arrived with the message. See §3. |

**To unblock:** add `www.sarahojewelry.com`, `sarahojewelry.com`, `www.animajewel.store`, `cdn.shopify.com` under the cloud environment's *Network access → Allowed domains*, and re-attach the screenshots.

## 1. Store facts (from Shopify Admin)

- Store: **Anima Jewels**, domain www.animajewel.store, plan Basic, **currency USD**, store country India.
- Live (MAIN) theme: `anima-jewels-final-v4 (copy) - draft` (custom theme). 15 unpublished themes also exist.
- Customer accounts: **new customer accounts** (shopify.com/73695428804/account) → classic customer templates are not needed.
- Logo file in Files: `shopify://shop_images/anima-logo-solid.png` (used as favicon in live theme).

### Catalogue (first 50 products of >50)
- **Active:** Montana Sapphire rings (4/5/8-stone, $75.90–$85.99), Emerald Starburst band ($72.99), 16 **Moissanite engagement rings** ($69–$109, gold-plated 925 silver).
- Variants: `Color` (Gold/Silver) × `Ring size` (6–10) or `Ring Size` (5–10).
- Many **Moissanite rings show inventory 0** (may be untracked or genuinely out of stock — please confirm).
- **Junk drafts:** ~25 draft products named "19", "20", "1 ear", "5 ear"… with $0 price. Not shown on storefront (draft) but worth cleaning up.
- Product descriptions hold structured specs (Gemstone, Number of Stones, Shape, Cut, Carat weight, Metal, Finish, Metal weight, Band width). Category metafields (`shopify.gemstone-type`, `shopify.jewelry-material`, `shopify.ring-size`, …) are filled in.

### Collections
| Handle | Products | Note |
| --- | --- | --- |
| rings | 24 | |
| bracelets | 19 | |
| new-arrivals | 76 | |
| moissanite-engagement-rings | 16 | Has good SEO description |
| moissanite-tennis-bracelets | 12 | |
| montana-sapphire / sapphire-rings / five-stone-rings / gemstone-rings / emerald-rings / statement-rings / 8-stone-ring | 2–7 | |
| **necklaces / necklace** | **0** | Menu links to `/collections/necklace` (empty). |
| **earrings** | **0** | Page "Earring" says "Will Be live Soon". |
| for-shopify-performance-tracking | 94 | Created by Faire — do not show/modify. |

### Menus
Main menu: Home, Catalog, Rings, Necklaces (`/collections/necklace`), Earrings, Bracelets, Gifts (`/collections/all`), Journal, Contact, About Us.

### Verified brand content (live theme `settings_data.json`, `index.json`, page templates)
- Announcement: "Free shipping on orders over $35 · Free 30-Day Returns".
- Tagline: "Natural gemstones, hand-set in 925 sterling silver." / "Handcrafted Gemstone Jewelry".
- Trust items used today: Natural Montana Sapphire · 925 Sterling Silver · Free US Shipping Over $35 · Free 30-Day Returns · Nickel & Lead Free · Secure Checkout.
- Shipping (theme page): processed in 1–2 business days, 3–7 business days delivery, **US delivery only**, free over $35.
- Returns (theme page + Shopify policy): 30 days, free return label, unworn/original packaging, earrings with broken seal / engraved / final sale not returnable, refunds in 5–7 business days, cancellation within 24 h.
- Brand meaning: "Anima means soul."
- Emails: `animajewels@animajewel.in` (theme) and `bohosoulart@animajewel.in` (Shopify contact policy).

## 2. ⚠️ Issues that need YOUR decision (not changed by me)

1. **"Handcrafted in the USA" vs. India address.** Live theme says "Handcrafted & shipped from the USA" and "every piece is handcrafted in the USA". Shopify contact policy lists *97 Gopalpuri, Jaipur, India*, and a product is tagged `india made ring`. US law (FTC "Made in USA" rule) penalises unqualified USA-origin claims that aren't true. **The new theme makes no origin claim at all** (no "USA" or "handcrafted in" wording anywhere). Collection copy mentions shipping "from our warehouse in the USA", which you could add once confirmed. Please confirm the correct origin statement.
2. **"BIS Hallmarked"** (requested in the brief) is **not stated anywhere in the store**. BIS is an Indian standard. Not used by default — confirm before adding.
3. **"Natural, never lab-grown"** (Our Story) conflicts with selling **lab-created moissanite**. Default copy avoids "never lab-grown".
4. **Possible third-party photos in your store.** Collection images `SOJ_APR24-0769.jpg` (Earrings) and `Dec16_lo-093.jpg` (Necklaces) — "SOJ" matches *Sarah O. Jewelry*. I could not view them. If they are Sarah O.'s photos, they must be removed (copyright). The new theme does **not** reference them.
5. **Shopify Shipping policy text is a placeholder**: "hey there this is my shipping policy". Fix in *Settings → Policies*.
6. Two different support emails (see §1). Which is official?
7. Necklaces & Earrings collections are empty — the new menu/category grid will show them only if you add products (the category section hides empty collections by option).
8. No genuine reviews were found in the store data (the live theme has a Judge.me section). The testimonial section ships **empty** — add only real reviews.
9. Social links are all empty in the live theme. Provide Instagram/TikTok/Pinterest URLs.

## 3. Design reference analysis — Sarah O. Jewelry

Direct inspection was blocked; the screenshots did not arrive. What is known from public sources: Denver fine-jewelry brand, modern-minimalist, editorial photography, strong custom/bridal storytelling, "Inspiration Station" social gallery. The brief describes the Inspiration Station precisely:

- clean white background, asymmetric/staggered horizontal row of **vertical** media cards
- **different card heights**, a **visually prominent central card**
- minimal spacing, **rounded image corners**
- **product info card beneath each image** (thumbnail, product name, price)

The theme implements exactly this concept (see `sections/inspiration-station.liquid`). When the screenshots/site become available, the Design Auditor pass must be re-run against them (checklist in `docs/03-VISUAL-CHECKLIST.md`).

Design language adopted (premium international jewelry retail, original to Anima):
- White and warm-ivory surfaces, near-black ink, one muted-gold accent.
- Editorial serif headings + clean sans body; small uppercase letter-spaced labels.
- Square-edged buttons and product images; rounded corners only on Inspiration cards.
- Large photography, generous whitespace, restrained motion (fade/scale ≤ 400 ms).

## 4. Asset map (referenced, not downloaded)

| Use | Asset (Shopify Files) |
| --- | --- |
| Logo | `anima-logo-solid.png` |
| Hero | `aster-round-montana-sapphire-band-12-25-01.jpg` |
| Category: Rings | `Rings.jpg` |
| Category: Necklaces | `Necklace-36_1.jpg` |
| Category: Earrings | `WhiteDiamonds-EARRING.jpg` |
| Category: Bracelets | `TEN-BRACELET.jpg` |
| Brand story | `Our_Story_Page.jpg` |
| Products | Product media from Shopify (e.g. `AJ-RNG-001-925-MTG.png`) — always live |

Please visually confirm these images are your own photography (point 4 above).
