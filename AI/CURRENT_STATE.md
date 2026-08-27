# Current state (frontend)

Updated 2026-08-27 (overhaul Wave 0–1 live verify). Canonical evidence:
`../demand-intel/docs/OVERHAUL_2026-08-27.md`.

- Live Coolify frontend image is **`4a95f53`**, not `26f5033`. Laptop HEAD `de1dd8f`.
  Do not rebuild production until the operator confirms.

- Homepage "selling this week" pairs category volume with **category** avg
  (`buildSellingThisWeekRows`). Freshness badge is age, not "LIVE".
- Customer price label is **Avg sold** (mean). Median is stored when the
  sample supports it; buy-below stays on the mean. Null is an em-dash, never 0.
- Starter = Deal Scanner + calculator. Pro = Live Deal Finder + Order Planner
  + Price Compare + API. Copy, paywall, support, llms.txt, JSON-LD match gates.
- Hero Air Max 1 panel is a dated screenshot, not a live fetch.
- Extension 1.2.1: "avg sold" not median. Chrome store still 1.2.0 until resubmit.
- `/tools?welcome=1` is first-item onboarding after free signup.
- Authenticity is "Listing check" under Account, not a marketed product.
- Live Deal Finder empty state distinguishes vague models vs no match.
  Gap on a listing is **Target net**, not profit.

Previous notes still apply:

- Live Coolify image tag: `26f5033` (methodology STR withhold + a11y + Target net).
  Coolify has overwritten tags before (`1c31d23`, `3050aac`); pin to the running
  SHA, do not rebuild to chase git. Local code is ahead of this image until deploy.
- Verdict UI is DECISION → WHY → NUMBER → EVIDENCE. Confidence HIGH/MEDIUM/LOW
  plus "Only N comparable sold items" on LOW. Gated free view still shows the band.
- Public checker (/tools) shows market price + buy-below + watched sold vs
  listed when the API sends them. SKIP is explained as a glut in our sample.
  STR / sizes stay gated. /check redirects to /tools, not /register.
- Manual pages and the live data strip read `getMarketNumbers()` only.
- Sidebar shows Starter/Pro, not OPERATOR/POWER.
- Deal scanner labels the constructed 30% gap "Target net", not "Est. Profit".
- Chrome Web Store: https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm
  (`chromeStoreUrl()` / `NEXT_PUBLIC_CHROME_STORE_URL`).
- Sell-through % is the observed share `sold_observed / (sold_observed + active) × 100`,
  null when n < 30 or active ≤ 0 (the 100% hole). Raw counts stay.
- `/data` weekly snapshot table (sold 7d, listings tracked, freshness) reads
  `getMarketNumbers()` only — no hardcoded counts.
- Free: 7-day reverse trial, then 10 checks/month. Logged-out first 10 views show numbers.
- avg_days_to_sell is withheld on customer surfaces (scrape-cadence listed_at).
- i18n: FR/ES for homepage + extension panel (`vinted.fr` / `vinted.es`).
- Playwright: `npm run test:e2e`.

Do not enable UK, auto-buy, fake hit rates, or authenticity marketing.
Stripe dashboard/prices/webhooks: do not touch.
