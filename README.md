# SavvyTech Transparency Tag

Static landing page + production tag for AI compliance disclosures.

- **Production domain**: `compliance.savvytechautomations.com` (CNAME → `Jbeezy918.github.io`)
- **Hosting**: GitHub Pages
- **States covered**: Colorado SB 24-205, California SB 942 (more pending)

## Files

| Path | Purpose |
|---|---|
| `index.html`        | Landing page with $2.99 bundle CTA |
| `tag.js`            | Production snippet customers paste on their site |
| `states/*.json`     | Per-state disclosure templates |
| `assets/demo.js`    | Live preview on the landing page |
| `assets/style.css`  | Page styling |
| `CNAME`             | GitHub Pages custom domain |

## Manual steps before launch

1. **Create Stripe Payment Link** for $2.99/year (one-off price). Replace `STRIPE_PAYMENT_LINK_HERE` in `index.html` with the resulting URL.
2. **Cloudflare DNS**: add a CNAME record `compliance` → `Jbeezy918.github.io` in the `savvytechautomations.com` zone. Set proxy mode **DNS only** for the first 24h (let Pages provision SSL), then optionally enable orange-cloud after.
3. **Enable Pages** in repo settings: Pages → Source: `main` branch, root.

## Disclaimer

Starter compliance templates only. Not legal advice. Customers must review with counsel.
