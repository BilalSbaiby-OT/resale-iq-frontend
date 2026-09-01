-- band_evidence_p50 — the HONESTY COUNTER to band coverage (OS §0 rule 4)
--
-- floor: 20
--   MEDIAN, not a proportion, so it tolerates a smaller population than the rate
--   metrics: a median is driven by the middle of the distribution rather than by
--   its tails. Below ~20 it starts moving on one or two rows, which is where it
--   stops being a summary and becomes an anecdote.
--
-- The median number of clean comparables behind a band we would actually print.
--
-- WHY THIS EXISTS, and it is a defect report as much as a metric.
--
-- OS §0 rule 4: no KPI without its counter-KPI. `band_coverage`'s declared
-- counter was `insufficient_data_rate` -- and that counter is MATHEMATICALLY
-- INCAPABLE of the job. The two are exact complements on the same population
-- (band_coverage = 100 - insufficient_data_rate, by construction, as
-- insufficient_data_rate.sql says in its own header). A counter that can never
-- contradict its primary is not a counter. `data-scientist` refused to carry
-- that card rather than quietly satisfy it, 2026-09-01.
--
-- The other declared counter, `n_predictions_resolved`, is 0 of 340 and has
-- never produced a row. So coverage -- about to move ~19pp under A13 -- has had
-- no working honesty check at all.
--
-- WHAT MAKES THIS ONE WORK: it moves in OPPOSITE directions for the two ways of
-- raising coverage, which is precisely what §0.4 asks a counter to do.
-- Measured against production, n=180 answered searches, 2026-08-12..2026-09-01:
--
--     today                                  113 bands printed, median evidence 12
--     A13 (use the 30d window already built) 146 bands printed, median evidence 26  UP
--     lower the threshold 8 -> 5             144 bands printed, median evidence 10  DOWN
--
-- The two interventions land within one point of each other on coverage (81.1%
-- vs 80.0%) and are opposite in honesty. Coverage alone cannot tell them apart.
-- This can.
--
-- SCOPE, stated because it is narrower than the name suggests: this is the
-- SUPPLY side -- evidence behind models that COULD be priced. The demand-side
-- version (evidence behind bands actually delivered to people) is not computable
-- yet: `verdict_logs` does not persist `comparable_n`, which is the open A8-3
-- item. When that column lands, add the demand-side sibling; do not silently
-- redefine this one.
WITH banded AS (
    SELECT comparable_n
      FROM model_signals
     WHERE comparable_n IS NOT NULL
       AND comparable_n >= 8          -- MIN_VERDICT_COMPARABLES
),
c AS (SELECT COUNT(*) AS k FROM banded)
SELECT 'band_evidence_p50' AS metric,
       (SELECT AVG(comparable_n) FROM (
            SELECT comparable_n FROM banded
             ORDER BY comparable_n
             LIMIT 2 - ((SELECT k FROM c) % 2)
            OFFSET (SELECT MAX((k - 1) / 2, 0) FROM c)
       ))                                       AS value,
       (SELECT k FROM c)                        AS n,
       (SELECT MIN(updated_at) FROM model_signals) AS window_start,
       datetime('now')                          AS window_end;
