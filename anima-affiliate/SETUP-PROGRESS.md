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
- [x] Step 5e – partners.animajewel.store connected (GoDaddy CNAME), HTTPS live
- [x] Step 6 – Shopify webhooks (order creation/update/payment/cancellation) + SHOPIFY_WEBHOOK_SECRET in Vercel. Dispute webhook not offered by Shopify admin: mark chargebacks manually in Admin › Orders
- [x] Step 8 – Theme "Anima Editorial 1.9 (own influencer portal)" points Apply / Influencer sign in to partners.animajewel.store
- [ ] Owner publishes theme 1.9, then decides whether to uninstall UpPromote
