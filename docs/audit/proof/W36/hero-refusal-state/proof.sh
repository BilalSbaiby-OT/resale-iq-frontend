#!/usr/bin/env bash
# PROOF — the two hero-checker defects found walking the live site with
# "Levi's Trucker" (docs/company GOALS "a band, a refusal and a system error
# are visually distinct on every surface") are fixed, and the rest of the
# app did not regress.
#
# THIS SCRIPT WAS WRITTEN BUT NOT RUN. The session that authored it (designer,
# 2026-09-01) had Read/Edit/Write/Grep/Glob only — no Bash, no browser tool —
# so nothing below has been executed even once. Do not report this proof as
# passing until someone actually runs it cold. That is the whole point of a
# proof.sh; a proof nobody ran is a claim, not evidence (OS §0 rule 6).
#
# What this DOES prove, cold, from a clean checkout, once run:
#   1. free-checker.tsx's INSUFFICIENT_DATA branch is its own branch (not the
#      shared BUY/WATCH/SKIP/LOCKED fallback), never renders VERDICT_COLOR,
#      and carries a next-step chip row (defect 2 + defect 3).
#   2. TryExamplesRow is shared by UNKNOWN and INSUFFICIENT_DATA, not
#      duplicated.
#   3. No hardcoded "sold" claim was added to the frontend to paper over the
#      backend string (defect 1 stays flagged, not faked-fixed).
#   4. tsc, build, and the required e2e suite (including the rewritten
#      INSUFFICIENT_DATA property-based spec) are green.
#
# What this does NOT prove:
#   - That production matches this branch. No browser tool was available
#     this session, so the live-site walk in the brief (resaleiq.dev,
#     "Levi's Trucker") was never re-run against the fix. That is qa-eng's
#     or a session with browser tools' job before this ships.
#   - That the backend confidence_note string is fixed — it is not, on
#     purpose. See design/README.md "Known gaps" and the comment at
#     free-checker.tsx's INSUFFICIENT_DATA branch for the four backend
#     locations (demand-intel/engine/listing_identity.py:364-370,
#     demand-intel/api/routes.py:538,595-597,922,1075) and the three test
#     files that pin the old string.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../../../.." && pwd)"   # -> resale-iq

cd "$ROOT"
echo "proof: hero-refusal-state (INSUFFICIENT_DATA defect 2 + defect 3) — UNRUN, see header"
echo "  repo: $ROOT"
echo

fail() { echo "FAIL  $1"; exit 1; }

# --- 1. source-level: the fix is present, not reverted --------------------
echo "-- source assertions --"

grep -q 'res.verdict === "INSUFFICIENT_DATA" ?' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: INSUFFICIENT_DATA no longer has its own branch"
grep -q 'data-testid="riq-insufficient"' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: INSUFFICIENT_DATA branch lost its testid"
grep -q 'function TryExamplesRow' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: TryExamplesRow was not extracted"
echo "  OK  INSUFFICIENT_DATA has its own branch with a testid and a shared next-step row"

# The old giant colour-coded label must never fire for INSUFFICIENT_DATA —
# checked by asserting the label ternary no longer branches on it.
grep -q 'INSUFFICIENT_DATA no longer reaches this label' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: the dead INSUFFICIENT_DATA label branch may have come back"
echo "  OK  INSUFFICIENT_DATA never reaches the verdict-coloured label"

# Defect 1 must stay flagged, not faked: no client-side string replace of
# "sold" and the backend locations must still be named in the comment.
grep -q 'do not string-replace "sold"' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: the defect-1 flag comment is missing — did someone paper over it?"
grep -q 'listing_identity.py:364-370' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: backend source citation for defect 1 is missing"
echo "  OK  defect 1 (backend 'sold items' string) is flagged, not silently fixed client-side"
echo

# --- 2. it actually compiles and type-checks -------------------------------
echo "-- tsc --"
npx tsc --noEmit || fail "tsc --noEmit"
echo "  OK"
echo

echo "-- build --"
npm run build >/tmp/hero-refusal-state-build.log 2>&1 \
  || { tail -60 /tmp/hero-refusal-state-build.log; fail "npm run build"; }
grep -q "Compiled successfully" /tmp/hero-refusal-state-build.log \
  || fail "build did not report success"
echo "  OK"
echo

# --- 3. required e2e — includes the rewritten INSUFFICIENT_DATA spec -------
echo "-- e2e:required (INSUFFICIENT_DATA property-based spec, paywall leak, LIMIT_REACHED) --"
npm run test:e2e:required || fail "npm run test:e2e:required"
echo

echo "PASS  defect 2 + defect 3 fixed on the hero checker, nothing regressed"
echo "REMINDER: this proof has never been run. Run it cold before trusting it."
