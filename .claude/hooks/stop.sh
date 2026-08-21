#!/usr/bin/env bash
# Timestamp only. MUST exit 0 and MUST NOT block: the process has to die so the
# shell loop can start a fresh session with a clean context.
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p "$REPO/agent"
printf '%s  session ended\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$REPO/agent/loop.log"
exit 0
