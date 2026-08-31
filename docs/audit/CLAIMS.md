# CLAIMS.md — Phase 1 truth pass (product-manager, read-only)

Method: every claim below was traced to the rendering source in `resale-iq/`, then to
the code/query that produces its number (or marked UNKNOWN per OS §0 rule 2). Where the
producing logic lives in the backend (`~/Desktop/demand-intel/`, not this repo), that is
stated explicitly — it is corroborating evidence, not this repo's own source. Live
`resaleiq.dev` was fetched read-only (GET/POST with no body except documented no-op auth
probes) to confirm routes exist and to read current rendered numbers. No file was
written except this one.

Verdict key: **TRUE** (traced to a live source) · **STALE** (was true, now hardcoded/drifted)
· **UNPROVEN** (no source found) · **FALSE** (contradicted by code/data) · **CONTRADICTED**
(the site says two incompatible things).

---

## 1. The two headline scale contradictions from OS §1

| Claim (verbatim) | Where it appears | Source | Verdict | Severity |
|---|---|---|---|---|
| "X Vinted listings analysed across 5 EU markets" / "X unique listings across 5 EU markets" | `src/app/layout.tsx:31,94`, `src/app/page.tsx:77-78`, `src/app/tools/page.tsx:14`, `src/app/tools/[slug]/page.tsx:100`, `src/app/category/page.tsx:23`, `src/app/flip/page.tsx:26`, `src/app/blog/page.tsx:26,44`, ~156 templated `/flip/[brand]` and `/category/[category]` pages, `src/data/search-intents.ts`, `src/data/blog-posts*.ts` (all via the `TRACKED`/`listingsTrackedLabel()` sentinel) · live: resaleiq.dev shows "3,750,000+ … across 5 EU ma[rkets]" | `listingsTrackedLabel()` → `getListingsTracked()` in `src/lib/stats.ts:17-23` → `getMarketNumbers().listingsTracked`, live `GET /api/public/market-snapshot` (`listings_tracked`, `COUNT(DISTINCT external_id)` per that endpoint's own `listings_tracked_method` field). Confirmed live: `markets:["ES","FR","DE","IT","PT"]`, `listings_tracked:3751035` (checked 2026-08-31). | **TRUE** | — |
| "X,XXX,XXX unique items tracked" (exact, homepage trust bar) | `src/app/page.tsx:126` (`trackedExact ?? tracked`) · live: "3,751,035 unique items tracked" | Same `listingsTracked` figure, unrounded, via `listingsTrackedExact()` in `src/lib/stats.ts:80-83`. | **TRUE** | — |
| **Verdict on the OS-flagged contradiction**: this is not a numeric falsehood — both figures are the same live `COUNT(DISTINCT external_id)`, one floored+labelled, one exact. But **"analysed" overstates what the number means**: every one of the 3.75M rows was *counted*, not necessarily *analysed* (only items with enough comparable sold listings get a verdict/buy-below — see the HIGH/MEDIUM/LOW gates on `/methodology`). "Tracked" is the accurate word; "analysed" is doing marketing work the underlying query doesn't support. | homepage, layout meta description, tools pages, blog index, ~180 SEO pages | n/a | **STALE** (wording, not the number) | Low |
| "5 EU markets" (core dataset) | pervasive — see grep list below | `market-numbers.ts` header comment (explicit design doc), backend `market-snapshot.markets = [ES,FR,DE,IT,PT]`, extension `manifest.json` `content_scripts.matches` = only `vinted.{es,fr,de,it,pt}` | **TRUE** | — |
| "**26-market** Price Compare" (Pro €49) | `src/lib/pricing.ts:72`, `src/components/layout/paywall.tsx:129,133`, `src/app/(dashboard)/compare/page.tsx:42` | `ALL_MARKETS` object in `src/app/(dashboard)/compare/page.tsx:9-15` lists 26 Vinted country TLDs; backend route `GET /api/compare/prices` — confirmed live, returns `401 Authentication required` unauthenticated (route is real). | **TRUE, but a different product than "5 EU markets" implies** — see next row. | — |
| "Search Vinted listings across **26 European markets** in real time" (Live Search) | `src/app/(dashboard)/search/page.tsx:49` | `GET /api/search/vinted` — confirmed live, `401` unauthenticated (route real). | **TRUE** (route real) | — |

**CONTRADICTED, the way it actually matters:** "5 EU markets" and "26-market Price Compare" are not
the same claim about the same product, and the site never says so. The 5-market number is
Resale IQ's own **tracked, sold-listing dataset** — buy-below prices, verdicts, sell-through,
all computed from listings the pipeline has watched sell. The 26-market features
(Price Compare, Live Search) are **on-demand pass-through queries to Vinted's own live
search** on each country domain, returning **current asking prices**, with **no buy-below
price, no verdict, no sell-through, no confidence band** — none of the machinery the rest
of the site is built to sell. A Pro subscriber reading "26-market Price Compare" next to "Live
Deal Finder" and "Order Planner" on the same feature list has no way to know 21 of those 26
markets get raw asking-price search while 5 get full intelligence. This is the highest-damage
finding in this audit — see Top 10, #1.

---

## 2. "100 product signals" (Starter €19)

| Claim | Where | Source | Verdict | Severity |
|---|---|---|---|---|
| "All 100 product signals, unblurred" / "all 100 signals" | `src/lib/pricing.ts:84`, `src/app/layout.tsx:105`, `src/app/llms.txt/route.ts:109`, `src/app/support/page.tsx:26`, `src/app/(auth)/register/page.tsx:18`, `src/app/(dashboard)/account/page.tsx:154`, `src/components/ui/unlock-panel.tsx:119` | Searched for an enumeration or count constant: `VerdictResult` (`src/types/index.ts:186-224`) has **~25 fields total** (verdict, opportunity_score, sell_through_rate, sold_7d, n, active_listings, momentum, buy_below, sell_avg, sell_median, top_sizes[], size_velocity[], reasons[], data_quality, confidence, confidence_note, provisional, etc.). No `signal_count`, no list of 100 named signals, anywhere in this repo. Checked the backend for a matching definition (`~/Desktop/demand-intel/api/stripe_routes.py:99`) — it only repeats the same marketing string, does not enumerate or compute it. | **UNPROVEN** (verging on FALSE — the actual field count is nowhere close to 100 by any counting method found) | High (paid-tier number with no traceable basis) |

---

## 3. Refresh cadence — "scraped every 30 min" / "recomputed hourly"

| Claim | Where | Source checked | Verdict | Severity |
|---|---|---|---|---|
| "Scraped every 30 min" | `src/app/page.tsx:127` (homepage trust bar) | — | **FALSE** | **Critical** |
| "The scraper runs every 30 minutes across all five EU Vinted domains" | `src/app/methodology/page.tsx:48` (FAQ) | — | **FALSE** | **Critical** |
| "Listing collection … every 30 minutes … all 5 EU domains" | `src/app/methodology/page.tsx:146` (methodology table) | — | **FALSE** | **Critical** |
| "it scans all five EU markets every 30 minutes" / Live Deal Finder "scanned every 30 minutes" | `src/lib/pricing.ts:64,68` (Pro tier pitch) | — | **FALSE / UNPROVEN** (Live Deal Finder is an on-demand endpoint `GET /api/live-deals`, called per user search — found no scheduled job for it at all, so "scanned every 30 minutes" describes a cadence that doesn't exist for this feature) | High |
| "Signals are recomputed hourly" / "recomputed hourly" | `src/app/methodology/page.tsx:48` (FAQ), `extension/STORE-LISTING.md` (Chrome Web Store description, live-facing) | — | **FALSE** | **Critical** |
| "Signal recomputation … every 60 minutes" | `src/app/methodology/page.tsx:147` | — | **FALSE** | **Critical** |
| "Refresh: signals recomputed hourly" | `src/app/llms.txt/route.ts` (line ~53, the AI-facing doc) | — | **FALSE** | High |
| "Sold-item verification … every 60 minutes" | `src/app/methodology/page.tsx:148` | `TRACKER_INTERVAL_MINUTES = 60` in `~/Desktop/demand-intel/config.py:233` | **TRUE** (this one line in the table is actually right) | — |
| "Public page refresh … every 15 minutes" | `src/app/methodology/page.tsx:149` | `export const revalidate = 900` — confirmed in `src/app/methodology/page.tsx:20`, `src/app/data/page.tsx`, `src/app/llms.txt/route.ts:19` (900s = 15 min) | **TRUE** | — |

**Evidence for the FALSE verdicts above**, gathered per the task's explicit instruction to check the
launchd job, plus two directly-linked files that explain *why* the real cadence is what it is
(all outside this repo, in `~/Desktop/demand-intel/`, read-only):

1. `~/Library/LaunchAgents/dev.resaleiq.scrape-agent.plist` — `StartInterval` = **7200** (2 hours), confirmed.
2. `scripts/run_local_agent.sh` — comment: *"Keep the log from growing without bound — this runs every 2h forever."*
3. `scripts/install_local_agent.sh` (the file that installs the plist) — the actual reason, stated in its
   own header comment: **"Vinted 403-blocks the production server's datacenter IP on everything,
   including the plain homepage. A residential connection is not blocked, so the scrape runs here
   [this Mac] and ships results to the server."** `INTERVAL="${INTERVAL:-7200}"   # 2h. Vinted 429s
   well before this matters.`
4. `config.py:225-233` — a self-documented history of the *same* class of bug for signal
   recomputation: *"The analyzer takes about 90 minutes on the current corpus, so an hourly
   schedule meant APScheduler dropped every other run … It was therefore already running
   two-hourly — the schedule just claimed otherwise … Say what actually happens."*
   `ANALYZER_INTERVAL_MINUTES = 120` (i.e. the backend config was already honestly fixed to
   say 2 hours — the marketing copy on `/methodology`, the homepage, the extension listing and
   `llms.txt` were never updated to match).
5. `main.py:721-758` registers `job_vinted` on `IntervalTrigger(minutes=SCRAPE_PEAK_INTERVAL)`
   (`SCRAPE_PEAK_INTERVAL = 30` in `config.py:220`) on the **production Hetzner server** — but
   per finding #3, that server's requests are 403-blocked by Vinted, so this scheduled job is
   effectively dead for real scraping; the local Mac agent (2-hour cadence) is what actually
   populates the dataset.

**Net: the true cadence is ~2 hours for both scraping and signal recomputation, not 30/60
minutes.** This is the single most load-bearing dishonesty in the audit, because
`/methodology` explicitly promises *"every figure here must be traceable to code… If you
change [the refresh intervals], change this page in the same commit"* — and the code was
changed (the 120-minute fix, with a comment explaining exactly why) without the page being
updated. See Top 10, #2.

---

## 4. REST API + Order Planner (Pro €49) — "Hard no" in `resale-iq/CLAUDE.md`, graded hardest as instructed

`CLAUDE.md` "Hard no" list: *"REST API · Order Planner · auto-buy · fake hit rates · fake
users · authenticity marketing · rewriting the app · new frameworks."* Both exist and are
live, contradicting that governance doc (a build-note staleness issue, not a public-facing
false claim — flagged for the CEO, not scored against the customer).

| Check | Evidence | Verdict |
|---|---|---|
| Routes exist | `next.config.ts:117` rewrites `/api/:path*` → `${BACKEND_URL}/api/:path*`. Live probes (read-only GET/POST, no payload beyond documented params): `GET /api/model-signals` → `402` (paid plan required — endpoint runs real logic); `POST /auth/api-key` → `401 {"detail":"Authentication required. Use Authorization: Bearer <token> or X-Api-Key: <key>"}`; `GET /api/deals` → `401`; `GET /api/kpis` → `401` with the same real auth message; `GET /api/order-plan?weeks=3&top_n=12` → `401` same message. All five routes are live and behave like real, gated endpoints, not stubs or 404s. | **TRUE — the API and Order Planner exist and work.** |
| Documented | `src/app/api-docs/page.tsx` (148 lines): base URL, `X-Api-Key` header, curl example, HTTP status table (200/401/402/403/404/429), 15 endpoints listed with params, example JSON response, fair-use clause. | **TRUE, and thorough.** |
| Keyed | `src/app/(dashboard)/account/page.tsx:89-90,209-248` — real `issueApiKey()` → `POST /auth/api-key` UI, key display, regenerate flow, `X-Api-Key` curl snippet matching the docs. | **TRUE** |
| Rate-limited | `/api-docs:66-67` — "60 requests per minute per key... 429 on exceed." | **UNPROVEN** — could not test without hammering a production API with a real paid key, which is out of scope for a read-only audit. No 429 behaviour observed or refuted. |
| Order Planner works | `src/app/(dashboard)/order-planner/page.tsx` calls `GET /api/order-plan` with `Authorization: Bearer`; live probe confirms the route exists and enforces auth. | **TRUE** |

Recommendation for the CEO (not part of this audit's scope to fix): either update
`CLAUDE.md`'s "Hard no" list to reflect that these ship, or explicitly decide to deprecate
them — right now the governance doc and the live product disagree, which will mislead the
next agent that reads `CLAUDE.md` before touching pricing.

---

## 5. "No accuracy claims until 30 outcomes scored"

| Check | Evidence | Verdict |
|---|---|---|
| Sentence appears | `src/app/page.tsx:129`, `src/lib/i18n.ts:40` — static text only, no live component. | — |
| Mechanism exists | `~/Desktop/demand-intel/engine/prediction_eval.py`, `db/schema.py`, `main.py:157` ("Daily rather than hourly: predictions only become scorable 30 days after…"), `tests/test_prediction_eval.py`, `tests/test_prediction_eval_join.py` — a real prediction ledger and resolver exist in the backend. | **TRUE** that the machinery is real (corroborates the parallel data audit; not independently re-verified against the DB here per the task's scoping). |
| The specific "30" gate | Searched `prediction_eval.py` for a scored-outcome-count threshold: found `EVAL_WINDOW_DAYS = 30` (a **time window**, days-until-scorable — not a count of scored outcomes) and no `MIN_SCORED`/count-based gate anywhere in that file. | **UNPROVEN** — could not find code that specifically enforces "wait until 30 outcomes are scored before publishing accuracy." |
| Is the page honest about what backs it | No page on `resaleiq.dev` shows a live count of scored predictions, current MAPE, or "X/30 scored so far." The promise is currently trivially true only because **no accuracy number is published anywhere at all** — not because a coded threshold is actively gating one. | Sev: Low-Medium — nothing is dishonest today, but there is no visible proof of the gate, and no counter-KPI stopping someone from publishing an accuracy figure before 30 real outcomes exist. |

---

## 6. "1,521 watched sold items last 7 days"

| Claim | Where | Source | Verdict |
|---|---|---|---|
| "Watched sold counts across 5 EU markets — X items in the last 7 days" | `src/components/landing/live-market-proof.tsx:89` (homepage proof band) | `total = market.brandNames.reduce((s,name)=> s + (get(name)?.sold_7d ?? 0), 0)` — live sum over `getMarketNumbers()`, itself `GET /api/public/market-snapshot`, per-brand `sold_7d`. | **TRUE** — live query, not hardcoded. Also re-derived identically on `/methodology` (`weekly` variable, same reduce) and `/data`. |

---

## 7. Cross-domain-overlap and condition-price claims (manual, blog, llms.txt)

These drive real reseller strategy advice (steering users away from country arbitrage,
setting condition-grading expectations) and are cited to language models via `llms.txt`, so
a wrong number here propagates further than a typo on a landing page.

| Claim | Where | Source | Verdict | Severity |
|---|---|---|---|---|
| "60–90% of listings appear on more than one Vinted domain; 12–39% appear on all five; over 99% of multi-domain listings carry an identical price" | `src/data/manual-2.ts:194-196,228-229,235`, `src/data/blog-posts-2.ts:380,408`, `src/app/llms.txt/route.ts` (§"Two findings worth citing") | Static prose. No `n`, no date range, no `sql/metrics/<name>.sql`, no `pipeline_version` — the exact evidence OS §0 rule 2 requires before a number counts as known. Nothing in this repo computes it live; presumably a one-off backend analysis, not re-run or linked. | **UNPROVEN** (Constitution rule 2: a number without n/date/sql/pipeline_version is UNKNOWN) | Medium — informs real user strategy, repeated across 3 public/AI-facing surfaces |
| "Median sold price by condition ranges **3.3x to 7x**" (`llms.txt`) vs "**roughly three and a half [3.5x] to seven times**" (`manual.ts:461`, condition chapter) | `src/app/llms.txt/route.ts` §"Two findings worth citing" vs `src/data/manual.ts:461` (`condition-and-authenticity` chapter) | Same underlying claim, two different low-end multiples (3.3x vs 3.5x) in two public documents, neither traceable to a query. | **CONTRADICTED** + **UNPROVEN** | Low-Medium |
| Specific price points ("Nike: €70 NWT → €10 satisfactory," "Adidas: €55 → €8," etc.) | `src/data/manual.ts:461-462` | Static prose, no query cited. | **UNPROVEN** | Low |

---

## 8. UK coverage implication

Per `CLAUDE.md`: *"market-numbers.ts still serves ES/FR/DE/IT/PT only, so any page that
implies UK coverage is still wrong until the data actually exists."*

| Surface | Finding | Verdict |
|---|---|---|
| Core dataset (`market-numbers.ts`, extension `manifest.json` content-script matches, all "5 EU markets" copy) | No UK anywhere. `manifest.json` content_scripts only match `vinted.{es,fr,de,it,pt}`. | **TRUE — no coverage claim, correctly scoped.** |
| `src/app/(dashboard)/search/page.tsx:13`, `src/app/(dashboard)/compare/page.tsx:13` | `"co.uk": "United Kingdom"` is a selectable market for **Live Search** and **Price Compare** — both on-demand pass-through queries to Vinted's own live search (asking prices only, no buy-below/verdict — see §1). Selecting it does not imply the tracked/analytics dataset covers the UK, but the UI does not say so either — it sits in the same market-picker as ES/FR/DE/IT/PT with no visual distinction. | **Not a false claim, but a real UX/trust gap** — a user could reasonably infer "if I can pick it here, Resale IQ covers it." Sev: Low-Medium, recommend a one-line caveat in the picker ("asking prices only outside ES/FR/DE/IT/PT"). |
| `src/data/blog-posts.ts` UK mentions | All are about **Depop's** UK/US fee structure in a Vinted-vs-Depop comparison post — correctly scoped, does not imply Resale IQ tracks UK Vinted data. One post explicitly states: *"Resale IQ covers Vinted only, across five markets… It does not cover Depop, and it does not cover the UK or the US."* (`blog-posts.ts:245`) | **TRUE, and explicitly honest.** |

---

## 9. Free tier / trial limits (spot-checked against backend config, since this is exactly the kind of number a customer-success or refund dispute turns on)

| Claim | Where | Source | Verdict |
|---|---|---|---|
| "No account: 10 checks/day" | `src/lib/trial-copy.ts` (`TRIAL_LIMITS_SENTENCE`, used across landing, methodology, llms.txt, register) | `FREE_VERDICT_DAILY_LIMIT = 10` — `~/Desktop/demand-intel/config.py:26` | **TRUE** |
| "Sign up: 7 days of Starter, 5 live finds and 1 order plan, then 10 full checks/month" | same | `TRIAL_LIVE_FIND_LIMIT = 5`, `TRIAL_PLANNER_LIMIT = 1`, `FREE_UNLOCK_LIFETIME_BUDGET = 10` (renamed in a comment to clarify it now rolls over monthly, not a true lifetime cap) — `config.py:29-47` | **TRUE**, matches exactly, including the "reverse trial is Starter-unlimited, not full Pro" nuance. |
| Business €99 "talk to us," no self-serve checkout | `src/lib/pricing.ts:30-47` | `anchor: true`, no `priceId` set — confirmed by code, cannot be self-checked out. | **TRUE** |

---

## 10. Formulas (methodology, api-docs, CLAUDE.md) — the one area that is fully consistent

| Claim | Where | Verdict |
|---|---|---|
| `buy_below = avg_sale_price × 0.95 × 0.70` | `src/app/methodology/page.tsx:181`, matches `resale-iq/CLAUDE.md` one-line product description exactly | **TRUE, consistent everywhere checked.** |
| `str = sold_observed / (sold_observed + active_listings) × 100`, withheld below 30 watched sales or when active=0 | `src/app/methodology/page.tsx:158-177`, matches the withholding language on `/api-docs` (`str_pct` field description) | **TRUE, consistent.** |
| HIGH/MEDIUM/LOW confidence thresholds (≥30 comps & quality≥70 / ≥10 & quality≥40 / thinner) | `src/app/methodology/page.tsx:198-206` | **UNPROVEN from this repo alone** — the scoring itself runs in the backend; the page's description is internally consistent but not independently re-derived here (would require re-running the backend's confidence-band function, out of scope). |
| Authenticity 0–100 score, 4 bands, explicitly "not a guarantee, never sees the physical item" | `src/app/methodology/page.tsx:209-231`, `/terms` | **TRUE and appropriately hedged** — no overclaiming found. |

---

## 11. Numbers confirmed correct and traceable (for completeness — not everything is broken)

- **"26 brands"** (`/api-docs` description) — `src/data/seo-brands.json` has exactly 26 brand
  entries. **TRUE.**
- **Free tier "10 checks/day anon"**, **7-day Starter trial** — see §9, **TRUE.**
- **"Public pages revalidate every 15 minutes"** — `revalidate = 900` across the relevant pages.
  **TRUE.**
- Legal/terms/privacy/legal-notice pages make **no** unverifiable numeric or superlative
  claims (no "#1," no "guaranteed accuracy," no "best in class" found anywhere on the site) —
  copy discipline here is good and should be the model for the rest.
- Extension `STORE-LISTING.md` correctly scopes coverage to "Spain, France, Germany, Italy or
  Portugal" and repeats the "no accuracy claims we cannot back" line — **except** for the
  "recomputed hourly" freshness claim (§3, FALSE).

---

## TOP 10 BY DAMAGE

Ordered by risk of refund, chargeback, store takedown, or consumer-protection complaint.
Each has the one-line fix.

1. **"26-market Price Compare" / "26 European markets" sold as part of the Pro €49 upsell,
   with no disclosure that 21 of those markets return raw live asking prices with no
   buy-below price, verdict, or sell-through — the exact analytics Pro is sold on.**
   (`src/lib/pricing.ts:72`, `paywall.tsx:129,133`, `compare/page.tsx`, `search/page.tsx`)
   *Fix: add one line to the Price Compare / Live Search UI and to the pricing feature list —
   "Asking prices only outside ES/FR/DE/IT/PT — no buy-below or verdict."*

2. **"Scraped every 30 min" and "recomputed hourly," stated as fact on the homepage, the
   trust-building `/methodology` page, the Chrome Web Store listing, and `llms.txt` — actual
   cadence is ~2 hours, confirmed by three independent files including the backend's own
   comment explaining that the production server is IP-blocked by Vinted and a residential
   Mac agent does the real scraping every 2 hours "on purpose."**
   (`src/app/page.tsx:127`, `src/app/methodology/page.tsx:48,146-147`, `extension/STORE-LISTING.md`)
   *Fix: change "every 30 minutes"/"hourly" to "every ~2 hours" everywhere listed in §3 —
   one commit, since `/methodology` explicitly promises to do exactly this when the code changes.*

3. **"All 100 product signals" sold as the headline Starter €19 feature, with no enumeration
   anywhere in the codebase and an actual field count (~25) nowhere close to 100.**
   (`src/lib/pricing.ts:84`, register page, account page, unlock panel)
   *Fix: either enumerate 100 real signals (unlikely to be possible) or replace with an
   honest, smaller, real number — "unlocks every field," or the true count.*

4. **Live Deal Finder marketed as "scanned every 30 minutes" (Pro €49) when it is in fact an
   on-demand endpoint with no scheduled scan found anywhere in the backend.**
   (`src/lib/pricing.ts:64,68`)
   *Fix: change to "on demand, live" or wire an actual scheduled scan and cite its interval.*

5. **Cross-domain arbitrage statistics (60–90%, 12–39%, >99% identical price) used to give
   reselling strategy advice in the free manual and cited to language models via `llms.txt`,
   with no `n`, date, or query anywhere — a direct violation of OS §0 rule 2.**
   (`src/data/manual-2.ts`, `blog-posts-2.ts`, `llms.txt`)
   *Fix: attach the real query/notebook and date, or mark the manual chapter provisional
   until it exists.*

6. **REST API rate limit ("60 requests per minute per key") published on `/api-docs` for a
   paying Pro tier, with no empirical confirmation it is actually enforced.**
   (`src/app/api-docs/page.tsx:67`)
   *Fix: a `qa-eng`/`security-eng` load test against staging, not production, to confirm 429
   actually fires at the documented threshold.*

7. **Condition-price multiplier stated as "3.3x to 7x" in `llms.txt` and "3.5x to 7x" in the
   manual — the same underlying finding contradicting itself across two public documents.**
   (`src/app/llms.txt/route.ts` vs `src/data/manual.ts:461`)
   *Fix: pick one number, correct the other, in the same commit.*

8. **Profit calculator claims to price "Vinted, Depop, eBay, Poshmark, StockX and GOAT"
   (`/methodology`, a public, unauthenticated page) but the actual platform list is
   backend-gated behind a paid plan and could not be verified in this audit.**
   (`src/app/methodology/page.tsx:188`)
   *Fix: `qa-eng` verifies with a real paid test account that all six platforms return a
   populated fee row, or the claim is trimmed to the platforms actually supported.*

9. **"No accuracy claims until 30 outcomes scored" has no visible progress counter and no
   code found enforcing a 30-scored-outcome threshold specifically (only a 30-day scoring
   window, a different constant) — the promise is currently kept only by omission.**
   (`src/app/page.tsx:129`)
   *Fix: publish the live scored-outcome count next to the sentence, or a literal countdown,
   so the promise is checkable rather than trusted.*

10. **UK selectable as a market in Live Search / Price Compare with no visual distinction
    from the five markets that carry full analytics — a real, if minor, coverage-implication
    risk flagged by `CLAUDE.md` itself.**
    (`src/app/(dashboard)/search/page.tsx:13`, `compare/page.tsx:13`)
    *Fix: group the picker into "Full intelligence: ES/FR/DE/IT/PT" and "Live search only: 21
    more markets," or grey out/label the extra markets.*
