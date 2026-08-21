#!/usr/bin/env bash
# Puts the handoff and the next task in front of the model before it does anything.
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
echo "=== agent/HANDOFF.md ==="
cat "$REPO/agent/HANDOFF.md" 2>/dev/null || echo "(no HANDOFF yet)"
echo
echo "=== next unchecked task ==="
grep -m1 '^- \[ \]' "$REPO/agent/TASKS.md" 2>/dev/null || echo "(no unchecked tasks — TASKS.md is complete)"
exit 0
