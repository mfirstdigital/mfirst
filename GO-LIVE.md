# Go live on Cloudflare Pages (your DNS and Worker are already on Cloudflare)
Nothing to change at GoDaddy (it is only the registrar). The site is a static folder (`docs/`) that Cloudflare Pages serves from your GitHub repo, with free HTTPS and the security headers in `docs/_headers`.

**Launch mode:** `docs/assets/config.js` has `API_LIVE:false`, so contact, call-back and careers forms open WhatsApp (97118 89449) with the details prefilled, plan buttons open WhatsApp, and the newsletter box is hidden. No OTP, email or payment account is needed yet. Call and WhatsApp buttons work as normal.

## Before you publish
1. **info@mfirst.in must be a real mailbox** (shown on every page), or tell us the real address.
2. **Prices** (₹999 / ₹2,499) are sample numbers and will be public. Edit `docs/pricing.html` first if wrong.

## 1. GitHub
New repository `mfirst-site` (Public or Private both work). Unzip the package and upload **everything inside** (the `docs` folder, `worker` folder and loose files). The repo root must show `docs`.

## 2. Create the Pages project
Cloudflare dashboard > **Workers & Pages** > Create > **Pages** > **Connect to Git** > pick `mfirst-site`.
- Project name `mfirst`, Production branch `main`
- Framework preset **None**, Build command **(empty)**, Build output directory **`docs`**
- Save and Deploy. Open the preview `https://mfirst.pages.dev` and check it.
(No GitHub? Choose **Upload assets** instead and drag the `docs` folder. Updates then need a new upload.)

## 3. Attach mfirst.in
1. Cloudflare **DNS**: if records for `@` or `www` already exist (old A/CNAME), delete them first. Do NOT delete MX or TXT records.
2. Pages project > **Custom domains** > Set up > `mfirst.in`, then again for `www.mfirst.in`. Cloudflare adds the DNS records for you.
3. **Rules > Redirect Rules** > Create: When hostname equals `www.mfirst.in` > Dynamic redirect to `concat("https://mfirst.in", http.request.uri.path)` , status 301, preserve query string.
4. **SSL/TLS**: mode **Full (strict)**; Edge Certificates: **Always Use HTTPS** ON, **Automatic HTTPS Rewrites** ON.
5. **Security > Bots / AI Crawl Control**: make sure AI crawlers are allowed if you want AI search visibility.

## 4. Test (5 minutes)
https://mfirst.in and https://www.mfirst.in (redirects to the first); every menu item; `/services.html` should redirect to `/services`; Call and WhatsApp buttons; contact form opens WhatsApp; phone view; https://securityheaders.com/?q=mfirst.in should show A or better.
Then **Google Search Console**: Add property `mfirst.in` (Cloudflare can add the DNS TXT for you) > submit `https://mfirst.in/sitemap.xml`.

## Updating later
Edit a file in GitHub > Commit. Cloudflare redeploys in about a minute. Roll back: Pages > Deployments > choose an older one > Rollback.

## Later: switch on OTP, emails, payments
Follow DEPLOY.md (the Worker route `api.mfirst.in` works because your DNS is on Cloudflare), then set `API_LIVE:true` in `docs/assets/config.js` and commit.
