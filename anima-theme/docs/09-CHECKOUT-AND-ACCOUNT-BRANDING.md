# Make checkout, sign-in and account pages look like Anima Jewels

Checkout, the sign-in page and the customer account pages (order history, profile) are hosted by Shopify, not by the theme. Your store uses Shopify's **new customer accounts**, so **one set of branding settings styles all of them**. A theme cannot change these pages; the settings below do, and they're available on the Basic plan.

Today these pages show Shopify's defaults: the store name in plain text instead of the logo, blue links and checkboxes, a generic font, and rounded inputs. That is why checkout feels like a different site.

## 1. Open the checkout editor
Shopify admin → **Settings → Checkout → Customize** (top right). The same editor also has a page picker for **Customer accounts** pages.

## 2. Branding (paintbrush icon)

| Setting | Value |
| --- | --- |
| **Logo** | `anima-logo-solid.png` (already in *Content → Files*), size **Medium**, position **Start** |
| **Favicon** | the same logo |
| **Main colour scheme → Background** | `#FFFFFF` |
| **Text** | `#1C1B1A` |
| **Accent** (links, checkboxes, focus) | `#9C7F52` |
| **Buttons → Background** | `#1C1B1A` |
| **Buttons → Text** | `#FFFFFF` |
| **Order summary background** | `#F7F4F0` |
| **Errors / Critical** | `#8A2F2F` |
| **Headings font** | **Playfair Display** |
| **Body font** | **Assistant** |
| **Corner radius** | **None** (the store uses square buttons and fields) |
| **Header background** | `#FFFFFF`, with the logo linking back to the store (default) |

These are the exact colours and fonts of the Anima Editorial theme (*Theme settings → Colors / Typography*). If you change them there, change them here too.

## 3. Customer accounts
- In the checkout editor's page picker, open **Customer accounts → Orders / Profile**. They pick up the same branding automatically. Check that the logo and colours appear.
- **Settings → Customer accounts → Customize menu:** add a **Shop** link to `https://www.animajewel.store` so customers can return to the store from their account.
- Optional: **Settings → Domains → Connect existing domain** and add `account.animajewel.store` as the customer accounts domain, so the address bar shows your domain instead of `shopify.com`.

## 4. Check
Add any product to the bag and go to checkout. The logo, black buttons, gold links and Playfair headings should match the store. Then open the account icon in the header and check the sign-in page.

## Why I couldn't apply this directly
The Shopify connection used for the theme upload is not granted access to checkout branding settings (Shopify returned "access denied"). Applying it in the editor takes about five minutes and changes only appearance. It doesn't touch payments, shipping or prices.
