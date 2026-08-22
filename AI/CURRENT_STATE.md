# Current state (frontend)

Updated 2026-08-22.

- P0, P1, and P2 done.
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
