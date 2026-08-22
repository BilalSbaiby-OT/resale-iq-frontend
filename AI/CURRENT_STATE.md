# Current state (frontend)

Updated 2026-08-22 (forensic pass: coverage gate + target-net label).

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
- Sell-through % is the observed share `sold_observed / (sold_observed + active)`,
  capped at 100%, withheld (null) when n < 30 watched sales. Raw counts stay.
- Median sold is shown with sample size n (`MedianN`). Null is an em-dash, never 0.
- `/data` weekly snapshot table (sold 7d, listings tracked, freshness) reads
  `getMarketNumbers()` only — no hardcoded counts.
- Free: 7-day reverse trial, then 10 checks/month. Logged-out first 10 views show numbers.
- i18n: FR/ES for homepage + extension panel (`vinted.fr` / `vinted.es`).
- Playwright: `npm run test:e2e`.

Do not enable UK, auto-buy, fake hit rates, or authenticity marketing.
Stripe dashboard/prices/webhooks: do not touch.
