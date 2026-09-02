#!/usr/bin/env python3
"""Regenerate src/data/seo-brands.json from PRODUCTION.

Why this exists: the file was frozen at 20 brands, hand-maintained, and it drives
every /flip/[brand] page, every brand x category page, the category hubs and the
sitemap. Production has 322 brands clearing 8 watched departures in 7 days and 123
clearing 20. We were publishing 5.6% of what we can already prove.

The count went 26 -> 20 earlier by deleting brands with models_tracked = 0. That
was right about thin pages and wrong about the axis: a brand page does not need
per-model tracking to say something true and useful. It needs real departure
volume, a real average, and a real category split -- all of which we have for
hundreds of brands.

Founder decision 2026-09-02, verbatim: "naming brands in marketing dosnt hurt us
as all / i fucking wish you expand the brands and models bro like that would do
us more good then bad". So the brand exclusion list is gone.

WHAT DID NOT CHANGE, and must not:
  - the evidence floor. A page still only exists if the brand clears FLOOR
    watched departures in the window. Expanding coverage is not licence to
    publish thin data.
  - "watched departures", never "sold".
  - no per-model buy-below on a public page; aggregates only (DATA_CONTRACT r4).
  - no authenticity claims. Naming a luxury brand is fine; telling someone we can
    verify an item is genuine is not, and never was about the brand name.

Run:  python3 scripts/company/gen_seo_brands.py [--floor 20] [--write]
Reads production read-only over ssh. Prints a diff summary; --write applies it.
"""
import argparse
import json
import subprocess
import sys

REMOTE = "resaleiq"
OUT = "/Users/bilalsbaiby/work/resale-iq/src/data/seo-brands.json"

# Runs INSIDE the backend container, read-only. Emits one JSON blob on stdout.
PROBE = r'''
import json, sqlite3
c = sqlite3.connect("file:/app/data/demand_intel.db?mode=ro", uri=True)
c.row_factory = sqlite3.Row
FLOOR = __FLOOR__
W = 'datetime("now","-7 day")'

brands = c.execute(f"""
    SELECT brand,
           COUNT(*)                AS sold_7d,
           ROUND(AVG(price_eur),2) AS avg_price_eur
      FROM listings
     WHERE sold_observed=1 AND brand IS NOT NULL AND TRIM(brand)!=''
       AND last_seen_at > {W}
     GROUP BY brand
    HAVING COUNT(*) >= ?
     ORDER BY sold_7d DESC""", (FLOOR,)).fetchall()

out = []
for b in brands:
    cats = c.execute(f"""
        SELECT category,
               COUNT(*)                AS sold_7d,
               ROUND(AVG(price_eur),2) AS avg_price_eur
          FROM listings
         WHERE sold_observed=1 AND brand=? AND category IS NOT NULL
           AND TRIM(category)!='' AND last_seen_at > {W}
         GROUP BY category HAVING COUNT(*) >= 5
         ORDER BY sold_7d DESC""", (b["brand"],)).fetchall()
    models = c.execute(f"""
        SELECT COUNT(DISTINCT model) FROM listings
         WHERE brand=? AND model IS NOT NULL AND TRIM(model)!=''
           AND last_seen_at > {W}""", (b["brand"],)).fetchone()[0]
    out.append({
        "brand": b["brand"],
        "sold_7d": b["sold_7d"],
        "avg_price_eur": b["avg_price_eur"],
        "top_categories": [r["category"] for r in cats[:3]],
        "categories": [dict(r) for r in cats],
        "models_tracked": models,
    })
print(json.dumps({"brands": out}))
'''


def slugify(s):
    out, prev_dash = [], False
    for ch in s.lower().replace("&", "and"):
        if ch.isalnum():
            out.append(ch)
            prev_dash = False
        elif not prev_dash:
            out.append("-")
            prev_dash = True
    return "".join(out).strip("-")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--floor", type=int, default=20,
                    help="minimum watched departures in 7d for a brand to get a page")
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()

    cmd = ("C=$(docker ps --format '{{.Names}}' | grep ph5cl | head -1); "
           "docker exec -i \"$C\" python3 -")
    r = subprocess.run(["ssh", REMOTE, cmd],
                       input=PROBE.replace("__FLOOR__", str(a.floor)),
                       capture_output=True, text=True, timeout=600)
    if r.returncode != 0 or not r.stdout.strip():
        print(f"  production probe FAILED: {r.stderr[:300]}", file=sys.stderr)
        return 1

    data = json.loads(r.stdout.strip().splitlines()[-1])
    for b in data["brands"]:
        b["slug"] = slugify(b["brand"])
    # Stable order: volume desc, then slug, so the file diffs cleanly week to week.
    data["brands"].sort(key=lambda x: (-x["sold_7d"], x["slug"]))
    # Schema the frontend expects, key order matched to the existing file.
    data["brands"] = [{"brand": b["brand"], "slug": b["slug"], "sold_7d": b["sold_7d"],
                       "avg_price_eur": b["avg_price_eur"],
                       "top_categories": b["top_categories"],
                       "categories": b["categories"],
                       "models_tracked": b["models_tracked"]}
                      for b in data["brands"]]

    old = json.load(open(OUT, encoding="utf-8"))["brands"]
    old_slugs = {b["slug"] for b in old}
    new_slugs = {b["slug"] for b in data["brands"]}

    print(f"  floor: >= {a.floor} watched departures in 7d")
    print(f"  brands: {len(old)} -> {len(data['brands'])}")
    print(f"  added:   {len(new_slugs - old_slugs)}")
    print(f"  dropped: {len(old_slugs - new_slugs)}"
          f"{' -> ' + ', '.join(sorted(old_slugs - new_slugs)) if old_slugs - new_slugs else ''}")
    thin = [b for b in data["brands"] if not b["categories"]]
    print(f"  brands with NO category clearing n>=5: {len(thin)}"
          " (these would be thin pages)")
    pages = sum(1 + len(b["categories"]) for b in data["brands"])
    print(f"  total generated URLs (brand + brand x category): {pages}")

    if a.write:
        json.dump(data, open(OUT, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
        open(OUT, "a", encoding="utf-8").write("\n")
        print(f"  WROTE {OUT}")
    else:
        print("  dry run — pass --write to apply")
    return 0


if __name__ == "__main__":
    sys.exit(main())
