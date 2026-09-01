-- band_coverage_supply — the SUPPLY side of Insight coverage (OS §3)
--
-- Of the models we track, how many have enough clean comparables to be priced
-- at all. This is the question `band_coverage` does NOT answer.
--
-- The pair, and why both exist:
--   band_coverage         demand side — of searches we answered, how many got a
--                         band. Moves when people search for things we cover.
--   band_coverage_supply  supply side — of models we track, how many COULD be
--                         priced. Moves only when the corpus deepens.
--
-- A product can have high demand-side coverage purely because the few models
-- people happen to search are the deep ones, while most of the catalog is
-- unpriceable. That is invisible from the demand side alone, which is the whole
-- reason this file exists.
--
-- `comparable_n >= 8` is MIN_VERDICT_COMPARABLES from
-- engine/listing_identity.py — the same threshold verdict_allows_buy_below()
-- enforces. Hardcoded here rather than imported because a .sql file cannot read
-- Python; if that constant ever moves, this comment is the trail.
--
-- NOTE ON PROVENANCE: METRICS.md previously stated this metric was blocked on
-- adding `model_stats.comparable_n`. That was wrong — the wrong table was
-- checked. The column already exists on `model_signals`, which is where verdict
-- signals are built (db/queries.py:2061). Nothing had to be added.
--
-- `model_signals` is a rolling snapshot of the present, not a time series, so
-- the window is "as of the last rebuild" rather than a range.
SELECT 'band_coverage_supply' AS metric,
       ROUND(
           100.0 * SUM(CASE WHEN comparable_n >= 8 THEN 1 ELSE 0 END)
                 / COUNT(*)
       , 1)                          AS value,
       COUNT(*)                      AS n,
       MIN(updated_at)               AS window_start,
       datetime('now')               AS window_end
  FROM model_signals
 WHERE comparable_n IS NOT NULL;
