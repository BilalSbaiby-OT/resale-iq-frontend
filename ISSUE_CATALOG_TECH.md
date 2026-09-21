# ISSUE_CATALOG — technical notes

Companion to `ISSUE_CATALOG.md`. Not a second findings list.

## What this pass is

A **product issue catalog** on `resale-iq-frontend` after PR **#131** landed on `main` and Coolify served it. Live `/deploy-id` matched `0c534be`.

It is **not**:

- A rewrite plan
- A request to unpause sell-through %
- A request to put “4 in 10 lookups fail” on the homepage (OBJECTIVE.md forbids that conversion tax; `heroHonesty` staying unused is correct)
- Permission to invent Miu Miu weekly volume
- A Stripe Dashboard / webhook change
- A SQLite schema change from this repo

Prior technical audit (honesty, JWT, paid CTAs) is `TECHNICAL_AUDIT_REPORT.md` + `TECHNICAL_ARCHITECTURE.md` from #131. Do not duplicate those fixes.

## How it was verified

| Check | How |
|--------|-----|
| Deploy pin | `curl https://resaleiq.dev/deploy-id` → `0c534be` |
| Warehouse | `GET /api/public/market-snapshot` — `brands_tracked` 28, `brands_published` 3 (Stone Island, New Balance, Reebok), `updated_at` 2026-09-21 12:54:00 |
| Anon verdict | `GET /api/verdict?q=` Samba/AF1/530 → WATCH+buy_below; Miu Miu / Gucci / Dunk / 501 / Balenciaga / North Face / garbage → PAYWALL |
| `/data` | HTML: 3 brands, “36 watched departures across 3 brands”; Nike/Gucci absent |
| `/` | H1 “Know what sells. Decide whether to buy.”; `+19 more` → `/data`; Samba/AF1/530 chips |
| `/de/tools` | DE title + EN `TOOLS_HUB_BODY` |
| `/de/pricing` | FAQ “Gibt es eine kostenlose Artikelprüfung? **Nein.**” |
| `/fr` `/es` `/it` `/pt` pricing | Same “No free checker” lie |
| `/de/tools/vinted-price-checker` | 307 → `/tools/vinted-price-checker` + `NEXT_LOCALE=de` |
| `www.resaleiq.dev` | 308 → apex |
| Code | `src/` + `extension/` at `0c534be`; unit/e2e **not re-run** (audit-only tree) |

## Sibling backend

`demand-intel` was **not** in this VM. Live API is the evidence for IQ-001 / IQ-002 / Samba `sold_7d: null` + `confidence_note` “Priced from 2408 active comparables, not watched sales”.

Frontend must not fabricate the missing 25 published brands. If `publish_floor_sold_7d: 5` is failing because the scrape is thin, that is a **data** incident, not a `/data` empty-state bug.

## HARD_PAYWALL interaction (IQ-002)

Anonymous `/api/verdict` 402s anything outside `FREE_MODELS`. The FE paywall card is doing what the API says. The product bug is **ordering**: coverage/unknown should be visible without a subscription so users do not pay to discover Miu Miu is untracked.

Paid `/verdict` paths were not session-tested against production (no customer JWT in this environment). UnlockPanel entitled branch is source-verified only.

## #131 overlap

Still open after #131:

- Cold `/verdict` pricing nudge (IQ-060) — not in `e2e/paid-checker-cta.spec.ts`
- Locale FAQ / tools hub / switcher
- Live Deal Finder button gating
- KPI `loading={!kpis}`

Do not re-merge #130 on top of #131 (paid CTA duplicate).

## UNVERIFIED (do not treat as closed or as bugs)

- Authenticated Pro session on live `/verdict` and `/deals` (needs a real `power` JWT)
- Live `/api/live-deals` empty vs 402 vs listings (needs Pro)
- Extension overlay on a real `vinted.de` listing (source + DESIGN-REVIEW only)
- Stripe Checkout in a real browser
- Playwright `test:e2e:required` (not run this pass)
- Whether `brands_published: 3` is a transient scrape hole or the new steady state — re-curl `/api/public/market-snapshot` before scheduling a “catalog expansion” sprint
- Native-speaker review of DE/FR beyond the documented lies and mix of du/Sie

## Browser / mobile

No GUI browser was driven. Mobile findings are CSS + live HTML (tools H1 px, `/data` `minWidth: 620`, dashboard `riq-scroll-x`). Closest substitute: cache-busted curl of `/`, `/de`, `/de/tools`, `/data`, `/pricing`.

## Charter traps (do not “fix” in the catalog sprint)

- Stripe price ID names stay inverted (`STRIPE_PRO_PRICE_ID` = Starter/operator).
- `null` is not `0`. Em-dash on missing warehouse cells is correct on `/flip/nike`.
- Do not label weekly turns as sell-through.
- Do not claim UK coverage in marketing until `market-numbers` has UK rows. Compare/search *asking-price* across 26 TLDs is an existing Pro tool with an on-page disclaimer — not the same as verdict coverage.
- Do not enable auto-buy, fake hit rates, authenticity scores on marketing.

## Trivial FE fixes (safe, if a follow-up PR)

All S, none done here (catalog-only branch):

1. Gate `riq-cold-pricing-cta` with `isPaidPlan(user)`
2. Login → `FIRST_CHECK_HREF`
3. Extend `LOCALE_ROUTED_ROOTS`
4. Fix DE/FR/ES/IT/PT pricing FAQ to match EN (three free SKUs)
5. Hide/relabel Find live deals unless `plan === "power"`
6. KPI catch → error state, not `loading`
7. Interpolate `market.brandCount` / `brandsTracked` instead of 26/28
8. Modal close `aria-label`

IQ-001 and IQ-002 are not trivial.
