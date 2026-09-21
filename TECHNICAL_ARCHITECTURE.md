# Resale IQ frontend — technical architecture

Frontend repo: `resale-iq-frontend` (this tree).  
Companion backend: `resale-iq-backend` / `demand-intel` (FastAPI + SQLite). This document is frontend-focused. API shapes are the **contracts the UI assumes**; the backend owns enforcement.

Verified against this tree on 2026-09-21 (`main` at `4f15eea` plus this audit branch). Sibling backend sources were **not** in this environment.

---

## 1. What this app is

The product number is the highest price worth paying for a Vinted item:

`buy_below = avg_sale × 0.95 × 0.70` on **ES / FR / DE / IT / PT**.

The frontend sells that number (homepage, `/tools`, `/pricing`, `/verdict`), cites weekly brand volumes (`/data`, `/flip`), and hosts the Chrome MV3 overlay (`extension/`). It does **not** own SQLite. Counts a customer sees on marketing/data pages come from `src/lib/market-numbers.ts` → `GET /api/public/market-snapshot`. `seo-brands.json` is slugs, not numbers.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js `^16.3` App Router, `output: "standalone"` |
| UI | React `19.2.4`, Tailwind CSS v4 (`@theme` in `src/app/globals.css`) |
| Language | TypeScript 5 |
| Client state | Zustand (`src/lib/auth-store.ts`) — auth only |
| HTTP | `src/lib/api.ts` `fetch` wrapper (browser-only) |
| i18n | In-repo dictionaries (`src/lib/i18n.ts` + copy modules). English unprefixed; `es\|fr\|de\|it\|pt` under `src/app/[locale]/` |
| Tests | `node --test` on `src/lib/*.test.ts`; Playwright in `e2e/` |
| Deploy | Coolify on Hetzner; GitHub Actions `agent-isolation.yml` is the deploy gate; `deploy.yml` SSHes after green Isolation on `main` |

There is no `src/middleware.ts`. Next 16 uses `src/proxy.ts` (locale cookie + `x-resaleiq-verified-ip` on backend-bound paths).

---

## 3. Directory map

| Path | Role |
|---|---|
| `src/app/` | App Router pages, `sitemap.ts`, `robots.ts`, `/deploy-id`, `/llms.txt` |
| `src/app/(auth)/` | login, register, verify, reset — `robots: noindex` |
| `src/app/(dashboard)/` | product app (`/verdict`, `/account`, `/deals`, …) — `robots: noindex` |
| `src/components/` | shell, landing, tools, paywall, UI primitives |
| `src/lib/` | API client, auth, entitlement, market warehouse, SEO, pricing, analytics |
| `src/types/index.ts` | Shared domain types (`Plan`, `VerdictResult`, deals, …) |
| `src/data/` | Blog posts, search-intent copy, SEO landing copy |
| `extension/` | Chrome MV3 content script + service worker |
| `e2e/` | Playwright + `mock-backend.mjs` |
| `scripts/` | Isolation / warehouse / locale / extension contracts |
| `docs/`, `agent/`, `AI/` | Company, agent lanes, Stripe trap notes |

---

## 4. Routing and backend proxy

`next.config.ts` rewrites same-origin traffic to `BACKEND_URL` (default `http://localhost:8080`):

- `/api/:path*` → backend `/api/:path*`
- `/auth/:path*` → backend `/auth/:path*`
- `/stripe/:path*` → backend `/stripe/:path*`
- `/admin/:path*` → backend `/admin/:path*`

Pages stay on Next. Exceptions that must **not** be rewritten: `/deploy-id`, `/llms.txt`, `_next/*`.

Notable redirects: `www` → apex; `/sign-in` → `/login`; `/checkout` → `/pricing`; glossary/VS slug 308s; social short links `/tt` `/ig` `/rd` `/li` → `/check?utm_*`.

Public marketing routes (English): `/`, `/pricing`, `/tools`, `/tools/[slug]`, `/data`, `/flip/*`, `/category/*`, `/blog/*`, `/manual/*`, `/methodology`, `/glossary/*`, `/best/*`, `/vs/*`, `/for/*`, `/support`, `/privacy`, `/terms`. Authenticated: `/verdict`, `/account`, `/dashboard`, `/deals`, `/watchlist`, `/portfolio`, `/billing/success`, admin.

---

## 5. Auth and session

- JWT stored in `localStorage` key `di_jwt` (`src/lib/utils.ts`). Extension uses `chrome.storage.local` `riq_token`.
- **No httpOnly cookie.** XSS can steal the token; paid data is still gated by the backend.
- `src/lib/api.ts` attaches `Authorization: Bearer` except on public auth paths (login/register/forgot/reset/verify-email).
- 401 (non-public) clears the token. 402 → `PaymentRequiredError`. 403 may redirect via `X-Verify-Url`.
- Zustand `checkAuth`: only a true 401 logs the user out. 429/5xx/network leave `isAuthenticated: true` so a blip does not dump a session (user object may be stale).
- `AppShell` redirects unauthenticated visitors to `/login` except `/verdict` (sandbox: seed card is the product). Unverified email → `/check-email`.
- Plan enum on the wire: `free` \| `operator` \| `power`. Display: Free / Starter / Pro. `src/lib/entitlement.ts` is the only place to name a signed-in plan.

**Stripe naming trap (do not "fix"):** `STRIPE_PRO_PRICE_ID` → Starter / `operator` / €19. `STRIPE_OPERATOR_PRICE_ID` → Pro / `power` / €49. Frontend placeholders `__OPERATOR__` / `__POWER__`. Dashboard/prices/webhooks are backend + Stripe Dashboard, not this repo.

---

## 6. Entitlement (frontend is UX, not security)

| State | Meaning |
|---|---|
| Logged out | HARD_PAYWALL: item-level buy-below only for `FREE_MODELS` (Adidas Samba, Nike Air Force 1, New Balance 530). Other queries → HTTP 402 `verdict: "PAYWALL"`. Weekly volumes on `/data` stay public. |
| `free` + trial pending | Email unconfirmed. Trial has not started (`trial_ends_at` null). |
| `free` + `trial_active` | Uncapped checks during 7 days; 5 live finds and 1 order plan for the whole trial; Price Compare is Pro. |
| `free` after trial | 10 checks/day, 10 full unlocks/month (monthly, not lifetime). |
| `operator` (Starter €19) | Unlimited checks + verdict signals. |
| `power` (Pro €49) | Adds Live Finder, Order Planner, Price Compare. |

`locked: true` means paid fields are **absent** from the payload. Never CSS-blur secrets into the DOM. Prefer `locked_fields[]` over the boolean — `locked` has been a constant `false` on live verdicts while fields were still withheld (`src/lib/locked-fields.ts`).

---

## 7. Data → UI warehouse

`src/lib/market-numbers.ts` is the only source for marketed counts (items tracked, sold_7d, brand weekly). It fetches `/api/public/market-snapshot` with a last-good disk cache (`src/lib/last-good-snapshot.ts`). Empty live query → last-good snapshot + UTC stamp. Scrape >2h old: warn, still show numbers.

`null` is not `0`. `Math.round(null) === 0` is a landmine. Withheld values render as an em-dash (`score-bar.tsx` pattern). Sell-through % is withheld while discovery rate > 20%; show raw `sold_7d` + `active_listings`. Do not label a ratio >100% as sell-through. `avg_days_to_sell` withheld unless n ≥ 30.

Sell-through strings go through `formatStrPct` / `formatStrPctString` (`src/lib/str-pct.ts`): sub-0.1% → `"<0.1%"`, never `"0%"`.

---

## 8. Important API consumers (frontend)

Central client: `src/lib/api.ts` (`getVerdict`, `getMe`, `getDeals`, `getWatchlist`, `createCheckout`, …).

Raw `fetch` (must send JWT when present):

- `src/components/tools/free-checker.tsx` — public checker
- `src/components/tools/register-check-vinted-item-tool.tsx` — WebMCP execute
- `src/lib/analytics.ts` — `POST /api/track`
- `src/lib/market-numbers.ts` / SSR — `GET /api/public/market-snapshot`
- `src/lib/hero-verdict.ts`, `teaser-verdict.ts` — server `BACKEND_URL/api/verdict`
- `extension/background.js` — `/api/verdict`, `/api/purchases`, `/api/ext/error`

Verdict union the UI handles: `BUY` \| `WATCH` \| `SKIP` \| `UNKNOWN` \| `INSUFFICIENT_DATA` \| `LIMIT_REACHED` \| `BRAND_CATEGORIES` \| `BRAND_AVERAGE` \| `PAYWALL`.

`n` on a price is `comparable_n` (IQR-fenced comps), **not** `sold_7d`.

---

## 9. Validation, types, styling, tests, deploy

- **Validation:** no Zod. HTML `required`, password length ≥ 8, checkout `price_id` guard in `createCheckout` (undefined was dropped by `JSON.stringify` → 422).
- **Types:** `src/types/index.ts` plus locals in `api.ts` / `entitlement.ts` / `pricing.ts` / `market-numbers.ts`.
- **Styling:** Tailwind v4 `@theme` tokens. Some dashboard pages still use older hex (`#141820`). No CSS modules.
- **Unit tests:** `npm run test:unit`. **E2E required:** `npm run test:e2e:required` against `e2e/mock-backend.mjs`.
- **CI gate:** `npx tsc --noEmit`, unit tests, `check:isolation` (+ built), `check:tracked`, `check:warehouse`, `check:dupes`, `check:locale-english`, `npm run build`.
- **Env:** `BACKEND_URL` (build + runtime), `SOURCE_COMMIT`, `GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_CHROME_STORE_URL`, snapshot cache paths. No Stripe secrets in the frontend.

---

## 10. Extension

Manifest V3, store listing `extension/STORE-LISTING.md`. Reads public title/brand/ask on `vinted.*` listing pages; asks `https://resaleiq.dev/api/verdict`. Must not cover the Vinted Buy button. Logged-out first views still show numbers on free models; 402 is a paywall, not an outage.
