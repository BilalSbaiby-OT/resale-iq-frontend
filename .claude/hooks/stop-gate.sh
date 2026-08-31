#!/usr/bin/env bash
# Stop / SubagentStop — Definition of Done gate (OS §5).
#
# DEFAULT: records, does not block. The founder already runs an unattended loop
# in this repo whose shell wrapper needs the process to die (see stop.sh). A
# blocking Stop hook would wedge that loop, so the gate is opt-in: create
# .claude/STOP_GATE_ON to make an unproven stop actually blocking.
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
TS="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
PAYLOAD="$(cat 2>/dev/null || true)"

# Never re-block a stop we already blocked once.
if printf '%s' "$PAYLOAD" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

MISSING=""
[ -f "$REPO/docs/company/SESSION.md" ] || MISSING="$MISSING SESSION.md"
if [ -n "$(git -C "$REPO" status --porcelain 2>/dev/null)" ]; then
  MISSING="$MISSING uncommitted-tree"
fi

if [ -z "$MISSING" ]; then
  printf '%s  stop: clean\n' "$TS" >> "$REPO/agent/loop.log"
  exit 0
fi

printf '%s  stop: INCOMPLETE —%s\n' "$TS" "$MISSING" >> "$REPO/agent/loop.log"

if [ -f "$REPO/.claude/STOP_GATE_ON" ]; then
  echo "STOP BLOCKED (OS §5 Definition of Done). Missing:$MISSING" >&2
  echo "Update docs/company/SESSION.md and commit the tree, then stop." >&2
  exit 2
fi

echo "Stop recorded, but incomplete:$MISSING — update SESSION.md and commit before you stop (OS §5)." >&2
exit 0
