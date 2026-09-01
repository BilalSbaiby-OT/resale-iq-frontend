#!/usr/bin/env bash
# proof.sh -- JOINT RELEASE MEASUREMENT: A13 (comparable window) x gate-paid-surfaces (n>=8 floor)
# Re-runs the two measurements COLD against production, READ-ONLY (sqlite mode=ro). Writes nothing.
#
# Preconditions the verifier must satisfy:
#   - `ssh -o BatchMode=yes resaleiq` works (same path scripts/company/build_dashboard.py uses)
#   - the backend container is up
#
# EXPECTED (measured 2026-09-01 08:47 UTC, board snapshot 2026-09-01 07:51:40, n=100 models):
#   Q1  movers 41 | withheld by the gate 19 | customer-visible 22
#   Q2  Levi's Trucker  n_after=5  ->  WITHHELD (gate_survives_after=false)
#   Q3  visible movers n=22, median -3.04%, IQR [-21.11%, +17.64%], range [-65.76%, +91.83%]
#   Q4  63/100 rows still show max_buy_price; 37/100 blank
#   counters: MIN(comparable_n) over banded rows == 8 before AND after; 0 models' n decreases
#
# THESE NUMBERS DRIFT. The board is DELETE-then-INSERT on every analyzer run and the
# sold_observed corpus deepens continuously. The reproduction control below reports how
# faithfully the BEFORE arm reproduces the stored board; it read 64/100 exact / 79/100 +-1
# at measurement time (it read 90/100 eight hours earlier -- see docs/audit/COVERAGE.md 2.2).
# A control below ~60/100 exact means the counterfactual is no longer trustworthy: re-measure,
# do not reconcile.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND=ph5clxk9hmghspv65pdkvak9
C=$(ssh -o BatchMode=yes resaleiq "docker ps --format '{{.Names}}' | grep $BACKEND | head -1")
[ -n "$C" ] || { echo "FAIL: backend container not found"; exit 1; }
echo "== container: $C =="
echo "== supply-side (Q1-Q4) =="
ssh -o BatchMode=yes resaleiq "docker exec -i $C python3 -" < "$HERE/joint_release.py" > "$HERE/rerun-supply.json"
python3 - "$HERE/rerun-supply.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1])); m=d['meta']
print(" board snapshot   :", m['board_snapshot_updated_at'], "| rows", m['board_rows'])
print(" repro control    :", m['repro_control_exact_vs_stored'], "exact /", m['repro_control_pm1_vs_stored'], "+-1")
print(" deployed has C5  :", m['deployed_build_has_C5_failclosed'], "| gate divergences:", len(m['gate_arithmetic_vs_deployed_divergences']))
print(" Q1 movers        :", d['Q1']['n_movers'], "| withheld", d['Q1']['n_movers_withheld_by_gate'], "| visible", d['Q1']['n_movers_customer_visible'])
t=d['Q2_levis_trucker']
print(" Q2 Levi's Trucker: n", t['n_before'], "->", t['n_after'], "|", t['mbp_before'], "->", t['mbp_after'],
      "| survives gate:", t['gate_survives_after'])
print(" Q3 visible n     :", d['Q3']['n_movers_surviving_gate'], "| median", d['Q3']['median_pct'],
      "| IQR", d['Q3']['p25_pct'], d['Q3']['p75_pct'], "| range", d['Q3']['min_pct'], d['Q3']['max_pct'])
print(" Q4 shows price   :", d['Q4']['shows_price_after_both_changes'], "/", d['Q4']['board_rows'],
      "| blank", d['Q4']['blank_after_both_changes'])
print(" counter MIN(n)   :", d['min_comparable_n_over_banded_rows'], "(must be 8 both arms)")
print(" counter n-decrease:", d['counter_no_model_n_decreases'], "(must be 0)")
print(" band_evidence_p50:", d['band_evidence_p50'], "(DESCRIPTIVE, never a gate)")
assert t['gate_survives_after'] is False, "REGRESSION: Levi's Trucker is no longer withheld"
assert d['min_comparable_n_over_banded_rows']['after'] == 8, "COUNTER FAILED: MIN(comparable_n) != 8"
assert d['counter_no_model_n_decreases'] == 0, "COUNTER FAILED: a model's comparable_n decreased"
print(" ASSERTIONS: PASS")
PY
echo "== demand-side (searches, replay) =="
ssh -o BatchMode=yes resaleiq "docker exec -i $C python3 -" < "$HERE/demand_side.py"
echo "NOTE: demand_side.py carries a FROZEN after-arm comparable_n map (AFTER_JSON) from the"
echo "2026-09-01 08:47Z board. It is a fixed-board comparison, not a live re-read. Regenerate it"
echo "from rerun-supply.json ('all_rows' -> n_after) if you want the two sides on the same board."
