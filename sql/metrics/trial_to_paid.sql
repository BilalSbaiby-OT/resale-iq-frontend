-- trial_to_paid — Revenue KPI, owner monetization (OS §3)
--
-- Of the trials that have ENDED, what share is now paying.
--
-- THE TRAP IN THIS TABLE, and the reason this file exists rather than a
-- one-liner someone writes into a dashboard: `users.plan` defaults to
-- 'operator' (db/schema.py, `plan TEXT NOT NULL DEFAULT 'operator'`). 'operator'
-- is a PAID tier name. So every account ever created reads as a paying operator
-- until something overwrites it, and `WHERE plan != 'free'` — the obvious query —
-- reports a conversion rate near 100% at EUR 0 MRR.
--
-- Paid is therefore defined as `stripe_sub_id IS NOT NULL`: a subscription
-- object that Stripe created. That is a fact about money, not a column default.
--
-- Cohort (n): trials whose trial_ends_at is in the past. An open trial has not
-- converted OR failed yet and belongs in neither half.
--
-- Cross-check, not a substitute: Stripe is the book of record for revenue
-- (docs/company/METRICS.md, `mrr`). This query answers "did our trials convert",
-- from our own data. If it ever disagrees with Stripe's subscription count, the
-- disagreement is the finding.
WITH win AS (
    SELECT datetime('now') AS hi
),
cohort AS (
    SELECT u.id, u.stripe_sub_id, u.trial_ends_at
      FROM users u, win
     WHERE u.trial_ends_at IS NOT NULL
       AND u.trial_ends_at < win.hi
)
SELECT 'trial_to_paid' AS metric,
       ROUND(
           100.0 * SUM(CASE WHEN stripe_sub_id IS NOT NULL AND stripe_sub_id != ''
                            THEN 1 ELSE 0 END) / COUNT(*)
       , 1)                                  AS value,
       COUNT(*)                              AS n,
       MIN(trial_ends_at)                    AS window_start,
       (SELECT hi FROM win)                  AS window_end
  FROM cohort;
