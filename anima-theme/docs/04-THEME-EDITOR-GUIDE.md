# Theme Editor guide — managing Anima Editorial without code

Open **Online Store › Themes › Anima Editorial › Customize**. Every section on every page can be added, removed, reordered (drag), hidden (eye icon) and duplicated. Products, prices, variants and stock always come live from Shopify; nothing is hard-coded.

## 1. Global settings (Theme settings, gear icon)
| Group | What you control |
| --- | --- |
| Colors | Background, soft background, text, muted text, lines, accent, buttons, sale, badges |
| Typography | Heading and body fonts (Shopify font library), size scales, letter spacing, uppercase headings |
| Layout | Page width, side margins (desktop/mobile) |
| Buttons and media | Button radius and tracking, image radius, Inspiration Station card radius |
| Animations | On/off and duration |
| Product cards | Image ratio, hover image, vendor, quick add, sale/sold-out badges, **“New” badge tag** (default tag `new`), color count |
| Cart | Drawer or page, **free-shipping threshold** (must match your real shipping rates), note under checkout, order note |
| Store information | Favicon, support email/phone/hours (used in header menu, footer, contact page) |
| Social media | Instagram, TikTok, Pinterest, Facebook, YouTube URLs |

## 2. Header & announcement bar (Header group)
- **Announcement bar:** add up to 6 announcements (text and optional link). You can turn on rotation and set the speed and colors, and show it on desktop only, mobile only or both, or switch it off.
- **Header:** logo, light logo (for the transparent header), logo width on desktop and mobile, logo position (left/center), menu, search/account toggles, sticky header, and a transparent header on the home page.
- **Dropdowns:** nest menu items in *Online Store › Navigation*.
- **Mega menu:** add a *Mega menu* block, type the exact top-level menu title (e.g. `Rings`) and optionally add 2 promo images with text and links. Child and grandchild menu links become columns.

**Recommended main menu** (matches the brief): Shop All (`/collections/all`), Rings, Necklaces, Earrings, Bracelets, New Arrivals, Our Story. *Necklaces and Earrings are currently empty; add them when products are live.* The current menu's Necklaces item links to `/collections/necklace`, which is empty.

## 3. Homepage sections (in default order)
1. **Hero:** up to 5 slides, each with:
   - Desktop image, focus point, optional mobile image and its focus point
   - Optional Shopify video
   - Overlay color and opacity
   - Eyebrow, heading, heading size and text
   - Two buttons
   - Content position, alignment and text width

   The section also has height (desktop and mobile), auto-rotate and speed settings.
2. **Trust strip:** up to 8 benefit blocks (text, optional icon, link). Optional auto-scroll on mobile.
3. **Shop by category:** blocks pick a collection. The image and title default to the collection's, and you can override both.
   - Choose the card style, image ratio, desktop columns, mobile columns or a carousel, and the gap.
   - *Hide empty collections* stays on until Necklaces and Earrings have products.
4. **Featured products (New arrivals):** choose a collection or add *Product* blocks (drag to reorder). You can also set:
   - Maximum products, grid or carousel layout, desktop and mobile columns
   - Link label and link, soft background
5. **Image with text (Brand story):** image, focus point, optional overlapping detail image, image-left or image-right layout and image width. Blocks: small text, heading, text, quote, button.
6. **Inspiration Station:** see section 4 below.
7. **Editorial spotlight:** choose a collection, image, heading, text and button, plus two featured products. Layouts: image left, image right or full width. You can also set the background and text colors.
8. **Featured products (Montana sapphire):** a second product row.
9. **Customer reviews:** add *Review* blocks with text, name, 0–5 stars, product purchased and an optional photo.
   - Use genuine reviews only.
   - The section stays hidden from shoppers until at least one review has text.
10. **Social community:** add posts (image or video, username, caption, link to the original post).
    - Set columns, ratio, gap and the follow button.
    - Hidden until at least one image or video is added.
    - You can also add an Instagram app block if you install an app.
11. **Newsletter:** heading, text, button label, success and error messages, small print, field style and colors. Uses Shopify's native customer form, so subscribers appear in *Customers* with email marketing consent.

## 4. Inspiration Station (step by step)
1. Customize › Home page › **Inspiration Station** › *Add block › Post* (up to 50 posts).
2. For each post:
   - **Image:** upload a vertical photo, ideally 1080 × 1350 or 1080 × 1920.
   - **or Video:** choose a Shopify-hosted MP4 (upload under *Content › Files*), **or** paste a direct *External MP4 URL*.
   - **Video poster image:** shown until the video plays. It defaults to the video's preview.
   - **Card size:** Automatic (follows the pattern), Small, Medium or Large (featured).
   - **Name, Social username, Link to original post, Caption.** Only publish people's names and photos with their permission.
   - **Product:** pick with the product picker. The thumbnail, title and **live price** (including sale price) appear under the image and link to the product page.
   - **Show this post:** untick to hide it without deleting it.
3. Reorder posts by dragging blocks. That is the card position.
4. Section settings:
   - Heading, text and link
   - **Number of visible posts**
   - Show creator / caption / product card
   - **Desktop:** size pattern, vertical alignment, centre-when-fits, start-at-middle, small/medium/large **card widths and image heights**, spacing
   - **Mobile:** staggered or uniform, scale, spacing
   - **Video playback:** autoplay muted when visible, or play on tap
   - Background and padding
5. Videos never load until they scroll into view, and they pause when off-screen, so they don't slow the page.
6. The whole section is hidden from shoppers until at least one post has an image or video. The 12 posts in the default template already have products selected, so you only add the media.

### Optional: large influencer library (metaobjects)
For more than 50 posts, or to reuse posts on several pages:
1. Go to *Settings › Custom data › Metaobjects › Add definition*, name it **Inspiration post**, type `inspiration_post`.
2. Add these fields (keys exactly as written):

   | Field | Key | Type |
   | --- | --- | --- |
   | Media | `media` | File (images and videos) |
   | Poster | `poster` | File (images) |
   | Creator name | `creator_name` | Single line text |
   | Username | `username` | Single line text |
   | Profile URL | `profile_url` | URL |
   | Caption | `caption` | Multi-line text |
   | Product | `product` | Product |
   | Size | `size` | Single line text (`sm`, `md`, `lg` or blank) |

3. Turn on *Storefronts* access for the definition, then add entries under *Content › Metaobjects*.
4. In the Inspiration Station section tick **Also show posts from the Inspiration library**. Library posts appear after the block posts, up to *Number of visible posts*.

## 5. Product page (Default product template)
The **Product information** section has these settings:
- **Gallery:** editorial grid or carousel with thumbnails; image ratio; breadcrumbs.

Blocks (each can be reordered or removed):
- **Text:** brand line.
- **Title, Price** (live; compare-at price shown automatically).
- **Inventory status:** low-stock threshold.
- **Variant picker:** metal swatches, and a *Size guide page* that adds a link beside size options.
- **Quantity, Buy buttons:** Add to bag plus Shopify's dynamic checkout button.
- **Benefits:** up to 4 lines with icons.
- **Description:** collapsible.
- **Collapsible tab:** any number, e.g. Shipping & returns, Jewellery care. Material or stone details can come from **product metafields**: click the *dynamic source* icon on the tab content.
- **Share, Apps.**

Below it: **Related products** (Shopify recommendations: related or complementary) and **Recently viewed** (remembered per visitor).

## 6. Collection, search, cart & pages
- **Collection banner:** collection image (on/off), height, overlay, description, breadcrumbs, alignment.
- **Product grid:**
  - Products per page, desktop and mobile columns
  - **Filtering:** set up filters in the free *Search & Discovery* app (price, availability, color, size…). Drawer or sidebar layout.
  - Sorting, and pagination as numbers or *Load more*
- **Search:** filtering and sorting toggles.
- **Cart:** accelerated checkout buttons toggle. The drawer or page is set in Theme settings.
- **Pages:** each page template is built from reusable sections (Rich text, Image with text, Multicolumn, Collapsible content, Contact form).

  | Page | Template |
  | --- | --- |
  | Our Story | `page.our-story` |
  | FAQ | `page.faq` (FAQ structured data on) |
  | Contact | `page.contact` |
  | Jewellery Care | `page.jewellery-care` |
  | Shipping Policy | `page.shipping-policy` |
  | Refund Policy | `page.refund-policy` |
  | Ring Size Guide | `page.ring-size-guide` |

  Any other page uses the default `page` template, which shows the content written in *Online Store › Pages*.
- **Privacy Policy and Terms of Service** are Shopify policy pages (`/policies/privacy-policy`, `/policies/terms-of-service`), edited in *Settings › Policies*. The footer links to them automatically.

## 7. Assign page templates
In *Online Store › Pages*, open each page and choose its template:

| Page handle | Template |
| --- | --- |
| our-story | page.our-story |
| faq | page.faq |
| contact | page.contact |
| jewellery-care | page.jewellery-care |
| shipping-policy | page.shipping-policy |
| refund-policy | page.refund-policy |
| ring-size-guide | page.ring-size-guide |
