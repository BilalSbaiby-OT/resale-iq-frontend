-- pipeline_lag_min — COUNTER-KPI to canary green (OS §3), owner data-eng
--
-- floor: 1
--   DURATION, not a rate. One productive run is a real observation of freshness. n here counts
--   productive runs in the window and exists to prove the clock had something to anchor to.
--
-- Minutes since the pipeline last DELIVERED DATA.
--
-- The word "delivered" is the entire point of this file. GAPS C7: the existing
-- ingestion monitoring is a LIVENESS check — it asserts that a scrape *ran*,
-- never that a row *landed*. A scraper that starts on time, gets a 403 on every
-- request and exits 0 satisfies liveness perfectly while the corpus goes stale.
-- That is not hypothetical here: 131 dead scrapes raised no alert.
--
-- So the freshness clock is anchored to `items_new > 0` — a run that actually
-- inserted something — and NOT to run_at, and NOT to status = 'ok'. A run can be
-- 'ok' and empty; that is the failure being measured, so it cannot also be the
-- thing that resets the clock.
--
-- value = minutes since the last productive run. LOWER IS BETTER: this is the
-- one metric in this directory where a rising number is the alarm.
-- n = productive runs in the last 7 days. n = 0 means nothing has landed in a
-- week, which the runner renders as UNKNOWN rather than as a lag of zero — a
-- silent pipeline must never read as a fresh one.
WITH win AS (
    SELECT datetime('now', '-7 days') AS lo,
           datetime('now')            AS hi
),
productive AS (
    SELECT s.run_at
      FROM scraper_log s, win
     WHERE s.items_new > 0
       AND s.run_at >= win.lo
       AND s.run_at <  win.hi
)
SELECT 'pipeline_lag_min' AS metric,
       CASE WHEN COUNT(*) = 0 THEN NULL
            ELSE ROUND((julianday('now') - julianday(MAX(run_at))) * 1440.0, 1)
       END                       AS value,
       COUNT(*)                  AS n,
       (SELECT lo FROM win)      AS window_start,
       (SELECT hi FROM win)      AS window_end
  FROM productive;
