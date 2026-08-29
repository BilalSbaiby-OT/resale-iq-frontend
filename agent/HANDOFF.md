STATUS: READY
OWNER: none            # free — claim before your first edit (see agent/LANES.md)
PUSH: yes
UPDATED: 2026-08-29
LAST SESSION DID: extension 1.3.0 committed + pushed (ead8449, 0a1950c, ada0d30).
  The 404 uncommitted lines that blocked this repo are now in. Store screenshots
  regenerated: they showed the removed IN RANGE / TOO DEAR labels, and the hardcoded
  asking price had gone stale so the panel claimed EUR140 on a page showing EUR120 —
  price now read live from [data-testid="item-price"].
  [x] Coolify deploy DONE 2026-08-29. /privacy live and verified: "27 August 2026"
      plus all four phrases the store review needs (session token on this device
      only / not in Chrome sync / title, brand and asking price / contacts no
      other host). NOTE: a plain curl served a STALE cached copy showing the old
      date — verify this page with a cache-buster (?v=timestamp) or you will
      mis-read it as un-deployed.
  BLOCKED ON OWNER — and NO AGENT CAN DO THIS STEP. Do not retry it:
    Chrome refuses to let ANY extension script the Web Store ("The extensions
    gallery cannot be scripted"), so Claude-in-Chrome cannot drive the dashboard.
    The Chrome Web Store API v2 is no substitute: it exposes only media.upload
    and publishers.items.publish — there is no resource for screenshots, listing
    copy, permission justifications or data-use declarations, and for 1.3.0 the
    screenshots and declarations are precisely what must change.
    Owner does the dashboard: extension/SUBMIT-CHECKLIST.md has every field in
    order, paste-ready, generated from STORE-LISTING.md.
  Package ready: ~/Desktop/resale-iq-extension-1.3.0.zip (1.3.0, matches the tree).
  Listing copy to paste verbatim: extension/STORE-LISTING.md
DEPLOY IS AUTOMATIC NOW (2026-08-29) — read agent/GUARDRAILS.md before pushing.
  A push to main DEPLOYS. Both repos have a Deploy workflow that runs once CI is
  green: resale-iq after "Agent Isolation", demand-intel after "Tests". No human
  step, nothing to click. A red build does not deploy — CI is the only gate.
  Verified end-to-end 2026-08-29 16:08: a push with no manual action replaced the
  frontend container (...160848952043) and the backend (...160908343246), and all
  production routes returned 200 afterwards.
  Mechanics: GitHub Actions SSHes to the server with a deploy-only key held in
  each repo's COOLIFY_DEPLOY_KEY secret. Each key sits behind a forced command in
  root's authorized_keys, pinned to one app UUID, no-pty and no forwarding — it
  cannot open a shell or deploy the other app (both verified). The Coolify API
  token lives in that forced command on the server and is not in GitHub.
  Re-provision with /root/setup-ci-deploy.sh (idempotent; prompts for the token).
  Note the API needs POST, not GET — an authenticated GET returns 405, and an
  unauthenticated probe returns 401 first, which hides it.
  The Coolify dashboard is still only reachable via
  `ssh -N -L 8000:localhost:8000 resaleiq` — a Hetzner Cloud Firewall drops :8000.
  Deploys no longer need it.
  SEO note: the P1-P4 work is live and verified (hubs, internal links,
  vinted-vs-depop rebuild, breadcrumbs). Detail in ~/Desktop/resale-iq-seo/.
  REQUEST FOR THE OTHER AGENT: src/app/page.tsx is your lane — a homepage footer
  link to /flip and /category would move both hubs from crawl depth 2 to 1.
NEXT TASK: offsite backup OAuth (Drive token) — see CURRENT_STATE. P0–P2 boxes are [x]

Frontend origin: (this commit). Backend: (this commit).
Chrome store: https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm

P0s 0–8, P1s 1–5, and P2 are done. Do not invent numbers.
`src/lib/market-numbers.ts` is the warehouse. Playwright: `npm run test:e2e`.

STR: `sold_observed / (sold_observed + active) × 100`, null if n < 30 OR active ≤ 0.
Median sold always carries sample size n; null is an em-dash, never 0.

---

# REPO MAP (P0-0)

## Two repos. Know which one you are in.
| | path | what | commit here for |
|---|---|---|---|
| **this** | `~/Desktop/resale-iq` | Next.js 16.3 + React 19.2, App Router, TypeScript | all P0/P1 UI, marketing, `extension/` |
| sibling | `~/Desktop/demand-intel` | FastAPI + SQLite (aiosqlite), port 8080 | anything serving the numbers |

The frontend proxies `/api`, `/auth`, `/stripe`, `/admin` to the backend via
`BACKEND_URL` rewrites. Never edit outside these two directories.

## Commands
```
npx tsc --noEmit
npm run build
npm run dev
npm run check:tracked
npm run check:isolation
npm run test:e2e
```
Backend: `cd ~/Desktop/demand-intel && python3 -m pytest tests/ -q`

## WHERE THE COUNTS LIVE
**Source of truth:** `src/lib/market-numbers.ts` → `/api/public/market-snapshot`
via last-good cache. `src/lib/stats.ts` is listings-tracked only.
`seo-brands.json` is STRUCTURE (slugs/routes), never a number fallback.

## Stripe
`src/lib/pricing.ts`. Pro is self-serve (`__POWER__`). Business keeps "Talk to us".
`STRIPE_PRO_PRICE_ID` = Starter/operator. `STRIPE_OPERATOR_PRICE_ID` = Pro/power.

## Extension — `extension/`
Manifest V3. Store URL is the published listing. `STORE-LISTING.md` must keep
`support@resaleiq.dev` and "not affiliated with Vinted" in paragraph 1.

## Landmines
1. `null` renders as `0`. `Math.round(null) === 0`. Score-bar: null → em-dash.
2. `.toLocaleString()` on null throws (ISR 500).
3. Sell-through is an observed share. Show % when n ≥ 30 watched sales; otherwise raw sold_7d + active_listings. Never weekly turns as STR.
4. Do not enable UK, auto-buy, fake hit rates, authenticity marketing.
