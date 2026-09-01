#!/usr/bin/env bash
# W48 proof: retest the free-checker at a real 375x812 mobile viewport
# against production, with a fresh browser context + reload per attempt
# (so load-time gates re-run), and observe the actual network call rather
# than guessing from rendered text.
#
# Requires: playwright installed (present in resale-iq/node_modules) and
# Google Chrome installed locally (script uses channel: "chrome", same as
# playwright.config.ts's own project). Needs network access to
# https://resaleiq.dev.
#
# Verdict on 2026-09-01: 4/4 attempts succeeded (2 click, 2 Enter-key).
# Every attempt: GET /api/verdict returned 200 with live data, and the
# result card + "Unlock the rest" CTA rendered. See
# mobile-375x812-result-live.png and attempt-*.png in this directory.
# Conclusion: the mobile submit failure ux-researcher saw does not
# reproduce cleanly — consistent with session tooling, not a product bug.
set -euo pipefail

REPO_NODE_MODULES="${REPO_NODE_MODULES:-/Users/bilalsbaiby/work/resale-iq/node_modules}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT
ln -s "$REPO_NODE_MODULES" "$WORKDIR/node_modules"
cp "$SCRIPT_DIR/mobile-retest.mjs" "$WORKDIR/mobile-retest.mjs"

cd "$WORKDIR"
node mobile-retest.mjs
