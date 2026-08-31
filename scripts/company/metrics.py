#!/usr/bin/env python3
"""METRICS — run sql/metrics/*.sql and render, without ever inventing a number.

OS §3: "No KPI is ever computed ad hoc." This is the only thing that executes
those files. If a number reaches the founder by another route, that route is the
bug.

    python3 scripts/company/metrics.py                    human-readable
    python3 scripts/company/metrics.py --json             for the dashboard
    python3 scripts/company/metrics.py --db /path/to.db   a specific database

Design rules, each inherited from something that already went wrong here:

  - UNKNOWN is a first-class result, never a zero. build_dashboard.py learned
    this the hard way; a placeholder zero is indistinguishable from a measured
    zero and one of them is a lie.
  - n = 0 is UNKNOWN, not a pass. Inherited from status_report.py, which
    inherited it from a verifier that reported all-clear having inspected
    nothing.
  - A query that CANNOT RUN (missing column on an unmigrated database) reports
    UNKNOWN with the exact missing column, not a crash and not a silent skip.
    The local dev db is missing four columns; discovering that by reading a
    traceback is how it stayed unnoticed.
  - The database is opened READ-ONLY, by URI. A metrics reader has no business
    holding a writable handle to production, and `mode=ro` makes that structural
    rather than a promise.
  - The five-column contract is CHECKED, not assumed. A .sql file that drifts
    out of shape fails loudly here instead of quietly filling a dashboard panel
    with whatever its first column happened to be.
"""
import argparse
import json
import os
import sqlite3
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SQL_DIR = os.path.join(ROOT, "sql", "metrics")

# The company's operational database lives in the sibling repo. Kept as a
# default, not a hardcode: --db points this at production's copy, and the proof
# harness points it at a fixture.
DEFAULT_DB = os.path.join(os.path.dirname(ROOT), "demand-intel", "demand_intel.db")

CONTRACT = ("metric", "value", "n", "window_start", "window_end")


def sql_files(sql_dir=SQL_DIR):
    """Every .sql in the directory, in a stable order. No registry to drift."""
    if not os.path.isdir(sql_dir):
        return []
    return sorted(
        os.path.join(sql_dir, f)
        for f in os.listdir(sql_dir)
        if f.endswith(".sql")
    )


def unknown(metric, why, fix=None):
    return {"metric": metric, "value": None, "unknown": True, "why": why,
            "fix": fix, "n": 0, "window_start": None, "window_end": None}


def run_one(conn, path):
    """Execute one metric file and return a result dict.

    Never raises: one broken query must not take the whole report down. The
    failure becomes an UNKNOWN carrying its own reason, which is the honest
    rendering and also the actionable one.
    """
    stem = os.path.basename(path)[:-4]
    try:
        sql = open(path, encoding="utf-8").read()
    except OSError as e:
        return unknown(stem, f"cannot read {path}: {e}")

    try:
        cur = conn.execute(sql)
        cols = tuple(d[0] for d in cur.description or ())
        rows = cur.fetchall()
    except sqlite3.OperationalError as e:
        msg = str(e)
        # The common, expected case: an unmigrated database. Say which column,
        # because "no such column: user_id" is a fix and "query failed" is not.
        fix = ("run db.schema.init_db() against this database — it is missing "
               "migrated columns") if "no such column" in msg else None
        return unknown(stem, msg, fix)
    except sqlite3.Error as e:
        return unknown(stem, f"{type(e).__name__}: {e}")

    if cols != CONTRACT:
        return unknown(
            stem,
            f"contract violation: returned {cols}, expected {CONTRACT}",
            "see sql/metrics/README.md — five columns, in order")
    if len(rows) != 1:
        return unknown(stem, f"contract violation: returned {len(rows)} rows, expected exactly 1")

    metric, value, n, w0, w1 = rows[0]
    n = int(n or 0)

    # The two ways a run produces no knowledge. Both render UNKNOWN, and they
    # are reported separately because they have different fixes: n = 0 means go
    # get data, value IS NULL means the query declined to divide by nothing.
    if n == 0:
        return unknown(metric or stem, "inspected nothing (n = 0)",
                       "no rows in the measurement window yet")
    if value is None:
        return unknown(metric or stem, "query returned NULL over a non-empty population",
                       "check the metric's own notes in its .sql file")

    return {"metric": metric or stem, "value": value, "unknown": False,
            "n": n, "window_start": w0, "window_end": w1}


def collect(db_path, sql_dir=SQL_DIR):
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    files = sql_files(sql_dir)

    if not os.path.exists(db_path):
        return {"generated_at": stamp, "db": db_path,
                "results": [unknown(os.path.basename(f)[:-4],
                                    f"database not found: {db_path}",
                                    "pass --db, or check the sibling repo is present")
                            for f in files]}

    # Read-only URI. A metrics run must not be able to write, even by accident.
    uri = "file:" + db_path.replace("?", "%3f").replace("#", "%23") + "?mode=ro"
    try:
        conn = sqlite3.connect(uri, uri=True, timeout=10)
    except sqlite3.Error as e:
        return {"generated_at": stamp, "db": db_path,
                "results": [unknown(os.path.basename(f)[:-4], f"cannot open db: {e}")
                            for f in files]}

    try:
        results = [run_one(conn, f) for f in files]
    finally:
        conn.close()

    return {"generated_at": stamp, "db": db_path, "results": results}


def render(data):
    """The founder's view. Known numbers first, then what we do not know and why."""
    res = data.get("results", [])
    known = [r for r in res if not r.get("unknown")]
    unk = [r for r in res if r.get("unknown")]

    out = ["METRICS   " + data.get("generated_at", "")]
    out.append("db: " + data.get("db", "?"))
    out.append("")

    if known:
        out.append("MEASURED")
        for r in known:
            v = r["value"]
            v = f"{v:g}" if isinstance(v, (int, float)) else str(v)
            out.append(f"  {r['metric']:<26} {v:>10}   n={r['n']}")
            out.append(f"  {'':<26} {r.get('window_start')} -> {r.get('window_end')}")
    else:
        out.append("MEASURED — nothing. Every metric is UNKNOWN.")

    if unk:
        out.append("")
        out.append("UNKNOWN — asked, no answer (never rendered as zero)")
        for r in unk:
            out.append(f"  {r['metric']:<26} {r.get('why')}")
            if r.get("fix"):
                out.append(f"  {'':<26}   -> {r['fix']}")

    out.append("")
    out.append(f"  {len(res)} metrics · {len(known)} measured · {len(unk)} unknown")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--db", default=DEFAULT_DB, help="database to measure (read-only)")
    ap.add_argument("--sql-dir", default=SQL_DIR, help="directory of .sql metric files")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    args = ap.parse_args()

    data = collect(args.db, args.sql_dir)
    print(json.dumps(data, indent=2) if args.json else render(data))

    # Exit 0 even with UNKNOWNs. Not knowing something is the normal state of
    # this company and must not fail a scheduled job; a metric that CANNOT be
    # computed is reported, not raised.
    return 0


if __name__ == "__main__":
    sys.exit(main())
