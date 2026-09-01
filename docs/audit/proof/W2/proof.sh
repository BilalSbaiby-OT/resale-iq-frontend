#!/usr/bin/env bash
# W2 proof — run cold from the repo root of this branch
# (claude/seo/w2-zero-model-cleanup). Verifies both halves of the claim:
#   1. The 36 zero-model /flip URLs are gone from the source of truth.
#   2. The live Index Coverage evidence backing the "don't kill the other
#      129" recommendation is on disk and adds up the way the WORKBOARD
#      row says it does.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../../.." && pwd)"
FAIL=0

echo "== 1. zero-model brands are gone from src/data/seo-brands.json =="
python3 - "$ROOT/src/data/seo-brands.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
kill = {"pull-bear", "zara", "bershka", "mango", "hugo-boss", "calvin-klein"}
slugs = {b["slug"] for b in d["brands"]}
present = kill & slugs
if present:
    print("FAIL: still present:", present)
    sys.exit(1)
print(f"OK: {len(d['brands'])} brands remain, none of the 6 zero-model brands present")
PY
[ $? -ne 0 ] && FAIL=1

echo
echo "== 2. dashboard counter reflects the kill =="
python3 - "$ROOT/dashboard/data.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
v = d.get("marketing", {}).get("zero_model_urls", {}).get("value")
print("zero_model_urls value:", v)
sys.exit(0 if v == 0 else 1)
PY
[ $? -ne 0 ] && FAIL=1

echo
echo "== 3. Index Coverage evidence file exists and totals 165 URLs =="
EVIDENCE="$HERE/2026-09-01-flip-category-index-coverage-165urls.json"
python3 - "$EVIDENCE" <<'PY'
import json, sys
from collections import Counter
d = json.load(open(sys.argv[1]))
print("rows:", len(d))
if len(d) != 165:
    print("FAIL: expected 165 rows")
    sys.exit(1)
kill = {"pull-bear", "zara", "bershka", "mango", "hugo-boss", "calvin-klein"}
def brand_of(url):
    parts = url.split("/flip/")
    return parts[1].split("/")[0] if len(parts) > 1 else None
remaining = [r for r in d if not (("/flip/" in r["url"]) and brand_of(r["url"]) in kill)]
print("remaining (36 zero-model excluded):", len(remaining))
c = Counter(r["coverageState"] for r in remaining)
for k, v in c.most_common():
    print(f"  {v:4d}  {k}")
rejected = c.get("Crawled - currently not indexed", 0)
print(f"explicit-rejection rate: {rejected}/{len(remaining)} = {rejected/len(remaining):.1%}")
if rejected / len(remaining) > 0.5:
    print("FAIL: majority-rejected -- the WORKBOARD claim ('not excluded as thin') would be wrong")
    sys.exit(1)
PY
[ $? -ne 0 ] && FAIL=1

echo
if [ "$FAIL" -eq 0 ]; then
    echo "PROOF OK"
else
    echo "PROOF FAILED"
fi
exit $FAIL
