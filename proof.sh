#!/usr/bin/env bash
# proof.sh — llms.txt / methodology / support / category refresh-cadence claims
# corrected to match production, not the schedule config. Run cold from repo root.
#
# Background: llms.txt and /methodology both claimed "listings collected about
# every 30 minutes" and "public pages revalidate every 15 minutes". Verified
# against production 2026-09-02 via SSH (resaleiq -> container ph5clxk9...,
# SQLite scraper_log table, read-only) and via `curl -sI` on live URLs:
#   - Collection is SCHEDULED every 30 min/market but skips when the prior run
#     is still in flight ("maximum number of running instances reached" in
#     /app/logs/demand_intel.log). Real cadence (scraper_log, trailing 7d,
#     n=1,157 gaps across vinted_es/fr/de/it/pt): median 34min, mean 43min,
#     83.1% of gaps <1h. Last 48h (n=242): only 57.9% <1h — an active backlog.
#   - "revalidate every 15 minutes" / "97% of gaps under an hour" / "ISR on
#     this site" were false: curl -sI on 8 live URLs (/, /manual, /flip/nike,
#     /category/sneakers, /methodology, /support, /tools/vinted-price-checker,
#     /blog/what-sells-best-on-vinted) all return
#     `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`
#     — i.e. no page cache, full per-request dynamic rendering. Root cause:
#     src/app/layout.tsx calls headers() (locale detection), which forces
#     dynamic rendering for the whole route tree in Next's App Router,
#     overriding `export const revalidate = 900` on every child page.
set -euo pipefail
cd "$(dirname "$0")"

fail() { echo "FAIL: $1"; exit 1; }
pass() { echo "PASS: $1"; }

# 1. The old false claims are gone from every surface that had them.
for f in src/app/llms.txt/route.ts src/app/methodology/page.tsx src/app/support/page.tsx "src/app/category/[category]/page.tsx"; do
  grep -q "revalidate every 15 minutes\|every 15 minutes\|ISR on this site" "$f" \
    && fail "$f still claims a 15-minute page revalidate that production does not do"
done
grep -q "97% of gaps" src/app/methodology/page.tsx \
  && fail "methodology/page.tsx still claims the stale, unverified 97%-under-an-hour figure"
pass "no surface still claims 15-minute ISR or the old 97% figure"

# 2. The corrected claims are present, sourced, and dated — not a new bare number.
grep -q "n=1,157" src/app/methodology/page.tsx || fail "methodology missing the n for the 7-day cadence figure"
grep -q "n=242" src/app/methodology/page.tsx || fail "methodology missing the n for the 48h cadence figure"
grep -q "2026-08-26 to 2026-09-02" src/app/methodology/page.tsx || fail "methodology missing the measurement date range"
grep -q "83% of gaps" src/app/methodology/page.tsx || fail "methodology missing the corrected 7-day figure"
grep -q "58% under 1h\|58% under an hour" src/app/methodology/page.tsx || fail "methodology missing the corrected 48h figure"
grep -q "no page-level cache" src/app/llms.txt/route.ts || fail "llms.txt route missing the corrected page-cache claim"
grep -q "no page-level cache\|no page cache" src/app/methodology/page.tsx || fail "methodology missing the corrected page-cache claim"
pass "corrected claims present with n, date range and source (scraper run log) in place of the old bare numbers"

# 3. TypeScript compiles clean on the touched files.
npx tsc --noEmit -p tsconfig.json 2>&1 | tee /tmp/riq-tsc-out.txt | grep -E "llms\.txt/route|methodology/page|support/page|category/\[category\]/page" \
  && fail "typecheck errors in a touched file (see /tmp/riq-tsc-out.txt)"
pass "tsc --noEmit: no errors in touched files"

# 4. Production build succeeds AND its own route table shows these pages as
#    Dynamic (not static/ISR) — i.e. the corrected "no page cache" claim
#    matches what Next.js itself says it built, not just what we typed.
BUILD_LOG=/tmp/riq-build-out.txt
npm run build > "$BUILD_LOG" 2>&1 || fail "next build failed — see $BUILD_LOG"
CLEAN=/tmp/riq-build-clean.txt
python3 -c "
import re
with open('$BUILD_LOG', 'r', errors='replace') as f:
    print(re.sub(r'\x1b\[[0-9;]*m', '', f.read()))
" > "$CLEAN"
grep -q '^.*ƒ /methodology *$' "$CLEAN" || fail "build route table does not show /methodology as Dynamic (ƒ)"
grep -q '^.*ƒ /support *$' "$CLEAN" || fail "build route table does not show /support as Dynamic (ƒ)"
grep -q 'ƒ /category/\[category\]' "$CLEAN" || fail "build route table does not show /category/[category] as Dynamic (ƒ)"
pass "next build succeeds; route table confirms these pages are Dynamic, not ISR-cached — matches the corrected copy"

echo
echo "All checks passed."
echo
echo "NOT covered by this script (requires live SSH access to production, run manually to reproduce):"
echo "  ssh resaleiq 'docker exec ph5clxk9hmghspv65pdkvak9-005644706039 python3 -c \"...\"'  # scraper_log gap query, n=1157/n=242"
echo "  curl -sI https://resaleiq.dev/methodology   # expect cache-control: private, no-cache, no-store"
echo "  curl -s https://resaleiq.dev/api/public/market-snapshot | python3 -m json.tool  # 998-departures figure, verified accurate 2026-09-02"
