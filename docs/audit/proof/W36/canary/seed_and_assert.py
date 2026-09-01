#!/usr/bin/env python3
"""Seeds a migrated fixture DB, freezes it, mutates it, diffs it, asserts.

Called by proof.sh with the fixture path and the resale-iq repo root.
Never touches production. Deletes nothing outside the sandbox it is given.
"""
import json
import os
import sqlite3
import subprocess
import sys

FIXTURE = sys.argv[1]
ROOT = sys.argv[2]
CANARY_DIR = os.path.join(ROOT, "scripts", "canary")
FROZEN = os.path.join(os.path.dirname(FIXTURE), "frozen_test.json")

FAILS = []
N_CHECKS = 0


def check(cond, msg):
    global N_CHECKS
    N_CHECKS += 1
    if not cond:
        FAILS.append(msg)
        print("  FAIL  %s" % msg)
    else:
        print("  ok    %s" % msg)


def seed():
    con = sqlite3.connect(FIXTURE)
    c = con.cursor()
    # Six rows: two verdict-eligible (n>=8), three admitted-not-eligible
    # (n=3-7, one with a NULL price_iqr_eur), one exactly at the n=7/n=8
    # boundary pair partner. Zone defaults 'EUR'.
    rows = [
        # brand, model, category, sold_7d, sold_30d, avg, median, iqr, buy_below, dts, plat, sizes, active, str_pct, dq, comparable_n
        ("TestBrand", "Stable8", "shoes", 5, 12, 100.0, 95.0, 20.0, 66.5, 10.0, "vinted", "[]", 30, 40.0, 70, 8),
        ("TestBrand", "WillChange8", "shoes", 5, 12, 100.0, 95.0, 20.0, 66.5, 10.0, "vinted", "[]", 30, 40.0, 70, 8),
        ("TestBrand", "AtSeven", "shoes", 2, 5, 80.0, 78.0, 15.0, None, 8.0, "vinted", "[]", 10, 30.0, 55, 7),
        ("TestBrand", "NullIqr", "bags", 1, 3, 50.0, 50.0, None, None, 5.0, "vinted", "[]", 5, 20.0, 40, 3),
        ("TestBrand", "WillVanish", "bags", 1, 3, 50.0, 50.0, None, None, 5.0, "vinted", "[]", 5, 20.0, 40, 3),
        ("TestBrand", "UntouchedControl", "bags", 9, 20, 200.0, 190.0, 30.0, 133.0, 12.0, "vinted", "[]", 40, 45.0, 80, 9),
    ]
    for r in rows:
        c.execute("""INSERT INTO model_signals
            (brand, model, category, sold_7d, sold_30d, avg_price_eur, median_price_eur,
             price_iqr_eur, max_buy_price, avg_days_to_sell, best_platform, top_sizes,
             active_listings, str_pct, data_quality_score, comparable_n)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", r)
    con.commit()
    con.close()


def freeze():
    p = subprocess.run(
        [sys.executable, os.path.join(CANARY_DIR, "freeze_drift_canary.py"),
         "--db", FIXTURE, "--out", FROZEN, "--target", "6", "--force"],
        capture_output=True, text=True)
    check(p.returncode == 0, "freeze_drift_canary.py exits 0 (%s)" % p.stderr[:200])
    check(os.path.exists(FROZEN), "frozen_test.json was written")
    with open(FROZEN) as fh:
        doc = json.load(fh)
    check(len(doc["rows"]) == 6, "froze all 6 fixture rows (got %d)" % len(doc["rows"]))
    ids_by_model = {r["model"]: r["id"] for r in doc["rows"]}
    check(set(ids_by_model) == {
        "Stable8", "WillChange8", "AtSeven", "NullIqr", "WillVanish", "UntouchedControl"},
        "frozen set contains exactly the 6 seeded models")
    stable = next(r for r in doc["rows"] if r["model"] == "Stable8")
    check(stable["verdict"] == "BUY_BELOW_ELIGIBLE",
          "n=8 row frozen as BUY_BELOW_ELIGIBLE")
    at_seven = next(r for r in doc["rows"] if r["model"] == "AtSeven")
    check(at_seven["verdict"] == "INSUFFICIENT_DATA",
          "n=7 row frozen as INSUFFICIENT_DATA (fails closed, matches "
          "engine.listing_identity.verdict_allows_buy_below)")
    return ids_by_model


def mutate(ids_by_model):
    con = sqlite3.connect(FIXTURE)
    c = con.cursor()
    # 1. Drop WillChange8 from n=8 to n=7: a verdict flip, buy-below eligible -> not.
    c.execute("UPDATE model_signals SET comparable_n=7, avg_price_eur=110.0 WHERE id=?",
              (ids_by_model["WillChange8"],))
    # 2. Move AtSeven's price without touching comparable_n: a plain price drift.
    c.execute("UPDATE model_signals SET avg_price_eur=88.0, median_price_eur=85.0 WHERE id=?",
              (ids_by_model["AtSeven"],))
    # 3. Delete WillVanish entirely: the model dropped off the board.
    c.execute("DELETE FROM model_signals WHERE id=?", (ids_by_model["WillVanish"],))
    # NullIqr, Stable8, UntouchedControl: left untouched on purpose (negative control).
    con.commit()
    con.close()


def run_diff(expect_drift):
    p = subprocess.run(
        [sys.executable, os.path.join(CANARY_DIR, "run_drift_canary.py"),
         "--db", FIXTURE, "--frozen", FROZEN, "--json", "--no-log"],
        capture_output=True, text=True)
    if expect_drift:
        check(p.returncode == 1, "run_drift_canary.py exits 1 when drift is present")
    else:
        check(p.returncode == 0, "run_drift_canary.py exits 0 when nothing moved")
    report = json.loads(p.stdout)
    return report


def assert_drift_report(report):
    check(report["n_watched"] == 6, "report watched all 6 rows")
    check(report["n_missing"] == 1, "exactly 1 row reported MISSING (WillVanish)")
    check(report["n_changed"] == 2, "exactly 2 rows reported CHANGED (WillChange8, AtSeven)")
    check(report["n_unchanged"] == 3, "exactly 3 rows reported UNCHANGED")
    check(report["n_verdict_flips"] == 1, "exactly 1 verdict flip detected (WillChange8)")

    by_label_prefix = {r["label"].split(" (")[0]: r for r in report["rows"]}
    wc8 = by_label_prefix.get("TestBrand WillChange8")
    check(wc8 is not None and wc8["status"] == "CHANGED", "WillChange8 reported CHANGED")
    check(wc8["fields_moved"]["verdict"]["was"] == "BUY_BELOW_ELIGIBLE"
          and wc8["fields_moved"]["verdict"]["now"] == "INSUFFICIENT_DATA",
          "WillChange8 verdict flip reported was/now correctly (eligible -> insufficient)")
    check(wc8["fields_moved"]["comparable_n"]["delta"] == -1,
          "WillChange8 comparable_n delta is exactly -1")

    at7 = by_label_prefix.get("TestBrand AtSeven")
    check(at7 is not None and "sell_avg_eur" in at7["fields_moved"],
          "AtSeven price drift reported on sell_avg_eur")
    d = at7["fields_moved"]["sell_avg_eur"]
    check(abs(d["delta"] - 8.0) < 1e-9, "AtSeven sell_avg_eur delta is exactly +8.0 (80 -> 88)")
    check("pct_delta" in d and abs(d["pct_delta"] - 10.0) < 1e-6,
          "AtSeven sell_avg_eur pct_delta is exactly +10.0%")
    check("verdict" not in at7["fields_moved"],
          "AtSeven verdict did NOT flip (price moved but n stayed at 7)")

    vanish = by_label_prefix.get("TestBrand WillVanish")
    check(vanish is not None and vanish["status"] == "MISSING",
          "WillVanish reported MISSING, not silently dropped from the report")

    for name in ("TestBrand Stable8", "TestBrand NullIqr", "TestBrand UntouchedControl"):
        r = by_label_prefix.get(name)
        check(r is not None and r["status"] == "UNCHANGED",
              "%s correctly reported UNCHANGED (negative control)" % name)


def assert_negative_control(report):
    check(report["n_changed"] == 0, "negative control: 0 changed on an untouched re-read")
    check(report["n_missing"] == 0, "negative control: 0 missing on an untouched re-read")
    check(report["n_verdict_flips"] == 0, "negative control: 0 verdict flips")


def main():
    print("seed...")
    seed()
    print("freeze...")
    ids = freeze()
    print("re-run freeze without --force (must refuse to overwrite)...")
    p = subprocess.run(
        [sys.executable, os.path.join(CANARY_DIR, "freeze_drift_canary.py"),
         "--db", FIXTURE, "--out", FROZEN, "--target", "6"],
        capture_output=True, text=True)
    check(p.returncode != 0, "freeze refuses to overwrite an existing frozen_test.json "
                              "without --force")
    print("negative control: diff against itself, nothing mutated yet...")
    report0 = run_diff(expect_drift=False)
    assert_negative_control(report0)
    print("mutate (flip a verdict, drift a price, delete a row)...")
    mutate(ids)
    print("diff after mutation...")
    report1 = run_diff(expect_drift=True)
    assert_drift_report(report1)

    print()
    if FAILS:
        print("PROOF FAILED (%d assertion(s)):" % len(FAILS))
        for f in FAILS:
            print("  - %s" % f)
        sys.exit(1)
    print("PROOF PASSED — %d assertions, 0 failures" % N_CHECKS)


if __name__ == "__main__":
    main()
