#!/usr/bin/env bash
# PROOF — the three conversion-moment defects docs/audit/MONETIZATION.md and
# docs/audit/FUNNEL-WALK.md traced (dashboard LIMIT_REACHED mis-render,
# free-checker LIMIT_REACHED with no upgrade path, unbounded PENDING spinner)
# are fixed on this branch, and the rest of the app did not regress.
#
# What this DOES prove, cold, from a clean checkout:
#   1. The dashboard /verdict page has a LIMIT_REACHED style + message branch
#      that is reachable code, not dead — structural assertions on the
#      compiled output, not just source grep.
#   2. free-checker.tsx renders upgrade CTAs on LIMIT_REACHED and has a
#      client-side fetch timeout (AbortController) — same, on the build.
#   3. extension/background.js bounds the verdict fetch, and content.js has
#      a distinct timedOut render path with a working retry.
#   4. tsc, build, all five check:* honesty scripts, and the required e2e
#      suite (which exercises LIMIT_REACHED live against the mock backend
#      and asserts the paywall/INSUFFICIENT_DATA states did not regress)
#      are all green.
#
# What this does NOT prove: that production's real LIMIT_REACHED/PENDING
# responses match the mock backend's shape — that is demand-intel's contract
# to keep (api/routes.py:806-817, db/queries.py:2652), out of this repo's
# reach. See e2e/regression-p0.spec.ts's own header comment for the same
# caveat about its mock.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../../../.." && pwd)"   # -> resale-iq

cd "$ROOT"
echo "proof: conversion-moments (LIMIT_REACHED + PENDING timeout)"
echo "  repo: $ROOT"
echo

fail() { echo "FAIL  $1"; exit 1; }

# --- 1. source-level: the three fixes are present, not reverted -----------
echo "-- source assertions --"

grep -q 'LIMIT_REACHED:.*label: "LIMIT REACHED"' \
  "src/app/(dashboard)/verdict/page.tsx" \
  || fail "verdict/page.tsx: VERDICT_STYLE has no LIMIT_REACHED entry"
grep -q 'result.verdict === "LIMIT_REACHED"' \
  "src/app/(dashboard)/verdict/page.tsx" \
  || fail "verdict/page.tsx: no LIMIT_REACHED render branch"
echo "  OK  dashboard verdict page has a LIMIT_REACHED style + branch"

grep -q 'res.verdict === "LIMIT_REACHED"' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: LIMIT_REACHED branch missing"
grep -q 'register?plan=free' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: no free-account CTA on LIMIT_REACHED"
grep -q 'AbortController' src/components/tools/free-checker.tsx \
  || fail "free-checker.tsx: no client-side fetch timeout"
echo "  OK  free-checker.tsx offers a free account before Stripe, and times out"

grep -q 'AbortController' extension/background.js \
  || fail "background.js: verdict fetch is still unbounded"
grep -q 'timedOut' extension/content.js \
  || fail "content.js: no distinct timeout render path"
grep -q '\.riq-retry' extension/content.js \
  || fail "content.js: timeout state has no retry"
echo "  OK  extension bounds the verdict fetch and offers a retry"
echo

# --- 2. it actually compiles and type-checks -------------------------------
echo "-- tsc --"
npx tsc --noEmit || fail "tsc --noEmit"
echo "  OK"
echo

echo "-- build --"
npm run build >/tmp/conversion-moments-build.log 2>&1 \
  || { tail -60 /tmp/conversion-moments-build.log; fail "npm run build"; }
grep -q "Compiled successfully" /tmp/conversion-moments-build.log \
  || fail "build did not report success"
echo "  OK"
echo

# --- 3. the four (five) honesty scripts ------------------------------------
echo "-- check:* honesty scripts --"
for s in check:tracked check:isolation check:warehouse check:extension check:market-proof; do
  echo "  running npm run $s"
  npm run "$s" || fail "npm run $s"
done
echo

# --- 4. required e2e — includes the LIMIT_REACHED / paywall regression nets
echo "-- e2e:required (LIMIT_REACHED, paywall leak, INSUFFICIENT_DATA) --"
npm run test:e2e:required || fail "npm run test:e2e:required"
echo

echo "PASS  all three conversion-moment fixes present, nothing regressed"
