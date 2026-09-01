#!/usr/bin/env python3
"""run_drift_canary.py — recompute the 60 frozen model_signals rows and diff.

READ THIS FIRST: this tool detects DRIFT, not CORRECTNESS.

    "canary green" here means "the 60 watched rows read the same today as
    they did when frozen." It does NOT mean "the numbers are right." Nobody
    has ever labelled a single one of these 60 rows against a real outcome —
    there is no ground-truth sold price on this platform (docs/audit/DATA.md
    Sec2) — so there is nothing for this script to check the frozen values
    AGAINST except themselves. A row can be "canary green" and wrong on both
    readings. A row can go "canary red" because the pipeline got MORE
    correct. Silence is not correctness; noise is not incorrectness. This
    script can only ever say two things: WHAT changed, and BY HOW MUCH. It
    cannot say whether either the old or the new number was ever right.

See docs/audit/canary/DRIFT_CANARY.md for the full CAN / CANNOT list before
using this in any report to the founder.

Usage:
    python3 scripts/canary/run_drift_canary.py                  # reads prod (ssh, read-only)
    python3 scripts/canary/run_drift_canary.py --db FIXTURE.db  # reads a local sqlite file instead
    python3 scripts/canary/run_drift_canary.py --json           # machine-readable report only

Never writes to production. Appends one line to
docs/audit/canary/runs/log.jsonl and prints a human report to stdout. Exit
code 0 = no field on any watched row moved since freeze. Exit code 1 = at
least one did — a signal to go look, not a test failure.
"""
import argparse
import json
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _prod import fetch_model_signals_prod, fetch_model_signals_local  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FROZEN_PATH = os.path.join(ROOT, "docs", "audit", "canary", "frozen_set.json")
LOG_PATH = os.path.join(ROOT, "docs", "audit", "canary", "runs", "log.jsonl")

# Numeric fields worth reporting a delta on. Text/derived fields are compared
# for equality only (a % delta on a category string is meaningless).
NUMERIC_FIELDS = [
    "comparable_n", "sold_7d", "sold_30d", "avg_price_eur", "median_price_eur",
    "price_iqr_eur", "max_buy_price", "active_listings", "data_quality_score",
]
IDENTITY_FIELDS = ["brand", "model", "category"]
MIN_VERDICT_COMPARABLES = 8  # engine.listing_identity.MIN_VERDICT_COMPARABLES


def verdict_of(comparable_n):
    try:
        return "BUY_BELOW_ELIGIBLE" if int(comparable_n) >= MIN_VERDICT_COMPARABLES \
            else "INSUFFICIENT_DATA"
    except (TypeError, ValueError):
        return "INSUFFICIENT_DATA"


def pct_delta(old, new):
    if old in (None, 0) or new is None:
        return None
    return round((new - old) / abs(old) * 100.0, 1)


def diff_row(frozen, current):
    """Compare one frozen row (from frozen_set.json) to one current row.

    frozen uses the frozen_set.json field names (sell_avg_eur etc); current
    uses the raw model_signals column names from _prod.FIELDS. Mapped here
    once so the rest of the file only deals with one vocabulary.
    """
    cur_map = {
        "comparable_n": current.get("comparable_n"),
        "sold_7d": current.get("sold_7d"),
        "sold_30d": current.get("sold_30d"),
        "sell_avg_eur": current.get("avg_price_eur"),
        "sell_median_eur": current.get("median_price_eur"),
        "price_iqr_eur": current.get("price_iqr_eur"),
        "buy_below_eur": current.get("max_buy_price"),
        "active_listings": current.get("active_listings"),
        "data_quality_score": current.get("data_quality_score"),
    }
    frozen_map = {
        "comparable_n": frozen.get("comparable_n"),
        "sold_7d": frozen.get("sold_7d"),
        "sold_30d": frozen.get("sold_30d"),
        "sell_avg_eur": frozen.get("sell_avg_eur"),
        "sell_median_eur": frozen.get("sell_median_eur"),
        "price_iqr_eur": frozen.get("price_iqr_eur"),
        "buy_below_eur": frozen.get("buy_below_eur"),
        "active_listings": frozen.get("active_listings"),
        "data_quality_score": frozen.get("data_quality_score"),
    }

    moved = {}
    for k, old in frozen_map.items():
        new = cur_map[k]
        if old != new:
            entry = {"was": old, "now": new}
            if isinstance(old, (int, float)) and isinstance(new, (int, float)):
                entry["delta"] = round(new - old, 4)
                pd = pct_delta(old, new)
                if pd is not None:
                    entry["pct_delta"] = pd
            moved[k] = entry

    for k in IDENTITY_FIELDS:
        if frozen.get(k) != current.get(k):
            moved[k] = {"was": frozen.get(k), "now": current.get(k)}

    old_verdict = frozen.get("verdict")
    new_verdict = verdict_of(current.get("comparable_n"))
    verdict_flip = old_verdict != new_verdict
    if verdict_flip:
        moved["verdict"] = {"was": old_verdict, "now": new_verdict}

    return moved, verdict_flip


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", help="local sqlite file (mode=ro) instead of production")
    ap.add_argument("--frozen", default=FROZEN_PATH, help="path to frozen_set.json")
    ap.add_argument("--json", action="store_true", help="print only the JSON report")
    ap.add_argument("--no-log", action="store_true", help="do not append to runs/log.jsonl")
    args = ap.parse_args()

    with open(args.frozen, encoding="utf-8") as fh:
        frozen_doc = json.load(fh)
    frozen_rows = {r["id"]: r for r in frozen_doc["rows"]}
    ids = sorted(frozen_rows)

    run_started = datetime.now(timezone.utc).isoformat()
    source = "local:%s" % args.db if args.db else "production (ssh, read-only)"
    try:
        if args.db:
            current_rows, meta = fetch_model_signals_local(args.db, ids=ids)
        else:
            current_rows, meta = fetch_model_signals_prod(ids=ids)
    except Exception as e:
        report = {
            "run_at_utc": run_started,
            "source": source,
            "frozen_at_utc": frozen_doc.get("frozen_at_utc"),
            "status": "UNKNOWN",
            "why": "could not read the current data: %s" % str(e)[:300],
        }
        _emit(report, args)
        sys.exit(2)

    current_by_id = {r["id"]: r for r in current_rows}

    row_reports = []
    n_missing = 0
    n_changed = 0
    n_verdict_flips = 0
    n_unchanged = 0

    for rid in ids:
        frozen = frozen_rows[rid]
        label = "%s %s (id=%s)" % (frozen["brand"], frozen["model"], rid)
        if rid not in current_by_id:
            n_missing += 1
            row_reports.append({
                "id": rid, "label": label, "status": "MISSING",
                "note": "row no longer exists in current model_signals — "
                        "the model dropped off the board entirely",
            })
            continue
        moved, verdict_flip = diff_row(frozen, current_by_id[rid])
        if verdict_flip:
            n_verdict_flips += 1
        if moved:
            n_changed += 1
            row_reports.append({
                "id": rid, "label": label, "status": "CHANGED",
                "fields_moved": moved,
                "was_hard_case": bool(frozen.get("hard_case_reason")),
            })
        else:
            n_unchanged += 1
            row_reports.append({"id": rid, "label": label, "status": "UNCHANGED"})

    window_start = frozen_doc.get("frozen_at_utc")
    window_end = run_started
    n_watched = len(ids)

    report = {
        "run_at_utc": run_started,
        "source": source,
        "frozen_at_utc": window_start,
        "n_watched": n_watched,
        "n_unchanged": n_unchanged,
        "n_changed": n_changed,
        "n_missing": n_missing,
        "n_verdict_flips": n_verdict_flips,
        "corpus_fingerprint_now": meta,
        "corpus_fingerprint_at_freeze": frozen_doc.get("corpus_fingerprint_at_freeze"),
        # Shaped like the sql/metrics/ five-column contract (metric, value, n,
        # window_start, window_end) for reporting consistency ONLY. This is
        # NOT a sql/metrics/*.sql file and is NOT wired into metrics.py or
        # the dashboard's quality.canary panel — see DRIFT_CANARY.md for why:
        # a diff between two point-in-time snapshots isn't expressible as one
        # SQL query against a single live database, which is what that
        # contract assumes.
        "metric_shaped_summary": {
            "metric": "canary_drift_rate",
            "value": round(n_changed / n_watched, 4) if n_watched else None,
            "n": n_watched,
            "window_start": window_start,
            "window_end": window_end,
        },
        "rows": row_reports,
        "can_conclude": "the 60 watched rows are unchanged / changed / gone since freeze, "
                        "and by how much.",
        "cannot_conclude": "that any value, changed or not, is CORRECT. No row here has ever "
                            "been checked against a real outcome. See DRIFT_CANARY.md.",
    }

    _emit(report, args)

    if not args.no_log:
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        with open(LOG_PATH, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(report, ensure_ascii=False) + "\n")

    sys.exit(0 if (n_changed == 0 and n_missing == 0) else 1)


def _emit(report, args):
    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return
    print("DRIFT CANARY RUN — %s" % report.get("run_at_utc"))
    print("source: %s" % report.get("source"))
    if report.get("status") == "UNKNOWN":
        print("UNKNOWN — %s" % report.get("why"))
        return
    print("frozen at: %s" % report.get("frozen_at_utc"))
    print("watched: %d   unchanged: %d   changed: %d   missing: %d   verdict flips: %d" % (
        report["n_watched"], report["n_unchanged"], report["n_changed"],
        report["n_missing"], report["n_verdict_flips"]))
    print()
    for r in report["rows"]:
        if r["status"] == "UNCHANGED":
            continue
        if r["status"] == "MISSING":
            print("  MISSING  %s — %s" % (r["label"], r["note"]))
            continue
        tag = "HARD-CASE " if r.get("was_hard_case") else ""
        print("  CHANGED  %s%s" % (tag, r["label"]))
        for field, d in r["fields_moved"].items():
            extra = ""
            if "pct_delta" in d:
                extra = " (%+.1f%%)" % d["pct_delta"]
            elif "delta" in d:
                extra = " (%+g)" % d["delta"]
            print("      %-18s %s -> %s%s" % (field, d["was"], d["now"], extra))
    print()
    print("CAN conclude: %s" % report["can_conclude"])
    print("CANNOT conclude: %s" % report["cannot_conclude"])


if __name__ == "__main__":
    main()
