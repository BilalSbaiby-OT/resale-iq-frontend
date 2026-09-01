# JOINT RELEASE MEASUREMENT — A13 × `gate-paid-surfaces`

**Written** 2026-09-01 by `data-scientist`. **Read-only.** No code changed, no branch, no PR.
`.claude/LOCK` names this task (`data-scientist (A13+gate joint release measurement)`).

**Proof:** `docs/audit/proof/W36/a13-gate-joint/proof.sh` — runs cold, asserts three invariants,
re-runs both measurements against production. Raw result frozen alongside it as
`result-supply-2026-09-01T0847Z.json` (all 100 rows, both arms).

---

## 0. FIRST, THE DATABASE YOU GAVE ME CANNOT ANSWER THESE QUESTIONS

You pointed me at `/Users/bilalsbaiby/work/demand-intel/demand_intel.db`. **Nothing in this report
comes from it, because nothing can.** Three checks, each a one-liner, each fatal:

```sql
-- 1. the column the entire gate depends on does not exist here
PRAGMA table_info(model_signals);
-- 20 columns: id..size_velocity. NO comparable_n. NO size_buy_below.
-- db/schema.py:971 adds it by migration; this file has never been migrated.

-- 2. the board is a nine-day-old single snapshot
SELECT COUNT(*), MIN(updated_at), MAX(updated_at) FROM model_signals;
-- 100 | 2026-08-23 15:46:37 | 2026-08-23 15:46:37

-- 3. THE COMPARABLE CORPUS IS EMPTY. This is the one that ends it.
SELECT COUNT(*) AS rows_with_sold_at, SUM(sold_observed) AS sold_observed_1
  FROM listings WHERE sold_at IS NOT NULL;
-- 24114777 | 0        <- 24.1M rows carry a sold_at, and NOT ONE has sold_observed = 1.
--                        Full table, all time. Not a windowing artefact.
SELECT MAX(sold_at) FROM listings;  -- 2026-08-23 15:37:49  (production: 2026-09-01 08:47:08)
```

`refresh_model_signals` builds every comparable from `WHERE ... sold_observed = 1`
(`db/queries.py:1944`). **This file has no such row in any window A13 touches.** Both arms of the
counterfactual would return zero comparables for all 100 models, and the "measurement" would be a
tautology that happened to run without error. `verdict_logs` here holds **26 rows** ending
2026-08-19; production holds 360 ending 2026-08-31.

**The missing column is `model_signals.comparable_n`. The missing rows are `listings.sold_observed
= 1` after 2026-08-15.** This local file is a stale dev copy, not production.

**What I did instead.** Every number below was measured against **production**,
`/app/data/demand_intel.db`, opened `mode=ro` inside the backend container over the same
`ssh + docker exec` path `scripts/company/build_dashboard.py:ssh_py` uses — the same path
`COVERAGE.md` used, so this report and that one are comparable. Nothing was written. The scripts
reuse the application's own `is_comparable_sold`, `comparable_fingerprint`, `expected_category` and
`summarise_sold_prices`, so the counterfactual cannot drift from the pipeline.

**Window and anchor for every number in this file:**

| | |
|---|---|
| database | production `/app/data/demand_intel.db`, `mode=ro` |
| clock | `SELECT datetime('now')` on production = **2026-09-01 08:47:12 UTC** |
| board snapshot | `MAX(model_signals.updated_at)` = **2026-09-01 07:51:40**, **n = 100 models** |
| 7-day window | 2026-08-25 07:51:40 → 2026-09-01 07:51:40 |
| 30-day window | 2026-08-02 07:51:40 → 2026-09-01 07:51:40 |
| `sold_observed` corpus | 2026-08-21 00:15:15 → 2026-09-01 08:47:08, **n = 106,489** — **11 days deep** |
| deployed build | post-C5 (`verdict_allows_buy_below({})` is `False`); 0 divergences between the arithmetic gate and the deployed function across all 100 models |
| demand replay | `verdict_logs` **2026-08-12 10:07:33 → 2026-08-31 21:06:57**, **n = 360 rows, 180 answered** |

### 0.1 The reproduction control has degraded and that bounds everything below

`COVERAGE.md` §2.2 recorded the BEFORE arm reproducing the stored board **90/100 exactly**.
**Today it reproduces 64/100 exactly, 79/100 within ±1.** The drift is one-directional — 33 models
recompute **higher** than stored, only 2 lower — which is the corpus deepening in the 56 minutes
between the board snapshot (07:51:40) and the read (08:47:12), compounded by C14 (`sold_at` is
stamped at labelling time, so rows land with backdated `sold_at`).

Consequence, stated plainly: **the BEFORE arm slightly over-states today's board, which
*understates* A13's gain.** Where a figure is sensitive to that, I give both arms. Where a single
model failed the control, I name it. `proof.sh` prints this control on every run and the header
says to re-measure rather than reconcile if it falls below ~60/100.

---

## Q1 — THE COMPOSED EFFECT

### Your framing is circular, and that matters more than the answer

You asked: *"Of the ~23 models whose buy-below moves under A13, how many are inside the gate's
withheld set?"*

**Zero, by construction — because the 23 was already defined as the non-withheld complement.**
`APPROVALS.md` line 1609 reads: *"18 of the 41 are suppressed by the gate, but the other 23 cross 8
and publish their swing anyway."* The 23 is the survivors. Asking how many survivors are withheld
can only ever return 0, and a 0 would look like reassurance.

**The question that is not circular is: is the 41 / 18 / 23 split right?** That is what I measured.

### The answer

| | n | source |
|---|---:|---|
| board models whose `max_buy_price` changes under A13 | **41** / 100 | recomputed both arms, one fixed board |
| — of which **WITHHELD** by the `n ≥ 8` floor (never publish the move) | **19** | `comparable_n` after A13 is 3–7 |
| — of which **CUSTOMER-VISIBLE** (still show a moving price) | **22** | `comparable_n` after A13 is ≥ 8 |

**The record says 18 withheld / 23 visible. Measured now: 19 / 22.** One model crossed back. That
is a one-model rebuild drift on a metric already known to move ±3 pp with no code change, not an
error in the earlier work — but **it is exactly why the release note must not carry a number
someone read yesterday.**

**The correct release-note sentence is about 22 models, not 41 and not 23.** A withheld model does
not have a moving price; it has no price. Every one of the 19 withheld sits at `comparable_n` 3–7
after A13, so the combined release silences them and their swings never reach a paid surface.

The 19 withheld movers, with the swing a customer will now never see:

| brand | model | `n` after | before | after | move |
|---|---|---:|---:|---:|---:|
| Stone Island | Marina | 7 | €52.53 | €322.24 | **+513.4 %** |
| Levi's | Trucker | 5 | €4.65 | €12.10 | **+160.2 %** |
| Adidas | Stan Smith | 5 | €39.90 | €51.74 | +29.7 % |
| Carhartt | Active Jacket | 6 | €32.25 | €42.01 | +30.3 % |
| Patagonia | Houdini | 5 | €17.95 | €22.48 | +25.2 % |
| Patagonia | Baggies | 7 | €17.12 | €19.95 | +16.5 % |
| Off-White | Out Of Office | 4 | €26.60 | €30.76 | +15.6 % |
| Fred Perry | Laurel Wreath | 7 | €15.43 | €17.67 | +14.5 % |
| Nike | Air Force 1 Mid | 6 | €83.12 | €88.11 | +6.0 % |
| Adidas | Spezial | 7 | €39.68 | €41.89 | +5.6 % |
| The North Face | Nuptse | 5 | €62.96 | €64.77 | +2.9 % |
| Nike | Air Max 95 | 7 | €46.88 | €48.17 | +2.8 % |
| Gucci | Dionysus | 7 | €325.68 | €318.63 | −2.2 % |
| Jordan | Jordan 3 | 6 | €85.45 | €80.25 | −6.1 % |
| Carhartt | Detroit Jacket | 6 | €49.36 | €46.21 | −6.4 % |
| Nike | Dunk Low SB | 6 | €129.01 | €110.39 | −14.4 % |
| Adidas | Predator | 6 | €97.31 | €83.01 | −14.7 % |
| Jordan | Jordan 1 | 6 | €40.35 | €32.14 | −20.4 % |
| Jordan | Jordan 1 Low | 3 | €129.46 | €78.47 | **−39.4 %** |

`Stone Island Marina` is in the reproduction-control failure set (stored `comparable_n` 7, recomputed
BEFORE 3) — treat +513 % as **unverified**. It is withheld either way, so it never reaches a
customer or a release note.

---

## Q2 — `Levi's Trucker`: **CONFIRMED WITHHELD.** It comes out of the headline.

```
brand=Levi's  model=Trucker
  stored on the board right now : comparable_n = 3, max_buy_price = €4.65
  BEFORE (main, 7d window)      : comparable_n = 3, avg → max_buy_price = €4.65
  AFTER  (A13, 30d window)      : comparable_n = 5, avg → max_buy_price = €12.10
  move                          : +160.22 %  (+€7.45)
  n ≥ 8 floor                   : 5 < 8  →  WITHHELD
```

**5 < 8, so `gate-paid-surfaces` withholds it, and it must not appear in the move distribution.**
Your recollection of "5 comparables" is the **post-A13** value; the board stores 3 today. Both are
below the floor, so the conclusion holds under either reading.

**One correction to your premise:** it is **not** the largest single move. `Stone Island Marina` at
+513.4 % is larger, and is also withheld. Both are on the withheld side, so removing them is not a
judgement call about outliers — it is a consequence of the gate, which is the cleaner argument.

**This is also the A17 argument reconfirmed with numbers.** If the gate shipped *after* A13, that
+160.2 % would publish to paying users on Deal Finder, the watchlist, the brand pages and the
`&price_to=` sourcing link (C11: those four surfaces have zero `comparable_n` checks), and then be
withdrawn. Shipping both together means it never publishes. **One release remains correct.**

---

## Q3 — THE REAL MEDIAN. **It is not +20.3 %. It is not even positive.**

**Population: the 22 models that move AND survive the gate. n = 22. Board 2026-09-01 07:51:40.**

| statistic | value |
|---|---|
| **n** | **22** |
| **median move** | **−3.04 %** |
| IQR (p25 → p75) | **−21.11 % → +17.64 %** |
| range | −65.76 % → +91.83 % |
| median absolute delta | **€8.01** |
| direction | **11 down, 11 up** |
| median of the 11 that fall | −21.74 % (median €8.56) |
| median of the 11 that rise | +17.71 % (median €7.94) |
| *(for contrast)* median over all 41 movers incl. withheld | +3.46 % |

### Sensitivity — and the honest reading is "indistinguishable from zero"

At n = 22 the median is not stable to arm choice. I ran three:

| arm | n | median | IQR |
|---|---:|---:|---|
| recomputed BEFORE vs recomputed AFTER (headline) | 22 | **−3.04 %** | −21.11 % → +17.64 % |
| drop the one reproduction-control failure (`Balenciaga Le Cagole`) | 21 | **+3.46 %** | −19.21 % → +17.71 % |
| STORED board (what a customer sees today) vs AFTER | 22 | **−3.67 %** | −21.90 % → +18.96 % |

**The median flips sign on a single model.** What does *not* move across arms is the shape: the
distribution straddles zero, roughly half the moves are downward, and the IQR is about ±20 %.

> **The sentence the release note gets:**
> *"22 of 100 tracked models change their buy-below and remain visible. The change is two-sided —
> 11 up, 11 down — with a median near zero (−3 %) and half of all moves between −21 % and +18 %.
> The largest visible rise is Fred Perry Harrington +91.8 % (`n` 7→12); the largest visible fall is
> Balenciaga Le Cagole −65.8 % (`n` 7→10). A further 19 models also move but are withheld by the
> `n ≥ 8` evidence floor and never publish their swing."*

**"23 models' buy-below moves, median 20.3 %" is wrong three ways**: 23 → 22, and +20.3 % → −3 %,
and it omits that half the moves are downward. I cannot recover how +20.3 % was produced; the
nearest arm I can construct (median of the 11 *rising* visible movers) reads +17.7 %, which suggests
the original may have taken the median of absolute or of upward moves only. **I am not asserting
that — I am saying it does not reproduce, and it must not ship.**

### The finding you did not ask for and should lead the release note with

**Eleven of the 22 visible corrections are DOWNWARD, median −21.7 %.** The 7-day window was pricing
those models **too high**. A reseller acting on Deal Finder or a watchlist alert for `Adidas
Gazelle` was told €53.98 was worth paying; on the wider evidence it is €36.04. `Balenciaga Le
Cagole`: €348.65 → €119.37.

**A13 is not a coverage fix that happens to move prices. It is a price correction that also raises
coverage, and about half of its corrections tell customers they have been overpaying.** That is
harder to write and it is the truthful framing. The 22, sorted:

| brand | model | `n` before → after | before | after | move |
|---|---|---|---:|---:|---:|
| Balenciaga | Le Cagole | 7 → 10 | €348.65 | €119.37 | −65.8 % |
| Stone Island | Ghost | 6 → 16 | €101.96 | €67.83 | −33.5 % |
| Adidas | Gazelle | 6 → 13 | €53.98 | €36.04 | −33.2 % |
| Nike | Dunk Low | 6 → 13 | €99.75 | €67.01 | −32.8 % |
| Levi's | 501 | 6 → 10 | €16.62 | €12.83 | −22.8 % |
| Adidas | Superstar | 6 → 10 | €32.25 | €25.24 | −21.7 % |
| Jordan | Jordan 1 Mid | 4 → 8 | €44.55 | €35.99 | −19.2 % |
| New Balance | 2002R | 7 → 14 | €29.45 | €24.32 | −17.4 % |
| Levi's | 512 | 6 → 10 | €12.63 | €10.51 | −16.8 % |
| Carhartt | Double Knee | 3 → 19 | €19.95 | €16.76 | −16.0 % |
| Gucci | Bamboo | 7 → 14 | €243.58 | €220.35 | −9.5 % |
| Adidas | Campus | 5 → 11 | €11.57 | €11.97 | +3.5 % |
| Gucci | Rhyton | 6 → 9 | €156.83 | €164.77 | +5.1 % |
| Gucci | Ace | 6 → 13 | €108.61 | €115.86 | +6.7 % |
| New Balance | 550 | 7 → 9 | €25.22 | €28.48 | +12.9 % |
| Nike | Air Max 1 | 6 → 10 | €46.33 | €54.40 | +17.4 % |
| Balenciaga | Hourglass | 4 → 8 | €319.20 | €375.72 | +17.7 % |
| Stone Island | Garment Dyed | 6 → 8 | €61.51 | €72.73 | +18.2 % |
| Nike | Tech Fleece | 7 → 14 | €18.33 | €21.85 | +19.2 % |
| New Balance | 327 | 3 → 9 | €16.84 | €20.54 | +22.0 % |
| Ralph Lauren | Classic Fit | 6 → 9 | €19.40 | €29.55 | +52.3 % |
| Fred Perry | Harrington | 7 → 12 | €19.84 | €38.06 | +91.8 % |

---

## Q4 — TOTAL BOARD IMPACT

**Supply side, `n = 100` board models, snapshot 2026-09-01 07:51:40:**

| arm | rows showing `max_buy_price` | blank |
|---|---:|---:|
| today, as stored (`comparable_n ≥ 8`) | **37** | **63** |
| BEFORE arm recomputed, gated | 41 | 59 |
| **AFTER BOTH CHANGES** | **63 / 100** | **37 / 100** |

> **Post-both-changes: 63 % of `model_signals` rows still show a `max_buy_price`. 37 % go blank.**

**Your "57 %" was wrong and the ~37 % you were told is confirmed.** Supply coverage
(`comparable_n ≥ 8`) reads 41 → 63 on my recomputed arms, against the 43 → 62 recorded eight hours
ago; both give the same 37 % blank to the nearest point.

**Three caveats that must travel with the 37 %, or it will be misquoted the way 57 % was:**

1. **`n = 100` is the whole board, but it is exactly at your own reporting floor** and it is a
   supply-side proportion with a **measured ±3 pp of rebuild noise** (43.0 → 40.0 with no code
   change, `APPROVALS.md`). Brief it as **"~37 %, ±3 pp, board of 100, measured 2026-09-01 08:47
   UTC"** — never as a fixed property.
2. **It drifts upward on its own until ~2026-09-20.** The `sold_observed` corpus is 11 days deep,
   so every window ≥ 14 days is currently the same window. The blank fraction will fall without
   anyone shipping anything.
3. **It is not what a customer experiences**, which is the next section and is the more important
   number.

### The number that should actually go in the release note: the demand-weighted answer

The board is not experienced uniformly — searches concentrate on well-evidenced models. Replaying
**every answered search in `verdict_logs`** (n = 180 all-time, 2026-08-12 → 2026-08-31) through the
live matcher against the same 100-model board:

| | today (stored board, no gate on paid surfaces) | after both changes |
|---|---:|---:|
| search gets a **priced band** | 113 / 180 (62.8 %) | **146 / 180 (81.1 %)** |
| search matches a model but is **too thin** to price | 44 | **11** |
| search **matches nothing** (out of scope, probes, brand-only) | 23 | 23 |

Restricted to the 157 searches that match a board model at all: **113 → 146 banded (72.0 % →
93.0 %)**.

> **The paid surfaces do not go 37 % blank. They lose a price on 11 of 157 matched searches
> (7.0 %) and gain a properly-evidenced price on 33 more.** Net, a customer sees **more** priced
> answers after this release, not fewer — 146 against 157 unevidenced ones today, of which 44 were
> below the floor.

This reproduces `COVERAGE.md`'s 62.8 % → 81.1 % exactly, independently, which is the strongest
replication in this report.

**Do not quote the 7-day arm.** It reads 19/44 → 29/44 (43.2 % → 65.9 %), and **n = 44 is below
your own 100 floor — it is UNKNOWN as a rate.** It is also 5 IP hashes with at least 4 rows of our
own probe traffic (`COVERAGE.md` §0.1).

---

## THE COUNTER-KPI. Both arms hold.

Against my KPI card's corrected counter, on this frozen snapshot:

| counter | before | after | verdict |
|---|---:|---:|---|
| `MIN(comparable_n)` over banded rows **== 8** | 8 | 8 | **PASS** |
| no model's `comparable_n` may **decrease** | — | **0 models decrease** | **PASS** |

Asserted in `proof.sh`, so a regression fails the proof rather than a reading. Both are proof-time
assertions on one snapshot, not live monitors — `comparable_n` decreases on its own between analyzer
rebuilds, which is why the "must not decrease" form is only valid frozen.

---

## AN UNASKED FINDING THAT AFFECTS THE RELEASE NOTE: **"median evidence 12 → 26" DOES NOT REPRODUCE**

This claim is the sole stated justification for choosing A13 over cutting the threshold to 5. It is
written into the **shipped branch's code comment** (`db/queries.py` on
`claude/data-scientist/a13-comparable-window`: *"median comparable_n behind a printed band goes
12 -> 26"*), into `COVERAGE.md`'s opening paragraph, and into `APPROVALS.md`.

I could not reproduce 26 under **any** of seven population definitions:

| definition of "median evidence behind a printed band" | before | after |
|---|---:|---:|
| **demand-weighted, all answered searches, n = 180** *(matches the documented definition)* | **12** | **13** |
| demand-weighted, last 7 days (n = 44 — below floor, shown for shape only) | 24 | **14** |
| supply-weighted, selected-window `n` over banded models | 14 | **12** |
| supply-weighted, 30-day `n` over the after-banded set | — | 15 |
| supply-weighted, 30-day `n` over all 100 | — | 10.5 |
| supply-weighted, 7-day `n` over the before-banded set | 14 | — |
| newly-banded models only (the 22 A13 admits) | — | 10 |

**And 26 is not merely unreproduced, it is arithmetically unreachable.** A13 can only *add* models
whose evidence is at or just above 8 — the 22 it admits have a median `comparable_n` of **10**.
Adding 33 searches with median ≈ 10 to 113 searches with median 12 cannot produce a median of 26.
A widening that admits weaker-but-sufficient evidence **pulls the median down**, and that is what
three of the seven arms show.

**This is my KPI card being right and the code comment being wrong.** The card already says:
*"`band_evidence_p50` is a descriptive statistic, NOT a gate — it falls under an honest widening,
which is why it must never score one."* It does fall. A13 is still the right change and cutting the
threshold to 5 is still wrong — but **the reason is the floor, not the median.** Cutting the
threshold to 5 publishes prices computed from 5 comparables; A13 publishes prices computed from ≥ 8.
That argument survives without 12 → 26, and it should be the one used.

- [ ] **Owed:** the code comment on the A13 branch must be corrected before merge, and the claim
      struck from `COVERAGE.md` and `APPROVALS.md`. A justification that does not reproduce is worse
      than no justification, because it will be cited.
- [ ] **`band_evidence_p50` must not be registered as A13's counter.** It was proposed as one
      (`APPROVALS.md` A8-3). On this measurement it would score the honest change a MISS. The
      corrected counters (`MIN(comparable_n) == 8`, no `comparable_n` decrease) are the right pair
      and both pass.

---

## WHAT IS UNKNOWN, AND WHAT WOULD CLOSE IT

| question | status | what would close it |
|---|---|---|
| What `comparable_n` was actually attached to a historical search | **UNKNOWN, unrecoverable.** `verdict_logs` has no `comparable_n` column; `model_signals` is `DELETE`-then-`INSERT` with no history | **`verdict_logs.comparable_n INTEGER`**, written where `api/routes.py:891` already computes `n_comp`. This is this week's goal and it turns every replay in this file from a counterfactual into a re-run |
| Whether the 22/19 split is stable across rebuilds | **UNKNOWN.** My two readings were 81 s apart on the same board snapshot — that is a determinism check, not a volatility band | Re-run `proof.sh` after the next analyzer rebuild, and again tomorrow. Three readings before any number is frozen into a release note |
| Whether the buy-below is *correct* at any `n` | **UNKNOWN and out of reach.** `price_eur` is the asking price at shelf departure, not a sold price (`DATA.md` §859). **MAPE is not computable.** A13 changes which asking prices are averaged; it cannot make the average a sale price | A ground-truth sold price. Nothing in flight provides one. This is A16 |
| Whether the `0.70` in `avg × 0.95 × 0.70` is margin or a silent asking-vs-sold correction | **UNKNOWN** (C12) | Decomposition. Until then every percentage in this file is a change in a number whose *level* is unvalidated — the deltas are sound, the absolute euros are not |
| `match_precision` (my primary KPI) | **UNKNOWN** — no `match_audit` table, no `/precision` command | Both, before it can be reported at all |

**The last two are the load-bearing caveat on this whole document.** Every delta here is a
faithful reading of what the code will do. **None of it establishes that the resulting buy-below is
right**, because no ground-truth sold price exists. The release note may say the number *changed*
and by how much. It may not say the new number is *more accurate* — only that it rests on more
comparables, which is a different and weaker claim.

---

## RECOMMENDATION

1. **Ship both together.** Re-confirmed with numbers: all 19 movers the gate silences sit at
   `comparable_n` 3–7 after A13, so gating first would publish `Levi's Trucker` +160.2 % and
   `Stone Island Marina` +513.4 % to paying users and then withdraw them.
2. **Release-note headline: 22 models, median ≈ 0, two-sided, IQR ±20 %.** Not 23, not +20.3 %.
   State the downward half explicitly — 11 models are being repriced *down*, median −21.7 %,
   because the 7-day window was over-pricing them.
3. **Lead with the demand-weighted figure, not the board figure.** "37 % of the board goes blank"
   is true and misleading; "matched searches getting an evidenced price go from 113 to 146 of 157"
   is true and is what a customer experiences.
4. **Strike "median evidence 12 → 26"** from the branch comment, `COVERAGE.md` and `APPROVALS.md`
   before merge.
5. **Re-run `proof.sh` immediately before the release note is published.** Every figure here is a
   single-snapshot reading on a metric with ±3 pp of rebuild noise and a reproduction control that
   has fallen from 90/100 to 64/100 in eight hours. **These numbers have a shelf life measured in
   hours, and that is the reason the release note should quote the proof run, not this file.**
