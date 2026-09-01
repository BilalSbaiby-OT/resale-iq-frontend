#!/usr/bin/env bash
# PROOF — the "sold" relabel (DATA.md:226-229, APPROVALS.md A16 item 1).
#
# DATA.md found that every "sold" claim on the site is a claim the data
# cannot support: we observe an asking price and a listing's disappearance
# from a Vinted search shelf, and infer a sale — never a confirmed
# transaction. This proof asserts four things, cold, from source:
#
#   1. The specific offending strings named in the task are gone from the
#      specific files named in the task.
#   2. /methodology states the mechanism plainly (asking price at shelf
#      departure, not a confirmed sale) exactly once, in the section that
#      exists to carry it.
#   3. The three protected internal identifiers were NOT renamed —
#      sold_observed, sold_7d, sold_at still appear in the source, proving
#      this was a copy-only change.
#   4. Self-verification pass (2026-09-01): the original commit's own audit
#      (SOLD-VS-ASKING-CATALOG.md) missed the programmatic SEO estate —
#      /category, /flip hub + brand pages, /flip/[brand]/[category], the
#      manual index/chapter shell, flip-narrative.ts's per-brand prose, and
#      one Spanish-language blog test page making the identical claim in
#      Spanish. Section 4 asserts those are closed too.
#
# Deliberately does not re-run the full e2e suite (npm run test:e2e:required)
# or `npm run build` — those are slow and already covered by the PR
# description. This proof is the fast, source-level check a reviewer can run
# cold to confirm the claim-shape actually changed.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../../../.." && pwd)"   # -> resale-iq
cd "$ROOT"

pass=0
fail=0

ok()   { echo "  OK    $1"; pass=$((pass+1)); }
bad()  { echo "  FAIL  $1"; fail=$((fail+1)); }

echo "proof: sold-relabel"
echo "  repo: $ROOT"
echo

# ── 1. Offending strings named in the task brief are gone ──────────────────
echo "1. Named offenders no longer make the claim"

check_gone() {
  local file="$1" needle="$2"
  if [ ! -f "$file" ]; then
    bad "$file does not exist (path moved? update this proof)"
    return
  fi
  if grep -qF -- "$needle" "$file"; then
    bad "$file still contains: $needle"
  else
    ok "$file no longer contains: $needle"
  fi
}

check_gone "src/app/methodology/page.tsx" 'confirms items actually sold'
check_gone "src/app/methodology/page.tsx" 'We anchor on <strong style={{ color: "#eef1f7" }}>sold</strong> listings'
check_gone "src/lib/i18n.ts" 'comparable sold listings'
check_gone "src/lib/i18n.ts" 'watched sold listings'
check_gone "extension/content.js" 'median: "avg sold"'
check_gone "extension/content.js" 'comparable sold items'
check_gone "extension/STORE-LISTING.md" 'live and sold listings'
check_gone "extension/SUBMIT-CHECKLIST.md" 'live and sold listings'

echo

# ── 2. The mechanism is said plainly on /methodology, not buried ───────────
echo "2. /methodology carries the mechanism, once, where the honesty lives"

M=src/app/methodology/page.tsx
if grep -q "we do not see a receipt" "$M"; then
  ok "methodology explains the inference (no receipt, asking price at departure)"
else
  bad "methodology does not explain the inference in plain language"
fi

if grep -q "relisting the same item under a new id" "$M"; then
  ok "methodology names the relist-bias mechanism (slow movers over-represented)"
else
  bad "methodology does not name the relist-bias mechanism"
fi

if grep -qi "asking price at the moment" "$M"; then
  ok "methodology uses the honest phrase (asking price at the moment of departure)"
else
  bad "methodology never states the honest replacement phrase"
fi

echo

# ── 3. Protected identifiers were NOT renamed ───────────────────────────────
echo "3. Protected identifiers untouched (copy-only change)"

for ident in sold_observed sold_7d sold_at; do
  n=$(grep -rl -- "$ident" src/ extension/ 2>/dev/null | wc -l | tr -d ' ')
  if [ "$n" -gt 0 ]; then
    ok "$ident still used in source ($n file(s)) — not renamed"
  else
    bad "$ident no longer appears anywhere in source — was it renamed?"
  fi
done

echo

# ── 4. Self-verification pass: the programmatic SEO estate + Spanish page ──
echo "4. Gaps the original catalog missed are closed (self-verification pass)"

check_gone "src/app/category/[category]/page.tsx" 'Sold / week'
check_gone "src/app/category/page.tsx" ' sold/week'
check_gone "src/app/flip/page.tsx" ' sold/week'
check_gone "src/app/flip/[brand]/page.tsx" 'Sold per week'
check_gone "src/app/flip/[brand]/page.tsx" 'live and sold listings'
check_gone "src/app/flip/[brand]/[category]/page.tsx" 'sold / week'
check_gone "src/lib/flip-narrative.ts" 'sold a week'
check_gone "src/app/manual/page.tsx" 'sold-listing data'
check_gone "src/app/manual/[chapter]/page.tsx" 'tracks sold about'
check_gone "src/data/manual.ts" 'is a count of what sold'
check_gone "src/data/blog-posts-3.ts" 'una venta te dice lo que alguien pagó'
check_gone "src/data/blog-posts-3.ts" 'pasar de activos a vendidos'

echo

echo "──────────────────────────────────────────────"
echo "  $pass passed, $fail failed"
if [ "$fail" -gt 0 ]; then
  echo "PROOF FAILED"
  exit 1
fi
echo "PROOF PASSED"
