# Current state (frontend)

Updated 2026-08-22 (thin-n/DTS docs + a11y contrast on `/` and `/tools`).

- Live Coolify image tag: `26f5033` (methodology STR withhold + a11y + Target net).
  Matches origin/main as of 2026-08-22 13:45 UTC. Coolify has overwritten tags
  before (`1c31d23`, `3050aac`); pin to the running SHA, do not rebuild to chase git.
- Verdict UI is DECISION → WHY → NUMBER → EVIDENCE. Confidence HIGH/MEDIUM/LOW
  plus "Only N comparable sold items" on LOW. Gated free view still shows the band.
- Public checker (/tools) shows market price + buy-below + watched sold vs
  listed when the API sends them. SKIP is explained as a glut in our sample.
  STR / sizes stay gated. /check redirects to /tools, not /register.
- Manual pages and the live data strip read `getMarketNumbers()` only.
- Sidebar shows Starter/Pro, not OPERATOR/POWER.
- Deal scanner labels the constructed 30% gap "Target net", not "Est. Profit".
- Extension 1.2.0: BADGE_ID fix, confidence, why, 10-min cache, 429 handling.
- Pricing sells outcomes; estimated margin, not promised profit. Account shows
  trial vs 10/month clearly; billing success says Starter/Pro not operator/power.
- Chrome Web Store: https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm
  (`chromeStoreUrl()` / `NEXT_PUBLIC_CHROME_STORE_URL`).
- Sell-through % is the observed share `sold_observed / (sold_observed + active) × 100`,
  null when n < 30 or active ≤ 0 (the 100% hole). Raw counts stay.
- Median sold is shown with sample size n (`MedianN`). Null is an em-dash, never 0.
- `/data` weekly snapshot table (sold 7d, listings tracked, freshness) reads
  `getMarketNumbers()` only — no hardcoded counts.
- Free: 7-day reverse trial, then 10 checks/month. Logged-out first 10 views show numbers.
- avg_days_to_sell is withheld on customer surfaces (scrape-cadence listed_at).
- i18n: FR/ES for homepage + extension panel (`vinted.fr` / `vinted.es`).
- Playwright: `npm run test:e2e`.

Do not enable UK, auto-buy, fake hit rates, or authenticity marketing.
Stripe dashboard/prices/webhooks: do not touch.

- Verdict UI is DECISION → WHY → NUMBER → EVIDENCE. Confidence HIGH/MEDIUM/LOW
  plus "Only N comparable sold items" on LOW. Gated free view still shows the band.
- Public checker (/tools) shows market price + buy-below + watched sold vs
  listed when the API sends them. SKIP is explained as a glut in our sample.
  STR / sizes stay gated. /check redirects to /tools, not /register.
- Manual pages and the live data strip read `getMarketNumbers()` only.
- Sidebar shows Starter/Pro, not OPERATOR/POWER.
- Deal scanner labels the constructed 30% gap "Target net", not "Est. Profit".
- Extension 1.2.0: BADGE_ID fix, confidence, why, 10-min cache, 429 handling.
- Pricing sells outcomes; estimated margin, not promised profit. Account shows
  trial vs 10/month clearly; billing success says Starter/Pro not operator/power.
- Chrome Web Store: https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm
  (`chromeStoreUrl()` / `NEXT_PUBLIC_CHROME_STORE_URL`).
- Sell-through % is the observed share `sold_observed / (sold_observed + active) × 100`,
  null when n < 30 or active ≤ 0 (the 100% hole). Raw counts stay.
- Median sold is shown with sample size n (`MedianN`). Null is an em-dash, never 0.
- `/data` weekly snapshot table (sold 7d, listings tracked, freshness) reads
  `getMarketNumbers()` only — no hardcoded counts.
- Free: 7-day reverse trial, then 10 checks/month. Logged-out first 10 views show numbers.
- i18n: FR/ES for homepage + extension panel (`vinted.fr` / `vinted.es`).
- Playwright: `npm run test:e2e`.

Do not enable UK, auto-buy, fake hit rates, or authenticity marketing.
Stripe dashboard/prices/webhooks: do not touch.
