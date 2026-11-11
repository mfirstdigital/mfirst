# mFirst Digital Media Solutions: mfirst.in
`docs/` = the website (Cloudflare Pages, build output directory `docs`). `worker/` = Cloudflare Worker API (deploy separately; it is NOT published by Pages). See DEPLOY.md.

Edit content: change the HTML in `docs/`. Pages load ONE stylesheet, `docs/assets/site.css`, which is built from aos.css + Tailwind + style.css. After editing HTML classes or `style.css`, run `npm i && npm run build:css` and commit the result. (`aos.css` is already trimmed to the animations the site uses; if you add new `data-aos` effects, restore the full file from the `aos` npm package first.)
Real testimonials/clients: add objects `{ "quote":"", "name":"", "role":"", "company":"" }` to `docs/assets/data/testimonials.json`; the section appears automatically.
Prices live in `docs/pricing.html` AND `worker/worker.js` (`PLANS`, in paise). Change both together.
