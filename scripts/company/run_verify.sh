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
REPO="/Users/bilalsbaiby/work/resale-iq"
cd "$REPO" || exit 1
# Refresh the dashboard FIRST, then report. status_report.py reads
# dashboard/data.json for its UNKNOWN section, so running the report against a
# data.json nobody rebuilt meant the hourly job faithfully re-reported yesterday's
# gaps. GAPS B9 names "the dashboard's hourly refresh" as a thing that existed
# only as prose; this is that line. It also runs sql/metrics/*.sql, so the KPI
# panels refresh on the same hour rather than only when someone opens a session.
# --prod is REQUIRED, not an optimisation. os_verify's production/dashboard-data-fresh
# check demands prod_included=true, so a local-only rebuild here would overwrite a good
# data.json with a worse one and turn the board RED every hour. It is also the only
# database where the KPIs can compute at all: the local copy is a stale dev snapshot
# missing four migrated columns, so the North Star is permanently UNKNOWN against it.
"$REPO/.claude/bin/with-secrets.sh" python3 "$REPO/scripts/company/build_dashboard.py" --prod 2>&1
DRC=$?
printf '%s  dashboard exit=%s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$DRC" >> "$HOME/Library/Logs/resaleiq/os-verify.log"

"$REPO/.claude/bin/with-secrets.sh" python3 "$REPO/scripts/company/status_report.py" 2>&1
RC=$?
printf '%s  os-verify exit=%s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$RC" >> "$HOME/Library/Logs/resaleiq/os-verify.log"
exit 0   # never let a red report make launchd back off the job
