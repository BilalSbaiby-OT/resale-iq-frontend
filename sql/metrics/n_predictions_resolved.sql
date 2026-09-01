-- n_predictions_resolved — COUNTER-KPI to band_coverage / MAPE (OS §3)
--
-- floor: 1
--   COUNT. Same reasoning as weekly_trusted_checks. '0 of 340 graded' is precise and damning; there
--   is no small-sample illusion to guard against.
--
-- The site promises outcomes. This counts how many predictions have actually
-- been graded — `evaluated_at IS NOT NULL`.
--
-- It is the counter to band_coverage for a specific reason: coverage measures
-- how often we were willing to SAY something, and this measures how often we
-- ever found out whether we were right. Coverage rising while this stays at
-- zero is a product that talks more and learns nothing.
--
-- EXPECT ZERO, AND DO NOT TREAT ZERO AS A BUG IN THIS FILE. GAPS C4: the
-- predictions table has rows and none are resolved, because the resolver reads
-- the fabricated `is_sold = 1` data and has never completed a real grading pass.
-- This query is the instrument that makes that visible on the dashboard instead
-- of leaving it as a sentence in an audit file.
--
-- Note the value/n split here differs from the rate metrics: `value` is a COUNT
-- (resolved), `n` is the population (all predictions ever). A rate would hide
-- the absolute number, and at this stage the absolute number is the whole story.
SELECT 'n_predictions_resolved' AS metric,
       SUM(CASE WHEN evaluated_at IS NOT NULL THEN 1 ELSE 0 END) AS value,
       COUNT(*)                                                  AS n,
       MIN(created_at)                                           AS window_start,
       datetime('now')                                           AS window_end
  FROM predictions;
