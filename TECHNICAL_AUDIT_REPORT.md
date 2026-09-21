# TECHNICAL_AUDIT_REPORT — Resale IQ frontend

**Date:** 2026-09-21  
**Repo:** `resale-iq-frontend` @ branch `cursor/frontend-audit-repair-b071`  
**Base:** `main` `4f15eea`  
**Backend:** not modified (sibling agent). Backend sources were **not** present in this environment.  
**Scope:** DATA→API→STATE→UI and USER→API on the Next.js frontend + Chrome extension.

---

## Executive summary

The frontend is a Next.js 16 App Router app that proxies `/api`, `/auth`, `/stripe`, `/admin` to FastAPI. The product number (`buy_below`) is computed on the backend; the frontend must render what arrived, never invent, and never treat `null` as `0`.

This audit inspected the tree, confirmed several real bugs on `main`, and shipped targeted fixes. Two recent conversion PRs (**#125, #126, #127, #128, #129**) are **merged**. **PR #130** (hide subscribe CTAs for paid users on FreeChecker) was still **OPEN** and unmerged — the founder-reported Pro “subscribe to plan” bug was still on `main`. Equivalent CTA gating is included here so `main` does not wait on #130. Reviewers should close or supersede #130 after this lands (overlap is intentional, not a second product).

**Verified locally (this session):** `npx tsc --noEmit` PASS; `npm run test:unit` **269/269** PASS (Node 24); `npm run build` **701 pages** PASS; `check:isolation` + `check:isolation:built` PASS; `check:dupes`, `check:locale-english`, `check:extension`, `check:warehouse`, `check:tracked` PASS.

**Playwright / live production curls:** see Verification and UNVERIFIED.

---

## Findings (by severity)

### P0

1. **Public FreeChecker called `/api/verdict` without the session JWT.** A signed-in Starter/Pro user on `/tools` was treated as anonymous (402 PAYWALL, anon quota, withheld fields). Confirmed in source: bare `fetch` vs `api.ts` `getToken()`.
2. **WebMCP `executeCheck` also omitted the JWT.** Same contract miss for agent-driven checks.
3. **Paid users were always shown GuestCheckout / “with a plan” after a real check** (founder, 2026-09-21). `UnlockPanel` on `/verdict` was already auth-aware; the public bar was not. PR #130 diagnosed this and was still open.
4. **Chrome extension treated HTTP 402 as an outage** (`down: true` → “Couldn't reach Resale IQ”) instead of a paywall.

### P1

5. **Brand rankings labelled `sold_7d` as sample size `n` next to average price.** `n` is `comparable_n`, not departures (`src/types/index.ts`).
6. **Trial/support copy named two free models; the allowlist is three** (Samba, AF1, **New Balance 530**).

### P2

7. **Watchlist gated on `locked` boolean only.** `locked` has been a constant `false` while fields are withheld (`locked-fields.ts`). Deals/dashboard already use `locked_fields`.
8. **Authenticated `/verdict` printed raw `sell_through_rate` strings**, bypassing `formatStrPct` (Samba-class `"0%"` landmine if the API ever rounds).
9. **Extension panel used `d.n ?? d.sold_7d` for comparable n.**
10. **Trends ranked missing `opportunity_score` as 0.**
11. **`BRAND_CATEGORIES` aggregates called `.toLocaleString()` on `sold_7d` without a null guard.**
12. **Live market pulse used `sold_7d ?? 0` after already filtering finite counts** (display path still coerced).
13. **`VerdictResult.verdict` omitted `PAYWALL`** while runtime uses it.
14. **Tools lede said “5% buyer-side fee”; methodology models a 5% seller deduction (`× 0.95`).**
15. **Portfolio stats used truthy checks**, so invested/profit `0` rendered as em-dash.

### P3 / policy (not rewritten)

16. Reverse calculator is `sell × 0.95 − target profit`, **not** product buy-below (`avg × 0.95 × 0.70`). Label clarified; formula left (different tool).
17. Category share column `Math.round` could print `"0%"` for a positive small share → now `"<1%"`.
18. Order Planner remains in nav/pricing despite the “hard no” list — product still sells it on Pro. **Not removed.**
19. JWT in `localStorage` (XSS can steal). Backend still gates data. **No cookie migration in this pass.**
20. `npm run lint` reports many **pre-existing** `react-hooks/set-state-in-effect` / `no-html-link-for-pages` errors. Isolation CI does not run eslint. Not mass-fixed.

### Already healthy (verified in source, not re-broken)

- Stripe placeholder mapping `__OPERATOR__` → operator/Starter, `__POWER__` → power/Pro.
- `formatStrPct` + score-bar em-dash pattern on deals/dashboard.
- HARD_PAYWALL parser drops teaser fields on 402.
- Free chips = `FREE_MODELS` (Samba / AF1 / NB 530).
- Homepage conversion PRs #125/#126 merged; checkout branding #128 merged; SEO batches #127/#129 merged.

---

## Bugs fixed

### 1. Paid FreeChecker subscribe CTA + missing JWT (P0)

- **Problem:** Pro/Starter still saw “unlock with a plan” / GuestCheckout after a `/tools` check. Logged-in checks were anonymous.
- **Root cause:** No session branch on the post-check bar; raw `fetch` without `Authorization`.
- **Fix:** `isPaidPlan` / `checkerUnlockBranch` / `pricingCtaKind`. Paid bar → Verdict + Manage subscription. JWT on FreeChecker fetch. Pricing cards: Current plan / Manage subscription for paid sessions. Same pattern as UnlockPanel.
- **Files:** `src/lib/entitlement.ts`, `src/lib/checker-unlock-state.ts`, `src/lib/pricing-cta-state.ts`, `src/components/tools/free-checker.tsx`, `src/components/landing/pricing-section.tsx`, `src/components/layout/app-shell.tsx`, `src/lib/i18n.ts`, `e2e/mock-backend.mjs`, `e2e/paid-checker-cta.spec.ts` (+ tests).
- **Verification:** unit tests for branch + pricing CTA + JWT header presence in source; tsc.

### 2. WebMCP verdict fetch without JWT (P0)

- **Problem:** Agent `check_vinted_item` executed as anonymous.
- **Root cause:** `register-check-vinted-item-tool.tsx` raw `fetch`.
- **Fix:** `getToken()` Bearer header when present.
- **Files:** `src/components/tools/register-check-vinted-item-tool.tsx`, `src/lib/webmcp-tools.test.ts`
- **Verification:** unit test asserts `Authorization: Bearer`.

### 3. Extension 402 as outage (P0)

- **Problem:** Paywalled model looked like Resale IQ was down.
- **Root cause:** `!r.ok` → `down: true`; no 402 branch.
- **Fix:** 402 / `verdict === "PAYWALL"` → `paywall: true`; panel copy + `/pricing` link in six locales.
- **Files:** `extension/background.js`, `extension/content.js`, `scripts/check-extension.mjs`
- **Verification:** `check:extension`; unit source contract.

### 4. Brand table `n` = `sold_7d` (P1)

- **Problem:** Average-price cell showed `· n {sold_7d}`.
- **Root cause:** Departure count stuffed into the comparable-sample slot.
- **Fix:** Removed the `n` suffix. Brand rows have no `comparable_n`.
- **Files:** `src/app/(dashboard)/brands/page.tsx`
- **Verification:** unit source contract; unused `Link` import removed.

### 5. Free-model copy missing NB 530 (P1)

- **Problem:** `FREE_MODELS` has three SKUs; trial/support sentences named two.
- **Fix:** All six locales of `trial-copy` and `support-copy` name Samba, AF1, and New Balance 530.
- **Files:** `src/lib/trial-copy.ts`, `src/lib/support-copy.ts`
- **Verification:** `check:locale-english`; `audit-honesty.test.ts`.

### 6. Watchlist `locked` boolean (P2)

- **Fix:** `setLocked(d.locked || isFieldLocked(d.locked_fields, "max_buy_price"))` — same rule as deals.
- **Files:** `src/app/(dashboard)/watchlist/page.tsx`

### 7. Dashboard STR formatter (P2)

- **Fix:** `formatStrPctString` in `str-pct.ts`; `/verdict` and FreeChecker both use it. `"0%"` / `"0.0%"` → `"<0.1%"`.
- **Files:** `src/lib/str-pct.ts`, `src/app/(dashboard)/verdict/verdict-content.tsx`, `src/components/tools/free-checker.tsx`

### 8. Other honesty / nullability (P2–P3)

| Fix | Files |
|---|---|
| Extension `n` is `d.n` only | `extension/content.js` |
| Trends drop null scores instead of ranking as 0 | `src/app/(dashboard)/trends/page.tsx` |
| Guard `sold_7d` on brand-category aggregates | `verdict-content.tsx` |
| Pulse never displays `sold_7d ?? 0` | `live-market-pulse.tsx` |
| `PAYWALL` on `VerdictResult` | `src/types/index.ts` |
| Seller fee wording on tools lede | `src/data/search-intents.ts` |
| Portfolio `0` is `€0`, not `—` | `portfolio/page.tsx` |
| Category share `<1%` instead of `0%` | `category/[category]/page.tsx` |
| Reverse calc labelled as not buy-below | `calculator/page.tsx` |
| Stale FreeChecker comment (HARD_PAYWALL) | `free-checker.tsx` |

---

## Remaining (not fixed)

- **Order Planner** still in sidebar + Pro feature list despite CLAUDE.md “hard no”. Removing it is a product decision.
- **Dashboard reverse calculator formula** still is not `× 0.70`. Label only.
- **Category / flip hubs** still sum `sold_7d ?? 0` into totals (aggregation skip-null, not a displayed zero). Left as-is.
- **`checkAuth` stale user on 5xx** — intentional resilience; can show shell with null user during outages.
- **Tailwind dual config** (`@theme` vs `tailwind.config.ts` hex) — visual drift, not a functional bug.
- **eslint-config-next 16.2.9 vs next 16.3** — version skew.
- **Overlapping PR #130** — close after merge of this branch or rebase #130 away.
- **Open PRs #124, #122** — not audited as landings on `main`.

---

## UNVERIFIED

- **Live production** (`https://resaleiq.dev`) after this PR — Coolify deploy is post-merge. Cache-busted curl of `/`, `/pricing`, `/tools` against prod **was not** the gate for these code fixes.
- **Backend JSON vs TypeScript types field-by-field.** Sibling `demand-intel` checkout was not in this VM. Types were checked against in-repo comments (`locked-fields.ts`, `hard-paywall.ts`, `MONETIZATION.md`) and frontend call sites.
- **Playwright `test:e2e:required`** — run after the first push if not recorded below. Spec `e2e/paid-checker-cta.spec.ts` is the behavioural proof for the Pro CTA; it needs the mock backend (`alice@example.com` / `pro@example.com`).
- **Extension on a real Vinted listing** — 402 copy is source-verified only.
- **Paid Stripe checkout in a real browser** — Stripe dashboard/webhooks untouched; no live card.
- **`npm run lint` as a gate** — fails on pre-existing rules; Isolation does not run it. Not claimed green.

---

## Verification log (this session)

| Command | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run test:unit` (Node 24, `src/lib/*.test.ts`) | **269 pass / 0 fail** |
| `npm run build` | PASS, 701 pages |
| `npm run check:isolation` | PASS |
| `npm run check:isolation:built` | PASS (447 source + 3071 artefacts) |
| `npm run check:dupes` | PASS |
| `npm run check:locale-english` | PASS (24 modules) |
| `npm run check:extension` | PASS |
| `npm run check:warehouse` | PASS |
| `npm run check:tracked` | PASS |
| `npm run lint` | FAIL — pre-existing hooks/link rules; not in Isolation |
| Playwright required suite | see follow-up on the PR if this file is updated after e2e |
| Production curl | **not run** (UNVERIFIED) |

New unit files: `src/lib/audit-honesty.test.ts`, `src/lib/checker-unlock-state.test.ts`, `src/lib/pricing-cta-state.test.ts`. Extra cases in `str-pct.test.ts`, `entitlement.test.ts`, `webmcp-tools.test.ts`.

---

## Next steps

1. Merge this PR (do not merge #130 on top without a rebase — duplicate CTA logic).
2. After Coolify: cache-busted curl of `/tools` (anon GuestCheckout on AF1) and a Pro session (no Starter €19 bar).
3. Backend agent: confirm `/api/verdict` 402 body still matches `parsePaywallBody`; confirm watchlist `locked_fields` includes `max_buy_price`.
4. Founder: decide Order Planner kill vs keep (nav currently sells it).
5. Optional: add `e2e/paid-checker-cta.spec.ts` to `test:e2e:required` so Isolation-adjacent Playwright always covers the Pro CTA.

---

## Architecture

See `TECHNICAL_ARCHITECTURE.md` (same PR) for stack, routes, auth, API consumers, warehouse, entitlement, deploy.
