# Installation & safe testing

The theme is uploaded **unpublished**. Your live theme keeps running until you publish this one yourself.

## A. Upload the ZIP (no code needed)
1. Download `anima-editorial-theme.zip` (it contains `assets/ config/ layout/ locales/ sections/ snippets/ templates/`).
2. In Shopify admin go to **Online Store › Themes › Add theme › Upload zip file** and choose the ZIP.
3. The theme appears under *Theme library* as **Anima Editorial**. **Do not click Publish yet.**
4. Click **⋯ › Preview** to browse it as a shopper, or **Customize** to edit it.

## B. Or with Shopify CLI (developers)
```bash
npm install -g @shopify/cli
cd anima-theme
shopify theme push --unpublished --store animajewel.myshopify.com   # creates a new unpublished theme
shopify theme dev --store animajewel.myshopify.com                  # local preview with hot reload
```

## C. After upload (one-time setup, 15 minutes)
1. **Logo:** Customize › Header › Logo. The default template points to `anima-logo-solid.png` from your Files; confirm it shows. Add a light logo if you use the transparent header.
2. **Menu:** build the recommended main menu (see Theme Editor guide §2), then select it in Header › Menu.
3. **Page templates:** assign templates to pages (Theme Editor guide §7).
4. **Inspiration Station:** upload creator photos and videos to the 12 prepared posts.
5. **Reviews:** add genuine reviews, or keep the section hidden.
6. **Social links:** Theme settings › Social media.
7. **Filters:** install or open the *Search & Discovery* app and enable price, availability, color and size filters.
8. **Free-shipping threshold:** Theme settings › Cart. Keep it at `35` only if your shipping rates really make orders over $35 free.
9. **Owner decisions:** resolve the content flags in `01-RESEARCH-AND-ASSET-AUDIT.md` §2 and in the audit reports (origin claim, emails, moissanite wording, placeholder Shopify shipping policy, possible third-party images).

## D. Test before publishing
- Preview on a phone and on a desktop.
- Place a test order using Shopify's *Bogus Gateway* or test mode, so you can check the cart, discount codes and checkout without real money.
- Check a sold-out variant, a product with a compare-at price, an empty collection, search and filters.

## E. Publish
When you're happy: **Online Store › Themes › Anima Editorial › Publish**. Your previous theme stays in the library and can be republished in one click if needed.

## What this theme does not change
It does not touch products, prices, inventory, discounts, customers, shipping, payments, markets, domains or checkout. Checkout is Shopify's own.
