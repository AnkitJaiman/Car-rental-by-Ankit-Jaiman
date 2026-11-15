# Agent 3: Creator, influencer and social content audit (animajewel.store)

Audited live on 2026-11-14 with curl, the public JSON endpoints, and Playwright at 390x844 (isMobile, hasTouch, Instagram in-app user agent). The theme source was read only.
Evidence files: site-audit/3/ (screenshots pdp-390-first/-scrolled/-atc/-full, home-390-first, inspo-390, footer-390; raw HTML/JSON in 3/raw; script 3/m.js).

## Score: 34 / 100
The theme is fast and a phone visitor arriving from a reel can buy. On the first screen they see the product photo, plus a sticky bar with the price and Add to bag. The drawer cart works and unlocks free shipping. But nothing a creator or their audience looks for is in place:
- There are no reviews anywhere.
- There is no customer or creator content. The "Styled by you" section shows the brand's own 3 reels, and at least one is tagged to the wrong product.
- There are no product videos.
- No ad pixels are installed (Meta or TikTok), and there is no affiliate or Collabs app, so creator sales cannot be attributed.
- 113 of 157 product descriptions still carry Etsy-style text that contradicts the site's own policies.
- The logo is misspelled ("ACESSORIES").

A US creator would most likely decline, or only take a paid flat-fee post. They would not stake their credibility on the brand with an affiliate link today.

## What I verified
- **Stock.** All 157 products now show available=true. The earlier "sold out" problem is fixed.
- **Social links.** The only social link on the site is https://www.instagram.com/anima_jewels_/ (footer icon plus 2 links in Inspiration Station). There is no TikTok, Pinterest, YouTube or Facebook profile link.
- **Scripts on the homepage.**
  - Theme and Shopify core scripts only.
  - webPixelsConfigList has only `shopify-app-pixel` and `shopify-custom-pixel`.
  - There is no Meta pixel, TikTok pixel, Pinterest tag or GA4 (gtag).
  - There is no review app (Judge.me, Yotpo, Loox, Okendo, Stamped).
  - There is no affiliate or creator app (Shopify Collabs, UpPromote, GoAffPro, Refersion, Social Snowball, Impact).
  - There is no Klaviyo.
- **Creator pages.** /pages/affiliate, /ambassador, /creators, /collab, /influencer, /press, /reviews, /about and /apps/collabs all return 404. The sitemap lists 9 pages, none of them for creators or press. /blogs/news has 0 posts.
- **Discount links.** Shopify's built-in link pattern /discount/CODE?redirect=/products/x works (302 to the product page). I could not check whether any codes exist.
- **Mobile product page from an Instagram-style link.** This is Playwright from a datacenter with no throttling, so it is not real 4G field data.

  | Measure | Result |
  |---|---|
  | FCP | 556 ms |
  | LCP | 1,140 ms |
  | CLS | 0 |
  | Load | 1.46 s |
  | Requests | 88 |
  | Transferred | about 1.9 MB |

  The sticky price and Add to bag bar is visible on the first screen. Add to bag opened the drawer with "You have unlocked free shipping" (cart item_count = 1).
- **Inspiration Station.**
  - 3 of 8 post slots render. Posts 4–8 have no video.
  - The 3 videos are 1080p MP4s of 1.26 MB, 3.95 MB and 2.58 MB, about 7.4 MB on mobile.
  - They lazy-load and autoplay muted once in view. 2 of 3 were playing in the test.
- **Product media.** All 890 product media items are images. 0 products have a video. 157 of 157 products have Etsy-origin image file names (`il_fullxfull.*`).

## Issues

| ID | Page | Problem | Evidence | Impact | Fix | Pri | Eff | Verify | Owner |
|---|---|---|---|---|---|---|---|---|---|
| A3-01 | Home, every product page | No customer reviews anywhere. The Reviews section is hidden because it has no review blocks. There are no star ratings on product cards or product pages. | `index.json` reviews section has no blocks; testimonials.liquid hides itself when empty. Home HTML for `__reviews` contains no review markup. No review app script. | Creator audiences check reviews before buying a $200+ ring. With zero reviews, a creator's endorsement is the only proof, which most creators won't risk. | Install a review app (Judge.me free tier is enough to start) and import genuine past reviews, for example from Etsy if the owner has them, using the app's Etsy import. Show stars on cards and product pages and turn the testimonials section back on. Ask buyers for photo reviews. Never invent reviews. | Critical | M | Stars visible on product cards and product pages; review count in product page schema | STORE + CONTENT (THEME: add app block slot to the product page if missing) |
| A3-02 | Home, Inspiration Station | Reels are tagged to the wrong products. | Reel 1 shows a green emerald-cut stone in wide gold and silver bands, but is tagged "Emerald Cut Montana Sapphire Ring", a thin bezel solitaire (see inspo-390.png). The video file names (`reel-1-five-stone-ring`, `reel-2-cluster-ring`, `reel-3-five-stone-oval-ring`) don't match their tagged products (emerald-cut, oval, hexagon). | "Tap a piece to shop it" sends a shopper to a different ring than the one in the video. That reads as bait-and-switch and causes returns. | Re-tag each reel to the exact product shown. If the product isn't listed, list it or remove the reel. | Critical | S | Reel thumbnail and tagged product image show the same ring | STORE (theme editor) |
| A3-03 | Site-wide | No ad or social pixels and no affiliate tracking. Shopify's Facebook & Instagram channel and the TikTok channel are not installed, and there is no Collabs or affiliate app. | `webPixelsConfigList` has only Shopify's own pixels; no fbq, ttq or pintrk; no affiliate script; /apps/collabs is 404 | Creator traffic cannot be attributed, retargeted or paid out. No Instagram or TikTok Shopping catalog, and no way to run Spark Ads or Partnership Ads. | Install the Facebook & Instagram channel and TikTok channel (pixel plus catalog), then Shopify Collabs (free) or UpPromote. Give each creator a unique code plus an attributed link. Add GA4 through Google & YouTube. | Critical | M | Meta Pixel Helper and TikTok Pixel Helper fire ViewContent/AddToCart; a Collabs test link records a click | STORE |
| A3-04 | All product pages (113/157) | Product descriptions are Etsy listings pasted in, and they contradict the site's own terms. | 63 say "Worldwide tracked shipping" but the site ships to the US only. 12 say "Only one available / one-of-a-kind" while the page says "Only 3 left". 113 end with Etsy text ("Special Thanks…", "message us anytime"). The "⚠️❗❗ Action Required: check unedited reference videos" note refers to videos that don't exist (0 product videos). | Followers who arrive from a creator see contradictions in the first scroll, which hurts trust and invites complaints to the creator. | Rewrite descriptions in one US template: specs, materials, care, a short honest color note without warning emojis, and the site's real shipping and returns. Remove Etsy wording. | High | L | grep descriptions for "worldwide", "Special Thanks", "message us", "❗" → 0 | CONTENT/STORE |
| A3-05 | All product pages | No product videos or on-body photos. All 890 media items are studio stills taken from Etsy. | products/*.js media_type: 890 images, 0 video. Image names are `il_fullxfull…`. | Reel and TikTok audiences expect motion and a hand shot (sparkle, scale on a finger). Creators also need brand video to remix. | Add at least 1 vertical 5–15s hand or on-finger video and 1 on-body photo for the top 20 products. Reuse the existing reel footage on the matching product pages. | High | M | Top 20 products show a video in the gallery | CONTENT |
| A3-06 | Home, Inspiration Station | Labelled "Styled by you / Real looks" but contains only the brand's own content: 3 reels, all rings. | Section copy; all 3 videos are owned content. The username is set to `anima_jewel_` while the real handle is `anima_jewels_`. | Mislabelling own content as customer content is a trust and FTC-adjacent risk, and the wrong handle sends people to a different account. | Rename to "As seen on our Instagram" until real customer or creator content exists. Fix the handle. Add a block for creator, permission and #ad, and only credit creators with written permission (the theme already has creator_name and username fields). Mix in necklaces, bracelets and earrings. | High | S | Section label honest; handle link resolves to the brand account | STORE + CONTENT |
| A3-07 | Ring product pages | Size 2 is preselected, and Add to bag adds size 2 without asking. | Sticky bar shows "925 Sterling Silver / 2"; the cart showed "Size: 2" after one tap (pdp-390-atc.png). main-product.liquid:2 uses `selected_or_first_available_variant`. | Impulse buyers from a reel get the wrong size, which means returns, bad reviews and an unhappy creator. | Require a size selection for rings (no preselect; button reads "Select size"), or make a common size (6 or 7) the first variant. | High | S | Fresh ring page: Add to bag disabled until a size is chosen | THEME (or STORE: reorder variants) |
| A3-08 | Site-wide header and footer | Logo misspells "ACCESSORIES" as "ACESSORIES". | header and footer logo image (footer-390.png) | Creators screenshot the site, and a typo in the logo signals a hobby shop. | Correct the logo file and upload it in Theme settings. | High | S | Visual check | CONTENT |
| A3-09 | Site-wide | No creator or affiliate landing page, no "As seen on" or press, and no About/Founder story with a face. | 404s listed above; /pages/our-story has no founder photo or name. | Creators vet the brand before agreeing to a deal, and audiences look for a person behind the brand. | Publish /pages/creators (commission, free product, apply form, brand assets), a founder section with photo, and later a real press or "as seen on" strip with genuine mentions only. | High | M | Pages return 200; linked in the footer | CONTENT + STORE |
| A3-10 | Home, Social gallery | The "Join our community" section is configured but invisible: 6 empty tiles. | index.json social section: all tile image/video blank, button_link "" | Lost social proof slot. | Fill with 6 real Instagram posts (or an app block such as a free Instafeed app), or delete it. | Medium | S | Section renders with 6 tiles | STORE + CONTENT |
| A3-11 | Product page | Share options are Pinterest, Facebook and Email only. There is no Copy link or native share sheet, which is what Instagram and TikTok users actually use. | main-product.liquid:251-255; pdp-390-scrolled.png | Customers can't easily send a ring to a friend or partner in DMs, a common jewelry behaviour. | Add a `navigator.share` button with a copy-link fallback; keep Pinterest. | Medium | S | Tap Share on iOS opens the share sheet | THEME |
| A3-12 | Product page | "Tax included." shows under the price on a US store. | main-product.liquid:115 prints it because the store setting has taxes included in prices | Confusing for US buyers, who expect tax at checkout. It conflicts with the cart's "Taxes … calculated at checkout". | Admin > Settings > Taxes: turn off "Include sales tax in product price" for the US market. | Medium | S | The text disappears on product pages | STORE |
| A3-13 | All products | Prices look like currency conversions ($262.85, $212.85, $282.38, $216.67). Only 7 of 157 end in .00/.95/.99. | products.json prices | A creator saying "use my code for 15% off $262.85" sounds odd, and odd prices suggest a foreign marketplace reseller. | Round to clean US price points ($265, $219) before launching creator codes. | Medium | M | Price list review | STORE |
| A3-14 | Home, Inspiration Station | About 7.4 MB of 1080p video loads on phones when the section scrolls into view. | 3 MP4 responses: 3.95, 2.58 and 1.26 MB, status 206 | Uses mobile data and battery; on a weak 4G connection the reels stall. | Use Shopify's lower-resolution video source on mobile (480p/720p), or only play the centred card. | Medium | S | Under 2 MB of video on mobile | THEME |
| A3-15 | Footer, Inspiration Station | Only Instagram is linked. No TikTok, Pinterest or YouTube. The TikTok handle could not be confirmed. | Footer icon set (footer-390.png) | TikTok is the main US discovery channel for affordable jewelry, and its absence limits creator matching. | Claim the same handle on TikTok and Pinterest, post the existing reels, and add them in Theme settings > Social media. | Medium | S | Icons visible in the footer | STORE + CONTENT |
| A3-16 | Product page | No product-level social proof near the buy button: no "X people bought", "as seen on @creator" or UGC strip. | pdp-390-full.png | Missed conversion at the moment of decision. | After A3-01, add a review stars link under the title and a "Seen on Instagram" strip on the product page using the reels tagged to that product. | Medium | M | Visible on product pages that have tagged media | THEME |
| A3-17 | Blog | /blogs/news has 0 posts. | blogs/news HTML | Creators look for gift guides and articles to link to. | Publish 3–4 posts (gift guide, Montana sapphire explainer, "how to choose a ring size at home") that creators can link. | Low | M | Posts live | CONTENT |
| A3-18 | Site-wide | No email or SMS capture tied to creator traffic: a basic footer form only, no welcome offer, no popup. | Footer "Join our list"; no Klaviyo or popup | Creator traffic that doesn't buy on the first visit is lost. | Shopify Email or Klaviyo free tier with a welcome flow; an optional 10% first-order offer that doesn't stack with creator codes. | Low | M | Signup triggers welcome email | STORE |

## What it takes to be influencer-ready (in order)
1. STORE: Re-tag the reels to the correct products (A3-02) and fix the Instagram handle (A3-06). Turn off "Tax included" for the US (A3-12).
2. CONTENT: Correct the logo typo (A3-08). Rewrite product descriptions, starting with the top 30 sellers (A3-04).
3. STORE + CONTENT: Install a review app and import genuine reviews (A3-01).
4. STORE: Install the Facebook & Instagram and TikTok channels (pixels plus catalog), GA4, and Shopify Collabs with per-creator codes and links (A3-03).
5. THEME: Require a ring size before Add to bag (A3-07). Add native share (A3-11). Serve lighter video on mobile (A3-14). Add a "Seen on Instagram" strip on the product page (A3-16).
6. CONTENT: Product videos and on-hand shots (A3-05). A creator page and founder story (A3-09). Fill the social grid (A3-10). Claim TikTok and Pinterest (A3-15). Round prices (A3-13).

## What I could NOT verify
- The Instagram profile: instagram.com returned a 302 login redirect. I couldn't check follower count, whether reels are shoppable, or whether the handle anima_jewel_ exists.
- Whether a TikTok account exists. tiktok.com returned 200, but that is a generic shell page.
- Whether any discount codes exist, and any admin settings: Collabs, sales channels, Markets, the Shop app.
- Real-device field speed over 4G. My figures are lab numbers from Playwright with no throttling, not Lighthouse.
- Checkout. I did not open it, because agent 1 or 2 covers it.
- Whether the brand holds usage rights for its reel footage and its Etsy-origin photos.
