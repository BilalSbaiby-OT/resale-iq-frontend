#!/usr/bin/env bash
# PreCompact — context is about to be dropped. Disk is the only memory (OS §4).
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
TS="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
mkdir -p "$REPO/docs/company"
printf '%s  compaction\n' "$TS" >> "$REPO/agent/loop.log"
cat <<MSG
=== PreCompact: write state to disk before it is lost ===
Rewrite $REPO/docs/company/SESSION.md NOW, in this shape:
  Updated / Working on / Blocked / Proof / Next 3 / Do not
Anything not in that file does not survive this compaction.
Current SESSION.md:
MSG
sed -n '1,60p' "$REPO/docs/company/SESSION.md" 2>/dev/null || echo "(SESSION.md does not exist yet — create it)"
exit 0
