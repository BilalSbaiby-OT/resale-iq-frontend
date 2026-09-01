#!/usr/bin/env bash
# PROOF — the drift canary (scripts/canary/{freeze,run}_drift_canary.py) does
# what docs/audit/canary/DRIFT_CANARY.md says it does, and nothing more.
#
# This proves the MECHANISM: freeze -> mutate -> diff correctly reports what
# changed, by how much, what verdict flipped, and what disappeared, and stays
# silent (exit 0, zero rows changed) when nothing moved. It does NOT and
# CANNOT prove that any frozen or current value is CORRECT — see the file
# above for why that is true by construction, not by omission here.
#
# Runs cold from anywhere. Builds its own fully-migrated fixture database
# from db/schema.py (same approach as docs/audit/proof/W36/metrics/proof.sh),
# seeds 6 rows with known relationships to the n>=8 verdict boundary, and
# asserts the diff report against values worked out by hand. Touches no real
# database — production is never contacted by this proof.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../../../.." && pwd)"          # -> resale-iq
INTEL="$(cd "$ROOT/.." && pwd)/demand-intel"        # sibling repo, holds the schema

echo "proof: drift canary"
echo "  repo:   $ROOT"
echo "  schema: $INTEL/db/schema.py"

if [ ! -f "$INTEL/db/schema.py" ]; then
  echo "FAIL  cannot find db/schema.py at $INTEL — the fixture needs the real schema"
  exit 1
fi

for f in "$ROOT/scripts/canary/_prod.py" \
         "$ROOT/scripts/canary/freeze_drift_canary.py" \
         "$ROOT/scripts/canary/run_drift_canary.py"; do
  if [ ! -f "$f" ]; then
    echo "FAIL  missing $f"
    exit 1
  fi
done

SANDBOX="$(mktemp -d)"
trap 'rm -rf "$SANDBOX"' EXIT
FIXTURE="$SANDBOX/fixture.db"

echo "  building fixture (init_db + column migrations)..."
( cd "$INTEL" && DB_PATH="$FIXTURE" python3 -c "
import asyncio
from db.schema import init_db
asyncio.run(init_db())
" ) >"$SANDBOX/init.log" 2>&1 || { echo "FAIL  init_db failed:"; tail -20 "$SANDBOX/init.log"; exit 1; }

# The fixture is only useful if it has the MIGRATED comparable_n column —
# same discipline as the metrics proof: assert the shape before trusting
# anything computed from it.
if ! sqlite3 "$FIXTURE" "PRAGMA table_info(model_signals);" | grep -q "|comparable_n|"; then
  echo "FAIL  fixture model_signals is missing comparable_n — migrations did not run"
  exit 1
fi
echo "  fixture ok (comparable_n present)"
echo

python3 "$HERE/seed_and_assert.py" "$FIXTURE" "$ROOT"
STATUS=$?

echo
if [ "$STATUS" -eq 0 ]; then
  echo "PASS  drift canary mechanism proven cold (freeze, refuse-overwrite, "
  echo "      negative control, verdict flip, price delta, missing-row report)"
else
  echo "FAIL  see assertions above"
fi
exit "$STATUS"
