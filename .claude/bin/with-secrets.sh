#!/usr/bin/env bash
# with-secrets.sh — the ONLY sanctioned way an agent touches this company's credentials.
#
# The founder's instruction (2026-08-31): "get access to Coolify, Hetzner, Stripe and
# Search Console yourself — I have a lot of APIs in env, why check with me."
# The charter's rule (OS §2): ".env never in context."
#
# Both hold at once if the agent never SEES a secret, only USES one. This script
# sources the env files into a child process, runs the command there, and scrubs every
# secret value out of stdout and stderr before it can reach a transcript. So an agent
# writes  $STRIPE_SECRET_KEY  and gets Stripe data back; the key itself never appears.
#
# Usage:
#   with-secrets.sh --names                 list variable NAMES available (never values)
#   with-secrets.sh <cmd> [args...]         run cmd with the secrets in its environment
#   with-secrets.sh sh -c 'curl -sS -u "$STRIPE_SECRET_KEY:" https://api.stripe.com/...'
#
# Guarantees:
#   - values are never echoed; `--names` prints names only
#   - stdout+stderr are filtered: any secret value ≥8 chars is replaced with ***REDACTED***
#   - the guard hook allows .env only through this script; direct `cat .env` stays blocked
#   - it does not weaken any other rail: pushes, Stripe writes and deploys are still gated
set -uo pipefail

ENV_FILES=(
  "$HOME/Desktop/demand-intel/.env"
  "$HOME/Desktop/resale-iq-growth/.env"
  "$HOME/.resaleiq-agent.env"
)

NAMES=()
set -a
for f in "${ENV_FILES[@]}"; do
  [ -r "$f" ] || continue
  while IFS= read -r line; do
    case "$line" in ''|'#'*) continue ;; esac
    case "$line" in *=*) NAMES+=("${line%%=*}") ;; esac
  done < "$f"
  # Parse KEY=VALUE rather than dot-sourcing. Sourcing executes the file, so one
  # malformed line runs as a shell command in the single sanctioned credential
  # path — there was a live `line 21: by: command not found` on every run. That is
  # arbitrary code execution from an unvalidated file, and nobody had read the
  # output closely enough to notice.
  while IFS= read -r line; do
    case "$line" in ''|'#'*) continue ;; esac
    key="${line%%=*}"; key="${key#export }"; key="${key#"${key%%[![:space:]]*}"}"
    case "$key" in *[!A-Za-z0-9_]*|'') continue ;; esac
    val="${line#*=}"
    val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
    export "$key=$val"
  done < "$f"
done
set +a

if [ "${1:-}" = "--names" ]; then
  printf '%s\n' "${NAMES[@]}" | sed 's/^[[:space:]]*//;s/^export //' | sort -u
  exit 0
fi

if [ "$#" -eq 0 ]; then
  echo "usage: with-secrets.sh [--names] <command> [args...]" >&2
  exit 64
fi

# Build the scrub list: every value long enough to be a credential.
SCRUB=$(
  for n in $(printf '%s\n' "${NAMES[@]}" | sed 's/^[[:space:]]*//;s/^export //' | sort -u); do
    v="${!n:-}"
    [ "${#v}" -ge 8 ] && printf '%s\n' "$v"
  done
)

"$@" 2>&1 | SCRUB="$SCRUB" python3 -c '
import os, re, sys
vals = [v for v in os.environ.get("SCRUB", "").split("\n") if len(v) >= 8]
vals.sort(key=len, reverse=True)
pat = re.compile("|".join(re.escape(v) for v in vals)) if vals else None
for line in sys.stdin:
    sys.stdout.write(pat.sub("***REDACTED***", line) if pat else line)
'
exit "${PIPESTATUS[0]}"
