# The drift canary — closes GAPS.md B10, Phase 2's exit criterion

Written 2026-09-01, data-eng. Governed by `docs/company/OS.md` §0 and §3, and
`docs/company/AMENDMENTS.md`. `docs/company/METRICS.md` and `sql/metrics/README.md`
read first, as instructed.

## Read this before you read anything else in this directory

**This is a DRIFT canary. It is not, and cannot be, a correctness canary.**

`docs/company/OS.md` §3 names the KPI `canary green 7/7 days`. That phrase is dangerous if read
carelessly: "green" sounds like "right." It is not going to mean that here, and this file says so
every place a number from this system could reach a person.

Here is the actual epistemics, stated once, plainly:

- There is no ground-truth sold price on this platform and there never will be from Vinted's public
  surface (`docs/audit/DATA.md` §2). `sold_observed=1` is the best signal that exists — a listing
  actually left the shelf, confirmed by `engine/shelf.py`'s survivorship logic, not by the fabricated
  `is_sold` flag (98.1% fabricated, per `docs/company/GAPS.md` C4, `docs/audit/DATA.md` §2.3). But
  even a `sold_observed=1` row records the **asking price at the moment the listing disappeared**,
  not a transaction price. Nobody has ever paired a single row in `model_signals` with a real
  outcome.
- So a canary built from this data can only ever compare **today's computed output to a frozen
  computed output from before**. If today's number matches the frozen one, the honest conclusion is
  *"the pipeline produced the same answer it produced before."* It is **not** *"the answer is
  right."* If the two disagree, the honest conclusion is *"something changed"* — a genuine bug, a
  genuine improvement, or the market itself moving are all equally consistent with a red result, and
  this tool cannot tell those apart.
- Calling that "canary green" without this caveat attached would be exactly the kind of overclaiming
  Resale IQ's own positioning ("no accuracy claims until 30 outcomes scored") exists to prevent. So
  every artefact here is named and labelled as **drift**, not correctness, and this file is the
  first thing anyone reading `quality.canary` on the dashboard should be pointed at.

### What this system CAN tell you

- Whether any of the 60 watched rows' computed fields (verdict, buy-below price, sell-average,
  comparable_n, and 6 supporting fields) are **identical** to what they were at freeze time.
- **Exactly which field moved, from what, to what, by how much** (absolute delta and % delta), for
  every row that changed.
- Whether a watched model **dropped off the board entirely** (deleted or fell below the n=3
  admission floor) — reported as `MISSING`, never silently skipped.
- Whether a row's **verdict flipped** across the `comparable_n >= 8` line
  (`engine/listing_identity.py:MIN_VERDICT_COMPARABLES`) — the single highest-leverage thing to
  watch, because it is the exact gate the North Star KPI (`weekly_trusted_checks`) reads through.
- A stable, reproducible, explained sample — so a human reviewing a red run can go straight to a
  named row and a named reason instead of grepping 100 rows cold.

### What this system CANNOT tell you

- Whether the frozen value was ever correct. It was never checked against an outcome.
- Whether a value that stayed the same is more trustworthy than one that changed. Constancy is not
  accuracy — a wrong number that never moves will read "canary green" forever.
- Whether a changed value got better or worse. A price correction from a bug fix and a price
  corruption from a bug both show up identically as `CHANGED`.
- Anything about the ~40 models in `model_signals` that are **not** in the 60 watched rows, or about
  any of the millions of listings that never reach `model_signals` at all.
- Match precision (title → model correctness) — that is a **separate, still-open** KPI
  (`match_precision >= 90%`, `docs/company/METRICS.md` §2a) that needs a **human** 30-sample audit,
  not a machine diff. This tool does not attempt it and should never be cited as evidence for it.
- Anything about production health beyond these 60 rows — `pipeline_lag_min`
  (`sql/metrics/pipeline_lag_min.sql`) is the counter-KPI on the OS §3 KPI tree for exactly that
  reason, and stays a separate, independent instrument.

If a future agent (or the founder) wants an actual correctness canary, the prerequisite is not more
engineering here — it is 30+ human-labelled outcomes (`n_predictions_resolved`, currently 0 of 340,
first cohort ripe ~2026-09-04 per `docs/company/GAPS.md` C4). Nothing in this directory can substitute
for that, and nothing in this directory tries to.

---

## What was frozen

60 of the 100 rows in production `model_signals` — **the entire customer-facing board is 100 rows**,
so 60 is 60% of everything that exists, not a small sample of something large. The selection is
deliberate, not random, documented in full (including the exact rule) in
[`frozen_set.json`](frozen_set.json)'s `selection_method` field and reproduced by
[`scripts/canary/freeze_drift_canary.py`](../../../scripts/canary/freeze_drift_canary.py).

**Two strata, 30 rows each:**

1. **Verdict-eligible** — `comparable_n >= 8`, the threshold `engine/listing_identity.py`'s
   `verdict_allows_buy_below()` requires before a `buy_below` price is ever shown to a user. 30 of the
   43 rows in production carrying this. These are the rows the North Star KPI
   (`weekly_trusted_checks`, which reads the `n>=8` gate through `said_buy_below`) actually depends on.
2. **Board-admitted, not verdict-eligible** — `comparable_n` 3–7. Admitted to the board
   (`MIN_COMPARABLES = 3`) but denied a `buy_below` price. 30 of the 57 rows carrying this. Watching
   this stratum matters because it is where `insufficient_data_rate` lives — if these rows started
   silently crossing 8 (or silently getting a price anyway, which would be the fail-open bug GAPS C5
   already found and fixed once), that is exactly the kind of regression a correctness-blind drift
   canary can still catch.

Every one of the **19 brands** present in `model_signals` is represented at least once.

**16 of the 60 are additionally curated "known-hard" cases**, picked for reasons grounded in the
code, not guesswork — each row's `hard_case_reason` field states the specific reason:

This table is a direct read of the 16 `hard_case_reason` values actually written into
`frozen_set.json` — grouped here for readability, not re-derived from memory:

| Why it's hard | Rows (id, comparable_n) |
|---|---|
| **Replica/authenticity risk** — `engine/authenticity.py` exists but `docs/audit/DATA.md` documents it is **not wired into** `refresh_model_signals`, so counterfeit or accessory listings are not excluded from these numbers today | Off-White Arrows (605, n=25, deep-n control), Off-White Out Of Office (679, n=3, lowest `data_quality_score` on the whole board at 36), Off-White Caravaggio (690, n=3); Gucci Dionysus (658, n=4, non-trivial IQR 209.75) and Balenciaga Le Cagole (634, n=7, IQR 467.5) carry the same brand-level risk alongside their own reasons below |
| **Highest price dispersion at depth** (`price_iqr_eur`) despite passing admission — wide dispersion surviving the comp filter suggests mixed listings (bags/cases/accessories), not one product | Gucci Horsebit (625, n=20, IQR 588.0 — highest on the board), Balenciaga Hourglass (643, n=5, IQR 500.0 — highest among Balenciaga at low n) |
| **Deep-n brand controls** — contrast the tiny-n hard cases above against a well-supported row from the *same* brand | Off-White Arrows (605, n=25), Balenciaga Triple S (609, n=30) |
| **Verdict-boundary pair** — one comp apart from flipping, same brand | Gucci GG Marmont (623, n=8, eligible) / Gucci Bamboo (655, n=7, denied, also `data_quality_score`=48 and IQR 317.0) |
| **Family-collapse risk** — `engine/listing_identity.py`'s own comment warns `family_of()` must never walk "Jordan 4" onto "Jordan 1"; the `_VARIANT_TAIL` regex (low/mid/high/sb/og/tn/xl/vtg) exists specifically for names like "Jordan 1 Low" | all 4 Jordan rows: Jordan 4 (641, n=10), Jordan 1 (659, n=3, the family root), Jordan 1 Low (689, n=3, the variant-tail case), Jordan 3 (696, n=3) |
| **Untested null-handling path** — lowest `data_quality_score` rows outside Off-White, both with `price_iqr_eur = NULL` | Carhartt Double Knee (693, n=3, dq=38), Adidas Forum Low (680, n=3, dq=46) |

Note what is deliberately **not** in this curated list: Gucci Ophidia (id 629, n=15, IQR 545.5 — the
third-highest on the board) and Gucci Jackie (id 624, n=12, IQR 343.75) are in the frozen 60 through
the plain brand-coverage/fill pass, not the curated hard-case rule — they happened to be selected
without a named reason. Their `hard_case_reason` field is `null` in `frozen_set.json`, and that
distinction (curated vs. incidentally-included) is preserved rather than blurred, because conflating
"picked on purpose" with "picked because it filled a slot" would be a smaller version of the same
overclaiming this whole file exists to avoid.

**Fields frozen and watched**, per row (see `frozen_set.json` for the exact shape):

- `verdict` — **derived, not a stored column.** Recomputed by the runner from `comparable_n` on
  every run, exactly the way `engine.listing_identity.verdict_allows_buy_below()` does
  (`BUY_BELOW_ELIGIBLE` if `comparable_n >= 8`, else `INSUFFICIENT_DATA`). Frozen for reference, but
  the diff always recomputes it fresh — a verdict "drifting" only ever means `comparable_n` moved
  across the line.
- `buy_below_eur` = `model_signals.max_buy_price`
- `sell_avg_eur` = `model_signals.avg_price_eur` — **caveat that must travel with this number
  everywhere it is shown:** this is the mean **asking price at shelf-departure** of `sold_observed=1`
  comps (`db/queries.py` step 4d, `engine/metrics.summarise_sold_prices`, IQR-fenced). It is a
  defensible, useful proxy. **It is never an observed transaction price.** Calling it "average sold
  price" without that qualifier is the exact overclaim `docs/audit/DATA.md` §2.5 flags across the
  whole product.
- `sell_median_eur`, `price_iqr_eur`, `comparable_n`, `sold_7d`, `sold_30d`, `active_listings`,
  `data_quality_score` — supporting fields, watched for the same reason: a silent change in any of
  them is diagnostic even when `verdict` itself doesn't move.

**Anchoring, since no `pipeline_version` exists anywhere in this schema** (verified:
`PRAGMA table_info(app_meta)` has only `key`/`value`/`updated_at`; no `pipeline_version` key has ever
been written — this is stated as UNKNOWN per OS §0 rule 2, not guessed). The freeze instead records a
**corpus fingerprint** at freeze time: total `listings` rows, total `sold_observed=1` rows, total
`model_signals` rows, and the max `model_signals.updated_at` — so a reviewer can sanity-check that a
"no drift" result isn't hiding a corpus that silently shrank to zero in between.

---

## How to run it

```bash
# Diff the 60 frozen rows against current production (read-only, over ssh + docker exec —
# the same access pattern scripts/company/build_dashboard.py --prod already uses)
python3 scripts/canary/run_drift_canary.py

# Machine-readable, for wiring into a future scheduler (GAPS.md B9 — none exists yet)
python3 scripts/canary/run_drift_canary.py --json

# Against a local fixture instead of production (what proof.sh does)
python3 scripts/canary/run_drift_canary.py --db /path/to/fixture.db
```

Every run appends one line to [`runs/log.jsonl`](runs/log.jsonl) — the "canary run log" OS §3 names
as this KPI's source — and never writes anywhere else. **Exit code 0** means none of the 60 rows'
watched fields moved since freeze. **Exit code 1** means at least one did — a prompt to go look at
`fields_moved` on that row, not a test failure and not evidence of a bug.

To (re)freeze — a deliberate, rare act, refused without `--force` so nobody overwrites the drift
baseline by accident:

```bash
python3 scripts/canary/freeze_drift_canary.py            # refuses: frozen_set.json exists
python3 scripts/canary/freeze_drift_canary.py --force     # re-freeze on purpose (e.g. after a
                                                            # deliberate pipeline change you want
                                                            # the new baseline to reflect)
```

## Proof

[`docs/audit/proof/W36/canary/proof.sh`](../proof/W36/canary/proof.sh) runs cold, builds a fully
migrated fixture from `demand-intel/db/schema.py` (same discipline as
`docs/audit/proof/W36/metrics/proof.sh`), seeds 6 rows with known relationships to the verdict
boundary, and asserts (28 checks, 0 network calls, touches no real database):

- freezing selects exactly the seeded rows and derives `verdict` correctly at n=8 and at n=7
- re-freezing without `--force` is refused
- a negative control (diff against an untouched fixture) reports zero drift and exits 0
- after a verdict-flipping mutation, a plain price mutation, and a row deletion: the report catches
  the flip with exact was/now, the price delta with exact absolute and % values, and the deleted row
  as `MISSING` rather than silently absent — and exits 1

## What "canary green 7/7 days" honestly means right now

One run against real production tonight (2026-09-01, logged in `runs/log.jsonl`): 60/60 unchanged, 0
missing, 0 verdict flips — expected, since `model_signals` was refreshed at 2026-08-31 22:43:02 and
this freeze was taken at 2026-09-01T00:18:21Z, inside the same refresh cycle. **One green run is not
seven green days.** `canary green 7/7 days` as an OS §3 KPI requires this to actually run daily for a
week, which needs GAPS.md B9 (a scheduler — none exists) before it can be true rather than asserted.
Until then, the honest state of this KPI is: **the mechanism exists and is proven; the 7-day track
record does not exist yet.**


---

## Scoreability — added 2026-09-01 after `tech-lead`'s review

A run only counts toward OS §3's `canary green 7/7 days` if **the source table could have changed
between the freeze and the run**. The first logged run could not: it was frozen at 00:18:21 and run
at 00:22:17, and `model_signals_max_updated_at` is identical in both corpus fingerprints. `60/60
UNCHANGED` was arithmetically guaranteed.

That run is now marked `"scoreable": false` in `runs/log.jsonl`. It proves the **mechanism** works.
It observes **no drift**, because no drift was possible.

**The general rule, and the reason this needed a field rather than a note:** this file already said
the honest thing in `cannot_conclude` — but that is prose, and **the scorer reads fields**. An
honesty caveat the scoring path cannot see is not a control. Any future run whose two fingerprints
share a `max_updated_at` must be written with `scoreable: false` by the runner itself, not left for
a reader to notice.
