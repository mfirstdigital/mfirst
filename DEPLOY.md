> **First launch the website with GO-LIVE.md.** Only do the steps below when you want OTP, lead emails and payments. The final step is setting `API_LIVE:true` in `docs/assets/config.js`.

# Deployment checklist (do in this order)
## 1. Website (Cloudflare Pages)
See GO-LIVE.md. Security headers and long font caching are already defined in `docs/_headers`.

## 2. Accounts you must create (these cannot be done in code)
- **MSG91 OTP**: register a sender ID and an OTP **template on DLT** (India requirement, takes days), create an MSG91 OTP template, note `MSG91_AUTHKEY` and `MSG91_TEMPLATE_ID`.
- **Resend**: add and verify `mfirst.in` (SPF + DKIM DNS records) so `noreply@mfirst.in` can send. Create `RESEND_API_KEY`. Make sure `info@mfirst.in` mailbox exists.
- **Razorpay**: start in Test Mode; copy `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. Add webhook `https://api.mfirst.in/api/razorpay-webhook`, event `payment.captured`, set a secret.
- **Cloudflare Turnstile** (free): create a widget for mfirst.in; put the *site key* in `docs/assets/config.js` (`TURNSTILE_SITEKEY`), the *secret* as `TURNSTILE_SECRET`.

## 3. Worker (`cd worker`)
```
npx wrangler kv namespace create STATE        # paste id into wrangler.toml, uncomment the block
for s in MSG91_AUTHKEY MSG91_TEMPLATE_ID RESEND_API_KEY RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET RAZORPAY_WEBHOOK_SECRET TURNSTILE_SECRET; do npx wrangler secret put $s; done
# optional: CRM_WEBHOOK_URL (Zoho/HubSpot/Make/Zapier catch-hook)
npx wrangler deploy && ./smoke.sh https://api.mfirst.in
```
Then test in order: contact-form OTP with your own phone > lead email arrives > careers form > newsletter > call-back > Razorpay TEST payment (check the page still allows the Razorpay popup) > switch to Live keys.

## 4. Cloudflare extras
Security headers are served from `docs/_headers` (no Transform Rules needed). Add a Rate Limiting rule on `api.mfirst.in/api/*` as a second layer. Security > Bots > AI Crawl Control: keep AI crawlers allowed.

## 5. Marketing / SEO setup
Google Search Console (add property, submit https://mfirst.in/sitemap.xml) > Bing Webmaster > Google Business Profile for the Greater Noida address (name, address, phone must match the site exactly) > put GA4 / Clarity IDs in `config.js` (a consent banner appears automatically) > add social profile URLs to the footer and to Organization `sameAs` > list the business on Indian directories.
