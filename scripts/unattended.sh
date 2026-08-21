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

# Resolve the CLI explicitly. A non-interactive shell does not source nvm, so
# `claude` is frequently NOT on PATH here even though it is in an interactive
# terminal — the loop would then fail every session with "command not found".
CLAUDE_BIN="${CLAUDE_BIN:-$(command -v claude || true)}"
if [ -z "$CLAUDE_BIN" ]; then
  for c in "$HOME"/.nvm/versions/node/*/bin/claude "$HOME/.claude/local/claude" \
           /usr/local/bin/claude /opt/homebrew/bin/claude; do
    [ -x "$c" ] && CLAUDE_BIN="$c" && break
  done
fi

log() { printf '%s  %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$LOG"; }

log "=== loop start (budget $(( BUDGET_SECONDS / 3600 ))h of in-claude time) ==="

# Preflight: a dead credential fails every session in seconds. Without this the
# loop retries forever and reports nothing useful. Block loudly instead.
if [ -z "$CLAUDE_BIN" ] || [ ! -x "$CLAUDE_BIN" ]; then
  log "PREFLIGHT FAILED — no usable claude binary found."
  log "  Fix: npm install -g @anthropic-ai/claude-code   (or set CLAUDE_BIN)"
  /usr/bin/sed -i '' '1s/^STATUS: .*/STATUS: BLOCKED/' "$HANDOFF" 2>/dev/null || true
  exit 0
fi
PRE="$("$CLAUDE_BIN" -p "reply with exactly: OK" --max-turns 1 2>&1 | head -3)"
if printf '%s' "$PRE" | grep -qiE 'failed to authenticate|401|re-authenticate|not logged in'; then
  log "PREFLIGHT FAILED — claude CLI cannot authenticate:"
  log "  $PRE"
  if ! grep -q '^STATUS: BLOCKED' "$HANDOFF"; then
    /usr/bin/sed -i '' '1s/^STATUS: .*/STATUS: BLOCKED/' "$HANDOFF" 2>/dev/null || true
  fi
  log "HANDOFF set to BLOCKED. A human must run: claude   (then /login)"
  exit 0
fi
log "preflight OK — CLI authenticated"

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
  SESSION_OUT="$REPO/agent/.session.out"
  : > "$SESSION_OUT"
  "$CLAUDE_BIN" --permission-mode acceptEdits \
         --max-turns 50 \
         --append-system-prompt "--resaleiq-loop" \
         -p "$(cat "$REPO/scripts/resume-prompt.md")" \
         >"$SESSION_OUT" 2>&1
  RC=$?
  cat "$SESSION_OUT" >> "$LOG"
  ELAPSED=$(( $(date +%s) - START ))
  SPENT=$(( SPENT + ELAPSED ))
  log "session exited rc=$RC after ${ELAPSED}s (total ${SPENT}s)"

  # 5. Rate limited? Sleep it off, then start fresh. Does not burn budget.
  # Read the SESSION's output, never $LOG — $LOG contains this loop's own
  # "rate limited" lines, so grepping it made every crash look like a limit and
  # sent the loop to sleep for 3h instead of retrying in 60s.
  if [ -f "$REPO/agent/RATE_LIMITED" ] || grep -qiE 'hit your (usage )?limit|usage limit reached|rate limit exceeded' "$SESSION_OUT"; then
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
