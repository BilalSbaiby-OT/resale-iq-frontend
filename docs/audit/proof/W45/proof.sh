#!/usr/bin/env bash
# W45/W47 proof: confirms whether the register-form default-plan fix
# (commit 392ff4a) is actually live on production, by inspecting the
# real deployed HTML/JS from https://resaleiq.dev — not by reading source.
#
# This is a LIVE check, not a deterministic unit test: it depends on
# network access and on what commit is currently deployed. Re-running it
# after a real deploy of 392ff4a+ should flip the verdict from FAIL to PASS.
#
# Screenshots in this directory were captured 2026-09-01 ~17:56 CEST:
#   1-free-result-live.png            — a real free check, live data
#   2-register-pro-preselected-live.png — /register after clicking the
#                                          real "Unlock the rest" CTA:
#                                          Pro pre-selected, waiver visible
set -uo pipefail

URL="https://resaleiq.dev/register"
html=$(curl -sL "$URL")

echo "== Fetching $URL =="

# The register-form radios render in DOM order power, operator, free.
# If the FIRST label carries the "checked" + emerald-selected classes,
# Pro is still the default (pre-fix, broken). If the THIRD does, Free is
# the default (post-fix, correct).
first_label=$(echo "$html" | grep -o '<label class="relative flex items-center[^"]*"><input type="radio" class="accent-emerald-400" name="plan"[^/]*/>' | head -1)

if echo "$first_label" | grep -q 'checked'; then
  echo "RESULT: FAIL — Pro (first radio) is checked by default on /register with no plan param."
  echo "The W47 fix (commit 392ff4a) is NOT live. See W53 for why (deploy pipeline stuck)."
  exit_code=1
else
  echo "RESULT: PASS — Pro is not the default; check screenshot / manual confirm Free is selected."
  exit_code=0
fi

echo "== Fetching the CTA-driven CTA target (?plan=free explicit) =="
curl -sL "https://resaleiq.dev/register?plan=free" -o /dev/null -w "HTTP %{http_code}\n"

exit $exit_code
