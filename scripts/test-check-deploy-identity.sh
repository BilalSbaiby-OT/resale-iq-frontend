#!/usr/bin/env bash
# Falsifies scripts/check-deploy-identity.sh against fixtures (no network,
# no production deploy triggered) — the deploy workflow's assertion must
# provably go RED on a mismatch, not just pass on the happy path.
set -uo pipefail
cd "$(dirname "$0")"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

EXPECTED="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
WRONG="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

fail=0

# Case 1: matching commit -> must exit 0 (GREEN)
echo "{\"commit\":\"${EXPECTED}\",\"short\":\"${EXPECTED:0:7}\"}" > "$tmp/match.json"
if ./check-deploy-identity.sh "${EXPECTED}" "file://$tmp/match.json"; then
  echo "PASS: matching commit -> exit 0"
else
  echo "FAIL: matching commit should have exited 0"
  fail=1
fi

# Case 2: wrong commit live -> must exit 1 (RED) -- this is the case that was
# previously impossible to produce: the old chunk-fingerprint check had no
# concept of "wrong commit", only "bundle changed or not".
echo "{\"commit\":\"${WRONG}\",\"short\":\"${WRONG:0:7}\"}" > "$tmp/mismatch.json"
if ./check-deploy-identity.sh "${EXPECTED}" "file://$tmp/mismatch.json"; then
  echo "FAIL: mismatched commit should have exited 1 (RED), exited 0 instead"
  fail=1
else
  echo "PASS: mismatched commit -> exit 1 (RED), as required"
fi

# Case 3: unreachable/empty response (simulates the site being down or
# /deploy-id not deployed yet) -> must exit 1, not silently pass.
: > "$tmp/empty.json"
if ./check-deploy-identity.sh "${EXPECTED}" "file://$tmp/empty.json"; then
  echo "FAIL: empty response should have exited 1 (RED), exited 0 instead"
  fail=1
else
  echo "PASS: empty/unreachable response -> exit 1 (RED), as required"
fi

if [ "$fail" -ne 0 ]; then
  echo "One or more falsification cases did not behave as required."
  exit 1
fi

echo "All cases behaved as required: the check can go both GREEN and RED."
