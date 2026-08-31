# Truth pass — claim changes, W36

Branch: `claude/frontend-eng/truth-pass-and-cut-business`. Every row below: the claim from
`CLAIMS.md`, the file it lived in, the exact old string, and the exact new string. Verified with
`npx tsc --noEmit`, `npm run build`, `npm run check:tracked`, `check:warehouse`,
`check:market-proof`, `check:isolation` — all green on this branch.

**Mid-task correction applied:** a CEO message arrived while this pass was in progress, citing
`docs/audit/DATA.md` (the data-eng audit, landed after `CLAIMS.md`) to correct two items:
"scraped every 30 min" is TRUE (measured: 353 real production scrape gaps, 83.6% land in
20–39 min, 96.9% under an hour — `DATA.md` §4.3–4.4), and "26-market Price Compare" is TRUE but
mislabelled (5 = stored corpus with buy-below/verdicts, 26 = live on-demand asking-price search
— `DATA.md` §9, `config.py` `VINTED_DOMAINS` vs `ALL_VINTED_MARKETS`). Both corrections were
independently verified against `DATA.md` before being applied (grep hits below). The homepage
and methodology cadence claims were reverted from an initial (wrong) edit to "every 2 hours" back
to "every 30 minutes" for listing collection, with signal recomputation correctly left at
"~every 2 hours" since `DATA.md` never re-examined that separate claim and `CLAIMS.md`'s finding
(`ANALYZER_INTERVAL_MINUTES = 120` in `config.py`) stands unchallenged.

## 1. Refresh cadence

| # | Claim | File | Old | New |
|---|---|---|---|---|
| 1a | Homepage trust bar | `src/app/page.tsx:127` | `Scraped every 30 min` | unchanged — confirmed TRUE, not edited (initially changed to "every ~2 hours" in error, reverted) |
| 1b | Methodology FAQ | `src/app/methodology/page.tsx:48` | `"The scraper runs every 30 minutes across all five EU Vinted domains. Signals are recomputed hourly, and public pages revalidate every 15 minutes. So a figure you read is at most about an hour behind the market, and usually less."` | `"The scraper runs about every 30 minutes across all five EU Vinted domains — measured on production, 97% of gaps land under an hour. Signals are recomputed on a slower cycle, roughly every 2 hours. Sold-item verification runs every 60 minutes, and public pages revalidate every 15 minutes. So a new listing is usually found within 30 minutes; the score built from it can lag up to about 2 hours behind that."` |
| 1c | Methodology freshness table | `src/app/methodology/page.tsx:146-149` | `["Listing collection","every 30 minutes",...]`, `["Signal recomputation","every 60 minutes",...]` | `["Listing collection","about every 30 minutes","...measured on production, 97% of gaps under an hour"]`, `["Signal recomputation","~every 2 hours","...a slower cycle than collection"]` |
| 1d | Chrome Web Store listing | `extension/STORE-LISTING.md:50` | `"...recomputed hourly."` | `"...collected about every 30 minutes and recomputed roughly every 2 hours."` |
| 1e | Extension submit checklist (internal, mirrors store copy) | `extension/SUBMIT-CHECKLIST.md:45` | same as 1d | same as 1d |
| 1f | `llms.txt` (AI-facing) | `src/app/llms.txt/route.ts:54` | `"Refresh: signals recomputed hourly; public pages revalidate every 15 minutes."` | `"Refresh: listings collected about every 30 minutes; signals recomputed roughly every 2 hours; public pages revalidate every 15 minutes."` |
| 1g | Support FAQ | `src/app/support/page.tsx:36` | `"...${tracked} items, recomputed hourly..."` | `"...${tracked} items, collected about every 30 minutes and recomputed roughly every 2 hours..."` |
| 1h | Flip brand SEO template (~156 pages) | `src/app/flip/[brand]/page.tsx:282` | `"...recompute every signal hourly."` | `"...recompute every signal roughly every 2 hours."` |
| 1i | Trends dashboard subtitle | `src/app/(dashboard)/trends/page.tsx:22` | `"...updated hourly"` | `"...recomputed roughly every 2 hours"` |
| 1j | Market dashboard empty state | `src/app/(dashboard)/market/page.tsx:85` | `"...the analyzer refreshes hourly."` | `"...the analyzer refreshes roughly every 2 hours."` |

Pro €49's own "scans all five EU markets every 30 minutes" and "Live Deal Finder ... scanned
every 30 minutes" are Item 4 below (a different, still-FALSE claim: Live Deal Finder is on-demand
with no scheduled scan at all, per `CLAIMS.md` §3).

## 2. "26-market Price Compare" (Pro €49) — label fixed, number kept

Per DATA.md §9: 5 = `VINTED_DOMAINS`, the stored corpus with buy-below/verdicts. 26 =
`ALL_VINTED_MARKETS`, on-demand live asking-price search via `search_market(tld, ...)`. Not a
contradiction, a labelling gap — fixed by disclosing the split everywhere the number appears.
**Also flagged, not fixed (backend, another lane):** DATA.md §5.1/§9 — `CURRENCY_RATES.get(currency, 1.0)`
in `demand-intel/scrapers/vinted.py:417-423` silently treats HUF/RON/BGN/SEK/DKK/HRK as EUR. 21 of
the 26 Price Compare markets carry this bug (e.g. a 15,000 HUF listing, ~€38, publishes as
€15,000). No frontend copy below claims those markets are numerically reliable — the copy only
scopes what's covered, not that it's correct — but the bug itself needs a backend fix or a
frontend guard before those markets should be trusted.

| # | Claim | File | Old | New |
|---|---|---|---|---|
| 2a | Pro tier feature list | `src/lib/pricing.ts:72` | `"26-market Price Compare"` | `"Price Compare — full buy-below intelligence on ES/FR/DE/IT/PT, plus live asking-price search across 26 markets total"` |
| 2b | Pro tier "why the jump" copy | `src/lib/pricing.ts:64` | `"...it scans all five EU markets every 30 minutes and shows you listings..."` | `"...on demand, it searches the five EU markets we track and shows you listings..."` (cadence fix, same item as §1) |
| 2c | Paywall headline (pro) | `src/components/layout/paywall.tsx:129` | `"Source at volume. Arbitrage 26 markets."` | `"Source at volume. Track five markets, search 26."` |
| 2d | Paywall body (pro) | `src/components/layout/paywall.tsx:133` | `"The Order Planner, 26-market Price Compare and live deals are on Pro. Upgrade to unlock the scale toolkit — cancel anytime."` | `"The Order Planner, Price Compare and live deals are on Pro — full buy-below intelligence on ES/FR/DE/IT/PT, live asking-price search across 26 markets. Upgrade to unlock the scale toolkit — cancel anytime."` |
| 2e | Price Compare page copy | `src/app/(dashboard)/compare/page.tsx` | no disclosure | added banner: `"Full buy-below intelligence... only exists for Spain, France, Germany, Italy and Portugal... The other 21 markets below are live Vinted asking-price search only: current prices, no buy-below price and no verdict."` |
| 2f | Price Compare paywall error | `src/app/(dashboard)/compare/page.tsx` | `"Price Compare is a Pro feature. Upgrade to unlock 26-market compare."` | `"Price Compare is a Pro feature. Upgrade to compare live asking prices across 26 markets."` |
| 2g | Live Search subtitle | `src/app/(dashboard)/search/page.tsx:49` | `"Search Vinted listings across 26 European markets in real time"` | `"...in real time — live asking prices only outside ES/FR/DE/IT/PT, no buy-below or verdict"` |
| 2h | `llms.txt` pricing line | `src/app/llms.txt/route.ts:110` | `"...Price Compare and REST API access."` | `"...Price Compare (full intelligence on ES/FR/DE/IT/PT; live asking-price search on 26 markets total) and REST API access."` |
| 2i | Support FAQ | `src/app/support/page.tsx:26` | `"...Price Compare, per-size velocity..."` | `"...Price Compare (full intelligence on those 5, live asking-price search on 26 markets total), per-size velocity..."` |

## 3. "All 100 product signals" (Starter €19) — actual field count ~25, nowhere enumerated

No enumeration exists anywhere in the codebase (`VerdictResult` in `src/types/index.ts` has ~26
fields total, most of them not "signals" — `locked`, `message`, `upgrade_url`, etc.). Replaced the
invented "100" with a true, non-numeric claim everywhere it appeared.

| File | Old | New |
|---|---|---|
| `src/lib/pricing.ts:84` | `"All 100 product signals, unblurred"` | `"Every product signal we compute, unblurred"` |
| `src/app/layout.tsx:105` (JSON-LD Offer) | `"Unlimited verdicts and all 100 product signals unblurred."` | `"Unlimited verdicts and every product signal unblurred."` |
| `src/app/llms.txt/route.ts:109` | `"...all 100 product signals unblurred."` | `"...every product signal unblurred."` |
| `src/app/support/page.tsx:26` | `"...all 100 product signals..."` | `"...every product signal..."` |
| `src/app/(auth)/register/page.tsx:18` | `"...all 100 signals..."` | `"...every signal..."` |
| `src/app/(dashboard)/account/page.tsx:154` | `"...all 100 signals"` | `"...every signal"` |
| `src/components/ui/unlock-panel.tsx:119` | `"...every one of the 100 product signals unblurred..."` | `"...every product signal unblurred..."` |

## 4. Live Deal Finder "scanned every 30 minutes" — actually on-demand, no scheduled scan

| File | Old | New |
|---|---|---|
| `src/lib/pricing.ts:68` | `"Live Deal Finder — current Vinted listings under your buy-below, scanned every 30 minutes"` | `"Live Deal Finder — current Vinted listings under your buy-below, on demand when you search"` |
| `src/lib/pricing.ts:64` | (see §2b — same string, cadence fixed for both claims at once) | |
| `src/app/llms.txt/route.ts:112` | `"adds the Live Deal Finder, Order Planner..."` | `"adds the Live Deal Finder (on demand), Order Planner..."` |
| `src/app/support/page.tsx:26` | `"...adds the live deal finder across 5 markets..."` | `"...adds the live deal finder (on demand) across 5 markets..."` |

## 5. Cross-domain arbitrage stats (60–90%, 12–39%, >99%, 2.5–3.5×) — no n/date/sql, OS §0.2 violation

Removed the specific unsourced percentages from every public/LLM-facing surface; kept the
underlying, non-numeric conclusion (most listings overlap across domains at an identical price,
so country arbitrage mostly doesn't work), since that direction is not in dispute — only the
precision was fabricated.

| File | What changed |
|---|---|
| `src/data/manual-2.ts:194-195,207,227-229,235` (manual chapter "cross-border-markets", intro + takeaways + FAQ) | `"60% and 90%"`, `"12% and 39%"`, `"two and a half to three and a half times"`, `"over 99%"`, `"10% to 35%"` → `"the large majority"`, `"a substantial share"`, `"several times"`, `"nearly all"`, `"a smaller share... varying by category"` |
| `src/data/blog-posts-2.ts:379-381,408` (same finding, blog version) | same numbers → same qualitative language, plus an explicit line: `"We haven't yet published the exact percentages with the query and date behind them, so read the size of the effect as directional."` |
| `src/app/llms.txt/route.ts:59-64` | `"60-90%... 12-39%... over 99%... 2.5-3.5x"` → `"the large majority... nearly all... several times over"` + `"We have not yet published the exact percentages with the n, date and query behind them."` |

**Bonus fix, same root cause (OS rule 2 / Top 10 #7 — CONTRADICTED):** the condition-price
multiplier was "3.3x to 7x" in `llms.txt` and "3.5x to 7x" in `manual.ts:461` — two public
documents stating the same unsourced finding with different numbers. Harmonized `llms.txt` to
`manual.ts`'s number (the manual chapter already hedges "treat the exact multiples as
indicative"), in `src/app/llms.txt/route.ts:67-71`.

## 6. Business €99 tier — removed (Job 2, AM-3)

See `BUSINESS-REMOVAL.md` in this same folder for the full before/after.

## Deliberately NOT changed — flagged for the CEO instead

Per the CEO's mid-task instruction, the "sold, not asking" framing on `/methodology` and its
echoes across the site were left untouched — the CEO is drafting that wording directly, because
`docs/audit/DATA.md` §2 found the system stores **asking prices only** (`price_eur` is "the
asking price at last scrape"; a "sale" is inferred from a listing leaving a search shelf, an
inference that has been catastrophically wrong twice already — 1.6M then 168,852 fabricated
sales). Every instance found, for the CEO's rewrite, is catalogued in `SOLD-VS-ASKING-CATALOG.md`
in this same folder. None of these strings were edited by this pass.
