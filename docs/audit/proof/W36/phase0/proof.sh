#!/usr/bin/env bash
# Phase 0 rails — proof. Run cold, from anywhere. Exits non-zero if any rail is down.
# Every deny rule gets a violation AND a negative control (a benign call that must pass).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$(mktemp -d)"
export COMPANY_OS_LOG_DIR="$OUT"      # keep the proof run out of the live ledger
echo "log sandbox: $OUT"
python3 "$HERE/test_rails.py"
RC=$?
echo
echo "--- rails wrote to the sandbox, not to the company ledger ---"
grep -c 'BLOCKED' "$OUT/SECURITY-LOG.md" 2>/dev/null | sed 's/^/blocked entries: /'
grep -c 'TRIPWIRE' "$OUT/SECURITY-LOG.md" 2>/dev/null | sed 's/^/tripwire entries: /'
wc -l < "$OUT/ACTIVITY.jsonl" 2>/dev/null | sed 's/^/activity rows: /'
exit $RC
