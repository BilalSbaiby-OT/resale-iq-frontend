#!/usr/bin/env python3
"""Prove every sql/metrics/*.sql returns the answer a human worked out by hand.

The fixture is seeded so that each expected number is small enough to verify on
paper — that is the whole method. A test that recomputes the metric in Python
proves only that two implementations agree; a test with a hand-checked constant
proves the query means what the docs say it means.

Usage:  seed_and_assert.py <fixture.db> <repo-root>
Exit 0 iff every assertion holds.
"""
import json
import os
import sqlite3
import subprocess
import sys

# ── The seed. Every row here exists to move exactly one expected number. ─────
#
# verdict_logs, all inside the 7-day window unless noted:
#   1  user 1  BUY   said_buy_below=10  -2d   trusted, and user 1 comes back (row 2)
#   2  user 1  WATCH said_buy_below=NULL -1d  the return visit; not itself trusted
#   3  user 2  BUY   said_buy_below=12  -3d   trusted, never comes back
#   4  user 3  WATCH NULL               -2d   logged in, no band -> not trusted
#   5  user 3  WATCH NULL               -1d
#   6  anon    INSUFFICIENT_DATA        -2d   honest refusal
#   7  anon    UNKNOWN / no_data        -2d   honest refusal
#   8  anon    LIMIT_REACHED            -2d   quota, NOT an answered search
#   9  anon    PENDING                  -1d   in flight, NOT an answered search
#
# By hand:
#   trusted checks (user_id + said_buy_below) = rows 1, 3          -> n = 2
#   of those, user came back within 7d        = row 1 only         -> value = 1
#   answered searches (excl LIMIT_REACHED, PENDING) = rows 1-7     -> n = 7
#   honest refusals among them                = rows 6, 7          -> 2/7 = 28.6%
#   band coverage                             = 5/7                -> 71.4%
VERDICT_ROWS = [
    # (user_id, verdict,           reason,             said_buy_below, age)
    (1,    "BUY",               None,               10.0, "-2 days"),
    (1,    "WATCH",             None,               None, "-1 days"),
    (2,    "BUY",               None,               12.0, "-3 days"),
    (3,    "WATCH",             None,               None, "-2 days"),
    (3,    "WATCH",             None,               None, "-1 days"),
    (None, "INSUFFICIENT_DATA", "thin_comparables", None, "-2 days"),
    (None, "UNKNOWN",           "no_data",          None, "-2 days"),
    (None, "LIMIT_REACHED",     "limit_reached",    None, "-2 days"),
    (None, "PENDING",           None,               None, "-1 days"),
]

# users:
#   1  signed up -40d, active at -2d (= day 38)  -> in cohort, RETAINED
#   2  signed up -40d, active at -3d (= day 37)  -> in cohort, RETAINED
#   4  signed up -40d, never active              -> in cohort, not retained
#   3  signed up  -5d                            -> NOT in cohort (no 30 days yet)
#   retention_30d = 2/3 = 66.7%, n = 3
#
# trials:
#   1  ended -10d, stripe_sub_id set   -> converted
#   2  ended -10d, no sub              -> not converted
#   4  ends  +5d                       -> still open, NOT in cohort
#   3  no trial                        -> NOT in cohort
#   trial_to_paid = 1/2 = 50.0%, n = 2
#
# NOTE user 4 carries plan='operator' with NO stripe_sub_id. That is the trap
# this metric exists to survive: `plan` defaults to a PAID tier name, so any
# query keying on plan would score user 4 as a paying customer.
USER_ROWS = [
    # (id, signup_age, trial_ends_age, stripe_sub_id, plan)
    (1, "-40 days", "-10 days", "sub_live_1", "power"),
    (2, "-40 days", "-10 days", None,         "operator"),
    (3,  "-5 days", None,       None,         "free"),
    (4, "-40 days", "+5 days",  None,         "operator"),
]

# predictions: 3 rows, 1 graded -> value = 1, n = 3
PREDICTION_ROWS = [("samba", "Samba OG", "BUY", "-20 days", "-5 days"),
                   ("jordan 4", "Jordan 4", "WATCH", "-18 days", None),
                   ("levi 501", "Levi 501", "BUY", "-15 days", None)]

# scraper_log — the GAPS C7 test, and the reason this metric is not run_at:
#   -10d  items_new=5   productive but OUTSIDE the 7-day window
#   -3d   items_new=0   ran, landed nothing
#   -2d   items_new=7   the last run that actually DELIVERED  <- the anchor
#   -1h   items_new=0   ran an hour ago, landed nothing
# A liveness clock would say the lag is ~60 minutes. The correct answer is
# ~2880 (2 days). If this assertion ever reads ~60, the metric regressed to
# measuring that a scrape ran rather than that a row landed.
SCRAPER_ROWS = [("vinted", "-10 days", 5),
                ("vinted", "-3 days", 0),
                ("vinted", "-2 days", 7),
                ("vinted", "-60 minutes", 0)]

EXPECT = {
    "weekly_trusted_checks":  {"value": 1,    "n": 2},
    "insufficient_data_rate": {"value": 28.6, "n": 7},
    "band_coverage":          {"value": 71.4, "n": 7},
    "retention_30d":          {"value": 66.7, "n": 3},
    "trial_to_paid":          {"value": 50.0, "n": 2},
    "n_predictions_resolved": {"value": 1,    "n": 3},
    # Time-dependent: assert the band, not the instant.
    "pipeline_lag_min":       {"between": (2860, 2900), "n": 1},
}


def seed(db):
    c = sqlite3.connect(db)
    for uid, signup, trial, sub, plan in USER_ROWS:
        c.execute(
            "INSERT INTO users (id, email, hashed_password, plan, stripe_sub_id, "
            "created_at, trial_ends_at) VALUES (?,?,?,?,?, datetime('now',?), "
            + ("datetime('now',?)" if trial else "NULL") + ")",
            ([uid, f"u{uid}@example.test", "x", plan, sub, signup]
             + ([trial] if trial else [])))

    for uid, verdict, reason, bb, age in VERDICT_ROWS:
        c.execute(
            "INSERT INTO verdict_logs (ip_hash, user_id, query, q_norm, verdict, "
            "reason, said_buy_below, created_at) "
            "VALUES ('h', ?, 'q', 'q', ?, ?, ?, datetime('now', ?))",
            (uid, verdict, reason, bb, age))

    for q, prod, verdict, made, graded in PREDICTION_ROWS:
        c.execute(
            "INSERT INTO predictions (query, product, verdict, created_at, evaluated_at) "
            "VALUES (?,?,?, datetime('now',?), "
            + ("datetime('now',?))" if graded else "NULL)"),
            ([q, prod, verdict, made] + ([graded] if graded else [])))

    for plat, age, new in SCRAPER_ROWS:
        c.execute(
            "INSERT INTO scraper_log (platform, run_at, items_seen, items_new, status) "
            "VALUES (?, datetime('now', ?), ?, ?, 'ok')",
            (plat, age, max(new, 1), new))

    c.commit()
    c.close()


def main():
    fixture, root = sys.argv[1], sys.argv[2]
    seed(fixture)

    out = subprocess.run(
        [sys.executable, os.path.join(root, "scripts/company/metrics.py"),
         "--db", fixture, "--json"],
        capture_output=True, text=True, timeout=60)
    if out.returncode != 0:
        print("FAIL  metrics.py exited", out.returncode)
        print(out.stderr[-2000:])
        return 1

    data = json.loads(out.stdout)
    got = {r["metric"]: r for r in data["results"]}

    passed = failed = 0
    for name, exp in sorted(EXPECT.items()):
        r = got.get(name)
        if r is None:
            print(f"FAIL  {name}: no result (is the .sql file missing?)")
            failed += 1
            continue
        if r.get("unknown"):
            print(f"FAIL  {name}: UNKNOWN — {r.get('why')}")
            failed += 1
            continue

        ok = True
        if r["n"] != exp["n"]:
            print(f"FAIL  {name}: n = {r['n']}, expected {exp['n']}")
            ok = False
        if "between" in exp:
            lo, hi = exp["between"]
            if not (lo <= r["value"] <= hi):
                print(f"FAIL  {name}: value = {r['value']}, expected {lo}..{hi}")
                ok = False
        elif abs(float(r["value"]) - float(exp["value"])) > 0.05:
            print(f"FAIL  {name}: value = {r['value']}, expected {exp['value']}")
            ok = False

        if ok:
            print(f"PASS  {name:<24} value={r['value']:<8} n={r['n']}")
            passed += 1
        else:
            failed += 1

    # Negative control: the contract must be ENFORCED, not merely documented.
    # A .sql that returns the wrong shape has to come back UNKNOWN rather than
    # quietly populating a panel with its first column.
    import tempfile
    with tempfile.TemporaryDirectory() as td:
        bad_dir = os.path.join(td, "metrics")
        os.makedirs(bad_dir)
        open(os.path.join(bad_dir, "bogus.sql"), "w").write("SELECT 1 AS oops;")
        neg = subprocess.run(
            [sys.executable, os.path.join(root, "scripts/company/metrics.py"),
             "--db", fixture, "--sql-dir", bad_dir, "--json"],
            capture_output=True, text=True, timeout=60)
        nd = json.loads(neg.stdout)["results"][0]
        if nd.get("unknown") and "contract violation" in (nd.get("why") or ""):
            print(f"PASS  {'negative-control':<24} off-contract sql -> UNKNOWN")
            passed += 1
        else:
            print(f"FAIL  negative-control: off-contract sql was accepted: {nd}")
            failed += 1

    print(f"\n{passed}/{passed + failed} assertions passed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
