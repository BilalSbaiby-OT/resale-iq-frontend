# JOINT RELEASE MEASUREMENT -- A13 (comparable window) x gate-paid-surfaces (n>=8 floor)
# Runs INSIDE the production backend container, READ-ONLY (mode=ro). Writes nothing.
# Reuses the application's own functions so the counterfactual cannot drift from the pipeline.
import sqlite3, sys, json, statistics
from datetime import datetime, timedelta
sys.path.insert(0, "/app")
from engine.listing_identity import (is_comparable_sold, comparable_fingerprint,
                                     expected_category, verdict_allows_buy_below)
from engine.metrics import summarise_sold_prices

MIN_COMPARABLES = 3            # admission floor  (main / BEFORE)
MIN_VERDICT_COMPARABLES = 8    # print-a-price floor (A13 / AFTER, and the gate)

con = sqlite3.connect("file:/app/data/demand_intel.db?mode=ro", uri=True, timeout=120)
con.row_factory = sqlite3.Row

now_utc = con.execute("SELECT datetime('now')").fetchone()[0]
anchor_s = con.execute("SELECT MAX(updated_at) FROM model_signals").fetchone()[0]
anchor = datetime.fromisoformat(anchor_s.replace(" ", "T"))
cut = {d: (anchor - timedelta(days=d)).isoformat(sep=" ") for d in (7, 30)}
board_n = con.execute("SELECT COUNT(*) FROM model_signals").fetchone()[0]
corpus = con.execute(
    "SELECT MIN(sold_at), MAX(sold_at), COUNT(*) FROM listings WHERE sold_observed=1").fetchone()

def window_pick(b7, b30, first_floor):
    """Reproduces db/queries.py:1984-1996. first_floor is the ONLY thing A13 changes."""
    s7 = summarise_sold_prices(b7)
    if (s7.get("n_fenced") or 0) >= first_floor:
        return {**s7, "price_window": "7d"}
    s30 = summarise_sold_prices(b30)
    if (s30.get("n_fenced") or 0) >= MIN_COMPARABLES:
        return {**s30, "price_window": "30d"}
    if s7.get("n"):
        return {**s7, "price_window": "7d"}
    return {**s30, "price_window": "30d"}

def to_row(pstats):
    """Reproduces db/queries.py:2059-2065 -- comparable_n / avg_price_eur / max_buy_price."""
    n_ok = pstats.get("n_fenced") or 0
    avg = pstats.get("avg_price_eur") if n_ok >= MIN_COMPARABLES else None
    mbp = round(avg * 0.95 * 0.70, 2) if avg else None
    return {"comparable_n": n_ok, "avg_price_eur": avg, "max_buy_price": mbp,
            "window": pstats.get("price_window"), "on_board": mbp is not None}

DIVERGE = []
DEPLOYED_C5 = verdict_allows_buy_below({}) is False  # C5 landed => empty row refuses
rows, repro_exact, repro_pm1 = [], 0, 0
for r in con.execute("SELECT brand, model, comparable_n, avg_price_eur, max_buy_price "
                     "FROM model_signals ORDER BY brand, model"):
    brand, model = r["brand"], r["model"]
    wc = expected_category(brand, model)
    raw = con.execute("""
        SELECT price_eur, title, size, photos, sold_at FROM listings
         WHERE brand=? AND model=? AND sold_observed=1
           AND sold_at>=? AND sold_at<? AND price_eur>0 AND COALESCE(is_deleted,0)=0""",
        (brand, model, cut[30], anchor.isoformat(sep=" "))).fetchall()
    seen, b7, b30 = set(), [], []
    for x in raw:
        t = x["title"] or ""
        if not is_comparable_sold(title=t, brand=brand, model=model,
                                  category=wc, listing_brand=brand):
            continue
        fp = comparable_fingerprint(t, x["size"], x["price_eur"], x["photos"])
        if fp in seen:
            continue
        seen.add(fp)
        b30.append(x["price_eur"])
        if str(x["sold_at"] or "") >= cut[7]:
            b7.append(x["price_eur"])

    n7f = summarise_sold_prices(b7).get("n_fenced") or 0
    n30f = summarise_sold_prices(b30).get("n_fenced") or 0
    before = to_row(window_pick(b7, b30, MIN_COMPARABLES))
    after  = to_row(window_pick(b7, b30, MIN_VERDICT_COMPARABLES))

    stored_n = r["comparable_n"]
    if stored_n is not None:
        if int(stored_n) == before["comparable_n"]:
            repro_exact += 1
        if abs(int(stored_n) - before["comparable_n"]) <= 1:
            repro_pm1 += 1

    # the gate, applied to the AFTER arm (post-C5 semantics: unknown is withheld too)
    # Arithmetic definition -- independent of whichever build is deployed here.
    survives = (after["comparable_n"] >= MIN_VERDICT_COMPARABLES) and after["max_buy_price"] is not None
    survives_before_gate = (before["comparable_n"] >= MIN_VERDICT_COMPARABLES) and before["max_buy_price"] is not None
    # Cross-check against the DEPLOYED function, to catch a build that predates C5.
    dep = bool(verdict_allows_buy_below({"comparable_n": after["comparable_n"]})) and after["max_buy_price"] is not None
    if dep != survives:
        DIVERGE.append((brand, model, after["comparable_n"], dep, survives))

    mb, ma = before["max_buy_price"], after["max_buy_price"]
    moved = (mb != ma)
    pct = (round((ma - mb) / mb * 100.0, 2) if (moved and mb) else (None if not moved else None))
    rows.append({
        "brand": brand, "model": model,
        "stored_n": stored_n, "stored_mbp": r["max_buy_price"],
        "n_before": before["comparable_n"], "n_after": after["comparable_n"],
        "w_before": before["window"], "w_after": after["window"],
        "mbp_before": mb, "mbp_after": ma,
        "moved": moved, "pct": pct,
        "abs_delta": (round(ma - mb, 2) if (moved and mb is not None and ma is not None) else None),
        "gate_survives_after": survives,
        "gate_survives_before": survives_before_gate,
        "on_board_before": before["on_board"], "on_board_after": after["on_board"],
        "n7_fenced": n7f, "n30_fenced": n30f,
    })

def q(vals, p):
    vals = sorted(vals)
    if not vals: return None
    k = (len(vals) - 1) * p
    lo, hi = int(k), min(int(k) + 1, len(vals) - 1)
    return round(vals[lo] + (vals[hi] - vals[lo]) * (k - lo), 2)

movers = [r for r in rows if r["moved"]]
mov_gated = [r for r in movers if not r["gate_survives_after"]]
mov_survive = [r for r in movers if r["gate_survives_after"]]
pcts_all = [r["pct"] for r in movers if r["pct"] is not None]
pcts_surv = [r["pct"] for r in mov_survive if r["pct"] is not None]

out = {
  "meta": {
    "db": "/app/data/demand_intel.db (production, mode=ro)",
    "now_utc": now_utc,
    "board_snapshot_updated_at": anchor_s,
    "board_rows": board_n,
    "window_7d": [cut[7], anchor.isoformat(sep=" ")],
    "window_30d": [cut[30], anchor.isoformat(sep=" ")],
    "sold_observed_corpus": {"min_sold_at": corpus[0], "max_sold_at": corpus[1], "n": corpus[2]},
    "repro_control_exact_vs_stored": f"{repro_exact}/{board_n}",
    "repro_control_pm1_vs_stored": f"{repro_pm1}/{board_n}",
    "deployed_build_has_C5_failclosed": DEPLOYED_C5,
    "gate_arithmetic_vs_deployed_divergences": DIVERGE,
  },
  "Q1": {
    "n_movers": len(movers),
    "n_movers_withheld_by_gate": len(mov_gated),
    "n_movers_customer_visible": len(mov_survive),
    "movers_withheld": [(r["brand"], r["model"], r["n_after"], r["mbp_before"], r["mbp_after"], r["pct"]) for r in mov_gated],
  },
  "Q2_levis_trucker": next((r for r in rows if r["brand"].startswith("Levi") and r["model"] == "Trucker"), "NOT ON BOARD"),
  "Q3": {
    "n_movers_surviving_gate": len(pcts_surv),
    "median_pct": q(pcts_surv, 0.5), "p25_pct": q(pcts_surv, 0.25), "p75_pct": q(pcts_surv, 0.75),
    "min_pct": (min(pcts_surv) if pcts_surv else None), "max_pct": (max(pcts_surv) if pcts_surv else None),
    "median_abs_delta_eur": q([abs(r["abs_delta"]) for r in mov_survive if r["abs_delta"] is not None], 0.5),
    "ALL_MOVERS_median_pct_for_contrast": q(pcts_all, 0.5),
    "ALL_MOVERS_n": len(pcts_all),
    "detail": [(r["brand"], r["model"], r["n_before"], r["n_after"], r["mbp_before"], r["mbp_after"], r["pct"]) for r in sorted(mov_survive, key=lambda x: (x["pct"] if x["pct"] is not None else 0))],
  },
  "Q4": {
    "board_rows": board_n,
    "shows_price_today_stored": sum(1 for r in rows if r["stored_mbp"] is not None and r["stored_n"] is not None and int(r["stored_n"]) >= 8),
    "shows_price_before_recomputed_gated": sum(1 for r in rows if r["gate_survives_before"]),
    "shows_price_after_both_changes": sum(1 for r in rows if r["gate_survives_after"]),
    "blank_after_both_changes": sum(1 for r in rows if not r["gate_survives_after"]),
    "has_mbp_at_all_before_any_gate": sum(1 for r in rows if r["on_board_before"]),
    "has_mbp_at_all_after_a13_no_gate": sum(1 for r in rows if r["on_board_after"]),
  },
  "supply_coverage": {
    "before_n_ge_8": sum(1 for r in rows if r["n_before"] >= 8),
    "after_n_ge_8": sum(1 for r in rows if r["n_after"] >= 8),
  },
  "band_evidence_p50": {
    "before": q([r["n_before"] for r in rows if r["gate_survives_before"]], 0.5),
    "after": q([r["n_after"] for r in rows if r["gate_survives_after"]], 0.5),
  },
  "min_comparable_n_over_banded_rows": {
    "before": (min([r["n_before"] for r in rows if r["gate_survives_before"]], default=None)),
    "after": (min([r["n_after"] for r in rows if r["gate_survives_after"]], default=None)),
  },
  "band_evidence_p50_variants": {
    "supply_before_selected_window_n(banded=gate_survives_before)": q([r["n_before"] for r in rows if r["gate_survives_before"]], 0.5),
    "supply_after_selected_window_n(banded=gate_survives_after)": q([r["n_after"] for r in rows if r["gate_survives_after"]], 0.5),
    "supply_after_30d_n_over_after_banded": q([r["n30_fenced"] for r in rows if r["gate_survives_after"]], 0.5),
    "supply_after_30d_n_over_ALL_100": q([r["n30_fenced"] for r in rows], 0.5),
    "supply_before_7d_n_over_before_banded": q([r["n7_fenced"] for r in rows if r["gate_survives_before"]], 0.5),
    "newly_banded_only_n_after": q([r["n_after"] for r in rows if r["gate_survives_after"] and not r["gate_survives_before"]], 0.5),
    "newly_banded_count": sum(1 for r in rows if r["gate_survives_after"] and not r["gate_survives_before"]),
  },
  "counter_no_model_n_decreases": sum(1 for r in rows if r["n_after"] < r["n_before"]),
  "all_rows": rows,
}
print(json.dumps(out, indent=1, default=str))
