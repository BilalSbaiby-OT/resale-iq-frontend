# COVERAGE — what is actually stopping `band_coverage` reaching 80 %

**Written** 2026-09-01 by `data-scientist`. **Read-only pass.** No code changed, no branch, no PR.
`.claude/LOCK` is held by `ceo (main session)` with `WIP: none` at the time of writing.

**Every number below was measured against production** — `/app/data/demand_intel.db`, opened
`mode=ro` inside the backend container over the same `ssh + docker exec` path
`scripts/company/build_dashboard.py:PROD_METRICS_SCRIPT` uses. Nothing was written. The SQL and the
Python for every table is inline, so the verifier can re-run any of it cold.

**Reference clock for every "7d" window in this file:** `SELECT datetime('now')` on production
returned `2026-09-01 00:11:31` UTC. So the 7-day window is
**`2026-08-25 00:11:31` → `2026-09-01 00:11:31`**. The full `verdict_logs` history is
**`2026-08-12 10:07:33` → `2026-08-31 21:06:57`** (`n = 360` rows).

---

## Answer in one paragraph

The cheapest change is **one token in `demand-intel/db/queries.py:1986`** — the test that decides
whether a model's comps come from the 7-day or the 30-day window. It currently prefers the 7-day
sample whenever that sample has ≥ `MIN_COMPARABLES` (3), so a model with 5 comps in 7 days and 11 in
30 is recorded at `comparable_n = 5` and is refused a price, with the 11 already computed two lines
away and thrown out. Changing that one constant to `MIN_VERDICT_COMPARABLES` takes supply coverage
from **43 % to 62 %** (`n = 100` models) and demand-side `band_coverage` from **62.8 % to 81.1 %**
on the all-time answered population (`n = 180`).

> **Correction, 2026-09-01 (`data-scientist`, `docs/company/RELEASE-A13-GATE.md`):** this paragraph
> originally claimed the median evidence behind a printed band goes "12 comps to 26." **That does
> not reproduce.** Re-measured against production under seven population definitions, none returns
> 26; on this section's own definition (demand-weighted, all answered searches, `n = 180`) it is
> **12 → 13**, and supply-weighted it **falls**, 14 → 12. It is also arithmetically unreachable — the
> 22 models this change admits have a median `comparable_n` of 10, and adding them to a 113-search
> population with median 12 cannot produce 26. A widening that admits weaker-but-sufficient evidence
> pulls the median down; that is what a median does. **The real argument for widening the window over
> lowering the threshold is the floor, not the median**: widening crosses the `≥ 8` floor by finding
> more evidence for a model that already sat close (e.g. a model at 5 comps on the 7-day read clears
> 11 on 30 days), while lowering the threshold to 5 prints prices computed from as few as 5
> comparables. Same coverage number, opposite mechanism. **The distribution does not justify lowering
> the threshold, and this document recommends against it** — on the floor argument, not the retracted
> median claim. It does not reach 80 % on the last-7-days window either — that window has a hard
> ceiling of **65.9 %** (`n = 44`) because 15 of 44 searches match nothing at all, and that is a
> separate, more expensive problem.

---

## 0. Two things to know before reading any percentage in this file

### 0.1 `n = 44` is five people, two of whom are us

`sql/metrics/band_coverage.sql` reported **59.1 %, n = 44** for the 7 days to 2026-09-01. Here is
that population by originating `ip_hash`:

```sql
SELECT COALESCE(ip_hash,'-') ip, COUNT(*) n,
       SUM(CASE WHEN verdict IN ('UNKNOWN','INSUFFICIENT_DATA') THEN 1 ELSE 0 END) fails
  FROM verdict_logs
 WHERE created_at >= datetime('now','-7 days')
   AND verdict IS NOT NULL AND verdict NOT IN ('LIMIT_REACHED','PENDING')
 GROUP BY ip ORDER BY n DESC;
```

| ip_hash | answered | of which refused |
|---|---:|---:|
| `d66e6eaf9400d271` | 25 | 12 |
| `12ca17b49af22894` | 8 | 5 |
| *(empty — logged-in user id 1)* | 8 | 1 |
| `c76a39e6c2255d84` | 2 | 0 |
| `0e20af8e3e7f741c` | 1 | 0 |

Two hashes are 33 of 44. And `12ca17b49af22894` issued `2015`, `nike` and `zzqqxx-not-a-real-thing`
**in the same second** (`2026-08-29 23:17:10`), plus `adidas samba` and `new balance 530` in the
same second (`2026-08-31 13:51:20`). User id 1 issued `totally-fake-model-xyz`. At minimum
**4 of the 44 rows are our own probe traffic** (`zzqqxx-not-a-real-thing`,
`totally-fake-model-xyz`, and the two same-second pairs are machine-timed, not human-timed).

**Consequence:** `band_coverage` at `n = 44` cannot be steered to a 1-pp target and should not be
scored weekly at this volume. Wherever this document needs a stable read it uses the **all-time
answered population, `n = 180`**, and says so. Both are reported side by side and never averaged.

### 0.2 `comparable_n` at answer time is not stored — so the replay is a counterfactual, not a re-run

`verdict_logs` has no `comparable_n` column (`PRAGMA table_info(verdict_logs)`: `id, ip_hash, query,
verdict, created_at, user_id, est_profit, reason, q_norm, said_buy_below, said_sell_avg,
client_ip_hash`). `model_signals` is a `DELETE`-then-`INSERT` snapshot rebuilt on every analyzer run
(`db/queries.py:2174-2186`), so a model's `comparable_n` at the moment a search was answered is
**UNKNOWN and unrecoverable**.

Every "replay" table below therefore applies **today's board snapshot**
(`model_signals.updated_at = 2026-08-31 22:43:02`, 100 rows) to historical query strings. That makes
the replay valid for **comparing arms against each other on one fixed board**, and invalid as a
reproduction of what production actually returned. Concretely: production logged **59.1 %** for the
7-day window; the same 44 queries replayed on today's board under today's settings give **43.2 %**.
The 7-search gap is board drift between answer time and now. **Do not quote 43.2 % as a coverage
reading.** Quote the deltas.

*What would remove this caveat:* one column, `verdict_logs.comparable_n INTEGER`, written where
`api/routes.py:891` already computes `n_comp = verdict_comparable_n(best_raw)`. Then the replay
becomes a re-run and every arm below can be scored on real history.

---

## 1. The 17 UNKNOWN + 1 INSUFFICIENT_DATA, by `reason` and by `q_norm`

### 1.1 The `reason` column, as logged

```sql
SELECT verdict, COALESCE(reason,'(null)') AS reason, COUNT(*) AS n
  FROM verdict_logs
 WHERE created_at >= datetime('now','-7 days') AND created_at < datetime('now')
 GROUP BY verdict, reason ORDER BY n DESC;
```

| verdict | reason | n | in `band_coverage` denominator? |
|---|---|---:|---|
| WATCH | *(null)* | 20 | yes — counted covered |
| PENDING | *(null)* | 19 | no — excluded |
| LIMIT_REACHED | `limit_reached` | 15 | no — excluded |
| UNKNOWN | `unknown` | 13 | yes — counted refused |
| SKIP | *(null)* | 6 | yes — counted covered |
| UNKNOWN | `model_too_vague` | 4 | yes — counted refused |
| INSUFFICIENT_DATA | *(null)* | 1 | yes — counted refused |
| | **answered total** | **44** | |

**On the face of the log, the failure is 17/18 = 94.4 % a matching failure and 1/18 = 5.6 % a data
failure.** That reading is wrong, and §1.2 shows why.

### 1.2 The `reason` taxonomy does not work — three of its five values have never been written

```sql
SELECT DISTINCT COALESCE(reason,'(null)') FROM verdict_logs;
-- ['(null)', 'limit_reached', 'model_too_vague', 'unknown']

SELECT COUNT(*) tot,
       SUM(CASE WHEN reason IS NULL THEN 1 ELSE 0 END) reason_null,
       SUM(CASE WHEN q_norm IS NULL THEN 1 ELSE 0 END) qnorm_null,
       MIN(created_at), MAX(created_at)
  FROM verdict_logs WHERE verdict='INSUFFICIENT_DATA';
-- 52, 52, 52, '2026-08-19 08:22:41', '2026-08-29 23:03:28'
```

Across all **360** rows ever logged, `thin_comparables`, `ambiguous` and `no_data` appear
**zero times**. And **all 52** `INSUFFICIENT_DATA` rows have `reason IS NULL` *and* `q_norm IS NULL`.

The cause is on disk. There are two `INSUFFICIENT_DATA` exits and only one of them logs a reason:

- `api/routes.py:910` — the thin-comparables gate — calls `_log_search("INSUFFICIENT_DATA",
  "thin_comparables")` → `record_search_outcome`, which writes `verdict`, `reason` **and** `q_norm`
  (`db/queries.py`, the `UPDATE verdict_logs SET verdict=?, reason=?, q_norm=? WHERE id=?` branch).
- `api/routes.py:1061` — the sufficiency gate — calls `resolve_anon_verdict(db, anon_log_id,
  "INSUFFICIENT_DATA")`, whose whole body is
  `UPDATE verdict_logs SET verdict=? WHERE id=?`. **The reason and the normalised query are
  discarded.**

The 52-of-52 NULL pattern says every `INSUFFICIENT_DATA` row we have came through the second path.
It is also true that `record_search_outcome` only shipped around **2026-08-29 23:15** (the first row
carrying any `reason` is `LIMIT_REACHED` at `2026-08-29 23:15:52`), and the last-ever
`INSUFFICIENT_DATA` row is `2026-08-29 23:03:28` — twelve minutes earlier. So a second reading is
also consistent: **since refusal instrumentation shipped, not one `INSUFFICIENT_DATA` has been
logged at all.** Both readings lead to the same conclusion:

> The `reason` column cannot currently distinguish a corpus failure from a matcher failure, because
> the corpus failure never writes to it.

### 1.3 What the failures actually are — replayed through the current matcher and board

Because `reason` is unusable, each failing `q_norm` was pushed back through the live matcher
(`engine.listing_identity.match_verdict_signal`) against the current 100-row board.

```python
# inside the prod container, read-only
raw   = con.execute("SELECT * FROM model_signals "
                    "ORDER BY COALESCE(opportunity_score,0) DESC, sold_7d DESC").fetchall()
board = [d for d in map(hydrate, raw) if publishable_opportunity(d)]   # 100 of 100 survive
hit, mr = match_verdict_signal(q, board)
```

All 18 failures in the 7-day window:

| `q_norm` | logged | replay today | class |
|---|---|---|---|
| `adidas samba` | UNKNOWN / `unknown` | **MATCH Adidas Samba, comparable_n = 41 → BAND** | **matcher/board miss** |
| `new balance 530` | UNKNOWN / `unknown` | **MATCH New Balance 530, comparable_n = 174 → BAND** | **matcher/board miss** |
| `adidas campus` | INSUFFICIENT_DATA / *(null)* | MATCH Adidas Campus, `comparable_n = 5` → refuse | **corpus (thin)** |
| `2015` | UNKNOWN / `model_too_vague` | no match — `model_too_vague` | correct refusal |
| `adidas` | UNKNOWN / `model_too_vague` | no match — `model_too_vague` | correct refusal |
| `nike` | UNKNOWN / `model_too_vague` | no match — `model_too_vague` | correct refusal |
| `lacoste` | UNKNOWN / `model_too_vague` | no match — `model_too_vague` | correct refusal |
| `camisetas fútbol` | UNKNOWN / `unknown` | no match | out of scope (kits are filtered by design, `listing_identity.py:_KIT`) |
| `fútbol` | UNKNOWN / `unknown` | no match | out of scope |
| `madrid` | UNKNOWN / `unknown` | no match | out of scope |
| `racing santander` | UNKNOWN / `unknown` | no match | out of scope |
| `nintendo` ×2 | UNKNOWN / `unknown` | no match | out of scope (not apparel/footwear) |
| `switch` | UNKNOWN / `unknown` | no match | out of scope |
| `bape` | UNKNOWN / `unknown` | no match | brand not in CATALOG |
| `olow` | UNKNOWN / `unknown` | no match | brand not in CATALOG |
| `totally-fake-model-xyz` | UNKNOWN / `unknown` | no match | **our own probe** |
| `zzqqxx-not-a-real-thing` | UNKNOWN / `unknown` | no match | **our own probe** |

**The honest breakdown of the 18 refusals, 2026-08-25 → 2026-09-01, n = 18:**

| class | n | share | fix lives in |
|---|---:|---:|---|
| correct refusal (brand-only / year-only) | 4 | 22.2 % | nothing — this is the product working |
| out of scope (football kits, consoles, non-catalog brands) | 8 | 44.4 % | catalog/scope decision, founder gate |
| **our own probe traffic** | 2 | 11.1 % | tag or exclude test traffic from the metric |
| **matcher/board miss on a model we can price** | 2 | 11.1 % | matcher or board-freshness bug |
| **corpus: tracked model, too few comps** | 2 | 11.1 % | `comparable_n` — §2 |

Note the last row is 2, not 1: `adidas campus` refused explicitly, and `spezial blue` in the wider
history is the same shape. **But this table understates the corpus problem badly**, because refusals
are not the only place thinness shows up — see §1.4.

### 1.4 The bucket the log cannot see: `Nike Tech Fleece` × 9, logged WATCH, `comparable_n = 7`

Replaying **all 44 answered searches** (not just the failures) through today's board:

| class | n of 44 | example |
|---|---:|---|
| `BAND` — matches, `comparable_n ≥ 8` | 19 | `Adidas Samba` (41), `Nike Air Force 1` (11) |
| `THIN` — matches, `comparable_n < 8` | **10** | `Nike Tech Fleece` **×9** (`comparable_n = 7`), `adidas campus` (5) |
| `NOMATCH` — matches nothing | 15 | `nintendo`, `madrid`, `2015` |

Nine of those ten `THIN` rows were **logged as `WATCH`** — i.e. `band_coverage` counted them as
covered. Under the current board they would be refused. Whether they were covered *correctly* at
answer time is **UNKNOWN** (§0.2): `Nike Tech Fleece` may genuinely have had `comparable_n ≥ 8` when
those searches ran, and dropped to 7 since. Either way the finding is the same and it is the most
important one in this section:

> **`comparable_n` for the most-searched models oscillates across the threshold of 8 from one
> analyzer run to the next.** The same query gets a price or a refusal depending on the hour. That
> is not a threshold that is too high; it is a sample that is too small to be stable, which is
> exactly what §2 fixes.

**Verdict on question 1.** By the log, the dominant failure is a matcher failure. By replay, the
44-search population splits 19 band / 10 thin / 15 nomatch, and the *thin* half is the one a single
constant closes. The 15 nomatch are mostly out-of-scope by design. **The corpus problem is the
tractable one; the matcher problem is mostly the product correctly saying no.**

---

## 2. The 57 models at `comparable_n` 3–7: how many cross 8 if the window widens

### 2.1 What the code does today

`db/queries.py:1983-1995`, inside `refresh_model_signals`:

```python
price_stats_map: dict[tuple, dict] = {}
for k in brand_model_set:
    s7 = summarise_sold_prices(prices_7d.get(k) or [])
    if (s7.get("n_fenced") or 0) >= MIN_COMPARABLES:          # <-- line 1986. MIN_COMPARABLES = 3
        price_stats_map[k] = {**s7, "price_window": "7d"}
        continue
    s30 = summarise_sold_prices(prices_30d.get(k) or [])
    if (s30.get("n_fenced") or 0) >= MIN_COMPARABLES:
        price_stats_map[k] = {**s30, "price_window": "30d"}
    ...
```

and 75 lines later, `db/queries.py:2061`: `comparable_n = n_ok`, where `n_ok` is the `n_fenced` of
whichever window won above.

`prices_30d` is **already built**, from the same `price_rows` result set, in the same loop
(`db/queries.py:1953-1982`). The 30-day comps are computed and then discarded for any model that
scraped together 3 comps in 7 days. A model with `n_fenced` = 5 at 7 days and 11 at 30 days is
written as `comparable_n = 5`, and `verdict_allows_buy_below` (`engine/listing_identity.py:44`,
`MIN_VERDICT_COMPARABLES = 8`) refuses it.

**The change is one token on line 1986:** `>= MIN_COMPARABLES` → `>= MIN_VERDICT_COMPARABLES`.
That keeps the *freshest* window for every model that can already fill it, and falls back to 30 days
only for models that otherwise cannot be priced at all.

### 2.2 The measurement

Run inside the production container, read-only, reusing the application's own functions so the
counterfactual cannot drift from the pipeline:

```python
import sqlite3, sys; from datetime import datetime, timedelta
sys.path.insert(0, "/app")
from engine.listing_identity import (is_comparable_sold, comparable_fingerprint,
                                     expected_category)
from engine.metrics import summarise_sold_prices

con = sqlite3.connect("file:/app/data/demand_intel.db?mode=ro", uri=True, timeout=60)
con.row_factory = sqlite3.Row
anchor = datetime.fromisoformat(
    con.execute("SELECT MAX(updated_at) FROM model_signals").fetchone()[0].replace(" ", "T"))
cut = {d: (anchor - timedelta(days=d)).isoformat() for d in (7, 14, 30)}

for brand, model, stored in con.execute(
        "SELECT brand, model, comparable_n FROM model_signals"):
    rows = con.execute("""
        SELECT price_eur, title, size, photos, sold_at FROM listings
         WHERE brand=? AND model=? AND sold_observed=1 AND sold_at>=? AND sold_at<?
           AND price_eur>0 AND COALESCE(is_deleted,0)=0""",
        (brand, model, cut[30], anchor.isoformat())).fetchall()
    seen, b = set(), {d: [] for d in (7, 14, 30)}
    wc = expected_category(brand, model)
    for r in rows:
        t = r["title"] or ""
        if not is_comparable_sold(title=t, brand=brand, model=model,
                                  category=wc, listing_brand=brand):
            continue
        fp = comparable_fingerprint(t, r["size"], r["price_eur"], r["photos"])
        if fp in seen:
            continue
        seen.add(fp)
        for d in (7, 14, 30):
            if str(r["sold_at"] or "") >= cut[d]:
                b[d].append(r["price_eur"])
    n_fenced = {d: summarise_sold_prices(b[d]).get("n_fenced") or 0 for d in (7, 14, 30)}
```

**Reproduction control first**, anchored to `model_signals.updated_at = 2026-08-31 22:43:02` so the
7-day window is the same 7 days the stored values were computed over:

| check | result |
|---|---|
| recomputed 7d `n_fenced` == stored `comparable_n`, exactly | **90 / 100** |
| within ±1 | **93 / 100** |
| supply coverage from the recomputed 7d values | **43 / 100 = 43.0 %** — reproduces `sql/metrics/band_coverage_supply.sql` exactly |

The 7 larger misses are all models whose 7-day sample is below 3, where the existing fallback
already sends them to the 30-day window (e.g. `Puma Speedcat OG` stored 5, recomputed-7d 2;
`Nike Cortez` stored 3, recomputed-7d 1). That is the fallback behaving as written, and it is
further confirmation the replication is faithful.

### 2.3 Result — 19 of the 57 cross 8

**Supply coverage by window, `n = 100` models, board snapshot `2026-08-31 22:43:02`:**

| fenced window | models with `comparable_n ≥ 8` | supply coverage |
|---|---:|---:|
| 7 days *(today)* | 43 | **43.0 %** |
| 14 days | 62 | **62.0 %** |
| 21 days | 62 | 62.0 % |
| 30 days | 62 | **62.0 %** |
| 60 days | 62 | 62.0 % |
| 90 days | 62 | 62.0 % |

**Of the 57 models stored at `comparable_n` 3–7: 19 cross 8** (33.3 % of the band) at any window
≥ 14 days. The full 57, with recomputed `n_fenced` per window — crossers in the top block:

| brand | model | stored | 7d | 14d | 30d |
|---|---|---:|---:|---:|---:|
| Carhartt | Double Knee | 3 | 3 | **19** | 19 |
| Stone Island | Ghost | 6 | 6 | **16** | 16 |
| Nike | Tech Fleece | 7 | 7 | **14** | 14 |
| Gucci | Bamboo | 7 | 6 | **14** | 14 |
| Adidas | Gazelle | 6 | 5 | **13** | 13 |
| New Balance | 2002R | 6 | 6 | **13** | 13 |
| Diesel | D-Strukt | 4 | 0 | **13** | 13 |
| Fred Perry | Harrington | 7 | 7 | **12** | 12 |
| Gucci | Ace | 4 | 3 | **12** | 12 |
| Adidas | Campus | 5 | 5 | **11** | 11 |
| Reebok | Club C 85 | 4 | 1 | **11** | 11 |
| Levi's | 501 | 6 | 6 | **10** | 10 |
| Balenciaga | Le Cagole | 7 | 4 | **10** | 10 |
| Adidas | Superstar | 5 | 5 | **10** | 10 |
| Gucci | Rhyton | 7 | 6 | **9** | 9 |
| Ralph Lauren | Classic Fit | 6 | 6 | **9** | 9 |
| Balenciaga | Hourglass | 5 | 4 | **8** | 8 |
| Stone Island | Garment Dyed | 6 | 6 | **8** | 8 |
| New Balance | 327 | 3 | 2 | **8** | 8 |
| *— threshold —* | | | | | |
| Nike | Air Max 95 | 6 | 6 | 7 | 7 |
| Levi's | 512 | 3 | 3 | 7 | 7 |
| Fred Perry | Laurel Wreath | 5 | 5 | 7 | 7 |
| Adidas | Spezial | 6 | 3 | 7 | 7 |
| Gucci | Dionysus | 4 | 4 | 7 | 7 |
| Stone Island | Marina | 3 | 2 | 7 | 7 |
| Patagonia | Baggies | 4 | 4 | 7 | 7 |
| New Balance | 550 | 3 | 3 | 6 | 6 |
| Jordan | Jordan 1 | 3 | 3 | 6 | 6 |
| Carhartt | Active Jacket | 4 | 4 | 6 | 6 |
| Nike | Dunk Low SB | 3 | 3 | 6 | 6 |
| Carhartt | Detroit Jacket | 3 | 4 | 6 | 6 |
| Nike | Air Force 1 Mid | 3 | 3 | 6 | 6 |
| Patagonia | Houdini | 5 | 3 | 5 | 5 |
| Adidas | Predator | 5 | 2 | 5 | 5 |
| The North Face | Nuptse | 3 | 3 | 5 | 5 |
| Puma | Speedcat OG | 5 | 2 | 5 | 5 |
| Jordan | Jordan 3 | 3 | 3 | 5 | 5 |
| Levi's | Trucker | 3 | 3 | 5 | 5 |
| Supreme | 6-Panel Cap | 4 | 4 | 4 | 4 |
| Balenciaga | Defender | 4 | 1 | 4 | 4 |
| Off-White | Out Of Office | 3 | 3 | 4 | 4 |
| The North Face | Denali | 4 | 2 | 4 | 4 |
| Diesel | Belther | 4 | 4 | 4 | 4 |
| Diesel | Krooley | 4 | 4 | 4 | 4 |
| Stone Island | Poly | 4 | 4 | 4 | 4 |
| Fred Perry | M3600 | 4 | 2 | 4 | 4 |
| Levi's | Engineered | 3 | 3 | 3 | 3 |
| Diesel | Zatiny | 3 | 3 | 3 | 3 |
| Reebok | Instapump Fury | 3 | 2 | 3 | 3 |
| Gucci | Soho Disco | 3 | 1 | 3 | 3 |
| Levi's | 501 Original | 3 | 2 | 3 | 3 |
| Adidas | Forum Low | 3 | 2 | 3 | 3 |
| Lacoste | Live | 3 | 2 | 3 | 3 |
| Ralph Lauren | Big Pony | 3 | 3 | 3 | 3 |
| Jordan | Jordan 1 Low | 3 | 3 | 3 | 3 |
| Off-White | Caravaggio | 3 | 2 | 3 | 3 |
| Nike | Cortez | 3 | 1 | 3 | 3 |

### 2.4 Why 14, 21, 30, 60 and 90 days are all the same number today — and will not be next week

```sql
SELECT MIN(sold_at), MAX(sold_at), COUNT(*) FROM listings WHERE sold_observed = 1;
-- '2026-08-21 00:15:15' | '2026-09-01 00:12:29' | 103890
```

**The observed-sales corpus is 11 days deep.** A "30-day window" today reaches back to
2026-08-02 and finds nothing before 2026-08-21. Every window ≥ 14 days is currently the *same*
11-day window. They diverge from **2026-09-04** (when 14 d starts biting) and 30 d does not become a
real 30-day window until **2026-09-20**.

Two consequences, and both are load-bearing:

1. **Pick 14, not 30.** Today they deliver the identical +19 pp. From 2026-09-04 the 30-day variant
   starts admitting comps up to 30 days old into a buy-below on a fast-moving resale market, and the
   14-day variant does not. Same gain now, half the future staleness. If a 30-day window is later
   shown to be safe, widening from 14 to 30 is another one-token change.
2. **Coverage will rise on its own between now and 2026-09-20 as the corpus deepens.** Any goal
   registered against `band_coverage` in this period must be pre-registered with a *calendar
   control*, or the verifier will score a HIT that the clock produced. State the expected drift in
   `GOALS.md` before the change ships.

### 2.5 What it does to the number the KPI card actually measures

Demand side. Every query string in `verdict_logs` replayed through the current matcher and board,
with `comparable_n` supplied by the recomputed 7-day and 30-day values:

```sql
-- the population, identical to sql/metrics/band_coverage.sql minus the date filter
SELECT COALESCE(q_norm, query) q FROM verdict_logs
 WHERE verdict IS NOT NULL AND verdict NOT IN ('LIMIT_REACHED','PENDING');
```

**Last 7 days — `n = 44` (2026-08-25 → 2026-09-01):**

| arm | band | thin | nomatch | `band_coverage` |
|---|---:|---:|---:|---:|
| **A — today: 7d window, threshold 8** | 19 | 10 | 15 | **43.2 %** |
| **B — 14/30d window, threshold 8** | 29 | 0 | 15 | **65.9 %** |
| C — 7d window, threshold 5 | 29 | 0 | 15 | 65.9 % |
| D — 7d window, threshold 6 | 28 | 1 | 15 | 63.6 % |
| E — 7d window, threshold 10 | 19 | 10 | 15 | 43.2 % |
| **CEILING — every matched query priced** | 29 | — | 15 | **65.9 %** |

**All time — `n = 180` (2026-08-12 → 2026-09-01):**

| arm | band | thin | nomatch | `band_coverage` |
|---|---:|---:|---:|---:|
| **A — today: 7d window, threshold 8** | 113 | 44 | 23 | **62.8 %** |
| **B — 14/30d window, threshold 8** | 146 | 11 | 23 | **81.1 %** ✅ |
| C — 7d window, threshold 5 | 144 | 13 | 23 | 80.0 % |
| D — 7d window, threshold 6 | 135 | 22 | 23 | 75.0 % |
| E — 7d window, threshold 10 | 100 | 57 | 23 | 55.6 % |
| F — 14/30d window, threshold 10 | 144 | 13 | 23 | 80.0 % |
| G — 14/30d window, threshold 12 | 135 | 22 | 23 | 75.0 % |
| **CEILING — every matched query priced** | 157 | — | 23 | **87.2 %** |

**Read the ceilings.** On the 7-day population, no window and no threshold can exceed **65.9 %**,
because 15 of 44 searches match nothing. On the all-time population the ceiling is **87.2 %**.
**The 80 % target is reachable only on a population like the all-time one, and only once the
matched-but-thin bucket is closed.** On last week's traffic mix it is not reachable at all by any
change described in this document.

---

## 3. Which models and queries users ask for that we cannot price — the catalog gap list

Every query string ever logged (`n = 360` rows, 151 distinct) replayed through the current matcher,
then bucketed by *why* it fails. `catalog_extract` is used to separate "we know this product but
have no board row" from "this product is not in our catalog at all".

```python
from engine.model_catalog import CATALOG, catalog_extract
hit, mr = match_verdict_signal(q, board)
if hit is not None:            cls = "BAND" if (hit["comparable_n"] or 0) >= 8 else "THIN"
elif mr == "model_too_vague":  cls = "VAGUE"
elif any(catalog_extract(q, b) for b in CATALOG):  cls = "CATALOG_NOT_ON_BOARD"
else:                          cls = "OUT_OF_CATALOG"
```

**Shares of all logged search volume, 2026-08-12 → 2026-09-01, n = 360:**

| bucket | n | share | what it is |
|---|---:|---:|---|
| `BAND` | 151 | 41.9 % | priced today |
| `THIN` | 57 | 15.8 % | tracked, `comparable_n < 8` — **corpus depth, §2 closes 29 of these 57** |
| `OUT_OF_CATALOG` | 86 | 23.9 % | brand or item not in CATALOG — **scope decision** |
| `VAGUE` | 37 | 10.3 % | brand-only / year-only — correct refusal |
| `CATALOG_NOT_ON_BOARD` | 29 | 8.1 % | in CATALOG, never reached `model_signals` |

### 3.1 The corpus-depth list — tracked, asked for, refused (n = 57 searches)

Ranked by demand. **✅ = crosses 8 under the widened window (§2.3).**

| searches | model | `comparable_n` today | after widening |
|---:|---|---:|---|
| 11 | Nike Tech Fleece | 7 | **14 ✅** |
| 7 | Jordan Jordan 1 | 3 | 6 |
| 5 | New Balance 550 | 3 | 6 |
| 5 | Levi's 501 | 6 | **10 ✅** |
| 4 | Adidas Gazelle | 6 | **13 ✅** |
| 4 | Adidas Spezial | 6 | 7 |
| 3 | Adidas Campus | 5 | **11 ✅** |
| 2 | Adidas Superstar | 5 | **10 ✅** |
| 2 | New Balance 2002R | 6 | **13 ✅** |
| 2 | New Balance 327 | 3 | **8 ✅** |
| 2 | Adidas Forum Low | 3 | 3 |
| 2 | Nike Air Max 95 | 6 | 7 |
| 2 | Nike Cortez | 3 | 3 |
| 2 | Gucci Dionysus | 4 | 7 |
| 2 | Off-White Out Of Office | 3 | 4 |
| 2 | The North Face Nuptse | 3 | 5 |

**29 of 57 thin searches (50.9 %) convert to a band from the one-token change. The residual 28 need
more observed sales, not a different constant.** The stubborn head of that residual is
**Jordan 1 (7 searches, `comparable_n` 3 at every window)** and **New Balance 550 (5 searches, 3 at
every window)** — two of the most-searched sneakers on the board, with essentially no observed
sales in the corpus.

### 3.2 The catalog-depth list — in CATALOG, no board row (n = 29 searches, 15 models)

| searches | model | `model_stats.sold_7d` | `sold_30d` | listings held | `sold_observed = 1` |
|---:|---|---:|---:|---:|---:|
| 2 | Adidas Stan Smith | 2 | 9 | 4 097 | 9 |
| 2 | Nike Air Max 90 | 2 | 11 | 3 070 | 15 |
| 2 | Nike Air Max 97 | 0 | 0 | 1 769 | 0 |
| 2 | Jordan 11 | 6 | 6 | 1 124 | 6 |
| 2 | New Balance 990 | 10 | 10 | 1 228 | 10 |
| 2 | New Balance 991 | 3 | 3 | 853 | 3 |
| 2 | New Balance 992 | 0 | 0 | 382 | 0 |
| 2 | Puma Suede | 0 | 1 | 2 627 | 1 |
| 2 | Puma Palermo | 0 | 0 | 2 590 | 0 |
| 2 | Carhartt WIP | 136 | 236 | 37 314 | 237 |
| 2 | Diesel Sleenker | 2 | 5 | 1 318 | 5 |
| 2 | Lacoste L.12.12 | 0 | 0 | 873 | 0 |
| 2 | Adidas Gazelle Indoor | 2 | 3 | 432 | 3 |
| 2 | Adidas Yeezy 350 | 0 | 0 | 214 | 0 |
| 1 | Reebok Nano | 4 | 5 | 935 | 5 |

**This is not a board-size cap.** Measured directly:

```
candidates after HAVING SUM(sold_7d) >= 3 and the junk filter : 152   (db/queries.py:1807)
 ... that would produce a board row (n_fenced >= 3 on 7d or 30d) : 108
 ... board actually written                                      : 100   (refresh_model_signals limit=100)
```

Raising `limit` from 100 adds exactly **8 models**, of which **1** (`Supreme Camp Cap`,
`n_fenced` 1 → 12) would be priceable. The other 44 candidates fail on comps, not on slots.
`Puma Palermo` has 2 590 listings and **zero** observed sales; `Lacoste L.12.12` has 873 and zero.
**Raising the board limit is not worth a PR.**

### 3.3 The scope list — not in CATALOG at all (n = 86 searches, 23.9 % of all volume)

Top of the list, by demand: `vinted` (3), `size 42` (3), `New Balance 1010` (2), `Nike Vomero` (2),
`Nike P-6000` (2), `Reebok Pump` (2), `Louis Vuitton Neverfull` (2), `Coach Tabby` (2),
`Longchamp Le Pliage` (2), `Stone Island Compass` (2), `Canada Goose Expedition` (2), `Crocs` (2),
`Birkenstock Arizona` (2), `iPhone 13` (2), `PlayStation 5` (2), `Zara jacket` (2), `H&M jeans` (2),
`nintendo` (2), `veronica beard scuba` (2), `frances valentine flats` (2),
`best sneakers to resell` (2), a pasted `https://www.vinted.co.uk/items/…` URL (2),
`acne studios …` (3 variants), `calvin klein plumas` / `plumon calvin klein negro` (Spanish
free-text), `zapatillas`, `vintage`, `UK 8`.

Three distinct things are inside this 23.9 %, and they have three different answers:

- **Adjacent models of brands we already carry** (`Nike Vomero`, `Nike P-6000`, `Reebok Pump`,
  `New Balance 1010`, `Stone Island Compass` — note `Stone Island Compass Badge` *is* on the board at
  `comparable_n = 14`, so this is a naming miss, not a data miss). Cheap catalog aliases.
- **Brands outside the 22** (Louis Vuitton, Coach, Longchamp, Canada Goose, Birkenstock, Crocs,
  Acne, Zara, H&M, Bape, Olow, Veronica Beard, Bogner). **Adding brands is an OS §0.9 prohibition
  ("never build: new marketplaces… more flip brands").** These stay refused. That is a deliberate
  scope choice and this document does not propose changing it.
- **Not products at all** (`vinted`, `size 42`, `UK 8`, `best sneakers to resell`, a pasted URL,
  `iPhone 13`, `PlayStation 5`). These should keep being refused. They are ~15 of the 86.

---

## 4. Is 8 the right threshold?

### 4.1 The distribution, and why its shape is an artefact

```sql
SELECT comparable_n, COUNT(*) FROM model_signals GROUP BY comparable_n ORDER BY comparable_n;
```

`n = 100` models, snapshot `2026-08-31 22:43:02`:

| `comparable_n` | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 17 | 19 | 20 | 23 | 25 | 26 | 28 | 30 | 39 | 41 | 65 | 77 | 174 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| models | **24** | 13 | 7 | 8 | 5 | 6 | 3 | 4 | 6 | 1 | 1 | 1 | 1 | 1 | 1 | 4 | 2 | 3 | 1 | 1 | 2 | 1 | 1 | 1 | 1 | 1 |

**Supply coverage at each candidate threshold, `n = 100`:**

| threshold | ≥ 3 | ≥ 4 | ≥ 5 | ≥ 6 | ≥ 7 | **≥ 8** | ≥ 10 | ≥ 12 | ≥ 15 | ≥ 20 | ≥ 30 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **7d window (today)** | 100 % | 76 % | 63 % | 56 % | 48 % | **43 %** | 34 % | 24 % | 21 % | 18 % | 7 % |
| **widened window** | — | — | 81 % | 75 % | 69 % | **62 %** | 57 % | 46 % | — | — | — |

The mode of the today-distribution is **3, with 24 of 100 models**, and the distribution is **left-
truncated at 3 by construction**: `db/queries.py:2058-2064` computes `avg_price` only when
`n_ok >= MIN_COMPARABLES` and then `continue`s, so a model with 0–2 comps is never written to
`model_signals` at all. **The pile at 3 is a boundary artefact of the admission gate, not a natural
mode of the data.** Any threshold argument built on "look how many models sit at 3–5" is reading the
gate, not the market.

### 4.2 The test that settles it: does coverage come from evidence, or instead of it?

`band_coverage` and `insufficient_data_rate` are **exact complements on the same window** —
`sql/metrics/band_coverage.sql` says so in its own header. One cannot police the other. The counter
that can is **the evidence behind a printed band**:

```python
# for each arm: over the answered population, collect comparable_n for every search
# that would receive a band, and describe that distribution
```

**All-time answered population, `n = 180`:**

| arm | bands printed | min `n` | p25 | **median `n` behind a band** | mean |
|---|---:|---:|---:|---:|---:|
| **A — today: 7d window, threshold 8** | 113 | 8 | — | **12** | — |
| **B — widened window, threshold 8** | **146** | 8 | — | **13** (corrected) | — |
| **C — 7d window, threshold 5** | 144 | **5** | — | UNKNOWN (unverified) | — |

> **Correction, 2026-09-01 (`data-scientist`, `docs/company/RELEASE-A13-GATE.md`):** this table
> originally read median `n` = **26** for arm B and **10** for arm C, with p25/mean columns derived
> from the same computation. **26 does not reproduce under any of seven re-measured population
> definitions.** Re-run against production on this section's own definition (demand-weighted, all
> answered searches, `n = 180`): arm A (before) = **12**, arm B (after) = **13**. Supply-weighted, the
> median **falls**, 14 → 12. p25 and mean are struck rather than corrected — they were not
> independently re-measured and should not be cited until they are. Arm C's "10" is likewise
> unverified and shown as UNKNOWN rather than repeated. **26 was also arithmetically unreachable**:
> the 22 models this widening admits have a median `comparable_n` of 10, and adding a 33-search
> population with median ≈10 to a 113-search population with median 12 cannot produce 26 — a
> widening that admits weaker-but-sufficient evidence pulls the median down, not up.

Arms B and C land one percentage point apart on `band_coverage` (81.1 % vs 80.0 %). The honest
comparison is not the retracted median, it is the floor each arm crosses on:

- **B prints 33 more bands by widening the window, not lowering the bar** — the models that cross do
  so because more of their existing sales history (30 days, not 7) becomes visible, e.g. a model
  sitting at 5 comps on the 7-day read clearing 11 on 30 days. The floor stays `≥ 8` throughout.
- **C prints 31 more bands by lowering the floor itself to 5 comps** — every extra band it prints is
  computed from as few as 5 comparables, weakening the promise on bands we were already printing
  correctly, not just the new ones.

### 4.3 The recommendation on the threshold, stated plainly

> **Do not lower `MIN_VERDICT_COMPARABLES` from 8. The distribution does not justify it.**
>
> The 57 models at 3–7 are not thin because the market is thin. They are thin because the pipeline
> is looking at 7 days when it already holds 11 (soon 30) days of the same comps in memory.
> `Carhartt Double Knee` reads 3 at 7 days and **19** at 30. `Diesel D-Strukt` reads **0** at 7 days
> and 13 at 30. `Nike Tech Fleece` — the single most-searched thin model, 11 searches — reads 7 and
> **14**. Lowering the bar to 5 would print a buy-below for `Adidas Superstar` off 5 sales when 10
> are sitting one branch away in the same function.
>
> The one case worth revisiting *later* is raising it. At the widened window, threshold 10 still
> delivers 80.0 % (`n = 180`) and threshold 12 delivers 75.0 %. Once the corpus is genuinely 30 days
> deep (2026-09-20), **8 may be too low, not too high.** That is a re-measurement to schedule, not a
> change to make now — and any move to the constant is a founder gate under OS §0.10, because
> `n ≥ 8` is the number in the North Star definition, on `/methodology`, and in the four extension
> panel states in OS §6.

---

## 5. RANKED INTERVENTIONS

Ranked by coverage gained per unit of cost and risk. Every gain is stated with its population.

---

### I-1 — Prefer the 7-day comps window only when it can already clear the verdict gate

**One token.** `demand-intel/db/queries.py:1986`:
`if (s7.get("n_fenced") or 0) >= MIN_COMPARABLES:` → `>= MIN_VERDICT_COMPARABLES`
plus widening `thirty_days_ago` for the *price* pool to 14 days (see risk below), and updating the
`price_window` label so the UI keeps telling the truth about which window it used.

**(a) Estimated coverage gain**
- supply `band_coverage_supply`: **43.0 % → 62.0 %**, +19.0 pp, `n = 100` models
- demand `band_coverage`, all-time answered: **62.8 % → 81.1 %**, +18.3 pp, `n = 180`
- demand `band_coverage`, last 7 days: **43.2 % → 65.9 %**, +22.7 pp, `n = 44` — **the 80 % target
  is not reachable on this window**, ceiling 65.9 %
- 19 of the 57 models at 3–7 cross; 29 of 57 thin searches convert
- counter (evidence behind a band): median `comparable_n` **12 → 13** — improves slightly
  (corrected 2026-09-01; an earlier reading of 12 → 26 does not reproduce under any of seven
  re-measured population definitions and was arithmetically unreachable — see §4.2)

**(b) Cost**
One line in one function, plus the label. No migration, no schema change, no new dependency, no
scraping change. The 30-day comps it consumes are already computed at `db/queries.py:1953-1982` and
currently discarded. Tests to add: the existing `tests/test_verdict_refuse.py` and
`tests/test_verdict_confidence.py` already pin the 8 boundary and must stay green; add one asserting
a model with `n_fenced` 5@7d / 11@30d is written at 11, and one asserting a model with
`n_fenced` 12@7d keeps the *7-day* prices (freshness must not regress for models that do not need
the fallback).

**(c) Risk — and this one is real and measurable**
Older comps mean staler prices. Measured, for the 24 models that cross:

| | median | max | > 10 % |
|---|---:|---:|---:|
| \|Δ buy_below\| between the 7d and 30d window, crossers, `n = 24` | **24.7 %** | 111.4 % | 19 of 24 |
| \|Δ mean sold price\| across all 100 board models, `n = 99` | 14.2 % | 340.5 % | 54 of 99 |

Worst individual movers: `Gucci Ace` €50.99 → €107.78 (+111 %), `Jordan 4` €35.86 → €71.61 (+100 %),
`Fred Perry Harrington` €19.84 → €38.06 (+92 %), `Balenciaga Le Cagole` €365.75 → €119.37 (−67 %).

**Which of the two numbers is closer to the true sold price is UNKNOWN and will stay UNKNOWN.**
`docs/audit/DATA.md` and `METRICS.md` §2e establish that no ground-truth sold price exists or can be
obtained, so MAPE is not computable and neither estimate can be validated. What *can* be said
without inventing anything: the 7-day figure for these 24 models is a mean of 0–7 observations and
the 30-day figure is a mean of 8–34; the second has strictly lower sampling variance. A 111 % swing
between a mean-of-3 and a mean-of-12 is far more likely to be the mean-of-3 being noise than the
market moving 111 % in four days. **That is an argument about variance, not about accuracy, and it
must not be presented as an accuracy claim.**

Three mitigations, all cheap:
1. **Widen to 14 days, not 30.** Identical +19 pp today (§2.4), half the future staleness exposure.
2. **Ship behind a flag and diff the board.** The full before/after `buy_below` table for all 100
   models is computable in one read-only pass — the script in §2.2 produces it.
3. **Surface the window.** `price_window` is already carried through `price_stats_map`; the panel
   should say "14-day comps" when it used them, per OS §6 ("`n` and dates visible").

**Rollback:** revert one token. No data migration; `model_signals` is rebuilt from scratch on the
next analyzer run.

---

### I-2 — Store `comparable_n` and the real `reason` on every verdict

**(a) Estimated coverage gain: 0 pp — and it should still ship first or alongside I-1.**
Without it, I-1 cannot be scored. §0.2 and §1.2 are the evidence: the metric that OS §3 puts a
target on cannot today tell a corpus failure from a matcher failure, and the per-search evidence
count is unrecoverable. §1.4 found nine searches logged as covered whose model now sits below the
threshold, and **whether they were covered honestly is UNKNOWN**.

**(b) Cost**
- `ALTER TABLE verdict_logs ADD COLUMN comparable_n INTEGER`, written at `api/routes.py:891`, where
  `n_comp = verdict_comparable_n(best_raw)` is already in a local variable.
- Give `resolve_anon_verdict` (`db/queries.py`) the `reason` and `q_norm` arguments
  `record_search_outcome` already has, and pass them at `api/routes.py:1061`. That single omission
  is why **52 of 52** `INSUFFICIENT_DATA` rows carry no reason and no normalised query.
- Tag or exclude probe traffic so `zzqqxx-not-a-real-thing` stops counting against a KPI (§0.1).

**(c) Risk**
Schema change on a live table → `pipeline_version` bump per AM-1. Nullable column, no backfill
possible (the values are gone). One PII check: `q_norm` is already stored, so no new class of data
enters the log.

---

### I-3 — Find out why `adidas samba` (n = 41) and `new balance 530` (n = 174) returned UNKNOWN

**(a) Estimated coverage gain: UNKNOWN, bounded at +4.5 pp on the 7-day window (2 of 44).**
Both were logged `UNKNOWN` / `unknown` at **`2026-08-31 13:51:20`** — the same second, from
`ip_hash 12ca17b49af22894`. Both replay today as a clean `BAND` off the deepest two rows on the
board. These are our two flagship models; `Adidas Samba` is 14 searches all-time and
`New Balance 530` is 5.

**The cause is UNKNOWN.** Two hypotheses, neither proven:
1. **Empty board at match time.** `refresh_model_signals` does `DELETE FROM model_signals` then
   `executemany(INSERT…)` (`db/queries.py:2174-2186`). It is one transaction under `DB_WRITE_LOCK`
   and `journal_mode = wal` (measured), so a concurrent reader *should* see the pre-delete snapshot
   — but `_ensure_model_signal_price_cols` runs DDL inside the same block, and DDL can commit an
   open transaction. If the board was momentarily empty, every query in that instant returns
   `UNKNOWN`, which fits two different queries failing in the same second.
2. **The board did not contain those rows at 13:51.** Also fits, and is benign.

**(b) Cost of finding out:** log `len(signals)` alongside each verdict (one integer, same column
family as I-2). Hypothesis 1 then becomes falsifiable in a day. Do not attempt a fix before the
instrument exists — a rewrite of the rebuild transaction is not a one-line change and would be
scoped on a guess.

**(c) Risk:** none for the instrument. Any change to the rebuild transaction is a real concurrency
change on the hot path and needs an ADR.

---

### I-4 — Catalog aliases for models we already price under another name

**(a) Estimated coverage gain: ≤ +2 pp, `n = 360`.** `Stone Island Compass` (2 searches) is refused
while `Stone Island Compass Badge` sits on the board at `comparable_n = 14`. Similar candidates:
`Nike Air Force` → `Nike Air Force 1`, `Adidas Forum` → `Adidas Forum Low` (already matches),
`Carhartt WIP Detroit` → `Carhartt Detroit Jacket`. Note the matcher already handles a good deal of
this: `sambas`, `adiddas samba`, `new ballance 530`, `af1`, `nb 530 grey`, `air max 1 '87` and
`nike dunk panda` all resolve correctly today.

**(b) Cost:** entries in `engine/model_catalog.py`. Each alias needs a test, because an alias is a
match-precision risk, and `match_precision ≥ 90 %` is this role's primary KPI.

**(c) Risk:** **this is the one intervention that can lower `match_precision` while raising
`band_coverage`.** An alias that walks `Nike Air Force` onto `Air Force 1` is fine; one that walks
`New Balance 2015` onto `530` is the exact bug `match_verdict_signal`'s closed-tree comment says was
already fixed once. Cap this at aliases where the target is a strict superstring of the query, and
require the `/precision` 30-sample audit before and after.

---

### I-5 — Label `model` on observed sales. The ceiling on everything above.

**(a) Estimated coverage gain: not directly estimable — but this is the constraint every other item
is working around.**

```sql
SELECT COUNT(*) FROM listings;                                                    -- 12 695 097
SELECT COUNT(*) FROM listings WHERE model IS NOT NULL AND model != '';            --    861 792
SELECT COUNT(*) FROM listings WHERE sold_observed = 1;                            --    103 993
SELECT COUNT(*) FROM listings WHERE sold_observed = 1
                                AND model IS NOT NULL AND model != '';            --      7 247
```

> **Only 7 247 of 103 993 observed sales — 7.0 % — carry a model label.**
> **96 746 real observed sales are invisible to every comps count in this document.**
> 11 833 305 of 12 695 097 listings (93.2 %) have a brand and no model.

This is why `Puma Palermo` has 2 590 listings and zero usable comps, why `Jordan 1` sits at
`comparable_n = 3` at every window despite being one of the most-searched shoes on the board, and
why widening the window helps 19 models rather than 57. **A model-label rate moving from 7 % to
14 % would do more for coverage than every constant in this file combined, and it is the only
intervention here whose ceiling is not 87.2 %.**

**(b) Cost:** genuinely large, genuinely unscoped, and **owned by `data-eng`, not this role**. It is
a labelling/extraction problem over 11.8 M rows, not a query change.

**(c) Risk:** a label is a match, so every point of label rate is a point of `match_precision`
exposure. Any labelling push must ship with the 30-sample audit running before and after, or it will
buy coverage with precision — the same trade §4.2 rejects, one layer down.

**Recommendation:** do not start this now. Ship I-1 and I-2, then bring a scoped proposal with a
measured precision baseline. Recorded here because a coverage document that stopped at the
constants would be hiding the actual ceiling.

---

### Explicitly NOT recommended

**Lowering `MIN_VERDICT_COMPARABLES` from 8 to 5 or 6.** It reaches 80.0 % on `n = 180` — one point
below I-1 — and it gets there by dropping the floor itself from 8 to 5, printing prices off as few
as 5 comparables (the "median evidence 12 → 10" figure previously cited here was not independently
re-verified when the paired "12 → 26" claim for I-1 was struck 2026-09-01 and should not be cited
until it is — see §4.2). §4.1 shows the pile of models at 3–5 is a left-truncation artefact of the
`MIN_COMPARABLES = 3` admission gate, and §2.3 shows those same models carry 8–19 comps once the
right window is used. **The distribution does not justify it.** It is also a founder gate (OS §0.10,
"KPI definition change") because `n ≥ 8` is written into the North Star, `/methodology` and the four
extension panel states.

**Raising the `model_signals` board limit above 100.** Measured: adds 8 models, 1 priceable (§3.2).

**Adding brands (Louis Vuitton, Coach, Birkenstock, Zara, Bape…) to close the 23.9 %
`OUT_OF_CATALOG` bucket.** OS §0.9 forbids it. Recorded as demand evidence, not as a proposal.

---

## 6. What is UNKNOWN, and what would be needed

| Question | Status | What would be needed |
|---|---|---|
| Is the 7-day or the widened-window `buy_below` closer to the true sold price? | **UNKNOWN, permanently** | A ground-truth sold price. `DATA.md` and `METRICS.md` §2e establish none exists or can be obtained. MAPE is not computable and must never be reported. |
| What was `comparable_n` when each historical search was answered? | **UNKNOWN, unrecoverable** | `verdict_logs.comparable_n` (I-2). Until then every replay in this file is a counterfactual, not a re-run. |
| Were the 9 `Nike Tech Fleece` `WATCH`es honest at answer time? | **UNKNOWN** | Same column. |
| Why did `adidas samba` and `new balance 530` return UNKNOWN at `2026-08-31 13:51:20`? | **UNKNOWN** | Board size logged per verdict (I-3). |
| What is the *true* `band_coverage` for real users? | **UNKNOWN** | Probe traffic is not tagged; ≥ 4 of 44 rows in the KPI window are ours (§0.1). |
| Does I-1 move `match_precision`? | **Should not — it changes no matching logic** — but not proven | `/precision` 30-sample audit before and after. That command does not exist yet (`METRICS.md` §2a, `GAPS.md` B8). |
| What does `band_coverage` do between now and 2026-09-20 with no change at all? | **UNKNOWN** | The corpus deepens from 11 to 30 days on its own (§2.4). Any goal registered in this period needs a calendar control or the verifier will score a HIT the clock produced. |

---

## 7. How to re-run everything in this file

Every table came from a Python snippet executed read-only inside the production backend container,
by the same route `scripts/company/build_dashboard.py` uses:

```bash
C=$(ssh -o BatchMode=yes resaleiq \
      'docker ps --format "{{.Names}}" | grep ph5clxk9hmghspv65pdkvak9 | head -1')
ssh -o BatchMode=yes resaleiq "docker exec -i $C python3 -" < query.py
```

Every snippet opens `sqlite3.connect("file:/app/data/demand_intel.db?mode=ro", uri=True)`. No write
was issued. The counterfactuals import `engine.listing_identity` and `engine.metrics` from `/app`
rather than reimplementing the filters, which is why the reproduction control in §2.2 lands at
90/100 exact and reproduces `band_coverage_supply` = 43.0 % to the decimal.

**If any of these becomes a goal, the queries move into `sql/metrics/` or a `proof.sh` under
`docs/audit/proof/` first.** Nothing in this document is a KPI yet, and per OS §0 rule 2 the numbers
here are audit findings carrying their own `n`, dates and query — not metrics.

---

## Appendix — the raw `comparable_n` ≥ 8 board, for reference

`n = 43` models, snapshot `2026-08-31 22:43:02`. `SELECT brand, model, comparable_n, sold_30d FROM
model_signals WHERE comparable_n >= 8 ORDER BY comparable_n DESC;`

| `n` | model | `sold_30d` | | `n` | model | `sold_30d` |
|--:|---|--:|---|--:|---|--:|
| 174 | New Balance 530 | 1192 | | 15 | Gucci Ophidia | 81 |
| 77 | Balenciaga Track | 491 | | 14 | Stone Island Compass Badge | 53 |
| 65 | New Balance 9060 | 305 | | 13 | Diesel Larkee | 17 |
| 41 | Adidas Samba | 124 | | 12 | Gucci Jackie | 66 |
| 39 | Balenciaga Runner | 240 | | 11 | Nike Air Force 1 | 164 |
| 30 | Balenciaga Triple S | 160 | | 11 | Supreme Box Logo | 107 |
| 30 | Patagonia Better Sweater | 106 | | 11 | Nike Dunk | 41 |
| 28 | Patagonia Synchilla | 117 | | 11 | Patagonia R1 | 65 |
| 26 | Patagonia Refugio | 164 | | 11 | Patagonia Torrentshell | 60 |
| 25 | Off-White Arrows | 122 | | 11 | Patagonia Nano Puff | 29 |
| 25 | Patagonia Black Hole | 150 | | 10 | New Balance 1906R | 42 |
| 25 | Balenciaga Speed Trainer | 88 | | 10 | Adidas Samba OG | 40 |
| 23 | Balenciaga City Bag | 155 | | 10 | Nike Air Force 1 Low | 35 |
| 23 | Balenciaga Arena | 125 | | 10 | Jordan 4 | 31 |
| 20 | Puma Speedcat | 122 | | 9 | New Balance 740 | 41 |
| 20 | Adidas Campus 00s | 106 | | 9 | New Balance 574 | 42 |
| 20 | Fred Perry Twin Tipped | 74 | | 9 | Patagonia Snap-T | 17 |
| 20 | Gucci Horsebit | 63 | | 8 | Gucci GG Marmont | 59 |
| 19 | Patagonia Capilene | 83 | | 8 | Nike Dunk Low | 56 |
| 17 | Patagonia Retro-X | 81 | | 8 | Adidas Handball Spezial | 47 |
| | | | | 8 | Reebok Club C | 34 |
| | | | | 8 | Nike Air Max 1 | 23 |
| | | | | 8 | Diesel Safado | 10 |
