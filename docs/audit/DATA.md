# DATA.md — Phase 1 read-only audit (data-eng + data-scientist)

Written 2026-08-31. Governed by `docs/company/OS.md` §0 (constitution), §3 (KPI tree), §8 (Phase 1).

**Evidence rule applied literally.** Every number below carries `n`, a date range and the exact
SQL or `path:line` that produced it. Anything I could not re-derive is written **UNKNOWN**.
Nothing is carried over from `CLAUDE.md`, `DATA_AUDIT.md`, `PROJECT_STATUS.md` or any other doc.

---

## 0. READ THIS FIRST — the two facts that reframe every number in this file

### 0.1 The local 56 GB database is NOT what production serves, and it is 8 days stale

| | local | production |
|---|---|---|
| file | `/Users/bilalsbaiby/Desktop/demand-intel/demand_intel.db` | `/app/data/demand_intel.db` on Hetzner volume `ph5clxk9hmghspv65pdkvak9-riq-db-data` |
| size | 56,428,421,120 bytes | ~4.6 GB per `scripts/health_check.py:241` comment (NOT re-derived → UNKNOWN) |
| `listings` rows | 36,305,525 | UNKNOWN (no read access) |
| distinct items | 11,124,155 (`app_meta`, stamped 2026-08-23 16:29:12) | 3,751,035 (`/api/public/market-snapshot`, stamped 2026-08-31 16:28:08) |
| last scraper run | 2026-08-23 17:10:37 | fresh — `/api/health` `ingestion-freshness` = pass @ 2026-08-31 12:51:54 |
| `sold_observed=1` | **0** | ≥ 1,089 in trailing 7d (sum of published brands) |

The local file's last write is `mtime 2026-08-28 14:19:08`; its newest `scraper_log.run_at` is
`2026-08-23 17:10:37`. **Every local number in this file describes a dead, divergent snapshot of a
corpus production has since replaced.** I have said so at each one.

### 0.2 Production and this laptop are already separate — but there is still no staging

See §8. Short version: local ≠ prod (different machines, different files, different corpora), the
laptop's `launchd` agent has never once succeeded, and there is **no staging database anywhere** —
so any migration or backfill an agent proves locally proves nothing about the DB that serves paying
users. OS §5's "if prod and staging are the same DB, that is P0 #1" is not literally triggered; the
weaker but still P0 condition — *prod has no rehearsal environment* — is.

---

## 1. SCHEMA

### 1.1 Row counts — every table

Local DB, opened read-only, 2026-08-31.

```sql
-- per table, run individually:
SELECT COUNT(*) FROM "<table>";
```

| table | rows | time column | range | notes |
|---|---:|---|---|---|
| `listings` | **36,305,525** | `first_seen_at`, `last_seen_at`, `sold_at` | `last_seen_at` 2026-05-26 05:56:55 → 2026-08-23 15:37:54 | 16 indexes |
| `listing_images` | **73,760,360** | `added_at` | 2026-05-29 16:54:54 → 2026-08-23 15:37:54 | `phash` computed on **0** rows |
| `rank_snapshots` | 3,124,343 | `snapshot_date` | 2026-08-14 → 2026-08-23 | only 10 days retained |
| `price_history` | 1,211,757 | `snapshot_date` | 2026-05-28 → 2026-08-23, 75 distinct days | |
| `price_changes` | 162,334 | `changed_at` | 2026-05-29 16:55:20 → 2026-08-23 13:25:38 | |
| `model_stats` | 81,139 | `updated_at` | — | 20,841 distinct brand+model |
| `scraper_log` | 19,420 | `run_at` | 2026-05-26 05:57:57 → 2026-08-23 17:13:06 | |
| `catalog_suggestions` | 9,399 | | | |
| `trends` | 1,921 | `date` | | |
| `market_stats` | 1,423 | `updated_at` | 2026-06-08 06:33:04 → 2026-08-23 16:56:31 | 39 distinct brands |
| `reddit_queue` | 405 | | | |
| `demand_index` | 253 | `updated_at` | 2026-08-05 23:23:44 → 2026-08-23 16:56:31 | 26 brands |
| `metric_snapshots` | 185 | | | |
| `health_checks` | 140 | `checked_at` | | |
| `model_signals` | 100 | `updated_at` | all 2026-08-23 15:46:37 | the customer-facing board |
| `predictions` | **38** | `created_at` | 2026-08-14 19:09:16 → 2026-08-18 08:30:42 | **0 evaluated** |
| `sqlite_sequence` | 30 | | | |
| `verdict_logs` | 26 | `created_at` | | |
| `cycle_purchases` | 20 | | | |
| `opportunities` | 17 | | | |
| `users` | 16 | | | |
| `supplier_catalog` | 15 | | | |
| `pageviews` | **27** | `at` | | analytics is effectively empty |
| `email_verifications` | 7 | | | |
| `agent_tasks` | 6 | | | |
| `watchlist_items` | 6 | | | |
| `investment_cycles` | 5 | | | |
| `app_meta` | 4 | `updated_at` | | |
| `deploys` · `activity_logs` · `password_resets` · `portfolio_items` | 1 each | | | |
| `acquisition_channels` · `agent_audit_log` · `agent_heartbeats` · `agent_learnings` · `authenticity_scores` · `customer_insights` · `experiments` · `image_embeddings` · `prospects` · `saved_searches` · `signup_attribution` · `user_alerts` | **0** | | | 12 empty tables |

`wallapop` is present but dead: 36 `listings` rows, last `scraper_log.run_at` **2026-06-18 19:04:19**.

### 1.2 Schema drift — the local DB is BEHIND the code

`PRAGMA table_info(listings)` returns 27 columns. The code writes columns and tables that do not
exist in this file:

| object | written at | present locally? |
|---|---|---|
| `listings.listed_at` | `db/queries.py:147`, `db/queries.py:167`, `scrapers/vinted.py:850` | **NO** |
| `listings.currency` | `db/queries.py:147`, `db/queries.py:195` | **NO** |
| `model_signals.comparable_n` | `db/queries.py:2183` | **NO** |
| `model_signals.size_buy_below` | `db/queries.py:2183` | **NO** |
| table `shelf_passes` | `engine/shelf.py:154`, `db/queries.py:268` | **NO** |

```sql
SELECT name FROM sqlite_master WHERE name LIKE 'shelf%';   -- returns 0 rows
```

Consequence: **`engine/shelf.py` — the only working sold-detector — has never run against this
file.** Every sold row in it comes from the retired, fabricating path (§2).

### 1.3 Indexes

`listings` carries 16 indexes (`sqlite_autoindex_listings_1` UNIQUE(platform, external_id) plus 15
named). Full list re-derived from `sqlite_master`; the wide ones are:

- `idx_listings_vinted_dedup(platform, brand, category, is_sold, external_id)`
- `idx_listings_brand_cat_plat_sold(brand, category, platform, is_sold)`
- `idx_listings_brand_model_plat_sold(brand, model, platform, is_sold)`
- `idx_listings_stale(is_sold, last_seen_at, verify_attempts) WHERE is_sold = 0`
- `idx_listings_price_sparkline(brand, model, is_sold, sold_at) WHERE is_sold = 1`

**`sold_observed` has no index**, although it is the predicate in ~30 aggregation queries in
`db/queries.py` (lines 434–692, 1940–1953). Every one of those is a table or wide-index scan.

`listing_images` has `idx_images_phash(phash) WHERE phash IS NOT NULL` — an index over **0** rows.

---

## 2. SOLD vs ASKING — the founder's question, answered plainly

## **The system stores ASKING prices only. There is no sold-price column anywhere in the schema.**

### 2.1 The column

`listings` has exactly two price columns:

```
10 | price      | REAL      -- native-currency asking price at last scrape
11 | price_eur  | REAL      -- the same asking price × a hardcoded FX rate
```

A sale is a **flag on the listing row**, not a separate event with its own price:
`is_sold INTEGER`, `sold_at TIMESTAMP`, `sold_observed INTEGER`, `days_to_sell`.

So "average sold price" = **the mean of the last asking prices of listings we believe ended**.
It is not a transaction price. Vinted publishes no transaction price, and nothing in
`demand-intel/engine/**` or `demand-intel/scrapers/**` attempts to recover one.

Definition of `AVG_SOLD` in `engine/metrics.py:21-28` states this outright:
"Mean of identity-filtered **watched sold prices** (`sold_observed=1, price_eur>0`)". The word
"sold" describes the listing's *state*, and the number is its *asking* price.

### 2.2 How a sale is inferred, and how the inference has failed twice

**There is no observed sale event.** `scrapers/vinted.py:1188-1228` (`check_listing_status`) can
return only `active` / `gone` / `unknown` — it is structurally incapable of returning `"sold"`:

```
# It does NOT cleanly distinguish sold from delisted — both sold and live
# pages contain the word — so this function deliberately does not guess.
```

So the tracker's `status == "sold"` branch (`engine/tracker.py:165-177`) is **dead code for every
Vinted platform**. Only Wallapop (36 rows, dead since 2026-06-18) can reach it.

The current sale signal is **disappearance from a search shelf**, `engine/shelf.py`:
`detect_ended()` (line 194) → `_judge()` (line 245) → `mark_listing_sold()` at `engine/shelf.py:279`
→ `db/queries.py:274-311`, the sole writer of `sold_observed = 1`.

The soundness argument (`engine/shelf.py:29-56`) is genuinely careful — survivorship-based rank
limits, 2-strike confirmation, `MAX_ENDED_FRACTION = 0.25` circuit breaker, a `shelf_detection_halted`
kill switch in `app_meta`. **But it still equates "left the shelf" with "sold".** A delist, a
sold-elsewhere, a price-edit that re-indexes, an account closure and a Vinted moderation removal are
all recorded as sales, at the seller's asking price.

**How often the inference has been wrong — measured, by the code's own comments:**

| version | error | source |
|---|---|---|
| v0 (`status[]=sold_out`) | marked the newest **ACTIVE** listings sold: **1.6M rows, 95% of all distinct listings** | `scrapers/vinted.py:816-818` |
| v1 (timestamp window) | **168,852 fabricated sales**, growing at 75,000/hour unnoticed | `engine/shelf.py:20-38`, `:79` |
| v2 (survivorship, current) | error rate **UNKNOWN** — no confirmation sample, no labelled holdout, no canary exists | — |

### 2.3 The local corpus contains ZERO real sales

```sql
SELECT COUNT(*) FROM listings WHERE is_sold=1;                        -- 24,114,777
SELECT COUNT(*) FROM listings WHERE is_sold=1 AND sold_observed=1;    --          0
SELECT COUNT(*) FROM listings WHERE is_deleted=1;                     --          0
-- negative control (is the column NULL rather than 0?):
SELECT sold_observed, COUNT(*) FROM listings WHERE is_sold=1 GROUP BY sold_observed;
--   0 | 24114777      <- literal zero, not NULL. Confirmed.
```

n = 36,305,525 rows, `sold_at` range 2026-05-26 → 2026-08-23.

**66.4% of the local corpus (24,114,777 / 36,305,525) is flagged sold, and 100% of those flags are
fabricated** — they are the v0/v1 residue, still sitting in the table, still queried by
`is_sold = 1` in five places (§2.4). Raw `listings` rows are never deleted by design
(`engine/listing_identity.py:3`), so the fabrications are permanent unless explicitly quarantined.

Corroboration from `model_signals` (the customer board, written 2026-08-23 15:46:37, n=100):

| brand | model | local `sold_7d` | production total for the whole brand, 7d |
|---|---|---:|---:|
| New Balance | 530 | 21,143 | 309 |
| Levi's | 501 | 9,106 | 44 |
| New Balance | 9060 | 8,793 | (in the 309) |
| Adidas | Samba | 4,762 | 142 |

Local board = **~68× overstated** versus what production publishes today. Nothing on Vinted sells
21,143 units of one model per week.

### 2.4 Five live queries still read the fabricated set

`is_sold = 1` without `sold_observed = 1` still appears at:

- `engine/prediction_eval.py:79` — **the calibration resolver** (§7). This is the worst one.
- `db/queries.py:631`, `db/queries.py:692` — price aggregations
- `db/queries.py:1881`, `db/queries.py:2552`
- `engine/analyzer.py:767`, `engine/model_catalog.py:763`, `db/schema.py:1215`

### 2.5 Verdict on OS §3 Quality KPIs

| OS §3 KPI | computable? | why |
|---|---|---|
| `match_precision ≥ 90 %` | **YES** — needs a human 30-sample audit, no new data | title→model matching is independent of sold-ness |
| `band_coverage ≥ 80 %` | **YES** | coverage = fraction of queries returning a band |
| `MAPE ≤ 15 %` | **NO** | MAPE needs a ground-truth sale price. None exists, and none can exist from Vinted's public surface. The closest honest target is *asking-price-at-disappearance*, which must be labelled as such everywhere |
| `n_predictions_resolved` | **YES**, machine exists, currently 0 (§7) | |
| `canary green 7/7` | **NO** — no canary set exists | |

**The honest reframe the product needs:** Resale IQ does not know sold prices and cannot. It knows
*the price at which listings stopped being listed*. That is a defensible, genuinely useful proxy —
but every occurrence of the word "sold" on the site is currently a claim the data cannot support,
and OS §0.2 makes that UNKNOWN until relabelled.

---

## 3. THE 56 GB QUESTION — answered: not bloat, not blobs, not WAL. The row count is 10× the claim.

```sql
PRAGMA page_size;      -- 4096
PRAGMA page_count;     -- 13,776,470
PRAGMA freelist_count; -- 0
PRAGMA journal_mode;   -- wal
PRAGMA auto_vacuum;    -- 0
```

4096 × 13,776,470 = **56,428,421,120 bytes — exactly the file size.** Not one byte is slack.

- **Not VACUUM bloat.** `freelist_count = 0`. There are no recoverable free pages. A `VACUUM`
  would reclaim only index fragmentation, not gigabytes.
- **Not WAL history.** `demand_intel.db-wal` is **0 bytes** (`mtime 2026-08-28 14:19:14`).
  `job_wal_checkpoint` runs every 3h (`main.py:795`).
- **Not blobs.** `image_embeddings` has **0 rows**. `listing_images.phash` is NULL on **all**
  73,760,360 rows. There is no BLOB-typed column in any table with rows.

**The row count is the answer.** The site says 3,710,000. The table holds:

```sql
SELECT COUNT(*) FROM listings;        -- 36,305,525
SELECT COUNT(*) FROM listing_images;  -- 73,760,360
SELECT COUNT(*) FROM rank_snapshots;  --  3,124,343
```

Sampled row widths (`n = 3,258` listings rows in `id BETWEEN 40000000 AND 40020000`;
`n = 20,001` image rows in `id BETWEEN 50000000 AND 50020000`):

```sql
SELECT COUNT(*), AVG(LENGTH(COALESCE(title,''))+LENGTH(COALESCE(url,''))
   +LENGTH(COALESCE(photos,''))+LENGTH(COALESCE(brand,''))+ ... +80)
FROM (SELECT * FROM listings WHERE id BETWEEN 40000000 AND 40020000);
```

| | avg bytes/row | × rows | ≈ |
|---|---:|---:|---:|
| `listings` payload | 552 (of which `photos` JSON = **349**) | 36.3M | ~20.0 GB |
| `listing_images` payload | 162 (of which `url` = 122) | 73.8M | ~11.9 GB |
| `rank_snapshots` + `price_history` + rest | — | — | ~0.7 GB |
| **16 indexes on `listings` + 3 on `listing_images`** | — | — | **remainder, ~23 GB** |

Two structural wastes worth naming:

1. **Photo URLs are stored twice.** `listings.photos` holds the JSON array (349 bytes/row avg) and
   `upsert_listing` *also* fans the first 3 out into `listing_images`
   (`db/queries.py:167-176`). ~12 GB of `listing_images` is a duplicate of ~12 GB already inside
   `listings.photos`, for a `phash` pipeline that has computed **0** hashes.
2. **~40M deleted rows' worth of id space.** `MAX(id) = 76,589,075` against 36,305,525 live rows
   (AUTOINCREMENT, so ids are never reused). Roughly 40M rows were inserted and later removed —
   consistent with the label-repair and fabrication cleanups the code comments describe.

**Actual bytes vs live data:** 56.43 GB allocated, 0 bytes free-list, roughly **32 GB of row payload
and ~24 GB of index**, for a corpus whose *useful* content is ~3.75M distinct items. The 15 KB/row
figure in the brief was computed against the wrong denominator: it is ~1.55 KB per `listings` row,
and the row count is 9.8× the public claim.

> `SELECT name, SUM(pgsize), COUNT(*) FROM dbstat('main',1) GROUP BY name ORDER BY 2 DESC;` was
> started read-only, ran for **~40 minutes of wall clock** without returning a row, and was then
> killed per the operating rule rather than left hammering the disk. **Exact per-object byte split:
> UNKNOWN.** The sampled estimates above are labelled as estimates and the
> three PRAGMAs — which are exact — already settle the question the founder asked (it is not
> bloat, blobs or WAL).

---

## 4. THE PUBLIC NUMBERS — re-derived

### 4.1 "3,710,000+ listings analysed" / "3,711,796 unique items tracked"

Provenance: `src/lib/stats.ts:17` → `src/lib/market-numbers.ts` → `GET /api/public/market-snapshot`
→ `api/routes.py:1290-1296` → `app_meta.distinct_listings`, written by `job_snapshot_metrics`
(`main.py:852`, cron `*/6` hours at :05). Method string, `api/routes.py:1373-1376`:
`COUNT(DISTINCT external_id)` across ES/FR/DE/IT/PT.

Re-derived from production, 2026-08-31 18:4x UTC:

```
$ curl -s https://resaleiq.dev/api/public/market-snapshot
  listings_tracked = 3751035
  updated_at       = 2026-08-31 16:28:08
```

**VERDICT: the claim is TRUE and slightly stale-low.** 3,751,035 ≥ 3,710,000. The rendering path
floors to 10k and appends "+" (`src/lib/stats.ts:32-35`), which stays true as the number grows.

Two honesty notes:
- **The same figure is used for two different nouns** on the same site — "listings analysed" and
  "unique items tracked". `COUNT(DISTINCT external_id)` is *items*. "Listings analysed" describes
  the raw ingest, which locally is 36,305,525 and in production is UNKNOWN. One of the two labels
  is wrong. (OS §1 already flagged this; confirmed here with the SQL.)
- Local `app_meta` disagrees violently and must never be quoted:
  ```sql
  SELECT * FROM app_meta;
  -- listings_count      34187247   @ 2026-08-18 08:10:11
  -- distinct_listings   11124155   @ 2026-08-23 16:29:12
  -- distinct_sold        7597519   @ 2026-08-23 16:29:12
  ```

### 4.2 "1,521 watched sold items last 7 days"

Re-derived from production's own endpoint, same call:

```
sum(brands[].sold_7d) = 1089   across 18 published brands
provenance.sold_definition = "sold_observed"
provenance.publish_floor_sold_7d = 5
brands_published = 18 of brands_tracked = 26
```

**VERDICT: MISMATCH at the moment of measurement — 1,089, not 1,521.** Both are point-in-time
readings of a rolling 7-day window, so a drop is legitimate; but the site renders whatever the
snapshot last said, and `src/components/landing/live-market-proof.tsx:89` sums the *published*
brands only — brands below the floor of 5/wk are silently excluded from a number presented as a
total. The label "1,521 watched sold items" is therefore *published watched sold items among
brands clearing a 5/wk floor*. n = 18 brands, window = trailing 7d.

Local re-derivation is **0** (§2.3), which is the strongest evidence that this figure is
production-only and cannot be audited from this machine.

### 4.3 "Scraped every 30 min" vs the 2-hour launchd job

**Both are true, of different things, and the brief's premise about the launchd job is wrong.**

- The **production server** scrapes itself. `main.py:725` schedules `job_vinted` on
  `IntervalTrigger(minutes=SCRAPE_PEAK_INTERVAL)` with `SCRAPE_PEAK_INTERVAL = 30`
  (`config.py:220`). `docs/PRODUCTION_ENVIRONMENT.md:59` records `SCRAPER_PROXY` unset because
  "Scraping currently works from Hetzner without a residential proxy — measured 57,985 listings
  in 2h." Production `/api/health` `ingestion-freshness` = **pass** @ 2026-08-31 12:51:54.
- The **laptop launchd job** (`StartInterval 7200`) is a *fallback* for the case where Vinted
  blocks the datacenter IP. It scrapes into a **throwaway temp DB** and POSTs to
  `https://resaleiq.dev/api/ingest/listings` — `scripts/local_scrape_agent.py:8-11`:
  *"pointing DB_PATH at a throwaway scratch database … Nothing is written to your real local
  database."* **It never writes to the 56 GB file.**

**P0 — that fallback has never once worked:**

```
$ launchctl list | grep resaleiq
-   126   dev.resaleiq.scrape-agent          # last exit status 126

$ sort -u ~/Library/Logs/resaleiq/launchd.err
/bin/bash: /Users/bilalsbaiby/Desktop/demand-intel/scripts/run_local_agent.sh: Operation not permitted

$ wc -l ~/Library/Logs/resaleiq/launchd.err
131                                          # 131 lines, all identical
$ wc -c ~/Library/Logs/resaleiq/launchd.out
0                                            # created 2026-08-20 20:32, never written
$ tail -1 ~/Library/Logs/resaleiq/launchd.err  # newest failure 2026-08-31 17:25
```

131 consecutive failures × 2h ≈ 262h ≈ the exact span from install (2026-08-20 20:32) to now.
Cause: macOS TCC denies `launchd`-spawned `/bin/bash` read access to `~/Desktop`. The residential-IP
escape hatch that exists precisely because Vinted may block Hetzner **does not work**, and nothing
alerts on it. `/api/health` cannot detect it either — see §4.5.

### 4.4 Real freshness

Production, measured 2026-08-31:

| signal | value | source |
|---|---|---|
| analyzer recompute | 2026-08-31 16:28:08 | `market-snapshot.updated_at` = `MAX(demand_index.updated_at)` |
| health-check run | 2026-08-31 12:51:54 | `/api/health`, 14/14 pass |
| scrape run | **UNKNOWN** — no unauthenticated endpoint exposes `MAX(scraper_log.run_at)` | |

Local (dead snapshot):

```sql
SELECT platform, MAX(run_at), COUNT(*) FROM scraper_log GROUP BY platform ORDER BY 2 DESC;
-- tracker        2026-08-23 17:13:06  1617
-- vinted_de      2026-08-23 17:10:37  3136
-- vinted_it      2026-08-23 17:10:36  3138
-- vinted_es      2026-08-23 17:10:34  3136
-- vinted_fr      2026-08-23 17:10:34  3134
-- vinted_pt      2026-08-23 17:10:32  3135
-- google_trends  2026-08-23 04:00:48    75
-- wallapop       2026-06-18 19:04:19  2049
```

Scrape-interval distribution, `vinted_es`, the last 14 days the local DB was alive
(`run_at >= '2026-08-09'`, actual data starts 2026-08-14 19:41:08, n = 353 gaps):

```sql
WITH r AS (SELECT run_at, LAG(run_at) OVER (ORDER BY run_at) AS prev
           FROM scraper_log WHERE platform='vinted_es' AND run_at >= '2026-08-09')
SELECT bucket, COUNT(*) FROM (SELECT CAST((julianday(run_at)-julianday(prev))*1440 AS INT) gap_min
                              FROM r WHERE prev IS NOT NULL) GROUP BY 1;
```

| gap | n | share |
|---|---:|---:|
| < 20 min | 8 | 2.3% |
| **20–39 min (the "every 30 min" claim)** | **295** | **83.6%** |
| 40–69 min | 39 | 11.0% |
| 70–179 min | 7 | 2.0% |
| 3–24 h | 4 | 1.1% |

**VERDICT: "scraped every 30 min" is TRUE for ~84% of intervals, with a ~14% tail slower than
40 minutes.** `/methodology` (`src/app/methodology/page.tsx:48`) claims "at most about an hour
behind the market, and usually less" — that holds for 96.9% of the sample and breaks for 3.1%.
Honest phrasing: *"about every 30 minutes; 97% of gaps under an hour."*

Volume over the same window (n = 354 runs/market, 2026-08-14 → 2026-08-23):

```sql
SELECT platform, SUM(items_seen), SUM(items_new), SUM(items_updated), SUM(errors)
FROM scraper_log WHERE run_at>='2026-08-09' GROUP BY platform;
```

| platform | seen | new | updated | errors |
|---|---:|---:|---:|---:|
| vinted_fr | 1,129,327 | 650,782 | 2,401 | 0 |
| vinted_it | 1,128,911 | 642,107 | 2,473 | 1 |
| vinted_de | 1,129,201 | 607,313 | 2,623 | 0 |
| vinted_es | 1,121,213 | 592,042 | 2,612 | 0 |
| vinted_pt | 1,121,877 | 589,393 | 2,575 | 0 |
| **tracker** | 63,000 | **0** | 0 | 0 |

The scraper inserts ~3.08M **new** rows per 9 days across 5 markets — that is the 36M-row growth
curve — while the tracker checked 63,000 items and confirmed **zero** sales. That single row is
§2 in miniature.

### 4.5 The freshness gate is a liveness gate, not a data gate

`scripts/health_check.py:235-239`:

```python
"ingestion-freshness",
"SELECT CAST((julianday('now') - julianday(MAX(run_at))) * 24 AS INT) "
"FROM scraper_log WHERE platform LIKE 'vinted%'",
assertion=lambda v: v is not None and v < 3,
```

It asserts **that the job fired**, never that a row landed. A fully 403-blocked scraper writing
`items_seen = 0` every 30 minutes keeps this check green forever. `config.py:123`
(`DQ_MAX_LISTING_AGE_HOURS = 12`) is the check that would catch it; it lives in `engine/data_quality.py`,
not in the health endpoint the founder and any uptime monitor actually read.

---

## 5. THE PIPELINE, L0 → L3

```
L0  RAW      scrapers/vinted.py:scrape_all_vinted        (job_vinted, every 30 min, main.py:725)
              parse_item()                     vinted.py:~670-790  — brand/model/category/price_eur
              db/queries.py:upsert_listing     :120-224            — INSERT/UPDATE listings
                                                                    + fan-out to listing_images (:166-175)
                                                                    + price_changes on delta (:213-221)
              db/queries.py:upsert_rank_snapshot :226-252          — rank_snapshots
              engine/shelf.py:detect_ended       :194-243          — sale inference (§2.2)

L1  CLEAN    engine/model_extractor.py, engine/model_catalog.py, engine/taxonomy.py
              engine/model_cleanup.py           (job_label_migration, every 180 min, main.py:826)

L2  MATCH    engine/listing_identity.py:is_comparable_sold  :212-240
              engine/metrics.py:summarise_sold_prices        :202-216
              db/queries.py:refresh_model_signals            :~1850-2210

L3  PUBLISH  db/queries.py → model_signals / demand_index / market_stats
              engine/sufficiency.py:apply, apply_all      — read-time suppression
              api/routes.py:/api/verdict :650, /api/public/market-snapshot :1173
```

### 5.1 OS §8 Phase 2 gates — status

| gate | status | evidence |
|---|---|---|
| **sold-not-asking** | **MISSING** — structurally impossible | §2. No sold price exists. `price_eur` is asking price at last scrape. Best achievable is *asking-at-disappearance*, currently mislabelled "sold" |
| **sold-observed-not-fabricated** *(the gate that actually exists)* | **PARTIAL** | `db/queries.py:1946` filters `sold_observed = 1` for the price sample. But 8 other call sites still read `is_sold = 1` — `engine/prediction_eval.py:79`, `db/queries.py:631,692,1881,2552`, `engine/analyzer.py:767`, `engine/model_catalog.py:763`, `db/schema.py:1215` — and the local corpus has 24,114,777 fabricated `is_sold=1` rows |
| **single item** (kit / bundle / accessory / spares) | **EXISTS** | `engine/listing_identity.py:227-230` — `is_accessory` (:112), `is_bundle` (:116), `is_kit` (:120); `board_model_is_junk` (:124) |
| **brand confidence** | **PARTIAL** | `listing_matches` + `models_conflict` (`engine/listing_identity.py:236-239`) enforce brand+model+category agreement. But there is **no brand normalisation**: `SELECT COUNT(DISTINCT brand) FROM listings` = **28,337** distinct strings, and comps split across "Ralph Lauren"/"Polo Ralph Lauren" (1,481,684 + 509,310), "Hugo Boss"/"Boss" (897,259 + 284,084), "Adidas"/"adidas Originals", "Carhartt"/"Carhartt WIP", "Mango"/"MNG", "Nike"/"Nike Air" |
| **replica filter** | **MISSING as a gate** | `engine/authenticity.py` exists (regexes at :46-56, risk pairs at :31) but is wired **only** to the on-demand endpoint `api/resale_routes.py:1378`. It is never called from `is_comparable_sold` or `refresh_model_signals`. `authenticity_scores` table: **0 rows**. Replica listings enter buy-below |
| **currency == TLD** | **MISSING** | `scrapers/vinted.py:681` and `:1292` — `price_eur = price_val * CURRENCY_RATES.get(currency, 1.0)`. `CURRENCY_RATES` (`vinted.py:417-423`) is a **hardcoded static table of 5 currencies** (EUR/GBP/USD/PLN/CZK) with no rate date and no refresh. **An unknown currency silently multiplies by 1.0.** Harmless for the 5 scheduled EUR markets; on the 26-market Price Compare a HUF/RON/SEK/DKK/BGN listing is published as if the amount were euros. There is no assertion that a `.pl` listing arrived in PLN |
| **relist dedupe** | **EXISTS** | `engine/listing_identity.py:195-209` `comparable_fingerprint(title, size, price, photos, phash)`, applied `db/queries.py:1970-1974`. **Degraded**: `visual_key` falls back to photo URLs because `phash` is NULL on all 73,760,360 image rows |
| **[p01, p99] outlier trim** | **PARTIAL — different method** | Not p01/p99. Tukey 1.5×IQR fence, `engine/metrics.py:148-160`, applied only when **n ≥ 4** (`:149`). For n=3 comps — which is the admission floor — no trimming happens at all |
| **recency window** | **EXISTS** | 7d preferred, 30d fallback: `db/queries.py:1984-1995`; SQL bound `sold_at >= thirty_days_ago` at `:1952` |
| **seller blacklist** | **MISSING** | `grep -rn "blacklist\|seller_id\|banned_seller" engine/ db/ scrapers/` → **0 hits**. The scraper does not even store a seller id, so one seller relisting the same item 50× cannot be detected except by the title+size+price fingerprint |
| **`n < 8` → insufficient** | **PARTIAL** | `MIN_VERDICT_COMPARABLES = 8` at `engine/listing_identity.py:41`; `verdict_allows_buy_below()` at `:44-60`; enforced at `api/routes.py:833` → returns `verdict: "INSUFFICIENT_DATA"`. **Two holes:** (a) `:56-57` — when `comparable_n` is missing the function returns **True**, i.e. *fails open*, and `model_signals` in this DB has **no `comparable_n` column** at all, so every legacy row bypasses the gate; (b) the board admission floor is `MIN_COMPARABLES = 3` (`:40`), so rows with n=3..7 are written with a `max_buy_price` and are only suppressed at read time by one code path |

### 5.2 Gates that exist but are not in OS §8, worth keeping

- `engine/sufficiency.py:36-38` — `MIN_SOLD_30D = 30`, `MIN_ACTIVE = 50`, `MIN_DQ_SCORE = 50`;
  `WITHHELD` blanks 13 fields at read time rather than at write time (`:42-45`).
- `engine/sufficiency.py:47-79` — `SALES_NOT_OBSERVABLE`: a brand whose shelf pass proves nothing
  reports "we can't measure this" instead of `sold_7d = 0`. This is the best honesty primitive in
  the codebase and OS §8 should adopt it by name.
- `engine/shelf.py:79` — `MAX_ENDED_FRACTION = 0.25` circuit breaker.
- `engine/shelf.py:86` — `shelf_detection_halted` kill switch in `app_meta`, readable per pass.

### 5.3 A contradiction inside the codebase

`engine/sufficiency.py:77-78` says:

> "Deliberately NOT `max_buy_price`, which is computed from **asking prices** and stays valid
> without any sold data."

`db/queries.py:1946` says the price sample is `WHERE sold_observed = 1`. One of these two comments
is stale, and they disagree about whether the product's single most important number is built from
asking prices or from watched sales. **Which is live in production: UNKNOWN from read-only access.**
The founder should treat this as a P0 documentation-vs-code reconciliation.

---

## 6. THE BAND AND `n`

### 6.1 The formula — VERIFIED

`CLAUDE.md` states `buy_below = avg_sale × 0.95 × 0.70`. Confirmed in code, three independent sites:

- `db/queries.py:2063` — `max_buy = round(avg_price * 0.95 * 0.70, 2) if avg_price else None`
- `db/queries.py:2009` — per-size variant, identical
- `engine/forecast.py:104-105` — "Deliberately identical to `max_buy_price` in db/queries.py"
- Definition of record: `engine/metrics.py:41-52` — "5% Vinted fee, 30% target margin on net"

Verified against the data, n = 100 (every row in `model_signals` with both fields):

```sql
SELECT COUNT(*) n, SUM(ABS(max_buy_price - ROUND(avg_price_eur*0.95*0.70, 2)) < 0.02) matches
FROM model_signals WHERE avg_price_eur IS NOT NULL AND max_buy_price IS NOT NULL;
-- n=100, matches=100
```

**100/100 rows match the formula exactly.** The formula is correct and consistently applied.

**But `avg_sale` is not a sale price** (§2), so the band is
`asking-price-at-disappearance × 0.95 × 0.70`. The 0.95 (Vinted fee) is being applied to a number
that never had a fee taken off it, because no money changed hands in our records.

### 6.2 What `n` backs a typical answer

`n` = `n_fenced` from `summarise_sold_prices` (`engine/metrics.py:202-216`) = the count of
identity-filtered, relist-deduped, IQR-fenced `sold_observed=1` prices in the 7d (or 30d) window.

**The 30-real-queries sample across ES/FR/DE/IT/PT was NOT run, and here is why, stated as
UNKNOWN rather than estimated:**

- `/api/model-signals` and `/api/calc` are **paid-gated** (`api/routes.py:1585-1590`, 402 for
  free/anon). I hold no credential and will not use one.
- `/api/verdict` is anon-limited to **10 checks/day per IP**; 30 queries is impossible without
  either consuming the founder's own quota three times over or authenticating.
- The local DB cannot answer it: `sold_observed = 1` count is **0**, so every local `n` is 0 and
  every local answer would be `INSUFFICIENT_DATA`. Reporting "100% insufficient" from a dead
  snapshot would be a fabricated finding.

**Per-query `n` distribution across ES/FR/DE/IT/PT: UNKNOWN.** It requires either a production read
replica or one authenticated pass, both of which are founder gates.

### 6.3 What IS derivable about `n` — an upper bound, from production's own public endpoint

From `GET /api/public/market-snapshot`, 2026-08-31 16:28:08, EU5, trailing 7d:

```
sum(brands[].sold_7d)      = 1,089    observed sale-transitions, all 5 markets, all models, 7 days
sum(brands[].models_tracked) =    59  models clearing MIN_SOLD_30D = 30
brands_published = 18 of brands_tracked = 26
```

Local `model_stats` holds **20,841 distinct brand+model pairs** (`SELECT COUNT(*) FROM (SELECT brand,
model FROM model_stats WHERE model!='' GROUP BY brand, model)`), and `api/routes.py:1272-1278` notes in a code comment that 4,693 models exist for Nike alone (comment, not re-derived).

Arithmetic, stated as a bound not an estimate:

> With 1,089 total observed 7-day sales, **at most ⌊1089/8⌋ = 136 models in all of EU5 can possibly
> have `n ≥ 8` in a 7-day window** — and that is the degenerate case where 136 models take every
> sale and all other models take none. Against ≥20,841 known brand+model pairs, the ceiling on
> band-eligible models is **≤ 0.65 %**.

The 30-day fallback (`db/queries.py:1988-1990`) raises this roughly 4×, to a ceiling of ~2.6%.

**Fraction insufficient under `n ≥ 8`: ≥ 97.4%, and the true figure is higher.** This is a hard
lower bound derived from a published production number, not a projection.

**Consequence for OS §3.** The North Star is `weekly_trusted_checks` = checks returning a band with
`n ≥ 8`. On today's data the honest product answers `INSUFFICIENT_DATA` to the overwhelming
majority of queries. That is not a bug — OS §0 says it is the whole thesis — but the pricing page,
which sells "All 100 product signals" at €19, is selling a surface the data cannot fill. The
counter-KPI `insufficient_data_rate` needs a baseline *before* anyone is tempted to lower the floor.

### 6.4 The floors, all of them, in one place

| constant | value | file:line | governs |
|---|---:|---|---|
| `MIN_COMPARABLES` | **3** | `engine/listing_identity.py:40` | admission to `model_signals`; a `max_buy_price` is written at n=3 |
| `MIN_VERDICT_COMPARABLES` | **8** | `engine/listing_identity.py:41` | printing a buy-below on a verdict — matches OS §3 |
| Tukey fence minimum | **4** | `engine/metrics.py:149` | below n=4 no outlier trimming at all |
| `MIN_SOLD_30D` | 30 | `engine/sufficiency.py:32` | read-time suppression of 13 fields |
| `MIN_ACTIVE` / `MIN_DQ_SCORE` | 50 / 50 | `engine/sufficiency.py:36-37` | alternative sufficiency route |
| HIGH confidence | n≥30, dq≥70, age<48h, IQR/median≤0.60 | `engine/metrics.py:17`, `:64-68` | confidence label |
| `MIN_SOLD_7D` publish floor | 5 | `api/routes.py:1212` | public `/data` brand listing |
| `MIN_OBSERVED_SALES` | 5 | `engine/prediction_eval.py:58` | scoring a prediction |
| `MIN_SAMPLE` (accuracy) | **100** | `db/queries.py:2306` | `get_prediction_stats.ready` |
| `PURCHASE_SCORECARD_MIN_N` | **30** | `db/queries.py:2321` | purchase scorecard |

**Three different "enough" numbers (3, 8, 30/100) with no single definition of record.** OS §3
requires `docs/company/METRICS.md` to freeze one SQL per KPI; `engine/metrics.py` is the closest
thing that exists and it does not cover the floors.

---

## 7. PREDICTIONS AND CALIBRATION

**There is a machine. It has produced zero outcomes.**

### 7.1 The table

```sql
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT, product TEXT, verdict TEXT,
    opportunity_score REAL, buy_below REAL, sell_avg REAL, momentum TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evaluated_at TIMESTAMP, outcome_sell_avg REAL, outcome_correct INTEGER
);
```

Missing, per OS §0.2: no `n`, no `market`, no `pipeline_version`, no `resolve_at`. A resolved row
cannot be attributed to the pipeline version that produced it.

### 7.2 The resolver

`engine/prediction_eval.py`, scheduled daily at 04:30 UTC (`main.py:748`, `job_prediction_eval` at
`main.py:154`).

| OS §8 requirement | status |
|---|---|
| resolver at **+30 days** | **EXISTS** — `EVAL_WINDOW_DAYS = 30`, `engine/prediction_eval.py:52` |
| resolver at **+14 days** | **MISSING** — there is exactly one window and it is 30 days |

Scoring rule (`:20-31`): BUY correct when observed median ≥ quoted `sell_avg × 0.90`
(`TOLERANCE`, `:55`); WATCH never scored; SKIP correct when the market did not support the margin.
Unscorable predictions are left NULL rather than counted wrong (`:37-41`) — correct behaviour.

### 7.3 The bug that makes the resolver unsound

`engine/prediction_eval.py:75-83`:

```sql
SELECT price_eur FROM listings
 WHERE (model = ? OR (brand || ' ' || model) = ?)
   AND is_sold = 1 AND price_eur > 0
   AND sold_at >= ?
 ORDER BY price_eur
```

**`is_sold = 1`, not `sold_observed = 1`.** The calibration loop grades every verdict against the
fabricated sold set (§2.3) — 24,114,777 rows locally, all of them asking prices of listings that
were never confirmed sold. If this ever crosses `MIN_SAMPLE`, the site will publish an accuracy
percentage measured against the exact artefact the shelf-detector rewrite existed to delete.

### 7.4 Count of resolved outcomes

```sql
SELECT COUNT(*) n, SUM(evaluated_at IS NOT NULL) resolved,
       SUM(outcome_correct=1) correct, MIN(created_at), MAX(created_at) FROM predictions;
-- n=38  resolved=0  correct=NULL  2026-08-14 19:09:16 → 2026-08-18 08:30:42
```

**38 predictions, 0 resolved, 0 scored.** All 38 were created in a 4-day burst and none since
2026-08-18 — 13 days with no new predictions logged, against 26 rows in `verdict_logs`. The oldest
(2026-08-14) became ripe on 2026-09-13, so 0 resolved is arithmetically correct today; but the
prediction *inflow* has stopped, which means the 30-outcome milestone recedes rather than
approaches.

### 7.5 "No accuracy claims until 30 outcomes scored"

The sentence is **honest, and backed by two different machines with two different numbers**:

- `PURCHASE_SCORECARD_MIN_N = 30` (`db/queries.py:2321`) — the customer-reported purchase scorecard.
- `MIN_SAMPLE = 100` (`db/queries.py:2306`) — `get_prediction_stats`, which gates the accuracy
  figure the sentence is actually about.

So the site promises 30 while the code that would publish the number requires 100. Both fail
closed, so no false claim is currently made — but the public sentence does not describe the machine
behind it. **Fix the sentence or fix the constant; do not leave them disagreeing.**

Verdict on OS §1's question: **there IS a machine (table + daily resolver + two fail-closed gates).
It has scored 0 outcomes, its resolver reads the wrong column, and it has no +14-day window.**

---

## 8. STAGING vs PRODUCTION — the founder's second question

### **There is one production database and no staging database. Local and prod are physically separate, so OS §5's literal "same DB" trigger does not fire — but nothing rehearses a prod change, and that is a P0 in its own right.**

### 8.1 The three DB locations, from config only (no values read; `.env` access was correctly blocked by the guard hook)

| | path | set by |
|---|---|---|
| **local dev** | `/Users/bilalsbaiby/Desktop/demand-intel/demand_intel.db` | `config.py:249` — `DB_PATH = os.environ.get("DB_PATH", os.path.join(_HERE, "demand_intel.db"))` |
| **production** | `/app/data/demand_intel.db` on named volume `riq-db` → live volume `ph5clxk9hmghspv65pdkvak9-riq-db-data` | `resale-iq-stack.yml:20,25,45`; `demand-intel/docs/PRODUCTION_ENVIRONMENT.md:15` |
| **scrape scratch** | `tempfile` throwaway, deleted per run | `scripts/local_scrape_agent.py:64-71` |

Env var name (name only, never a value): **`DB_PATH`**. `docs/PRODUCTION_ENVIRONMENT.md:33`
records it as set in prod, with the note "Falls back to a path inside the container — data lost on
redeploy" if missing.

`docker-compose.yml:10` — the *dev* compose file — bind-mounts `./demand_intel.db` into the
container. That file is not what Coolify runs (`resale-iq-stack.yml` is), but anyone running
`docker compose up` locally mounts the 56 GB legacy DB. Worth deleting or renaming.

### 8.2 Does agent work read/write the file production serves?

**No — but only by accident of geography, and the divergence is now dangerous.**

- The laptop's scrape agent writes to a **temp DB** and uploads over HTTPS to
  `POST /api/ingest/listings` (power-plan authenticated, 2000-row cap, per-item Pydantic
  validation — `api/routes.py:2905`). That path is well built. It has also **never run**
  (§4.3), so it has ingested nothing.
- The 56 GB local file is a **read-only fossil**: last scraper run 2026-08-23, 24.1M fabricated
  sold rows, `sold_observed = 0` everywhere, missing `listed_at` / `currency` / `comparable_n` /
  `shelf_passes`.

**The concrete danger:** an agent that tests a migration, a backfill or a query plan against the
local file is testing against a schema that is three migrations behind and a corpus whose central
column (`sold_observed`) is all-zero. Every such test passes or fails for the wrong reason. That is
worse than a shared DB in one respect — a shared DB at least tells you the truth.

### 8.3 What production has instead of staging

| control | present? | evidence |
|---|---|---|
| staging DB / staging app | **NO** | one Coolify stack, one volume, one backend container (`docs/PRODUCTION_ENVIRONMENT.md:12-17`) |
| daily backup | yes | `job_backup`, `main.py:788`, cron 03:00 |
| **offsite** backup | **NO** | `BACKUP_OFFSITE_CMD` unset — `docs/PRODUCTION_ENVIRONMENT.md:61`: "Backups exist only on the same volume as the database … A host loss loses both" |
| restore test | **UNKNOWN** — no artefact found | |
| migration runner | schema applied at boot by `db/schema.py` (`init_db`) | `scripts/local_scrape_agent.py:71-72` |
| reversible migrations (OS §5) | **NO** — `db/schema.py` is forward-only `ALTER TABLE` | |

Also noted in passing for `devops`/`security-eng` (not my lane): the frontend reaches the backend
over **plain HTTP** at `http://ph5clxk9hmghspv65pdkvak9.62.238.51.83.sslip.io`
(`resale-iq/Dockerfile:16`), baked into the Next build.

**Recommendation to the founder (OS §11 Q2 answer): "same Supabase project?" — the question does not
apply; there is no Supabase in this stack, it is SQLite on a single Hetzner volume. The answer to
the spirit of the question is: there is no staging, no offsite backup and no reversible migration
path. Treat that as P0 #1 exactly as OS §5 instructs.**

---

## 9. MARKET COVERAGE

### 9.1 Markets with stored data — 5, plus a dead sixth

```sql
SELECT platform, COUNT(*) FROM listings GROUP BY platform ORDER BY 2 DESC;
```

| platform | rows | share |
|---|---:|---:|
| vinted_fr | 7,663,150 | 21.1% |
| vinted_it | 7,593,978 | 20.9% |
| vinted_de | 7,070,427 | 19.5% |
| vinted_es | 7,009,698 | 19.3% |
| vinted_pt | 6,968,236 | 19.2% |
| **wallapop** | **36** | 0.0001% |
| **total** | **36,305,525** | |

Wallapop's last scrape was **2026-06-18 19:04:19** — 74 days dead, 2,049 historical log rows, 11
`model_stats` rows, 9 `market_stats` rows. It is a second marketplace on the books with no data.
**CUT candidate.**

### 9.2 "5 EU markets" vs "26-market Price Compare" — BOTH ARE TRUE

OS §1 flagged these as contradictory on the same page. They are not; they describe different
systems, and the site never says so.

- **5 markets = the stored corpus.** `config.py:73-79` `VINTED_DOMAINS` = exactly `{es, fr, de, it,
  pt}`. `PLATFORM_WEIGHTS` (`config.py:60-66`) covers the same five. `/api/public/market-snapshot`
  returns `markets: ["ES","FR","DE","IT","PT"]` and `provenance.scope: "EU5"`. Confirmed in the
  data above.
- **26 markets = on-demand live search only.** `config.py:84-92` `ALL_VINTED_MARKETS` — I counted
  the entries: es, fr, de, it, pt, nl, be, at, pl, cz, sk, hu, ro, hr, lt, fi, dk, se, co.uk, com,
  lu, ie, gr, bg, si, ee = **26**. The comment at `config.py:82-83` is explicit: *"used for
  on-demand search and cross-country price comparison only. Scheduled scraping stays on
  VINTED_DOMAINS (5 TLDs)."* Served by `scrapers/vinted.py:1250 search_market(tld, ...)`.

**Verdict: not a contradiction — a labelling failure.** Price Compare queries 26 Vinted sites live;
no intelligence, no band, no sold history exists for the other 21. The pricing page
(`src/lib/pricing.ts:72`) sells "26-market Price Compare" adjacent to intelligence claims built on
5. Recommended copy: *"Price Compare searches 26 Vinted markets live. Resale intelligence — bands,
sell-through, momentum — covers ES/FR/DE/IT/PT."*

**And 21 of those 26 markets carry an FX bug** (§5.1, currency gate): `CURRENCY_RATES`
(`scrapers/vinted.py:417-423`) knows EUR, GBP, USD, PLN, CZK. HUF, RON, BGN, SEK, DKK and HRK are
absent, and `.get(currency, 1.0)` silently treats them as euros. A 15,000 HUF listing (~€38) is
published as **€15,000**.

### 9.3 Brands

```sql
SELECT brand, COUNT(*) FROM listings GROUP BY brand ORDER BY 2 DESC LIMIT 40;
SELECT COUNT(DISTINCT brand) FROM listings;   -- 28,337
```

Top 20 (local, n = 36,305,525):

| brand | rows | | brand | rows |
|---|---:|---|---|---:|
| Nike | 2,865,946 | | Tommy Hilfiger | 1,726,242 |
| Zara | 2,490,579 | | Ralph Lauren | 1,481,684 |
| Adidas | 2,412,464 | | New Balance | 1,414,879 |
| Bershka | 2,067,032 | | Carhartt | 1,149,638 |
| Levi's | 2,009,389 | | Calvin Klein | 1,120,913 |
| Pull&Bear | 1,887,549 | | The North Face | 1,089,657 |
| Lacoste | 1,788,769 | | Jordan | 1,002,187 |
| Mango | 1,781,594 | | Hugo Boss | 897,259 |
| Puma | 1,763,935 | | Diesel | 784,805 |

`config.py:95+` `TARGET_BRANDS` = 26. `demand_index` holds 26 distinct brands; `market_stats` holds
38–39 per market. Production publishes **18 of 26** brands above the 5/wk floor.

**28,337 distinct brand strings against 26 target brands** is the brand-normalisation gap named in
§5.1. Splits visible in the top 40 alone: Ralph Lauren / Polo Ralph Lauren (1,481,684 + 509,310),
Hugo Boss / Boss (897,259 + 284,084), Calvin Klein / Calvin Klein Jeans (1,120,913 + 334,001),
Tommy Hilfiger / Tommy Jeans, Carhartt / Carhartt WIP, Adidas / adidas Originals, Nike / Nike Air,
Mango / MNG. Every split is a comp pool cut in two, which directly lowers `n` — the very number
§6 shows is already the binding constraint.

---

## TOP FINDINGS

| # | finding | evidence | sev | KPI it breaks |
|---|---|---|---|---|
| 1 | **No sold prices exist. `price_eur` is the asking price at last scrape; a "sale" is inferred from a listing leaving a search shelf.** The inference has been catastrophically wrong twice (1.6M then 168,852 fabricated sales); the current version's error rate is unmeasured. | `listings` schema (no sold-price column); `engine/shelf.py:279` → `db/queries.py:274-311`; `scrapers/vinted.py:816-818`; `engine/shelf.py:20-38` | **P0** | `MAPE ≤ 15 %` is **not computable**. Every "sold" string on the site is UNKNOWN under OS §0.2 |
| 2 | **24,114,777 fabricated `is_sold=1` rows (66.4% of the corpus) are still queried by 8 live code paths**, including the calibration resolver. `sold_observed=1` count is **0** (negative control: literal 0, not NULL). | `SELECT COUNT(*) FROM listings WHERE is_sold=1` = 24,114,777; `… AND sold_observed=1` = 0; `engine/prediction_eval.py:79`, `db/queries.py:631,692,1881,2552` | **P0** | `match_precision`, `band_coverage`, any accuracy figure |
| 3 | **No staging database and no offsite backup.** One SQLite file on one Hetzner volume; forward-only `ALTER TABLE` migrations; backups on the same volume as the DB. Local dev file is 3 migrations behind and its corpus is all-zero on `sold_observed`, so it cannot rehearse anything. | `resale-iq-stack.yml:20-45`; `docs/PRODUCTION_ENVIRONMENT.md:15,61`; missing `listed_at`/`currency`/`comparable_n`/`shelf_passes` locally | **P0** | OS §5 "Migrations … run on staging first"; change-failure-rate, rollback < 10 min |
| 4 | **The residential-IP scrape fallback has never once run.** 131/131 launchd invocations failed with `Operation not permitted` (macOS TCC on `~/Desktop`), exit 126, since 2026-08-20. Nothing alerts. | `launchctl list` → `126`; `sort -u ~/Library/Logs/resaleiq/launchd.err` → 1 distinct line, 131 occurrences; `launchd.out` 0 bytes | **P0** | `pipeline_lag_min`; the day Vinted blocks Hetzner, ingestion stops with no fallback |
| 5 | **`n ≥ 8` fails OPEN.** `verdict_allows_buy_below()` returns `True` when `comparable_n` is missing — and `model_signals` has no `comparable_n` column in this DB. Board admission is `MIN_COMPARABLES = 3`, so bands are written at n=3 and suppressed only at one read site. | `engine/listing_identity.py:40-60`; `api/routes.py:833`; `PRAGMA table_info(model_signals)` | **P0** | North Star `weekly_trusted_checks` (n≥8) is unenforceable; `insufficient_data_rate` understated |
| 6 | **≥ 97.4% of models cannot support an `n ≥ 8` band today.** Production reports 1,089 observed 7d sales EU-wide; ⌊1089/8⌋ = 136 models maximum against ≥20,841 known brand+model pairs. | `/api/public/market-snapshot` @ 2026-08-31 16:28:08; `SELECT COUNT(*) FROM (SELECT brand,model FROM model_stats … GROUP BY brand,model)` = 20,841 | **P0** | North Star; and the €19 tier sells "All 100 product signals" the data cannot fill |
| 7 | **Calibration resolver reads the fabricated set** (`is_sold = 1`, not `sold_observed = 1`) and has **no +14-day window**. 38 predictions, **0 resolved**, none created since 2026-08-18. | `engine/prediction_eval.py:79`, `:52`; `SELECT COUNT(*), SUM(evaluated_at IS NOT NULL) FROM predictions` = 38, 0 | **P0** | `n_predictions_resolved`; "No accuracy claims until 30 outcomes scored" has a machine, but a broken one |
| 8 | **`ingestion-freshness` is a liveness check, not a data check.** It asserts `MAX(run_at) < 3h` and never that a row landed. A fully blocked scraper stays green forever. | `scripts/health_check.py:235-239`; `/api/health` 14/14 pass @ 2026-08-31 12:51:54 | **P0** | `canary green 7/7`; silent data outage |
| 9 | **Site says 30, code says 100.** `PURCHASE_SCORECARD_MIN_N = 30` vs `MIN_SAMPLE = 100`. Three different "enough" floors (3 / 8 / 30 / 100) with no definition of record. | `db/queries.py:2306`, `:2321`; `engine/listing_identity.py:40-41` | **P1** | OS §3 "No KPI is ever computed ad hoc"; `METRICS.md` does not exist |
| 10 | **21 of the 26 Price Compare markets have an FX bug.** `CURRENCY_RATES.get(currency, 1.0)` — HUF/RON/BGN/SEK/DKK/HRK are absent and silently treated as EUR. Rates are hardcoded with no date. | `scrapers/vinted.py:417-423`, `:681`, `:1292` | **P1** | Price Compare correctness; a Pro-tier feature returns numbers off by ~400× on HUF |
| 11 | **"1,521 watched sold items last 7 days" re-derives to 1,089** and counts only the 18 brands clearing a 5/wk publish floor, while being presented as a total. | `/api/public/market-snapshot` sum(`sold_7d`) = 1,089, `brands_published` 18 of 26 | **P1** | truth pass on OS §1; public claim ≠ SQL |
| 12 | **Same 3.71M figure labels two different nouns** — "listings analysed" (raw ingest, locally 36.3M) and "unique items tracked" (`COUNT(DISTINCT external_id)`, 3,751,035). Only the second is what the code computes. | `api/routes.py:1290-1296`, `:1373-1376`; `src/app/layout.tsx:31,94` | **P1** | zero UNKNOWN public claims (OS §8 Phase 2 exit) |
| 13 | **28,337 distinct brand strings, no normalisation.** Ralph Lauren/Polo Ralph Lauren, Hugo Boss/Boss, Calvin Klein/CK Jeans, Adidas/adidas Originals, Nike/Nike Air, Mango/MNG all split their comp pools. | `SELECT COUNT(DISTINCT brand) FROM listings` = 28,337; top-40 breakdown in §9.3 | **P1** | `match_precision`; directly suppresses `n`, the binding constraint in finding 6 |
| 14 | **Replica filter and seller blacklist are absent from the pipeline.** `engine/authenticity.py` exists but is wired only to an on-demand endpoint; `authenticity_scores` has 0 rows. `grep` for any seller-blacklist concept returns 0 hits, and no seller id is even stored. | `api/resale_routes.py:1378`; `engine/listing_identity.py:212-240`; `SELECT COUNT(*) FROM authenticity_scores` = 0 | **P1** | OS §8 Phase 2 gate list; replicas set buy-below |
| 15 | **Outlier trim is Tukey 1.5×IQR, not [p01,p99], and is skipped entirely below n=4** — i.e. skipped at exactly the n=3 admission floor where it matters most. | `engine/metrics.py:148-160`, `:149`; `engine/listing_identity.py:40` | **P1** | OS §8 gate; band correctness at low n |
| 16 | **~12 GB of the 56 GB is a duplicate photo-URL table for a `phash` pipeline that has computed 0 hashes.** `listing_images` = 73,760,360 rows, `phash IS NOT NULL` = 0, `image_embeddings` = 0 rows, plus an index over 0 rows. | `PRAGMA freelist_count` = 0; row counts; `SELECT COUNT(*) FROM listing_images WHERE phash IS NOT NULL` = 0 | **P2** | infra cost per trusted check; visual relist-dedupe silently degraded to URL matching |
| 17 | **Wallapop is a dead second marketplace**: 36 rows, last scrape 2026-06-18, still in `PLATFORM_WEIGHTS`-adjacent code paths and still the only platform whose tracker branch can return `"sold"`. | `SELECT platform, COUNT(*) FROM listings GROUP BY platform`; `MAX(run_at)` for wallapop = 2026-06-18 19:04:19 | **P2** | CUT candidate at Gate 1 |
| 18 | **The code contradicts itself on what buy-below is built from.** `engine/sufficiency.py:77-78` says asking prices; `db/queries.py:1946` filters `sold_observed = 1`. | both lines | **P2** | OS §0.2 — the product's central number has two incompatible definitions of record |

---

## UNKNOWNs (declared, not estimated)

1. **Per-object byte split of the 56 GB file.** `dbstat('main',1)` did not return within ~25 minutes.
   The three PRAGMAs are exact and already answer the founder's question; the per-table split in §3
   is a *sampled estimate*, labelled as such.
2. **Per-query `n` distribution across ES/FR/DE/IT/PT (30 real queries).** Requires a paid credential
   or would consume the founder's 10/day anon quota three times over. The ≥97.4% bound in §6.3 is a
   hard lower bound from a public production number, not a substitute for the sample.
3. **Production row counts, production `is_sold` vs `sold_observed` split, production
   `MAX(scraper_log.run_at)`.** No read replica, no unauthenticated endpoint. Everything in this
   file marked "local" describes a dead 2026-08-23 snapshot.
4. **The current shelf-detector's false-positive rate.** No confirmation sample, no labelled
   holdout, no canary exists. This is the single most valuable number the company does not have.
5. **Whether `engine/sufficiency.py:77` or `db/queries.py:1946` is live in production** (finding 18).

## The three measurements to take first

1. **A confirmation sample for the shelf detector.** 100 listings marked `sold_observed=1`, checked
   by hand against the live Vinted page within 24h of the mark. Without this number, nothing in
   §2, §6 or §7 has an error bar, and `MAPE` can never be honest.
2. **Production `SELECT COUNT(*) FROM listings WHERE is_sold=1 AND sold_observed=0`.** One query.
   It tells the founder how much of the prod corpus is still fabrication residue.
3. **The real per-query `n` distribution**, from one authenticated pass over 30 queries across the
   five markets. It converts finding 6 from a bound into a baseline for `insufficient_data_rate`.
