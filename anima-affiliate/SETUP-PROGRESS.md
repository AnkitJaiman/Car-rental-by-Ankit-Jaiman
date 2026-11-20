# Influencer portal – setup progress (resume here)

Last updated: 20 Nov 2026. No keys or passwords are stored in this file.
All keys are in the owner's note: **Desktop › "All login key"**.

## Done
- [x] Step 1 – Supabase project `anima-affiliate` created, database tables created (RLS enabled)
- [x] Step 2 – Database connection string saved (DATABASE_URL)
- [x] Step 3 – Resend account, domain animajewel.store verified (DNS added in GoDaddy), API key saved
- [x] Step 4 – Shopify Dev Dashboard app "Anima Partners Portal" created and installed
      (Discounts: view + edit, Orders: view). Client ID + secret saved
- [x] Step 5a – Vercel account (team "Anima-Jewels", project "animajewels"), Root Directory = anima-affiliate
- [x] Step 5b – 14 environment variables added
- [x] Step 5c – Production branch tracking set to `claude/jewelry-website-usa-xzeimv`

## Next (start here tomorrow)
- [x] Step 5d – Deployed and Ready at https://animajewels.vercel.app (vercel.json sets framework nextjs)
- [x] Deployment Protection (Vercel Authentication) disabled
- [x] Database connected (DATABASE_URL fixed), all 14 environment variables present
- [x] Step 7 – Admin account created via /setup (setup page now closed)
- [ ] Step 5e – Vercel › Settings › Domains › add `partners.animajewel.store`; add the CNAME record it shows in GoDaddy DNS
- [ ] Step 6 – Shopify webhooks to `https://partners.animajewel.store/api/webhooks/shopify` (order create/update/paid/cancelled, dispute)
- [ ] Step 8 – Claude checks the live portal, then switches the website's "Apply" / "Influencer sign in" buttons from UpPromote to the portal
