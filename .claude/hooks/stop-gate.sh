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

# SubagentStop is NOT the Definition of Done. A subagent is given a narrow
# mandate by the session that spawned it — a Phase 1 audit agent is told
# read-only, never commit, write one file. Demanding a commit and a SESSION.md
# rewrite from it asks it to break its own instructions to satisfy a shell
# script, and the correct response from a well-behaved agent is to refuse.
# One did, on 2026-08-31, and it was right. The gate belongs to the session that
# holds write authority, not to its read-only children. Record and let it go.
if printf '%s' "$PAYLOAD" | grep -q '"hook_event_name"[[:space:]]*:[[:space:]]*"SubagentStop"'; then
  printf '%s  subagent stopped\n' "$TS" >> "$REPO/agent/loop.log"
  exit 0
fi

MISSING=""
[ -f "$REPO/docs/company/SESSION.md" ] || MISSING="$MISSING SESSION.md"
# Only MODIFIED TRACKED files count as leaving the tree dirty. That is the state
# agent/LANES.md warns about: another agent cannot tell in-progress from abandoned.
# A brand-new UNTRACKED file is visible and unambiguous, and is usually a running
# background agent mid-write — this gate blocked once on exactly that, on a
# deliverable another agent had not finished writing yet. Refusing to stop until
# someone commits a half-written file is the wrong trade.
# SECURITY-LOG.md is excluded because the guard hook APPENDS TO IT ON EVERY BASH
# CALL -- including the `git commit` that would clean it. Committing it dirties
# it again, so the gate could never be satisfied: it demanded a state its own
# logger made unreachable, and the only ways out were to loop forever or to stop
# without meeting the gate. Neither is a Definition of Done.
#
# Nothing is lost: it is still tracked and still committed by whoever is next to
# touch the tree for a real reason. What is dropped is only its power to BLOCK,
# which it should never have had, because no amount of agent work can clear it.
DIRTY="$(git -C "$REPO" status --porcelain --untracked-files=no 2>/dev/null \
  | grep -v ' docs/company/SECURITY-LOG.md$')"
if [ -n "$DIRTY" ]; then
  MISSING="$MISSING uncommitted-tracked-changes"
fi
UNTRACKED="$(git -C "$REPO" ls-files --others --exclude-standard 2>/dev/null | head -5)"

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
