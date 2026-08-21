# Architecture (frontend)

```
browser → Next.js (resale-iq)
            rewrites /api /auth /stripe /admin → BACKEND_URL (demand-intel :8080)
```

- App Router. Server components fetch the snapshot. Client shells (`AppShell`) gate `/dashboard`.
- Public numbers: `getMarketNumbers()` → last-good file in tmp if live fails.
- Extension: Manifest V3, injects panel on vinted.es|fr|de|it|pt listing pages.
- Coolify is the deploy path. See backend `AI/DEPLOYMENT.md`.
