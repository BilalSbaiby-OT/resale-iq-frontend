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
