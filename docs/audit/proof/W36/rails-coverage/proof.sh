#!/usr/bin/env bash
# PROOF — do the rails fire in every repo, or only in the one that was tested?
#
# EXPECTED TO FAIL until APPROVALS A12's rollout lands. That is deliberate.
# phase0/proof.sh certifies the deny rules 40/40 by invoking guard.py directly,
# which proves the logic and says nothing about whether a session in another repo
# ever reaches it. OS-COMPLIANCE.md read "Phase 0 rails DONE" on that basis.
#
# Reads configuration and feeds the hook synthetic input. No credential, no
# production system, no network.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$HERE/check_rails_coverage.py"
