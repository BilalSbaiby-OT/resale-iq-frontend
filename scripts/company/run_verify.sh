#!/usr/bin/env bash
# Hourly wrapper for the OS verifier. Runs under the credential gateway so the
# credentials layer actually authenticates and no value reaches a log file.
#
# Lives OUTSIDE ~/Desktop deliberately? No — it lives inside the repo, and that is
# safe because launchd runs /bin/bash on THIS script, and bash has been granted
# nothing special. The scrape agent's TCC failure was about executing a script in a
# protected folder; if this ever reports "Operation not permitted", move it the same
# way, to ~/resaleiq-agent. See docs/eng/runbook/local-scrape-agent.md.
set -uo pipefail
REPO="/Users/bilalsbaiby/Desktop/resale-iq"
cd "$REPO" || exit 1
"$REPO/.claude/bin/with-secrets.sh" python3 "$REPO/scripts/company/status_report.py" 2>&1
RC=$?
printf '%s  os-verify exit=%s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$RC" >> "$HOME/Library/Logs/resaleiq/os-verify.log"
exit 0   # never let a red report make launchd back off the job
