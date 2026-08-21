# Current state (frontend)

Updated 2026-08-21.

- P0-0 … P0-8 done. P1 not started.
- Sell-through % is globally withheld. UI shows raw sold_7d + active_listings.
- Counts: `src/lib/market-numbers.ts` only. `seo-brands.json` is route structure.
- Hero CTA is Add to Chrome. Authenticity 0–100 is hidden from homepage/pricing/default panel; `/authenticity` still exists.
- Playwright smoke: `npm run test:e2e` (mock snapshot server). Optional prod GETs in `e2e/prod.smoke.spec.ts`.
- Do not unpause STR. Do not enable UK, auto-buy, fake hit rates, or authenticity marketing.
- Stripe dashboard/prices/webhooks: do not touch. Naming trap lives in backend env.

Evidence: `../demand-intel/docs/READINESS_AUDIT_2026-08-20.md`
