-- band_coverage — Insight KPI (OS §3), target >= 80%
--
-- Of the searches we answered, what share got an actionable band rather than an
-- honest refusal.
--
-- READ THIS BEFORE QUOTING IT ALONGSIDE insufficient_data_rate:
-- on the same window these two are complements — band_coverage = 100 -
-- insufficient_data_rate, exactly, by construction. They are ONE measurement
-- shown from two sides, not two independent readings, and quoting both as if
-- they corroborate each other is double-counting. They are both kept because
-- OS §3 pairs them with different counters and reads them at different cadences,
-- but the dashboard must never present them as mutual confirmation.
--
-- What OS §3 arguably wants instead is SUPPLY-side coverage: of the models we
-- track, how many have >= 8 clean comparables and could therefore be priced at
-- all. That is not computable — `model_stats` has no comparable_n column
-- (verified against a migrated schema), so the corpus cannot be asked how much
-- of itself is bandable. That variant is logged as OPEN in METRICS.md with the
-- one-column migration it needs. This file measures the demand-side share,
-- which is real, and says so rather than silently substituting one for the other.
WITH win AS (
    SELECT datetime('now', '-7 days') AS lo,
           datetime('now')            AS hi
),
answered AS (
    SELECT v.verdict
      FROM verdict_logs v, win
     WHERE v.created_at >= win.lo
       AND v.created_at <  win.hi
       AND v.verdict IS NOT NULL
       AND v.verdict NOT IN ('LIMIT_REACHED', 'PENDING')
)
SELECT 'band_coverage' AS metric,
       ROUND(
           100.0 * SUM(CASE WHEN verdict NOT IN ('INSUFFICIENT_DATA', 'UNKNOWN')
                            THEN 1 ELSE 0 END) / COUNT(*)
       , 1)                     AS value,
       COUNT(*)                 AS n,
       (SELECT lo FROM win)     AS window_start,
       (SELECT hi FROM win)     AS window_end
  FROM answered;
