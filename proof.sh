#!/usr/bin/env bash
# proof.sh — W10 and W5 decisions recorded (A23, A24), rows closed.
# Docs-only change: no code shipped in this repo. Run cold from repo root.
set -euo pipefail
cd "$(dirname "$0")"

fail() { echo "FAIL: $1"; exit 1; }
pass() { echo "PASS: $1"; }

# 1. A23 (W10) and A24 (W5) exist in APPROVALS.md with their decisions stated.
grep -q "^### A23 — \*\*DECIDED 2026-09-01" docs/company/APPROVALS.md \
  || fail "A23 heading missing from APPROVALS.md"
grep -q "Hold €19 Starter / €49 Pro" docs/company/APPROVALS.md \
  || fail "A23 does not state the hold decision"
grep -q "Do not resurrect €99 Business" docs/company/APPROVALS.md \
  || fail "A23 does not rule on the €99 tier"
pass "A23 (W10) recorded with hold-price and no-€99 rulings"

grep -q "^### A24 — \*\*DECIDED 2026-09-01" docs/company/APPROVALS.md \
  || fail "A24 heading missing from APPROVALS.md"
grep -q "this is a leak, not a deliberate product choice" docs/company/APPROVALS.md \
  || fail "A24 does not state the leak ruling"
pass "A24 (W5) recorded with the leak ruling"

# 2. WORKBOARD rows closed / opened, and reference the decision.
grep -q "W10.*CLOSED 2026-09-01 — decided \`APPROVALS.md\` A23" docs/company/WORKBOARD.md \
  || fail "W10 not marked CLOSED referencing A23"
grep -q "W5.*CLOSED 2026-09-01 — decided \`APPROVALS.md\` A24" docs/company/WORKBOARD.md \
  || fail "W5 not marked CLOSED referencing A24"
grep -q "W43" docs/company/WORKBOARD.md \
  || fail "W43 (false marketing claims, blocks the W10 pitch reposition) not opened"
pass "WORKBOARD: W10 closed -> A23, W5 closed -> A24, W43 opened"

# 3. The bus consult actually happened (not just claimed in prose).
python3 scripts/company/bus.py --json log --limit 20 2>/dev/null \
  | grep -q '"from": "product-manager"' \
  || fail "no product-manager bus messages found in the log"
for target in monetization finance-ops ux-researcher; do
  python3 scripts/company/bus.py --json log --limit 20 2>/dev/null \
    | grep -q "\"to\": \"$target\"" \
    || fail "no bus message sent to $target"
done
pass "bus consult sent to monetization, finance-ops, ux-researcher"

echo
echo "All checks passed."
echo
echo "NOT covered by this script (different repo, code owned by backend-eng/monetization,"
echo "verify against demand-intel@c2ac96a or later before trusting A23/A24's own citations):"
echo "  cd ~/work/demand-intel"
echo "  git merge-base --is-ancestor claude/backend-eng/gate-paid-surfaces main && echo merged"
echo "  grep -c 'comparable_n\\|verdict_allows_buy_below\\|MIN_VERDICT' api/resale_routes.py   # expect >0"
echo "  grep -n 'require_paid_plan' api/resale_routes.py | grep -c portfolio                    # W5 predecessor check"
echo "  sed -n '1538,1642p' api/resale_routes.py   # W5 target before backend-eng's fix lands"
