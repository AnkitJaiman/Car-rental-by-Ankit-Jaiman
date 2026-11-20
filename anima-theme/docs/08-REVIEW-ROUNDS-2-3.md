# Review rounds 2 and 3: issues and resolution

All six reviewers re-checked their round-1 findings against the fixed build (round 2), then re-checked the round-2 fixes (round 3). The full reports are in `docs/audits/round-2/` and `docs/audits/round-3/`.

## Round 2: new or remaining issues and what was done

| ID | Severity | Issue | Resolution |
| --- | --- | --- | --- |
| R2-Q-01 | High | Header stayed on the menu icon after the window was narrowed once | Fixed: the menu is measured in the expanded layout. Verified with a 980–1920 px resize sweep. |
| R2-C-01 (dev) | High | Password page heading would print "translation missing" | Fixed: prints the merchant heading, and falls back to the translation only when blank |
| R2-C-01 (conv.) | High | Empty-bag category links never rendered | Fixed: uses the menu setting directly and skips empty collections, pages and blogs |
| P5-06 | High | Size and quantity button borders 1.30:1 | Fixed: 3.32:1 |
| A1-04 | Brief | Inspiration Station still a symmetric pyramid | Fixed: asymmetric size cycle, staggered card tops, large card centred |
| B2-07 | Medium | FAQ exchange answer promised more than the refund policy | Fixed: matches the Shopify refund policy |
| R2-B-01 | Medium | Footer said "moissanite" without "lab-created" (FTC 16 CFR 23.23) | Fixed |
| R2-B-02 | Medium | Our Story said "real" and blanket "natural gemstones" | Fixed |
| R2-C-02 (conv.) | Medium | Mobile add-to-bag bar did not show the chosen size | Fixed: shows the selected options |
| R2-C-02 (dev) | Medium | Wrong-password error hidden in a closed section | Fixed |
| R2-E-01 | Medium | Heading order skipped a level on five pages | Fixed: axe reports 0 violations |
| P5-13 | Medium | Product data: run-together description, one image | Fixed: clean description, up to 5 images, validated GTIN |
| R2-Q-02 | Medium | Enter in a cart quantity box went to checkout | Fixed |
| R2-Q-03 | Medium | Footer could not be reopened after rotating a phone | Fixed |
| R2-Q-04 | Medium | Theme Editor: selecting a hero slide didn't hold it | Fixed |
| Q6-06 | Medium | Tall desktop buy box scrolled away | Fixed for most widths: it sticks by its bottom edge. 1024–1280 px is left open (Low). |
| C4-06 | Medium | Size guide left the product page | Fixed: opens in a side panel |
| C4-08 / C4-09 | Medium | Gift note label and small cart tap targets | Fixed: "Gift message or order note", 44 px targets |
| R2-E-05 | Low | Page behind dialogs readable by screen readers | Fixed for drawers, search and quick add. The lightbox keeps its focus trap. |
| Others | Low | Breadcrumb wrapping, footer chevron, sale price colour, carousel gap, creator pill, order-note marker, vendor escaping, collection breadcrumbs, Organization logo, image loading on search, cart and first sections, cart update queue and focus, invalid quantities | Fixed |

## Round 3: new issues and what was done

| ID | Severity | Issue | Resolution |
| --- | --- | --- | --- |
| R3-C-01 (conv.) | High | Size guide panel opened with its content invisible | Fixed: animated content is shown immediately. Re-tested at 390 and 1440 px, and the US ring size chart is visible. |
| R3-C-01 (dev) | Medium | Escape closed hidden quick add instead of the size guide | Fixed: drawers are handled first. QA confirmed. |
| R3-A-01/02 | Low | Gift note row width, "View bag" underline | Fixed |
| A1-11 / R2-C-05 | Low | Empty collection showed "0 products" and sort | Fixed: toolbar hidden when the collection is empty |
| R2-C-03 | Low | Mobile add-to-bag bar hidden at first load | Fixed: shows whenever the main button is out of view |
| B2-23 / B2-19 / R2-B-04 | Low | Title Case trust strip, community copy, missing final-sale line | Fixed |

## Final verdicts (round 3)
| Reviewer | Verdict |
| --- | --- |
| UI/UX | Ship |
| Brand & content | Ship with conditions (owner items only) |
| Shopify development | Ship |
| Conversion | Ship with conditions. The blocker it raised (size guide) was fixed and re-tested afterwards; the remaining conditions are owner menu decisions. |
| Performance, SEO & accessibility | Ship |
| Extreme QA | Ship |

The remaining Low items and the owner decisions are listed in `07-TEST-REPORT.md`.
