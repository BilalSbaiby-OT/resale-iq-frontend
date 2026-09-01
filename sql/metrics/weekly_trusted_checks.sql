-- weekly_trusted_checks — THE NORTH STAR (OS §3)
--
-- floor: 1
--   COUNT, not a rate -- and this is the distinction the floor exists to make visible rather than
--   paper over. 'We served 1 trusted check and 0 returned' is a true and useful statement; '0.0%
--   conversion, n=1' is not. A count reported WITH its n cannot mislead about precision, because
--   the n is the whole claim. Rates hide their own uncertainty; counts do not.
--
-- Definition, verbatim from OS §3: "checks that returned a band with n >= 8 to a
-- user who came back within 7 days."
--
-- Three decisions this query makes, each of which changes the number:
--
-- 1. "returned a band with n >= 8" is read as `said_buy_below IS NOT NULL`.
--    comparable_n is NOT persisted anywhere — verdict_logs has no such column
--    (checked against a migrated schema, not the stale dev db). But buy_below is
--    only ever emitted through verdict_allows_buy_below(), which requires
--    comparable_n >= MIN_VERDICT_COMPARABLES (= 8), so a non-null said_buy_below
--    is the n >= 8 gate having passed, by construction.
--    CAVEAT, and it is a real one: engine/listing_identity.py:50-58 FAILS OPEN —
--    when comparable_n is absent it returns True. So this count inherits GAPS C5
--    and is an UPPER BOUND on trusted checks, not an exact count. Fixing C5
--    tightens this metric with no change to this file.
--
-- 2. "to a user" is read as `user_id IS NOT NULL`, i.e. logged in. Anonymous
--    checks resolve through resolve_anon_verdict(), which sets `verdict` but
--    never said_buy_below, and an anonymous visitor has no identity that could
--    "come back" in the first place. The North Star is a logged-in metric.
--
-- 3. "came back within 7 days" is any later verdict_logs row from the same user
--    within 7 days of the trusted check. Returning is measured by activity, not
--    by a session table, because there is no session table.
--
-- n = trusted checks in the window (the population). value = how many of those
-- were delivered to a user who returned. value/n is the return rate; the North
-- Star itself is `value`.
WITH win AS (
    SELECT datetime('now', '-7 days') AS lo,
           datetime('now')            AS hi
),
trusted AS (
    SELECT v.id, v.user_id, v.created_at
      FROM verdict_logs v, win
     WHERE v.user_id IS NOT NULL
       AND v.said_buy_below IS NOT NULL
       AND v.created_at >= win.lo
       AND v.created_at <  win.hi
),
returned AS (
    SELECT t.id
      FROM trusted t
     WHERE EXISTS (
         SELECT 1
           FROM verdict_logs r
          WHERE r.user_id     =  t.user_id
            AND r.created_at  >  t.created_at
            AND r.created_at  <= datetime(t.created_at, '+7 days')
     )
)
SELECT 'weekly_trusted_checks'          AS metric,
       (SELECT COUNT(*) FROM returned)  AS value,
       (SELECT COUNT(*) FROM trusted)   AS n,
       (SELECT lo FROM win)             AS window_start,
       (SELECT hi FROM win)             AS window_end;
