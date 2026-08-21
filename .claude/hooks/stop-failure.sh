#!/usr/bin/env bash
# Session failed. ONLY claim a rate limit when the failure actually says so —
# blanket-labelling every crash as a limit sent the loop to sleep for 3 hours
# each time instead of retrying in 60 seconds.
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p "$REPO/agent"
PAYLOAD="$(cat 2>/dev/null || true)"
TS="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

if printf '%s' "$PAYLOAD" | grep -qiE 'hit your (usage )?limit|usage limit reached|rate limit exceeded'; then
  if date -u -v+3H '+%Y-%m-%dT%H:%M:%SZ' >/dev/null 2>&1; then
    UNTIL="$(date -u -v+3H '+%Y-%m-%dT%H:%M:%SZ')"          # BSD/macOS
  else
    UNTIL="$(date -u -d '+3 hours' '+%Y-%m-%dT%H:%M:%SZ')"  # GNU
  fi
  echo "SLEEP_UNTIL=$UNTIL" > "$REPO/agent/RATE_LIMITED"
  printf '%s  stop-failure: RATE LIMITED, sleep until %s\n' "$TS" "$UNTIL" >> "$REPO/agent/loop.log"
else
  printf '%s  stop-failure: session failed (not a rate limit) — loop will retry\n' "$TS" >> "$REPO/agent/loop.log"
fi
exit 0
