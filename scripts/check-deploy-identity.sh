#!/usr/bin/env bash
# check-deploy-identity.sh <expected-sha> [deploy-id-url]
#
# Exits 0 iff the live /deploy-id endpoint reports SOURCE_COMMIT == expected-sha.
# Exits 1 otherwise (wrong commit, unreachable, or malformed response) — this
# script is meant to fail loudly, unlike the chunk-fingerprint check it
# replaces as the deploy gate (see .github/workflows/deploy.yml).
#
# Split out of the workflow so scripts/test-check-deploy-identity.sh can
# falsify it against fixtures instead of production, and so the workflow and
# the test run the exact same logic rather than two copies that can drift.
set -uo pipefail

EXPECTED="${1:?usage: check-deploy-identity.sh <expected-sha> [deploy-id-url]}"
URL="${2:-https://resaleiq.dev/deploy-id}"

live=$(curl -sL -m 20 "${URL}" 2>/dev/null | grep -oE '"commit":"[0-9a-f]+"' | cut -d'"' -f4) || true

if [ "${live}" = "${EXPECTED}" ]; then
  echo "Confirmed live: ${live} (expected ${EXPECTED})"
  exit 0
fi

echo "::error::Live commit '${live:-<none>}' from ${URL} does not match expected ${EXPECTED}"
exit 1
