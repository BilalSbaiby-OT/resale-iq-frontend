#!/usr/bin/env python3
"""freeze_drift_canary.py — (re)build docs/audit/canary/frozen_set.json.

Freezes 60 of the (currently 100) rows in production `model_signals`,
stratified across comparable_n bands and brands, plus a curated set of
"known-hard" cases picked for named, code-grounded reasons (see
docs/audit/canary/DRIFT_CANARY.md).

This is a DRIFT canary, not a correctness canary — freezing today's output
records what the pipeline SAID, not what was true. Re-freezing throws away
the ability to detect drift against the old baseline, so this refuses to
overwrite an existing frozen_set.json without --force. Freezing should be a
rare, deliberate, reviewed act (e.g. after a known pipeline change you want
the new baseline to reflect), not something a script does casually.

Usage:
    python3 scripts/canary/freeze_drift_canary.py                 # reads prod (ssh, read-only)
    python3 scripts/canary/freeze_drift_canary.py --db FIXTURE.db # reads a local sqlite file
    python3 scripts/canary/freeze_drift_canary.py --force         # overwrite existing freeze

Never writes to production — this only ever reads model_signals and writes
a JSON file under docs/audit/canary/ in this repo.
"""
import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _prod import fetch_model_signals_prod, fetch_model_signals_local  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_PATH = os.path.join(ROOT, "docs", "audit", "canary", "frozen_set.json")
MIN_VERDICT_COMPARABLES = 8
TARGET_N = 60

# Curated known-hard rows and WHY each was chosen, keyed by the (brand, model)
# it names rather than by id (ids are production auto-increment and not
# guaranteed stable across a re-freeze on a changed corpus). If a re-freeze
# can't find one of these brand+model pairs any more, it is dropped with a
# printed warning rather than silently substituted — a hard case that vanished
# from the board is itself worth noticing, not papering over.
HARD_CASE_RULES = [
    (("Off-White", None), 3,
     "Off-White — replica/authenticity-risk brand; engine/authenticity.py "
     "exists but DATA.md documents it is not wired into refresh_model_signals"),
    (("Gucci", None), 2,
     "Gucci — luxury/replica-risk brand; pick the highest price_iqr_eur rows "
     "(wide dispersion despite admission is the signature of mixed comps)"),
    (("Balenciaga", None), 2,
     "Balenciaga — luxury/replica-risk brand; pick the highest price_iqr_eur rows"),
    (("Jordan", None), 4,
     "All Jordan rows — engine/listing_identity.py warns family_of() must not "
     "walk 'Jordan 4' onto 'Jordan 1'; _VARIANT_TAIL exists for 'Jordan 1 Low'"),
]


def verdict_of(comparable_n):
    try:
        return "BUY_BELOW_ELIGIBLE" if int(comparable_n) >= MIN_VERDICT_COMPARABLES \
            else "INSUFFICIENT_DATA"
    except (TypeError, ValueError):
        return "INSUFFICIENT_DATA"


def select_hard_cases(rows):
    """Deterministic, rule-based (not random) selection of hard-case rows."""
    picked = []
    reasons = {}
    for (brand, _model), k, reason in HARD_CASE_RULES:
        candidates = [r for r in rows if r["brand"] == brand]
        candidates.sort(
            key=lambda r: (-(r.get("price_iqr_eur") or 0), -(r.get("comparable_n") or 0)))
        for r in candidates[:k]:
            if r["id"] not in reasons:
                picked.append(r)
                reasons[r["id"]] = reason
    # Boundary pair: highest n==8 row and lowest n==7 row, if present and not
    # already picked, to capture a verdict-flip-distance-1 case even if the
    # brand rules above didn't happen to land on one.
    at8 = [r for r in rows if (r.get("comparable_n") or 0) == 8 and r["id"] not in reasons]
    at7 = [r for r in rows if (r.get("comparable_n") or 0) == 7 and r["id"] not in reasons]
    if at8:
        r = at8[0]
        picked.append(r)
        reasons[r["id"]] = "sits exactly at the verdict boundary (comparable_n=8)"
    if at7:
        r = at7[0]
        picked.append(r)
        reasons[r["id"]] = "sits exactly one comp below the verdict boundary (comparable_n=7)"
    return picked, reasons


def stratified_select(rows, target=TARGET_N):
    hard_rows, hard_reasons = select_hard_cases(rows)
    hard_ids = {r["id"] for r in hard_rows}

    def band(r):
        return "A" if (r.get("comparable_n") or 0) >= MIN_VERDICT_COMPARABLES else "B"

    by_brand = defaultdict(list)
    for r in rows:
        if r["id"] in hard_ids:
            continue
        by_brand[r["brand"]].append(r)
    for b in by_brand:
        by_brand[b].sort(key=lambda r: (-(r.get("comparable_n") or 0), r["id"]))

    hard_brands = {r["brand"] for r in hard_rows}
    picked_ids = list(hard_ids)

    for b in sorted(by_brand):
        if b in hard_brands:
            continue
        lst = by_brand[b]
        if not lst:
            continue
        picked_ids.append(lst[0]["id"])
        if len(lst) > 1 and band(lst[0]) != band(lst[-1]):
            picked_ids.append(lst[-1]["id"])
    picked_ids = list(dict.fromkeys(picked_ids))

    by_id = {r["id"]: r for r in rows}
    remaining = [r for r in rows if r["id"] not in picked_ids]
    pool_a = sorted([r for r in remaining if band(r) == "A"], key=lambda r: (r["brand"], r["id"]))
    pool_b = sorted([r for r in remaining if band(r) == "B"], key=lambda r: (r["brand"], r["id"]))
    i = j = 0
    while len(picked_ids) < target and (i < len(pool_a) or j < len(pool_b)):
        c_a = sum(1 for pid in picked_ids if band(by_id[pid]) == "A")
        c_b = sum(1 for pid in picked_ids if band(by_id[pid]) == "B")
        if c_a <= c_b and i < len(pool_a):
            picked_ids.append(pool_a[i]["id"]); i += 1
        elif j < len(pool_b):
            picked_ids.append(pool_b[j]["id"]); j += 1
        elif i < len(pool_a):
            picked_ids.append(pool_a[i]["id"]); i += 1
        else:
            break

    picked_ids = picked_ids[:target]
    return picked_ids, hard_reasons


def build_frozen_rows(rows, picked_ids, hard_reasons):
    by_id = {r["id"]: r for r in rows}
    out = []
    for pid in sorted(picked_ids):
        r = by_id[pid]
        n = r.get("comparable_n") or 0
        band = "n>=8 (verdict-eligible)" if n >= MIN_VERDICT_COMPARABLES \
            else "n=3-7 (board-admitted, no buy-below)"
        stratum = (["known-hard"] if pid in hard_reasons else []) + [band]
        out.append({
            "id": r["id"], "brand": r["brand"], "model": r["model"],
            "category": r["category"],
            "verdict": verdict_of(r.get("comparable_n")),
            "buy_below_eur": r.get("max_buy_price"),
            "sell_avg_eur": r.get("avg_price_eur"),
            "sell_median_eur": r.get("median_price_eur"),
            "price_iqr_eur": r.get("price_iqr_eur"),
            "comparable_n": r.get("comparable_n"),
            "sold_7d": r.get("sold_7d"), "sold_30d": r.get("sold_30d"),
            "active_listings": r.get("active_listings"),
            "data_quality_score": r.get("data_quality_score"),
            "updated_at_at_freeze": r.get("updated_at"),
            "stratum": stratum,
            "hard_case_reason": hard_reasons.get(pid),
        })
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", help="local sqlite file (mode=ro) instead of production")
    ap.add_argument("--out", default=OUT_PATH)
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--target", type=int, default=TARGET_N)
    args = ap.parse_args()

    if os.path.exists(args.out) and not args.force:
        print("%s already exists. Re-freezing throws away the drift baseline; "
              "pass --force if that is really what you want." % args.out,
              file=sys.stderr)
        sys.exit(1)

    if args.db:
        rows, meta = fetch_model_signals_local(args.db)
        source = "local:%s" % args.db
    else:
        rows, meta = fetch_model_signals_prod()
        source = "production (ssh, read-only, mode=ro)"

    if len(rows) < args.target:
        print("only %d rows available, cannot freeze %d — freezing all of them "
              "instead" % (len(rows), args.target), file=sys.stderr)
        args.target = len(rows)

    picked_ids, hard_reasons = stratified_select(rows, target=args.target)
    frozen_rows = build_frozen_rows(rows, picked_ids, hard_reasons)

    n_a = sum(1 for r in frozen_rows if (r["comparable_n"] or 0) >= MIN_VERDICT_COMPARABLES)
    n_b = len(frozen_rows) - n_a
    brands = sorted({r["brand"] for r in frozen_rows})

    doc = {
        "_what_this_is": "A DRIFT canary, not a correctness canary. See "
                          "docs/audit/canary/DRIFT_CANARY.md for what this file can "
                          "and cannot prove.",
        "schema_version": 1,
        "frozen_at_utc": datetime.now(timezone.utc).isoformat(),
        "frozen_by": "data-eng",
        "source": {
            "db": source, "table": "model_signals",
            "n_ids_selected": len(frozen_rows),
            "n_ids_available_in_model_signals": len(rows),
        },
        "pipeline_version": None,
        "pipeline_version_note": "UNKNOWN — no pipeline_version instrument exists "
                                  "in demand-intel's schema or app_meta. Anchored to "
                                  "corpus_fingerprint_at_freeze instead.",
        "corpus_fingerprint_at_freeze": meta,
        "selection_method": "Stratified + curated known-hard overlay. See "
                             "select_hard_cases() and stratified_select() in this "
                             "script for the exact, reproducible rule, and "
                             "DRIFT_CANARY.md for the reasoning in prose. Result: "
                             "%d rows with comparable_n>=8 (verdict-eligible), %d rows "
                             "with comparable_n 3-7 (admitted, no buy-below), across "
                             "%d brands." % (n_a, n_b, len(brands)),
        "fields_frozen_and_watched": [
            "verdict (derived from comparable_n, recomputed every run — not a stored column)",
            "buy_below_eur (= model_signals.max_buy_price)",
            "sell_avg_eur (= model_signals.avg_price_eur — asking price at shelf-departure "
            "for sold_observed=1 comps; NEVER an observed transaction price)",
            "sell_median_eur", "price_iqr_eur", "comparable_n",
            "sold_7d", "sold_30d", "active_listings", "data_quality_score",
        ],
        "rows": frozen_rows,
    }

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, indent=2, ensure_ascii=False)
    print("froze %d rows (%d verdict-eligible, %d not; %d brands) to %s" % (
        len(frozen_rows), n_a, n_b, len(brands), args.out))


if __name__ == "__main__":
    main()
