-- retention_30d — Company KPI, owner product-manager (OS §3)
--
-- floor: 100
--   PROPORTION. Currently n=0 (the oldest account is 28 days old), so this is UNKNOWN on its own
--   terms already. The floor is what stops it publishing a rate over the first three cohort members.
--
-- "Still here 30 days after signing up."
--
-- Cohort (n): every user who signed up at least 30 days ago, so they have
-- actually HAD 30 days in which to come back. Users younger than that are
-- excluded rather than counted as churned — including them would make the
-- number fall every time signups rise, which is the classic way a retention
-- chart lies about a growing product.
--
-- Retained: any verdict_logs activity on or after day 30 of their own signup.
-- Activity is the only durable trace a user leaves in this schema; there is no
-- session or login-event table, so "came back" means "used the product".
--
-- Deliberately NOT counted as retention: still having a row in `users`, or
-- still holding a plan. Both are true of an account nobody has opened since
-- February.
WITH win AS (
    SELECT datetime('now', '-30 days') AS lo,   -- newest signup eligible for the cohort
           datetime('now')             AS hi
),
cohort AS (
    SELECT u.id, u.created_at
      FROM users u, win
     WHERE u.created_at IS NOT NULL
       AND u.created_at <= win.lo
),
retained AS (
    SELECT c.id
      FROM cohort c
     WHERE EXISTS (
         SELECT 1
           FROM verdict_logs v
          WHERE v.user_id    = c.id
            AND v.created_at >= datetime(c.created_at, '+30 days')
     )
)
SELECT 'retention_30d' AS metric,
       ROUND(
           100.0 * (SELECT COUNT(*) FROM retained)
                 / (SELECT COUNT(*) FROM cohort)
       , 1)                             AS value,
       (SELECT COUNT(*) FROM cohort)    AS n,
       (SELECT MIN(created_at) FROM cohort) AS window_start,
       (SELECT hi FROM win)             AS window_end;
