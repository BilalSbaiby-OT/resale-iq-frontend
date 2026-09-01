#!/usr/bin/env bash
# extension-eng — panel-states proof. Run cold, from anywhere.
#
# Proves, against the shipped extension/content.js loaded unmodified into a
# Node sandbox (no real browser available in this environment):
#   1. INSUFFICIENT_DATA and UNKNOWN are visually and textually distinct, and
#      both prefer the backend's own `message` field over a generic string.
#   2. Neither ever renders with .riq-watch (the real-WATCH amber class).
#   3. A genuine WATCH verdict is unaffected — still amber, still a number.
#   4. System failures (network down) render .riq-status-err (SKIP red).
#   5. Self-serve system states (rate limit, unverified email) render the
#      neutral .riq-status — distinct from both a verdict and a real error.
#
# Also syntax-checks every changed file so a broken script can't hide behind
# a green panel-state assertion.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../../../.." && pwd)"
RC=0

echo "== syntax: extension/*.js =="
for f in content.js background.js options.js link.js; do
  node --check "$ROOT/extension/$f" && echo "  ok: $f" || { echo "  FAIL: $f"; RC=1; }
done

echo
echo "== syntax: store-assets/make-screenshots.py =="
python3 -c "import ast; ast.parse(open('$ROOT/extension/store-assets/make-screenshots.py').read())" \
  && echo "  ok" || { echo "  FAIL"; RC=1; }

echo
echo "== panel-state assertions (content.js loaded live, unmodified) =="
node "$HERE/panel_states_test.mjs" || RC=1

echo
if [ "$RC" -eq 0 ]; then
  echo "PROOF PASSED"
else
  echo "PROOF FAILED"
fi
exit $RC
