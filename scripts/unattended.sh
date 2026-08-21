#!/usr/bin/env bash
# Runs Resale IQ agent sessions back-to-back so no human has to type "continue".
#
# Budget is time spent INSIDE claude processes. Sleeping through a rate limit
# does not burn it — otherwise one 3h backoff would eat most of the night.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
REPO="$(pwd)"
LOG="$REPO/agent/loop.log"
HANDOFF="$REPO/agent/HANDOFF.md"
BUDGET_SECONDS=$(( 8 * 3600 ))
SPENT=0

mkdir -p "$REPO/agent"
log() { printf '%s  %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$LOG"; }

log "=== loop start (budget $(( BUDGET_SECONDS / 3600 ))h of in-claude time) ==="

while :; do
  # 1. Stop if the work is finished or needs a human.
  STATUS="$(grep -m1 '^STATUS:' "$HANDOFF" 2>/dev/null | awk '{print $2}')"
  case "$STATUS" in
    DONE|BLOCKED) log "STATUS=$STATUS — nothing further to do. Exiting."; exit 0 ;;
  esac

  # 2. Stop if the budget is gone.
  if [ "$SPENT" -ge "$BUDGET_SECONDS" ]; then
    log "budget exhausted (${SPENT}s in-claude). Exiting."; exit 0
  fi

  # 3. Never run two sessions against the same repo.
  if pgrep -f "claude .*--resaleiq-loop" >/dev/null 2>&1; then
    log "a session is already running — waiting 30s"; sleep 30; continue
  fi

  # 4. Fresh session. Fresh context every time; the files carry the state.
  log "starting session (spent ${SPENT}s / ${BUDGET_SECONDS}s)"
  START=$(date +%s)
  claude --permission-mode acceptEdits \
         --max-turns 50 \
         --append-system-prompt "--resaleiq-loop" \
         -p "$(cat "$REPO/scripts/resume-prompt.md")" \
         >>"$LOG" 2>&1
  RC=$?
  ELAPSED=$(( $(date +%s) - START ))
  SPENT=$(( SPENT + ELAPSED ))
  log "session exited rc=$RC after ${ELAPSED}s (total ${SPENT}s)"

  # 5. Rate limited? Sleep it off, then start fresh. Does not burn budget.
  if [ -f "$REPO/agent/RATE_LIMITED" ] || tail -40 "$LOG" | grep -qiE 'hit your (usage )?limit|rate.?limit|usage limit reached'; then
    rm -f "$REPO/agent/RATE_LIMITED"
    log "rate limited — sleeping 3h, then resuming with a fresh session"
    sleep $(( 3 * 3600 ))
    continue
  fi

  if [ "$RC" -ne 0 ]; then
    log "non-zero exit — retrying in 60s"; sleep 60; continue
  fi

  sleep 2
done
