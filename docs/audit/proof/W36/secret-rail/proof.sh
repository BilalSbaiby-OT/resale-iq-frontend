#!/usr/bin/env bash
# PROOF — A12 CRITICAL. The credential rail resolves PROGRAMS, not substrings.
#
# Runs cold from anywhere. Reads no credential and executes no bypass: every case
# is a synthetic tool call handed to the hook, and the hook's exit code is the
# assertion.
#
# It checks BOTH directions, which is the point. The defect had two faces — a
# false negative (a trailing comment defeated the block) and a false positive
# (a commit message documenting the rule tripped it). A tightened match that
# still refuses legitimate calls is half a fix, and it teaches people to route
# around the rail rather than through it.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "proof: secret-rail (A12 CRITICAL)"
python3 "$HERE/test_secret_rail.py"
