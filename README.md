# Resale IQ (frontend)

Next.js 16 marketing site + authenticated app. Numbers come from the FastAPI
backend in `../demand-intel` via `/api` rewrites.

## Run

```
npm install
npx tsc --noEmit
npm run dev          # :3000, proxies BACKEND_URL (default localhost:8080)
```

Required before commit: `npx tsc --noEmit && npm run build && npm run check:tracked && npm run check:isolation`

## Tests

```
npm run test:e2e     # Playwright smoke (starts a mock snapshot server)
```

## Where counts live

One warehouse: `src/lib/market-numbers.ts` → `/api/public/market-snapshot`
(+ last-good cache in `src/lib/last-good-snapshot.ts`). `seo-brands.json` is
route structure only. `null` is not `0`.

## Stripe naming trap

`STRIPE_PRO_PRICE_ID` = Starter / operator (€19).
`STRIPE_OPERATOR_PRICE_ID` = Pro / power (€49). Do not "fix" the names.

See `AI/CURRENT_STATE.md` for what is true in production today.
