# sql/metrics — one file per KPI, and the contract they all keep

OS §3: *"All definitions live in `docs/company/METRICS.md` with one SQL file each. Changing a
definition is a founder gate. No KPI is ever computed ad hoc."*

This directory is the "one SQL file each" half. [`../../docs/company/METRICS.md`](../../docs/company/METRICS.md)
is the definitions half and says which KPIs are **not** here, and why.

## The contract

Every `.sql` file in this directory returns **exactly one row with exactly these five columns, in
this order**:

| Column | Type | Meaning |
|---|---|---|
| `metric` | TEXT | the KPI id, identical to the filename stem |
| `value` | REAL or NULL | the number. **NULL means UNKNOWN** and must never render as `0` |
| `n` | INTEGER | the size of the population the value was computed over |
| `window_start` | TEXT | inclusive lower bound of the measurement window |
| `window_end` | TEXT | exclusive upper bound |

The contract is not decoration. OS §0 rule 2 says a number without its `n`, its dates and its query
is UNKNOWN — so the result shape makes a rule-2 violation impossible to express. You cannot return a
value from here without also returning what it was measured over and when.

### Every file declares a floor

Each `.sql` carries `-- floor: N` in its header, **with its rationale written out**. When `n < N`
the runner renders UNKNOWN with `population below floor`.

It is **required, not defaulted**. The honest floor for a rate and for a count are different
numbers, and that difference has to be argued in the file rather than assumed by the runner. A
missing declaration is a contract violation, not a free pass.

Why it exists: the rule below already says `n = 0` is UNKNOWN rather than zero, because a query that
inspected nothing has not measured a rate of 0%. **A population of 44, four of whose rows are our
own probe traffic, has not measured a rate either.** At p≈0.8 the 95% half-width is
`1.96·√(p(1−p)/n)` — n=44 gives **±14.5pp**, which cannot distinguish 45% from 72% against an 80%
target. n=100 gives ±8pp. So proportions take **floor 100**, derived rather than chosen.

Counts take **floor 1**, and the asymmetry is the point rather than an exception: *"we served 1
trusted check and 0 returned"* is true and useful; *"0.0% conversion, n=1"* is not. A count reported
with its `n` cannot mislead about precision, because the `n` **is** the claim. Rates hide their own
uncertainty; counts do not.

**The floor is a contract rule, applied to every file.** Blanking one metric at n=44 while another
publishes a rate at n=1 two panels above would look like blanking the numbers we dislike.

Two consequences that are deliberate:

- **`n = 0` is UNKNOWN, not zero.** A query that inspected nothing has not measured a rate of 0%; it
  has failed to measure. `metrics.py` renders it as UNKNOWN with the reason. This is the same rule
  `status_report.py` applies to checks that inspected nothing.
- **Division by zero returns NULL in SQLite**, which lands on UNKNOWN by itself. The queries rely on
  that rather than guarding with `COALESCE(...,0)`, because coalescing to zero is precisely the
  failure the rule exists to stop.

## Running them

```bash
python3 scripts/company/metrics.py                    # all metrics, human-readable
python3 scripts/company/metrics.py --json             # machine-readable, for the dashboard
python3 scripts/company/metrics.py --db /path/to.db   # against a specific database
```

The runner defaults to the local `demand-intel/demand_intel.db`. That database is **unmigrated** and
is missing `verdict_logs.user_id`, `.reason` and `.said_buy_below`; four of the seven queries cannot
run against it and report UNKNOWN with `missing column` as the reason. That is the honest result, not
a bug in the query — see METRICS.md §"Where these actually run".

## Proof

`docs/audit/proof/W36/metrics/proof.sh` builds a fully migrated fixture database from
`db/schema.py`, seeds rows whose correct answer is known by hand, and asserts each query returns
that answer. It runs cold from anywhere and touches no real database.
