# Anima Editorial — Design System

All values are **Theme settings** (Online Store › Themes › Customize › Theme settings) and become CSS custom properties in `snippets/theme-styles.liquid`. The stylesheet is `assets/base.css`.

## Color tokens

| Token | Setting | Default | Use |
| --- | --- | --- | --- |
| `--color-bg` | Background | `#FFFFFF` | Page background |
| `--color-bg-soft` | Soft background | `#F7F4F0` | Alternate sections, image wells, footer |
| `--color-text` | Text | `#1C1B1A` | Body + headings (contrast 17.3:1 on white) |
| `--color-text-muted` | Muted text | `#6B6560` | Secondary copy (5.6:1 on white, 5.1:1 on soft) |
| `--color-line` | Lines | `#E6E1DB` | Hairlines, borders |
| `--color-accent` | Accent | `#9C7F52` | Icons, stars, small details only (not body text) |
| `--color-button` / `--color-button-text` | Button | `#1C1B1A` / `#FFFFFF` | Primary buttons |
| `--color-sale` | Sale price | `#8A2F2F` | Sale price + sale badge |

One accent, no gradients, no shadows on cards.

## Typography

| Role | Font (setting) | Size (desktop → mobile) | Notes |
| --- | --- | --- | --- |
| Display `.h0` | Heading font — default Playfair Display | 72 → 40 px | Hero only |
| `h1` | Heading | 52 → 32 px | Page titles |
| `h2` | Heading | 40 → 26 px | Section titles |
| `h3` | Heading | 26 → 20 px | Card titles, sub-sections |
| Body | Body font — default Assistant | 15 px / 1.65 | Max line ~70 characters |
| Eyebrow / labels / nav / buttons | Body, uppercase | 11.5–12 px, letter-spacing 0.14–0.18em | Small caps style |

Scale is adjustable with *Heading size scale* and *Body size scale*. Fonts load from Shopify's font CDN with `font-display: swap` and preload.

## Spacing & grid

- Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 px.
- Every section has **Top/Bottom padding** sliders (mobile automatically uses 65%).
- Page width 1440 px (setting), side margins 48 px desktop / 16 px mobile (settings).
- Grid gaps: 24 px desktop / 12 px mobile horizontally; 40 px / 28 px vertically.
- Breakpoints: **750 px** (tablet), **990 px** (desktop), 1200 px (wide).

## Components

- **Buttons:** square (radius setting, default 0), 48 px tall, uppercase 12 px with 0.14em tracking. Solid, outline, light and outline-light variants.
- **Links:** text links use an animated 1 px underline.
- **Product card:** portrait 4:5 image (setting), second image on hover, badges top-left (Sale / Sold out / New tag), quick add on hover (desktop) or below the image (touch), title in body font, live price, color count.
- **Image ratios:** square 1:1, portrait 4:5, tall 2:3, landscape 3:2, wide 16:9.
- **Borders:** 1 px `--color-line` hairlines; no card shadows. Rounded corners are used **only** in the Inspiration Station (setting, default 14 px).
- **Motion:** fade + 16 px rise on scroll, image zoom 1.03–1.04 on hover, 400 ms ease (setting; can be disabled). Fully disabled for visitors with *reduced motion*.

## Inspiration Station layout system

Three card sizes (small / medium / large), each with an editable **width** and **image height**. Posts set to *Automatic* follow a pattern:

- Wave: S · M · L · M · S (prominent centre card) — default
- Rise: S · M · L · L · M
- Alternate: M · L · M · L
- Uniform: all medium

Cards are vertically centred by default (staggered top and bottom edges), separated by 20 px (setting), with a product card under each image. On mobile, cards scale to 72% (setting) or switch to uniform 66vw cards, and the track opens centred on the featured post.
