-- insufficient_data_rate — COUNTER-KPI to the North Star (OS §3)
--
-- floor: 100
--   PROPORTION, over the same population as band_coverage, so it takes the same floor. If one of a
--   complementary pair renders and the other does not, the pair is lying by omission.
--
-- "Honesty must not fall to inflate it." The North Star counts checks that
-- printed a band. The cheapest way to raise it is to print bands we have no
-- business printing, so this measures the opposite face: of the searches we
-- ANSWERED, what share did we honestly decline to price?
--
-- A rising North Star with a collapsing insufficient rate is the failure mode
-- this pair exists to catch.
--
-- Population: answered searches only.
--   * LIMIT_REACHED is excluded — the quota stopped it, the data never got a
--     chance to. Counting it as an honesty event would flatter this number
--     every time the free tier filled up.
--   * PENDING is excluded — an anon quota row reserved but never resolved. It
--     is an in-flight row, not an outcome. (If PENDING is ever a large share,
--     that is its own bug: see METRICS.md.)
--
-- Numerator, from api/routes.py:
--   INSUFFICIENT_DATA / thin_comparables  — model known, too few clean comps
--   UNKNOWN / model_too_vague|ambiguous|no_data — we could not identify it
-- Both are the product declining to invent a number, which is the behaviour
-- being protected.
--
-- SQLite returns NULL for x/0, so an empty window lands on UNKNOWN by itself.
-- That is deliberate: see sql/metrics/README.md.
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
SELECT 'insufficient_data_rate' AS metric,
       ROUND(
           100.0 * SUM(CASE WHEN verdict IN ('INSUFFICIENT_DATA', 'UNKNOWN')
                            THEN 1 ELSE 0 END) / COUNT(*)
       , 1)                      AS value,
       COUNT(*)                  AS n,
       (SELECT lo FROM win)      AS window_start,
       (SELECT hi FROM win)      AS window_end
  FROM answered;
