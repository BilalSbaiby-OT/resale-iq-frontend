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
# One definition of "can we authenticate", used by both the startup preflight
# and the in-loop recovery check, so they can never disagree.
auth_ok() {
  [ -n "$CLAUDE_BIN" ] && [ -x "$CLAUDE_BIN" ] || return 1
  local out
  out="$("$CLAUDE_BIN" -p "reply with exactly: OK" --max-turns 1 < /dev/null 2>&1)"
  ! printf '%s' "$out" | grep -qiE 'failed to authenticate|401|re-authenticate|not logged in|invalid api key'
}

block_on_auth() {
  /usr/bin/sed -i '' '1s/^STATUS: .*/STATUS: BLOCKED/' "$HANDOFF" 2>/dev/null || true
  grep -q '^BLOCKED_REASON: auth' "$HANDOFF" 2>/dev/null || \
    /usr/bin/sed -i '' '1a\
BLOCKED_REASON: auth
' "$HANDOFF" 2>/dev/null || true
}

if [ -z "$CLAUDE_BIN" ] || [ ! -x "$CLAUDE_BIN" ]; then
  log "PREFLIGHT FAILED — no usable claude binary found."
  log "  Fix: npm install -g @anthropic-ai/claude-code   (or set CLAUDE_BIN)"
  /usr/bin/sed -i '' '1s/^STATUS: .*/STATUS: BLOCKED/' "$HANDOFF" 2>/dev/null || true
  exit 0
fi
PRE="$("$CLAUDE_BIN" -p "reply with exactly: OK" --max-turns 1 < /dev/null 2>&1)"
if printf '%s' "$PRE" | grep -qiE 'failed to authenticate|401|re-authenticate|not logged in|invalid api key'; then
  :
  log "PREFLIGHT FAILED — claude CLI cannot authenticate:"
  log "  $(printf '%s' "$PRE" | grep -iE 'failed to authenticate|401|re-authenticate|not logged in' | head -1)"
  block_on_auth
  log "HANDOFF set to BLOCKED (reason: auth). Owner: run 'claude' then /login."
  log "The loop re-checks every 5 min and resumes by itself once that is done."
else
  log "preflight OK — CLI authenticated"
fi

while :; do
  # 1. Stop if the work is finished or needs a human.
  STATUS="$(grep -m1 '^STATUS:' "$HANDOFF" 2>/dev/null | awk '{print $2}')"
  REASON="$(grep -m1 '^BLOCKED_REASON:' "$HANDOFF" 2>/dev/null | awk '{print $2}')"

  # A BLOCKED set by the auth preflight must NOT be self-latching. Once the
  # owner signs in, nothing else would ever clear it and the loop would sit
  # dead for the rest of the night with a perfectly usable credential. So an
  # auth block re-tests itself and lifts on its own; every other block stays
  # put, because those genuinely need a person.
  if [ "$STATUS" = "BLOCKED" ] && [ "$REASON" = "auth" ]; then
    if auth_ok; then
      log "auth recovered — clearing the auth block and resuming"
      /usr/bin/sed -i '' '1s/^STATUS: .*/STATUS: READY/' "$HANDOFF" 2>/dev/null || true
      /usr/bin/sed -i '' '/^BLOCKED_REASON: auth$/d' "$HANDOFF" 2>/dev/null || true
      STATUS=READY
    else
      log "still blocked on auth — re-checking in 5 min. Owner: run 'claude' then /login"
      sleep 300
      continue
    fi
  fi

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
  HEAD_BEFORE="$(git -C "$REPO" rev-parse HEAD 2>/dev/null)"
  START=$(date +%s)
  SESSION_OUT="$REPO/agent/.session.out"
  : > "$SESSION_OUT"
  "$CLAUDE_BIN" --permission-mode acceptEdits \
         --max-turns 50 \
         --append-system-prompt "--resaleiq-loop" \
         -p "$(cat "$REPO/scripts/resume-prompt.md")" \
         < /dev/null >"$SESSION_OUT" 2>&1
  RC=$?
  cat "$SESSION_OUT" >> "$LOG"
  ELAPSED=$(( $(date +%s) - START ))
  SPENT=$(( SPENT + ELAPSED ))
  log "session exited rc=$RC after ${ELAPSED}s (total ${SPENT}s)"

  # A session that exits cleanly WITHOUT committing has made no progress. One is
  # normal (STATUS check, nothing to do); three in a row means the loop is
  # spinning — every task done but STATUS never set to DONE, or a crash that
  # still exits 0. Left alone that burns the night at one session every 2s.
  HEAD_NOW="$(git -C "$REPO" rev-parse HEAD 2>/dev/null)"
  if [ "$HEAD_NOW" = "${HEAD_BEFORE:-}" ]; then
    NO_PROGRESS=$(( ${NO_PROGRESS:-0} + 1 ))
    log "  no commit this session (${NO_PROGRESS}/3)"
    if [ "$NO_PROGRESS" -ge 3 ]; then
      log "3 sessions in a row committed nothing — stopping rather than spinning."
      log "Check agent/TASKS.md and agent/HANDOFF.md; set STATUS: DONE if finished."
      exit 0
    fi
  else
    NO_PROGRESS=0
  fi

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
