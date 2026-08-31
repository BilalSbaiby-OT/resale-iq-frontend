# MAP.md — Resale IQ, architecture as built

Phase 1 read-only audit. Every line: `path:line`, a command, or `UNKNOWN`.
Written 2026-08-31 by `tech-lead`. The company OS (`docs/company/OS.md`) assumes
Supabase; the real stack is **Next.js 16 (frontend) + FastAPI + a 56 GB SQLite
file (`demand-intel/demand_intel.db`)**. This file records what is actually there.

---

## 1. The four repos

| Repo | What | Evidence |
|---|---|---|
| `~/Desktop/resale-iq` | Next.js 16.3 / React 19.2 App Router frontend + Chrome MV3 extension (`extension/`) | `package.json`, `extension/manifest.json` |
| `~/Desktop/demand-intel` | FastAPI backend, APScheduler jobs, scrapers, 56 GB SQLite (`demand_intel.db`, `aiosqlite`, WAL) | `main.py`, `config.py` |
| `~/Desktop/resale-iq-growth` | Short-form content + attribution pipeline. No product code. | `resale-iq-growth/CLAUDE.md` |
| `~/Desktop/resale-iq-seo` | SEO agent workspace (briefs, GSC snapshots). No product code, no `.claude/` dir. | `find ~/Desktop/resale-iq-seo -maxdepth 1` |

Production: `resaleiq.dev` on Hetzner (`62.238.51.83`) via Coolify, two containers —
`frontend:3000` (public) and `backend:8080` (**internal only**, no public port) —
`demand-intel/resale-iq-stack.yml:1-11,25-38`.

---

## 2. Frontend entry points — `src/app/**` (Next.js App Router)

| Route | File | Nav-linked? |
|---|---|---|
| `/` | `src/app/page.tsx` | landing |
| `/check` | `src/app/check/page.tsx` | yes (CTA, `/tt /ig /rd /li` redirects target it) |
| `(auth)` group | `login`, `register`, `forgot-password`, `reset-password`, `verify-email`, `check-email` | auth flow |
| `(dashboard)/dashboard` | `.../dashboard/page.tsx` | sidebar default |
| `(dashboard)/deals` | Deal Scanner | sidebar §Overview (`src/components/layout/sidebar.tsx:22`) |
| `(dashboard)/order-planner` | Order Planner | sidebar §Overview (`sidebar.tsx:23`) |
| `(dashboard)/calculator` | fee calculator | sidebar §Overview (`sidebar.tsx:24`) |
| `(dashboard)/market` | Market Signals | sidebar §Intelligence (`sidebar.tsx:30`) |
| `(dashboard)/trends` | Market Trends | sidebar §Intelligence (`sidebar.tsx:31`) |
| `(dashboard)/brands` | Brand Rankings | sidebar §Intelligence (`sidebar.tsx:32`) |
| `(dashboard)/search` | Live Search | sidebar §Intelligence (`sidebar.tsx:33`) |
| `(dashboard)/compare` | Price Compare | sidebar §Intelligence (`sidebar.tsx:34`) |
| `(dashboard)/watchlist` | Watchlist | sidebar §Workspace (`sidebar.tsx:40`) |
| `(dashboard)/portfolio` | Portfolio P&L | sidebar §Workspace (`sidebar.tsx:41`) |
| `(dashboard)/verdict` | Quick Verdict | sidebar §Workspace (`sidebar.tsx:42`) |
| `(dashboard)/account` | Settings + REST API key UI | sidebar §Account (`sidebar.tsx:62`, `account/page.tsx:209-217`) |
| `(dashboard)/authenticity` | Listing check | sidebar §Account (`sidebar.tsx:63`) |
| `(dashboard)/admin`, `/admin/ops`, `/admin/traffic` | owner-only | shown only if `is_owner` (`sidebar.tsx:69-73,87-89`) |
| `/manual`, `/manual/[chapter]` | Reselling Manual | sidebar §Resources (`sidebar.tsx:52`) |
| `/blog`, `/blog/[slug]` | Guides | sidebar §Resources (`sidebar.tsx:53`) |
| `/tools`, `/tools/[slug]` | Free tools | sidebar §Resources (`sidebar.tsx:54`) |
| `/data` | Market Data | sidebar §Resources (`sidebar.tsx:55`) |
| `/support` | Support | sidebar §Resources (`sidebar.tsx:56`) |
| `/flip`, `/flip/[brand]`, `/flip/[brand]/[category]` | SEO flip pages | homepage footer (per `agent/HANDOFF.md`, "footer now links /flip and /category") |
| `/category`, `/category/[category]` | SEO category hub | homepage footer, same commit |
| `/api-docs` | REST API docs | **not in sidebar nav**; reachable only via direct URL / account page copy. Reachability: partial (orphaned from primary nav). |
| `/methodology`, `/legal`, `/privacy`, `/terms` | policy pages | footer |
| `/billing/success` | Stripe return URL | linked from Stripe Checkout only |
| `/llms.txt` (route.ts), `/robots.ts`, `/sitemap.ts`, `/opengraph-image.tsx` | machine-readable surfaces | crawlers |
| `/pricing`, `/sign-in` | 307 redirects to `/#pricing`, `/login` | `next.config.ts:70-76` |
| `/tt`, `/ig`, `/rd`, `/ig`, `/li` | UTM-tagged short links → `/check?utm_*` | `next.config.ts:88-114` |

No `src/app/api/**` directory exists — the frontend has **zero Next.js API routes**
of its own; all `/api`, `/auth`, `/stripe`, `/admin` calls are proxied straight to
FastAPI (§4). `find src/app -maxdepth 1` confirms no `api/` dir under `src/app`.

---

## 3. Extension surfaces — `extension/` (MV3)

| File | Role |
|---|---|
| `manifest.json` | content script on `vinted.{es,fr,de,it,pt}` = `content.js`+`content.css`; content script on `resaleiq.dev` = `link.js`; `background.js` service worker; `options.html`/`options.js` popup. `host_permissions: ["https://resaleiq.dev/*"]` only. |
| `content.js` | runs on a Vinted listing page, extracts the query string, paints the price band into the DOM (`content.js:6,292,354-355`) |
| `background.js` | service worker; only network caller. `API = "https://resaleiq.dev"` (`background.js:7`); calls `GET /api/verdict?q=` (`background.js:41`) and `POST /api/purchases` (`background.js:57`) |
| `link.js` | reads the session resaleiq.dev already stored, runs only on resaleiq.dev (`link.js:4`) |
| `options.js` | popup; deep-links to `https://resaleiq.dev/login` (`options.js:20`) |

Published: Chrome Web Store, version **1.3.0**, live since 2026-08-30 per
`agent/HANDOFF.md` ("SUBMITTED AND LIVE ... verified against the public listing
2026-08-31: version 1.3.0, updated 30 August 2026, 18.22 KiB, 0 ratings").
Two stale local zips exist on Desktop (`resale-iq-extension-1.2.0.zip`,
`-1.3.0.zip`, `resale-iq-extension.zip` inside the repo) — not evidence of what's
live, only of what was packaged.

---

## 4. Request flow for one price check, end to end

1. **Vinted page** (e.g. `vinted.es/item/...`) — `extension/content.js` reads the
   listing title/brand into a query string `q`.
2. `content.js` messages the service worker; `extension/background.js:41` calls
   `GET https://resaleiq.dev/api/verdict?q=<q>` with the stored API key header.
3. **Next.js rewrite** — `next.config.ts:120-125`: `{ source: "/api/:path*",
   destination: "${BACKEND_URL}/api/:path*" }`. `BACKEND_URL` env var is
   `http://backend:8080` in prod (`resale-iq-stack.yml:32`), `http://localhost:8080`
   in dev (`next.config.ts:6`).
4. **FastAPI route** — `demand-intel/api/routes.py:650`, `@public_router.get("/api/verdict")`,
   handler `get_verdict(q, request, unlock)`. Resolves caller via `_resolve_caller`,
   rate-limits per-user/per-IP (`api/routes.py:684-690`), then queries
   `db/queries.py` (`get_model_signals`, `count_verdicts_today`, etc., imported at
   `api/routes.py:666-669`) against `demand_intel.db`.
5. Response includes buy-below price (`max_buy_price = avg_price × 0.95 × 0.70`,
   `demand-intel/CLAUDE.md` "Max Buy Price"), band, and (for paid/trial) STR/sizes/reasons.
6. `content.js` paints BUY/WATCH/SKIP + price into the Vinted DOM.

The same rewrite pattern covers `/auth/:path*`, `/stripe/:path*`, `/admin/:path*`
→ `api/auth.py`, `api/stripe_routes.py`, and the `/admin/*` handlers in
`api/routes.py` (`next.config.ts:121-124`).

---

## 5. FastAPI backend — routers and endpoint counts

| Router (file) | Mounted at | Endpoints | Gate |
|---|---|---|---|
| `auth_router` (`api/auth.py`) | `/auth/*`, `/register` etc. (no prefix visible in grep — see file) | 12 | none (public auth flow) — `main.py:1131` |
| `stripe_router` (`api/stripe_routes.py`) | `/plans`, `/checkout`, `/verify-session`, `/portal`, `/webhook` | 5 | none (webhook must be public) — `main.py:1135` |
| `public_router` (`api/routes.py`) | `/api/ping` etc, `/api/verdict`, `/api/public/market-snapshot`, `/api/calc`, `/api/model-signals`, `/api/purchases` | 6 | none — `main.py:1139` |
| `router` (`api/routes.py`) | 53 remaining `/api/*` and `/admin/*` endpoints (demand matrix, cycles, catalog, admin users, scraper control, ingest, growth-funnel, traffic) | 53 | `require_verified_email` + `require_paid_plan` — `main.py:1148` |
| `resale_router` (`api/resale_routes.py`) | `/api/kpis`, `/api/deals`, `/api/live-deals`, `/api/order-plan`, `/api/watchlist*`, `/api/portfolio*`, `/api/authenticity/score`, `/api/alerts/telegram/*`, `/api/price-history/*`, `/api/account/trial-recap` | 22 | `require_verified_email`; per-endpoint `require_power_plan` for live-deals/order-plan — `main.py:1156` |
| `agent_router` (`api/agent_routes.py`) | `/api/ops/heartbeat`, `/api/admin/ops` | 2 | `_require_power` internal, not `require_paid_plan` — `main.py:1162` |

Total ≈ 100 FastAPI endpoints (59+22+2+5+12 counted via
`grep -c "^@.*\.\(get\|post\|put\|delete\|patch\)"` on each file).

**Legacy server-rendered pages, same `main.py`, `/`, `/register`, `/app`,
`/dashboard`, `/deals`, `/trends`, `/brands`, `/authenticity`, `/portfolio`,
`/watchlist`, `/calculator`, `/admin`, `/account`, `/terms`, `/privacy`, `/check`
(`main.py:1165-1245`)** each `FileResponse` a static file under `demand-intel/frontend/*.html`
(a second, older, vanilla-JS dashboard — `demand-intel/CLAUDE.md` "Frontend | Single-file
`frontend/dashboard.html`"). These are **dead in production**: the backend
container has no public port (`resale-iq-stack.yml:1-11` "backend ... :8080 —
internal only"), and Next.js only rewrites `/api /auth /stripe /admin`
(`next.config.ts:120-125`), so nothing routes a resaleiq.dev visitor to `/`, `/app`,
`/dashboard` etc. on the backend. Confirmed reachable only when the backend is run
standalone (`demand-intel/docker-compose.yml:4-5`, `ports: 8080:8080`) — i.e. local
dev / the operator's own machine, per `demand-intel/CLAUDE.md`: "a terminal-style
dark web dashboard at `localhost:8080`".

---

## 6. The frontend↔backend contract

`next.config.ts:120-125`:
```
/api/:path*    -> ${BACKEND_URL}/api/:path*
/auth/:path*   -> ${BACKEND_URL}/auth/:path*
/stripe/:path* -> ${BACKEND_URL}/stripe/:path*
/admin/:path*  -> ${BACKEND_URL}/admin/:path*
```
`BACKEND_URL` default `http://localhost:8080` (`next.config.ts:6`), prod value
`http://backend:8080` (Coolify internal network, `resale-iq-stack.yml:32`).

### Env vars — names only, never opened `.env`

**Frontend** (`grep -rhoE "env\.[A-Z_]+" src/ next.config.ts scripts/`):
`BACKEND_URL`, `GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_CHROME_STORE_URL`, `SNAPSHOT_CACHE_PATH`.

**Backend** (`grep -rhoE "getenv|environ" api/ config.py main.py db/ engine/ scripts/`):
`ALLOWED_ORIGINS`, `APP_URL`, `BACKUP_KEEP`, `BACKUP_MAX_DISK_USE`,
`BACKUP_MAX_SHARE`, `BACKUP_OFFSITE_CMD`, `BOOTSTRAP_ADMIN_EMAIL`, `DB_PATH`,
`ENABLE_DOCS`, `FROM_EMAIL`, `JWT_SECRET`, `MONITOR_FAILURES_BEFORE_ALERT`,
`OFFSITE_COMPRESS_RATIO`, `OFFSITE_MIN_KEEP`, `OWNER_EMAILS`,
`PLAN_LOCKED_EMAILS`, `PROTECTED_USER_EMAILS`, `REDDIT_CLIENT_ID`,
`REDDIT_CLIENT_SECRET`, `REDDIT_LIVE_MODE`, `REDDIT_PASSWORD`, `REDDIT_USERNAME`,
`REDDIT_USER_AGENT`, `REPLY_TO_EMAIL`, `RESALEIQ_API`, `RESALEIQ_API_KEY`,
`RESALEIQ_TOKEN`, `RESELLER_ALERTS`, `RESEND_API_KEY`, `SCRAPER_PROXY`,
`SSL_CERT_FILE`, `STRIPE_OPERATOR_PRICE_ID`, `STRIPE_PRO_PRICE_ID`,
`STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL`, `TELEGRAM_CHAT_ID`.

`config.py` header states "no `.env` file" for the dashboard/config layer, yet the
grep above shows `os.getenv`/`os.environ` used throughout `api/`, `main.py`,
`db/`; `demand-intel/.env` and `.env.example` both exist on disk
(`ls demand-intel/.env*`). Contradiction between the CLAUDE.md claim ("Config |
`config.py` — flat constants, no `.env` file") and the actual code — UNKNOWN
which is authoritative without opening `.env` (blocked by rules).

---

## 7. Background jobs — every one found

### In-process (FastAPI container, `demand-intel/main.py:schedule_jobs()`, lines 720-878)
20 APScheduler jobs, `max_instances=1, coalesce=True` on all:

| id | cadence | what |
|---|---|---|
| `vinted_peak` | every `SCRAPE_PEAK_INTERVAL`=30 min (`config.py:220`) | `job_vinted` — scrapes all 5 Vinted TLDs **from inside the production container** |
| `google_trends` | daily 06:00 | `job_google_trends` |
| `tracker` | every `TRACKER_INTERVAL_MINUTES` | `job_tracker` — sold-item detection |
| `prediction_eval` | daily 04:30 | `job_prediction_eval` |
| `analyzer` | every `ANALYZER_INTERVAL_MINUTES` | `job_analyzer` — `recalculate_all()` 7-step pipeline |
| `daily_brief` | daily, `DAILY_BRIEF_HOUR` | `job_daily_brief` — **only if `RESELLER_ALERTS_ENABLED`** (off by default) |
| `strong_buy_alerts` | every 2h | same gate |
| `health_check` | every 6h | `job_health_check` |
| `db_backup` | daily 03:00 UTC | `job_backup` — WAL-consistent, rotated |
| `wal_checkpoint` | every 3h | `job_wal_checkpoint` |
| `reddit_bot` | 10:00 & 18:00 | `job_reddit_bot` |
| `business_digest` | daily, `BUSINESS_DIGEST_HOUR` | `job_business_digest` |
| `data_quality` | hourly at :35 | `job_data_quality` |
| `label_migration` | one-time (fires 3 min after boot, then never again) | `job_label_migration` |
| `str_diagnostic` | every 6h (first fire 2 min after boot) | `job_str_diagnostic` — governs the STR (sell-through) publish hold, see §9 |
| `shelf_watchdog` | hourly (first fire 5 min after boot) | `job_shelf_watchdog` |
| `snapshot_metrics` | every 6h at :05 | `job_snapshot_metrics` |
| `website_audit` | every 6h at :15 | `job_website_audit` |
| `watchlist_alerts` | every 6h at :30 | `_job_watchlist_alerts` |
| `deal_alerts` | every 6h at :45 | `_job_deal_alerts` |

### launchd (this Mac, outside any container) — `dev.resaleiq.scrape-agent`

`~/Library/LaunchAgents/dev.resaleiq.scrape-agent.plist` runs
`demand-intel/scripts/run_local_agent.sh` every 7200s (2h), `RunAtLoad=false`.
It wraps `scripts/local_scrape_agent.py`, which POSTs scraped listings to
**production** at `https://resaleiq.dev/api/ingest/listings` and
`/api/shelf/observed` using `RESALEIQ_API_KEY`
(`scripts/local_scrape_agent.py:32-33,116,192`). Exists because "Vinted 403-blocks
the production server's datacenter IP on everything ... a residential connection
is not blocked" (`scripts/install_local_agent.sh:4-8`).

**This job has never successfully run since install.** `launchctl list
dev.resaleiq.scrape-agent` reports `LastExitStatus = 32256` (exit 126).
`~/Library/Logs/resaleiq/launchd.err` has 131 consecutive lines of
`/bin/bash: .../run_local_agent.sh: Operation not permitted`, first entry
matching install (2026-08-20), latest 2026-08-31 17:25 — i.e. **every single
2-hourly attempt for 11 days has failed**, and `scripts/local_scrape_agent.py`
has never produced its own log (`~/Library/Logs/resaleiq/scrape-agent.log` does
not exist — `run_local_agent.sh` only writes it once the Python script starts,
and it never got that far). `demand_intel.db` itself last changed 2026-08-28
14:19 and `demand_intel.db-wal` is 0 bytes and unchanged since the same
timestamp (`ls -la demand_intel.db*`), consistent with no new writes via this
path in 3+ days. Root cause: macOS TCC/permissions on the launchd background
process (bash denied "Operation not permitted" running a script it has +x on);
not diagnosed further under a read-only audit.

**Whether the site's live data is fresh at all now depends entirely on the
in-container `vinted_peak` job (above) actually reaching Vinted** — which
needs `SCRAPER_PROXY` set to a residential proxy in production
(`scrapers/vinted.py:446-451,486,580,1000` — the code explicitly checks for and
recommends `SCRAPER_PROXY` when blocked). **UNKNOWN whether `SCRAPER_PROXY` is
set in prod** — cannot open `.env`. If it is not set, and the local agent is
broken, the pipeline has had no new residential-IP source in 11 days while the
homepage still advertises "scraped every 30 min" (OS.md §1).

### GitHub Actions (not background jobs, but automatic) — see §8.

---

## 8. CI/CD — what actually gates a deploy

| Repo | Workflow | Runs on push/PR to `main` | Gate content | Then |
|---|---|---|---|---|
| `resale-iq` | `.github/workflows/agent-isolation.yml` | push+PR to `main` | `npm run check:isolation` (secret scan), `npx tsc --noEmit`, `npm run check:tracked && check:warehouse && check:market-proof` (number-honesty checks), `npm run build`, `npm run check:isolation:built` | `deploy.yml` fires on this workflow's success |
| `resale-iq` | `.github/workflows/deploy.yml` | `workflow_run` on Agent Isolation success (main only) or manual dispatch | fingerprints the live JS bundle, SSHes a forced-command deploy key to Coolify, polls for the bundle hash to change | ships `resaleiq.dev` frontend |
| `demand-intel` | `.github/workflows/backend-tests.yml` ("Tests") | push+PR to `main` | `pytest tests/ -v --tb=short` — **1147 tests collected** (`python3 -m pytest tests/ --collect-only -q`) | `deploy.yml` fires on success |
| `demand-intel` | `.github/workflows/deploy.yml` | `workflow_run` on Tests success or manual dispatch | SSH deploy, then a smoke curl to `/api/public/market-snapshot` (200 required) | ships the backend container |

**Neither `.github/workflows/agent-isolation.yml` nor `deploy.yml` in `resale-iq`
runs `npm run lint`, unit tests, or `npm run test:e2e` (Playwright).** The
Playwright suite (`e2e/customer-workflow.spec.ts`, `e2e/smoke.spec.ts`,
`e2e/signup-verify.spec.ts`, `e2e/prod.smoke.spec.ts`, plus `mock-backend.mjs`) exists
and is runnable locally (`playwright.config.ts`, `package.json:"test:e2e"`), but is
**not part of the merge gate or the deploy gate** — confirmed by reading
`agent-isolation.yml` end to end (no `playwright test` step). So the frontend ships
on: secret scan + typecheck + three custom number-honesty scripts + a successful
build. The backend ships on a real 1147-test pytest run. This is an asymmetry: a
frontend regression that typechecks and builds can reach production with zero
behavioural test coverage.

Deploy mechanism for both: not a Coolify GitHub-App webhook (Coolify's instance
URL is blank — `deploy.yml` comment, both repos) but a GitHub Actions job SSHing
to `62.238.51.83` with a per-app forced-command deploy key
(`no-pty`, pinned to one Coolify app UUID) that only that key can trigger.

---

## 9. Feature-by-feature: route, reachability, maintenance state

| Feature | Route(s) | Reachable? | Maintained / abandoned |
|---|---|---|---|
| Live search | `/search` (frontend), `GET /api/search/vinted` | yes, nav | active — `search/page.tsx` last touched 2026-08-23 |
| Price Compare | `/compare` (frontend), `GET /api/compare/prices` | yes, nav (Pro-gated, `sidebar.tsx:15,34`) | active — 2026-08-23. Sells "26-market" (`pricing.ts:72`) vs `market-numbers`/`i18n.ts:33` "5 EU markets" — contradiction, see HARNESS.md |
| Deal Finder (Live Deal Finder) | `/deals` (frontend, "Deal Scanner" for Starter), `GET /api/live-deals` (Pro-only, `resale_routes.py:952`) | yes, nav | active — `deals/page.tsx` 2026-08-27 |
| Order Planner | `/order-planner`, `GET /api/order-plan` (`resale_routes.py:1035`) | yes, nav | active — 2026-08-27. **Sold on Pro €49 while `CLAUDE.md` lists it under "Hard no"** — see HARNESS.md contradiction #1 |
| Watchlist | `/watchlist`, `GET/POST/DELETE /api/watchlist*` | yes, nav | active — 2026-08-27 |
| Deal Scanner | `/deals` (Starter-tier alias of Deal Finder UI) | yes, nav | active |
| Portfolio P&L | `/portfolio`, `/api/portfolio*` | yes, nav | active — 2026-08-27 |
| Fee calculator | `/calculator` | yes, nav | active — 2026-08-17 (oldest of the dashboard pages, but repo itself is 27 days old) |
| Manual | `/manual`, `/manual/[chapter]` (17 chapters per `resale-iq-seo/CLAUDE.md`) | yes, nav + footer | active — 2026-08-29 |
| Blog | `/blog`, `/blog/[slug]` (31 posts per `resale-iq-seo/CLAUDE.md`) | yes, nav + footer | active — 2026-08-29 |
| Tools | `/tools`, `/tools/[slug]` (5 tools) | yes, nav + footer | active — 2026-08-22 |
| REST API | `/api-docs` (frontend docs page), customer key issued from `/account` (`account/page.tsx:209-217`), consumed via `router`/`resale_router` endpoints with `X-Api-Key` | **partially** — `/api-docs` is not in the sidebar nav; only reachable by direct URL or from the account page's REST API panel | active — sold on Pro €49 (`pricing.ts:71`) while `CLAUDE.md` "Hard no" also lists REST API — same contradiction as Order Planner |
| Portfolio, Watchlist Telegram alerts | `/api/alerts/telegram/*` | yes (account settings, not checked for a UI toggle) | active |
| Admin (ops/traffic/customers) | `/admin`, `/admin/ops`, `/admin/traffic` | owner-only, gated on `is_owner` | active |

---

## 10. Dead code and orphans found

1. **Backend's own server-rendered dashboard** (§5) — 17 routes + `demand-intel/frontend/*.html`
   files, unreachable in production (no public port on the backend container).
   Live only when the backend is run standalone/locally.
2. **`/api-docs`** — exists and is sold on, but not linked from the dashboard
   sidebar nor confirmed in the marketing footer; reachability is by direct URL only.
3. **`demand.db`** — `demand-intel/CLAUDE.md` "Current Known Issues": "Two DB files
   exist in the project root. `demand_intel.db` is the active database ...
   `demand.db` is stale/legacy — do not reference it." (self-documented dead data file.)
4. **Model extraction Layer 3** — disabled (`demand-intel/CLAUDE.md` "Model
   Extraction Coverage": "Layer 3 of model extraction is disabled ... producing junk").
5. **Wallapop scraper** — disabled, "36 rows, 0 sold" (`demand-intel/CLAUDE.md`
   "Disabled Platforms"). **Facebook scraper** — disabled, needs a saved Playwright
   session that expires silently.
6. **`_quarantine_sold_observed_20260820`** table — 173,883 fabricated rows kept only
   as evidence, explicitly not a dataset (`demand-intel/CLAUDE.md` "shelf.py v1").
7. `resale-iq-extension.zip` (repo root) and two Desktop zips
   (`resale-iq-extension-1.2.0.zip`, `-1.3.0.zip`) — stale packaging artefacts, not
   what's actually published (1.3.0 confirmed live via the Chrome Web Store listing
   itself, per `agent/HANDOFF.md`).

No orphaned frontend **components** were found by import-graph inspection within
budget; the sidebar nav array (`sidebar.tsx:17-73`) accounts for every dashboard
route. A full unused-export sweep (e.g. `ts-prune`) was not run — **UNKNOWN**
beyond what's listed above.

---

## 11. Test and CI inventory (consolidated)

| Suite | Location | Count | In CI gate? |
|---|---|---|---|
| Backend pytest | `demand-intel/tests/*.py` | 1147 tests collected (`pytest --collect-only -q`) | yes — `backend-tests.yml` |
| Frontend Playwright e2e | `resale-iq/e2e/*.spec.ts` (customer-workflow, smoke, signup-verify, prod.smoke) | 4 spec files + `mock-backend.mjs` | **no** — not invoked by any workflow |
| Frontend typecheck | `npx tsc --noEmit` | — | yes — `agent-isolation.yml` |
| Frontend lint (`npm run lint`) | `eslint.config.mjs` | — | **no** — not invoked by any workflow |
| Custom honesty checks | `scripts/check-isolation.mjs`, `check-tracked-figure.mjs`, `check-warehouse.mjs`, `check-market-proof-grain.mjs`, `check-extension.mjs` | 5 scripts | yes (isolation/tracked/warehouse/market-proof); `check-extension` **not referenced in any workflow** — UNKNOWN if run anywhere |

---

## 12. What this file could not determine

- **Whether `SCRAPER_PROXY` is set in production** — the one fact that decides
  whether the site has any live Vinted data source left at all, given the local
  agent is broken (§7). Cannot check without opening `.env` (rule-blocked).
- **Whether `demand-intel/config.py`'s "no `.env` file" claim is stale** — code
  clearly reads env vars throughout; `.env`/`.env.example` exist on disk.
- Whether `check-extension.mjs` runs anywhere (no workflow reference found).
- Full unused-export/orphan-component sweep beyond the sidebar-nav cross-check.
- Whether `resale-iq-growth` or `resale-iq-seo` have their own test suites —
  not explored; out of scope per the OS §8 Phase 1 department split (their own
  audits, not tech-lead's).
