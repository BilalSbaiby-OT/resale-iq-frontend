#!/usr/bin/env bash
# PROOF — sql/metrics/*.sql compute what docs/company/METRICS.md says they compute.
#
# Runs cold from anywhere. Builds its own fully-migrated fixture database from
# db/schema.py, seeds rows whose correct answer was worked out by hand, and
# asserts each query returns that answer.
#
# Touches no real database. The fixture lives in a temp dir and is deleted on
# exit — including on failure, so a failed run cannot leave a stale db that a
# later run picks up and passes against.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../../../.." && pwd)"          # -> resale-iq
INTEL="$(cd "$ROOT/.." && pwd)/demand-intel"        # sibling repo, holds the schema

echo "proof: metrics"
echo "  repo:   $ROOT"
echo "  schema: $INTEL/db/schema.py"

if [ ! -f "$INTEL/db/schema.py" ]; then
  echo "FAIL  cannot find db/schema.py at $INTEL — the fixture needs the real schema"
  exit 1
fi

SANDBOX="$(mktemp -d)"
trap 'rm -rf "$SANDBOX"' EXIT
FIXTURE="$SANDBOX/fixture.db"

# Build the fixture through the application's OWN bootstrap, so the proof runs
# against the schema production actually gets — migrations included. Writing the
# CREATE TABLE by hand here would let the fixture and production drift apart
# silently, which is the exact class of bug this file exists to catch.
echo "  building fixture (init_db + column migrations)..."
( cd "$INTEL" && DB_PATH="$FIXTURE" python3 -c "
import asyncio
from db.schema import init_db
asyncio.run(init_db())
" ) >"$SANDBOX/init.log" 2>&1 || { echo "FAIL  init_db failed:"; tail -20 "$SANDBOX/init.log"; exit 1; }

# The fixture is only useful if it has the MIGRATED columns. Assert that before
# asserting anything else: a fixture missing user_id would make every query
# report UNKNOWN, and a run of all-UNKNOWN must never read as a pass.
for col in user_id said_buy_below reason q_norm; do
  if ! sqlite3 "$FIXTURE" "PRAGMA table_info(verdict_logs);" | grep -q "|$col|"; then
    echo "FAIL  fixture is missing verdict_logs.$col — migrations did not run"
    exit 1
  fi
done
echo "  fixture ok (migrated columns present)"
echo

python3 "$HERE/seed_and_assert.py" "$FIXTURE" "$ROOT"
