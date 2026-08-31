#!/usr/bin/env bash
# SessionStart — put the company's state in front of the model before it acts.
# OS §8 Phase 0: inject SESSION, GOALS, LOCK. The lane HANDOFF stays, because
# two loop agents still share this repo (agent/LANES.md).
REPO="$(cd "$(dirname "$0")/../.." && pwd)"

# The generated status, before anything else. Reads the CACHE, not the verifier:
# re-running it here cost 981ms, which is slow enough that someone eventually
# deletes the hook. The hourly job keeps the cache fresh, and the report prints
# its own age, so a stale green cannot pass for a current one.
# A session that starts by being told the wiring is broken cannot spend an hour
# building on it, which is exactly what happened on 2026-08-31.
if [ -x "$REPO/scripts/company/status_report.py" ] || [ -f "$REPO/scripts/company/status_report.py" ]; then
  python3 "$REPO/scripts/company/status_report.py" --session --no-run 2>/dev/null || \
    echo "(status report unavailable — run: python3 scripts/company/status_report.py)"
  echo
fi
echo "=== docs/company/OS.md governs this repo (read §0 CONSTITUTION) ==="
echo "=== ...together with docs/company/AMENDMENTS.md — where they conflict, the AMENDMENT WINS ==="
grep -E '^## AM-' "$REPO/docs/company/AMENDMENTS.md" 2>/dev/null | sed 's/^## /  /'
echo
echo "=== .claude/LOCK (WIP = 1) ==="
cat "$REPO/.claude/LOCK" 2>/dev/null || echo "(free — claim it before your first edit)"
echo
echo "=== docs/company/SESSION.md ==="
cat "$REPO/docs/company/SESSION.md" 2>/dev/null || echo "(no SESSION.md yet)"
echo
echo "=== docs/company/GOALS.md ==="
cat "$REPO/docs/company/GOALS.md" 2>/dev/null || echo "(no GOALS.md yet)"
echo
echo "=== docs/company/APPROVALS.md — waiting on the founder ==="
grep -n '^- \[ \]' "$REPO/docs/company/APPROVALS.md" 2>/dev/null | head -20 || echo "(none)"
echo
echo "=== agent/HANDOFF.md (lane lock) ==="
sed -n '1,40p' "$REPO/agent/HANDOFF.md" 2>/dev/null || echo "(no HANDOFF yet)"
echo
echo "=== next unchecked task ==="
grep -m1 '^- \[ \]' "$REPO/agent/TASKS.md" 2>/dev/null || echo "(no unchecked tasks)"
exit 0
