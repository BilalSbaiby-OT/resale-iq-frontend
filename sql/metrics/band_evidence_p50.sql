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
-- WHAT THIS ACTUALLY MEASURES -- corrected 2026-09-01 after `data-scientist`
-- REJECTED the first version of this header. The SQL below is right; the
-- justification written above it was not.
--
-- The header used to quote 113/12 -> 146/26 -> 144/10 and claim this metric
-- RISES under A13. Those are DEMAND-side figures, weighted by what people
-- actually search (n=180 searches). This query is SUPPLY-side (n~40 models).
-- They are different populations and were never this file's output.
--
-- Recomputed on production, supply-side, which is what this query returns:
--
--     today   (7d window, threshold 8)     k=39   median 14
--     A13     (widened window, threshold 8) k=62   median 13.0   <- FALLS
--     cheat   (7d window, threshold 5)      k=62   median  9.0   <- falls further
--
-- IT FALLS UNDER THE HONEST INTERVENTION. Not because any model got worse --
-- none did, and 19 got dramatically better -- but because the 19 models that
-- cross enter at comparable_n 8-19, BELOW the existing median of 14. Adding
-- members at the low end of a pool drags the median down. That is a COMPOSITION
-- EFFECT, and this statistic is composition-sensitive: its population changes
-- size under exactly the intervention it was built to police.
--
-- CONSEQUENCE, and the reason this correction had to happen before anything
-- shipped: OS §7 says a counter may not degrade > 2pp. Registering A13 against
-- this metric would have scored the honest change a MISS. The counter built to
-- tell the honest intervention from the dishonest one would have blocked the
-- honest one.
--
-- SO IT IS A ONE-SIDED COUNTER, not a broken one. It still catches the real
-- gaming risk unambiguously -- lowering the threshold takes it 14 -> 9.0 -- and
-- that is worth keeping. It simply must not be used as a gate on a change that
-- widens the pool.
--
-- DO NOT pre-register a coverage-widening change against this metric. Use the
-- two composition-immune assertions instead: MIN(comparable_n) over banded rows
-- must equal 8 (moves only if the threshold moves), and no model's comparable_n
-- may decrease (zero by construction when widening a window).
--
-- The two-sided version needs `verdict_logs.comparable_n`, which does not exist
-- yet -- the same column A8-3 needs. When it lands, add the demand-weighted
-- sibling; do not redefine this one.
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
