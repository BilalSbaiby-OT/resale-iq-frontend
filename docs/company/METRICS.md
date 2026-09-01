# METRICS — every KPI in OS §3, its definition, and the query behind it

**Written** 2026-09-01 (CEO, main session). Closes `GAPS.md` **B1**, the item that file named
*"the single biggest gap"*.

OS §3: *"All definitions live in `docs/company/METRICS.md` with one SQL file each. Changing a
definition is a founder gate. No KPI is ever computed ad hoc."*

This is that file. It is also, deliberately, a list of what **cannot** be computed — 7 of the 21 KPIs
in §3 have a query today, and the other 14 have a named blocker and the smallest change that would
unblock them. A metrics doc that only listed the metrics that work would be the same kind of
document as a status report that only counts passing checks.

- **The queries:** [`sql/metrics/`](../../sql/metrics/) — one file per KPI, all keeping one contract.
- **The runner:** `scripts/company/metrics.py` — the only thing that executes them.
- **The proof:** `docs/audit/proof/W36/metrics/proof.sh` — 8/8 cold, on a fixture built from the
  application's own schema.

```bash
python3 scripts/company/metrics.py            # human-readable
python3 scripts/company/metrics.py --json     # what the dashboard reads
bash docs/audit/proof/W36/metrics/proof.sh    # prove they mean what this file says
```

---

## SERIES BREAKS — 2026-09-01 (APPROVALS A8, founder-authorised)

A definition change breaks comparability with its own history, which is worse than not having the
number. `verifier` required these markers before ratifying, because it is the thing that scores
against these definitions and a silent redefinition would read to it as performance.

| Metric | What changed | Read before/after together at your peril |
|---|---|---|
| `band_coverage` → **`band_coverage_demand`** | Renamed. A supply-side sibling now exists, and the bare name silently resolved to one of two different questions | Same query, same population — only the name moved |
| **All metrics** | An `n`-floor was added to the contract. Below it, a metric renders UNKNOWN | Values did not change. **What changed is which ones are allowed to be shown.** `trial_to_paid`, `retention_30d` and `band_coverage_demand` went from published to withheld without their underlying numbers moving at all |
| **`MAPE`** | **STRUCK** (below) | Never had a `.sql` file, never produced a reading, so nothing is orphaned |
| **`band_evidence_p50`** | New | No history. First reading 2026-09-01 |

**Not a series break, and the distinction matters:** merging C5 will move the North Star's *baseline*
without changing its *definition*. That gets a dated discontinuity marker — pre-C5 reading with its
`n`, the merge SHA, first post-C5 reading with its `n` — **not** an entry in this table. Filing a
baseline discontinuity as a definition change would corrupt the very property this gate protects.

---

## The contract, and why the result shape is the rule

Every `.sql` file returns exactly one row of `metric, value, n, window_start, window_end`.

OS §0 rule 2 says a number without its `n`, its dates and its query is UNKNOWN. Rather than trust
everyone to remember that, the result shape makes the violation **inexpressible**: you cannot return
a value from `sql/metrics/` without also returning the population it came from and the window it
covers. `value = NULL` and `n = 0` both render as UNKNOWN, never as `0`.

**Every file also declares `-- floor: N`.** Below that population the metric renders UNKNOWN with
`population below floor`. It extends the same rule: `n = 0` is UNKNOWN because a query that inspected
nothing has not measured a rate — and **a population of 44, four of whose rows are our own probe
traffic, has not measured one either.** Proportions take 100 (at p≈0.8, n=44 gives a 95% half-width
of ±14.5pp and cannot distinguish 45% from 72%); counts take 1, because a count reported with its `n`
cannot mislead about precision — the `n` *is* the claim. Full derivation in
[`sql/metrics/README.md`](../../sql/metrics/README.md).

The runner enforces the shape. `proof.sh` includes a negative control — an off-contract query is fed
in and must come back UNKNOWN — because a rule that has never been observed failing is not known to
work.

---

## Part 1 — The seven that compute

| KPI | File | Status | **Production, 2026-09-01** |
|---|---|---|---|
| **`weekly_trusted_checks`** (North Star) | [`weekly_trusted_checks.sql`](../../sql/metrics/weekly_trusted_checks.sql) | **LIVE**, one caveat | **0**, n = 1 |
| **`insufficient_data_rate`** | [`insufficient_data_rate.sql`](../../sql/metrics/insufficient_data_rate.sql) | **LIVE** — but see the naming note below | **WITHHELD** — n = 44, below floor |
| `band_coverage_demand` | [`band_coverage_demand.sql`](../../sql/metrics/band_coverage_demand.sql) | **LIVE**, demand-side | **WITHHELD** — n = 44, below the floor of 100 |
| **`band_evidence_p50`** (its honesty counter) | [`band_evidence_p50.sql`](../../sql/metrics/band_evidence_p50.sql) | **NEW 2026-09-01** | **13.5**, n = 40 |
| `retention_30d` | [`retention_30d.sql`](../../sql/metrics/retention_30d.sql) | **LIVE** | UNKNOWN — n = 0, oldest account is 28 days old |
| `trial_to_paid` | [`trial_to_paid.sql`](../../sql/metrics/trial_to_paid.sql) | **LIVE** | **WITHHELD** — n = 1, below floor |
| `n_predictions_resolved` | [`n_predictions_resolved.sql`](../../sql/metrics/n_predictions_resolved.sql) | **LIVE** | **0**, n = 340 |
| `pipeline_lag_min` | [`pipeline_lag_min.sql`](../../sql/metrics/pipeline_lag_min.sql) | **LIVE** | **1.5 min**, n = 1344 |

These are read from **production** (`/app/data/demand_intel.db`, read-only, over the existing ssh +
`docker exec` path) on every `build_dashboard.py --prod`, which now runs hourly. They are not read
from the local database, and the reason is in "Where these actually run" below.

### What the first real reading says

- **The North Star is 0.** In the last 7 days production served **one** trusted check, and that user
  did not come back. `n = 1` is the honest headline: this is not a retention problem yet, it is a
  volume problem. Nothing here is a rate worth optimising until `n` is in the hundreds.
- **`band_coverage` = 59.1 %, against a §3 target of ≥ 80 %.** Of 44 answered searches, 18 got an
  honest refusal. This is the single most actionable number in the file: four in ten people who ask
  us something get told we cannot price it.
- **`n_predictions_resolved` = 0 of 340.** The site promises outcomes. Three hundred and forty
  predictions exist and not one has ever been graded — `GAPS.md` C4, now on an instrument rather
  than in prose, and at ten times the scale the dev database suggested (38).
- **`pipeline_lag_min` = 1.5 minutes over 1,344 productive runs.** Ingestion is genuinely healthy,
  and this is now measured by rows landing rather than by scrapes starting.
- **`retention_30d` is UNKNOWN because the company is 28 days old.** Six accounts exist; the oldest
  signed up 2026-08-04. Nobody has *had* 30 days yet, so the cohort is empty and the query says so
  instead of reporting 0 %. It begins computing on its own around 2026-09-03. This is the clearest
  example in the file of why `n = 0` must never render as a zero.

### Two things the first production run surfaced

1. **There is a fifth verdict value, `SKIP`** (6 rows in 7 days), which was not in the dev database.
   It is counted as *covered*, not as a refusal — `SKIP` is a real, data-backed answer ("do not buy
   at this price"), and treating a confident no as a failure to answer would understate coverage.
2. **19 of 78 rows in the last 7 days are `PENDING`** — anonymous quota rows reserved and never
   resolved. They are excluded from every rate here, correctly. But a quarter of all rows sitting
   unresolved is its own defect: either those requests died before returning, or a resolve path is
   being missed. **Not fixed in this pass; logged here because the metric found it.**

### The North Star, and the one thing it is not

**Definition (OS §3):** checks that returned a band with `n ≥ 8` to a user who came back within
7 days. **Counter:** `insufficient_data_rate` — honesty must not fall to inflate it.

`comparable_n` **is not stored anywhere.** `verdict_logs` has no such column and neither does
`model_stats` — verified against a migrated schema, not the stale dev copy. So the query reads the
`n ≥ 8` gate through its consequence: `said_buy_below IS NOT NULL`. A buy-below price is only ever
emitted through `verdict_allows_buy_below()`, which requires `comparable_n >= MIN_VERDICT_COMPARABLES`
(= 8). A non-null `said_buy_below` **is** that gate having passed.

**The caveat, rewritten 2026-09-01 after `tech-lead` and `data-scientist` both refuted the earlier
version of this paragraph.** It used to say the number was an *upper bound* that C5 would make
*exact*. C5 removes one over-count. **It does not make this a count of the thing it names**, and
there are three independent reasons — found separately, by two agents, neither of which I had seen:

1. **`said_buy_below` records what was COMPUTED, not what was DELIVERED** (`tech-lead`).
   `_log_recap` runs on the **pre-gate** payload (`api/routes.py:1080`, `:1220`), and for a logged-in
   **free** user `_gate` locks `buy_below` (`:1006-1010`) — the band is never shown. Those rows still
   write `said_buy_below` and this query still counts them. §3 says *"returned a band … to a user"*.
   **A paywalled teaser was not returned.**
2. **The `n ≥ 8` inference is two hops held together by a comment** (`data-scientist`).
   `db/queries.py:2062` gates `max_buy_price` on `MIN_COMPARABLES` (**3**), not 8 — all 100 board
   rows carry one, including the 24 sitting at `comparable_n = 3`. **The only thing enforcing 8 is a
   single early return at `api/routes.py:889`.** A non-null `said_buy_below` is not evidence of
   n ≥ 8; it is evidence that one `return` did not fire.
3. **`comparable_n` oscillates across 8 between analyzer runs.** Nine `Nike Tech Fleece` searches in
   the last 7 days logged `WATCH`; that model now sits at 7.

**So: do not write "upper bound" — the bias it names disappears with C5. Do not write "exact count"
either.** The honest line, and the only one this file should carry:

> `n ≥ 8` is **inferred** from `said_buy_below`, not read from a stored `comparable_n`.

**The fix that would close it properly** is one column and one test:
`ALTER TABLE verdict_logs ADD COLUMN comparable_n INTEGER`, written at `api/routes.py:891` where
`n_comp` already sits in a local variable, plus a regression test asserting
`said_buy_below IS NOT NULL ⟹ comparable_n >= 8` — so the invariant is machine-checked rather than
commented. Queued as the third A8 item.

**And keep it in proportion: exactly one row** in the entire history of `verdict_logs` has
`said_buy_below IS NOT NULL`. Upper bound versus exact count is, today, a debate about a single row.

Scope note: the North Star is a **logged-in** metric. Anonymous checks resolve through
`resolve_anon_verdict()`, which sets `verdict` but never `said_buy_below`, and an anonymous visitor
has no identity that could "come back". That matches the definition rather than working around it.

### `insufficient_data_rate` is misnamed, and it has already misled three agents

**It counts `verdict IN ('INSUFFICIENT_DATA', 'UNKNOWN')` — the UNION of two different refusals.**
`INSUFFICIENT_DATA` means *we know the model and cannot price it*; `UNKNOWN` means *we could not
identify what you asked for*. Those have completely different fixes — one is a corpus problem, the
other a matcher problem — and this metric adds them together.

On 2026-09-01, six agent artefacts cited this number. **Three attributed all of it to
`INSUFFICIENT_DATA` alone**, and those three were the ones building UI copy, e2e tests and design
priorities on it. The `INSUFFICIENT_DATA`-only share is **UNKNOWN and ≤ 40.9 %** — nobody has run the
segmented query.

Nothing was fabricated: the `.sql` says exactly what it counts, in its own header. **The name is what
misled them**, and a name that denotes one of the two things it counts will keep doing so.

- **OPEN, deliberately not decided tonight:** rename to `refusal_rate`, with `refusal_reason` split
  out as its own breakdown. That is a definition change, so it goes to the founder rather than being
  taken under an authorisation granted for three other things.
- **It is also about to move.** C5 routes *more* traffic to `INSUFFICIENT_DATA`, so every "40.9 %"
  written before that merge goes stale — six known downstream consumers. An argument for writing the
  discontinuity marker **before** C5 lands, not after.

### Two honest asterisks on the rest

**`band_coverage` is the exact complement of `insufficient_data_rate`** on the same window —
`band_coverage = 100 − insufficient_data_rate`, by construction. They are one measurement seen from
two sides. Both are kept because §3 pairs them with different counters, but **they must never be
presented as corroborating each other.** What §3 arguably wants is *supply-side* coverage — of the
models we track, how many have enough comps to be priced at all — and that is not computable:
`model_stats` has no `comparable_n`. Listed as OPEN below.

**`pipeline_lag_min` is anchored to `items_new > 0`, not to `run_at`.** `GAPS.md` C7: the existing
ingestion monitoring is a liveness check that asserts a scrape *ran*, never that a row *landed* —
which is how 131 dead scrapes raised no alert. A scraper that starts on time, 403s on every request
and exits 0 satisfies liveness perfectly. The proof harness pins this: it seeds a run from one hour
ago that landed nothing and a run from two days ago that landed seven, and asserts the answer is
**2880 minutes, not 60**. If that assertion ever reads ~60, the metric has regressed to liveness.

---

## Part 2 — The fourteen that do not, with the blocker for each

Grouped by what is actually in the way, because "OPEN" is not an action.

### 2a. Needs one column, or one table

| KPI | §3 owner | Blocker | Smallest fix |
|---|---|---|---|
| `band_coverage` (supply-side) | data-scientist | `model_stats` has no `comparable_n` | one `ALTER TABLE model_stats ADD COLUMN comparable_n INTEGER` + write it where stats are built |
| `match_precision ≥ 90 %` | data-scientist | no sample log exists; §3 specifies a **30-sample weekly human audit**, which no query can replace | a `match_audit` table (query, chosen model, verdict, auditor, date) + the `/precision` command (`GAPS.md` B8) |
| `match_rate` (its counter) | data-scientist | same table | same |
| `canary green 7/7 days` | data-eng | the canary set does not exist — `GAPS.md` **B10**, Phase 2's exit criterion | 60 frozen labelled listings + a run log |
| `change_failure_rate`, `rollback < 10 min`, `deploys/week` | devops | **the `deploys` table has 1 row, dated 2026-08-12**, and it has the right shape (`verdict`, `rolled_back_at`, `previous_sha`). Deploys since — including two on 2026-08-31 — never wrote to it | wire the deploy path to `INSERT INTO deploys`. **Deliberately no .sql shipped:** a rate over a log that misses most deploys measures the logging gap, and would read as a confident 0 % |

### 2b. Needs an event the product does not emit

| KPI | §3 owner | Blocker |
|---|---|---|
| `activation: install → first trusted check < 60 s` | product-manager | there is no install event and no funnel-event table. `pageviews` carries UTM since the growth release, but the extension emits nothing on install, so the clock has no start |
| `extension installs/week`, `install → first check` | seo, content-social | same missing start event; installs are visible only as a Chrome Web Store aggregate (3, as of 2026-08-31) |
| `panel renders a band or honest state on 100 % of sampled listings` | extension-eng | a browser-QA sample, not a query. Needs `chrome-walk` (`GAPS.md` B7) |
| `7d_retention` (activation's counter) | product-manager | computable the day an install event exists; the `retention_30d` query is the template |

### 2c. Lives outside SQLite (correctly)

| KPI | Source of record | Status |
|---|---|---|
| `MRR`, `refund rate`, `churn rate` | **Stripe** | `scripts/company/stripe_read.py` reads it live and read-only from inside the production container. Stripe is the book of record for money — no `.sql` file will ever exist for MRR, and `trial_to_paid` above is a **cross-check from our own data, not a substitute**. If the two disagree, the disagreement is the finding |
| `GSC clicks on pages with ≥ 1 model` | Search Console API | reachable today via the `gsc` connector; not yet on a schedule. Owner: `seo` |
| `store rating ≥ 4.3` | Chrome Web Store | no ratings yet (3 installs) |
| `flaky tests = 0`, `coverage ≥ 80 %`, `test runtime` | CI | backend gates on 1,147 tests; **the frontend gates on typecheck and build only** and Playwright is in no workflow (`GAPS.md` C3). Owner: `qa-eng` |
| `security findings open = 0 high`, `scan cadence kept` | `SECURITY-LOG.md` | maintained by hand; parseable, not parsed |
| `first-response < 24 h`, `churn reasons → P0 within 7 d`, `reopen rate` | support inbox | no ticket store. Owner: `customer-success` |

### 2d. Needs the spend ledger

| KPI | Blocker |
|---|---|
| `spend vs cap` (AM-2: €200/month) | `docs/company/LEDGER.md` does not exist. This is the one CEO-visible KPI with no instrument, and OS §0 rule 8 makes spend a KPI |
| `gross margin per plan` | same, plus per-plan infra attribution |
| `scrape cost per trusted check` | same ledger, divided by the North Star above |

### 2e. Impossible, and it stays impossible

| KPI | Why |
|---|---|
| **`MAPE ≤ 15 %`** | **STRUCK 2026-09-01, founder-authorised (A8).** Impossible, not open. `docs/audit/DATA.md`: no ground-truth sold price exists or can be obtained. Vinted does not publish sale prices; the `is_sold = 1` rows in the corpus are **fabricated** (24.1M of them, `GAPS.md` C4/C5). Computing MAPE against those would grade our predictions against fiction and report a precision we do not have. **This KPI must be struck from §3 or redefined against a real outcome source** — a founder gate, since §3 says changing a definition is one. The honest partial substitute already shipped: `n_predictions_resolved`, which counts how often we ever found out at all |

---

## Where these actually run

The default database — `demand-intel/demand_intel.db` — is **unmigrated**. It is missing
`verdict_logs.user_id`, `.reason`, `.said_buy_below` and `.q_norm`, so `weekly_trusted_checks` and
`retention_30d` cannot execute against it and report `no such column: v.user_id` with the fix.
That is the correct behaviour, not a defect in the query: a metric that cannot be computed says so.

Production has the migrated schema. To read it, the same runner is pointed at the production copy
the way `build_dashboard.py --prod` already does — read-only, from inside the container. The runner
opens every database with `mode=ro`, so a metrics run **cannot** write to production even by
accident.

## Changing anything here is a founder gate

OS §3, last line. A definition change means the number stops being comparable to its own history,
which is worse than not having it. Amend by adding a row to `APPROVALS.md`, not by editing a `.sql`
file — and if you edit one, `proof.sh` will fail, which is the intended outcome.

Three changes are **already owed a founder decision** and are queued for Gate #2:

1. **`MAPE` struck or redefined** (§2e above). It is in §3 and cannot ever be computed honestly.
2. **`band_coverage` split** into the demand-side metric that exists and the supply-side metric that
   needs a column, so one name stops covering two different questions.
3. **The North Star's fail-open caveat** (C5) — accept it as an upper bound, or fix C5 first and
   have the number mean exactly what §3 says.
