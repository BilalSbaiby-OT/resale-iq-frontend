#!/usr/bin/env bash
# Session died on a usage/rate limit. Leave a marker the loop can see, plus the
# wall-clock time it is safe to try again.
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p "$REPO/agent"
touch "$REPO/agent/RATE_LIMITED"
if date -u -v+3H '+%Y-%m-%dT%H:%M:%SZ' >/dev/null 2>&1; then
  UNTIL="$(date -u -v+3H '+%Y-%m-%dT%H:%M:%SZ')"     # BSD/macOS
else
  UNTIL="$(date -u -d '+3 hours' '+%Y-%m-%dT%H:%M:%SZ')"  # GNU
fi
echo "SLEEP_UNTIL=$UNTIL" > "$REPO/agent/RATE_LIMITED"
printf '%s  stop-failure: rate limited, sleep until %s\n' \
  "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$UNTIL" >> "$REPO/agent/loop.log"
exit 0
