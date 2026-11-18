# Influencer portal – setup progress (resume here)

Last updated: 18 Nov 2026. No keys or passwords are stored in this file.
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
- [ ] Step 5d – Vercel › Deployments: check for a new deployment from `claude/jewelry-website-usa-xzeimv`
      (a commit was pushed to trigger it). If none: Create New › Deployment › branch `claude/jewelry-website-usa-xzeimv`.
      Wait for green "Ready", note the `….vercel.app` address.
      (The earlier failed build used `main`, which has no anima-affiliate folder. That is expected.)
- [ ] Step 5e – Vercel › Settings › Domains › add `partners.animajewel.store`; add the CNAME record it shows in GoDaddy DNS
- [ ] Step 6 – Shopify webhooks to `https://partners.animajewel.store/api/webhooks/shopify` (order create/update/paid/cancelled, dispute)
- [ ] Step 7 – Open `/setup`, enter SETUP_TOKEN (from the note), create the admin login
- [ ] Step 8 – Claude checks the live portal, then switches the website's "Apply" / "Influencer sign in" buttons from UpPromote to the portal
