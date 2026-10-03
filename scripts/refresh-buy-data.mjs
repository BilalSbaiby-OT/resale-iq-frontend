#!/usr/bin/env node
/**
 * scripts/refresh-buy-data.mjs
 *
 * Regenerates src/data/buy-data.json from the production market_stats table.
 * Run this whenever the market_stats data is refreshed.
 *
 * Usage:
 *   node scripts/refresh-buy-data.mjs
 *
 * Requires:
 *   - SSH access to resaleiq server
 *   - docker exec access to the backend container
 *   - The backend container name must match /ph5cl/
 *
 * The script reads ONLY - no writes to the production DB.
 *
 * CNT (2026-10-04): sold_30d is now COUNT(DISTINCT external_id) of F1-valid
 * departures over the last 30 days (same rules as O7's refresh_model_signals),
 * NOT AVG(market_stats.sold_30d) -- market_stats is per platform and the same
 * item sits on several Vinted domains. The page set is frozen to the pairs
 * already in src/data/buy-data.json (no new URLs); pass --expand to add every
 * brand x category pair that clears the threshold.
 */

import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATH = path.join(__dirname, "../src/data/buy-data.json")

// Python script to run inside the container
const EXPAND = process.argv.includes("--expand")
let ALLOWED = null
let PREV = {}
try {
  if (!EXPAND) {
    const prev = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"))
    ALLOWED = prev.brands.flatMap((b) => b.categories.map((c) => [b.brand, c.category]))
    for (const b of prev.brands) for (const c of b.categories) PREV[`${b.brand}||${c.category}`] = c
  }
} catch {}

const PY = `
import sqlite3, json, sys, re
ALLOWED = json.loads(r'''${JSON.stringify(ALLOWED)}''')
PREV = json.loads(r'''${JSON.stringify(PREV)}''')

def make_slug(s):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', 'and'))).strip('-')

EXISTING_SLUGS = {
    'Fred Perry': 'fred-perry', 'Stone Island': 'stone-island', 'Patagonia': 'patagonia',
    'Balenciaga': 'balenciaga', 'New Balance': 'new-balance', 'The North Face': 'the-north-face',
    'Diesel': 'diesel', 'Gucci': 'gucci', 'Nike': 'nike', 'Lacoste': 'lacoste',
    'Supreme': 'supreme', 'Reebok': 'reebok', 'Hugo Boss': 'hugo-boss', 'Adidas': 'adidas',
    'Carhartt': 'carhartt', 'Tommy Hilfiger': 'tommy-hilfiger', 'Calvin Klein': 'calvin-klein',
    'Zara': 'zara', 'Ralph Lauren': 'ralph-lauren', "Levi's": 'levis', 'Puma': 'puma',
    'Pull&Bear': 'pullandbear', 'Off-White': 'off-white', 'Bershka': 'bershka', 'Vans': 'vans',
    'Jordan': 'jordan', 'Uniqlo': 'uniqlo', 'ASICS': 'asics', 'Salomon': 'salomon',
    'Converse': 'converse', 'Dr. Martens': 'dr-martens', 'Mango': 'mango',
}

c = sqlite3.connect('file:/app/data/demand_intel.db?mode=ro', uri=True)
c.row_factory = sqlite3.Row

# Latest aggregate per brand+category, threshold sold_30d >= 3
rows = c.execute('''
    SELECT brand, category, 
        AVG(sold_30d) as sold_30d_avg, AVG(avg_price_eur) as avg_price_eur,
        AVG(median_price_eur) as median_price_eur, AVG(min_price_eur) as min_price_eur,
        AVG(max_price_eur) as max_price_eur, AVG(avg_days_to_sell) as avg_days_to_sell,
        AVG(sell_through_rate) as sell_through_rate, AVG(active_listings) as active_listings,
        MAX(updated_at) as updated_at
    FROM market_stats WHERE sold_30d >= ${ALLOWED === null ? 3 : 0}
    GROUP BY brand, category
    ORDER BY sold_30d_avg DESC
''').fetchall()

# CNT: de-duplicated, F1-valid departures per brand x category (30 days).
# One departure per external_id; departure_shelf_match IS NOT 0 drops departures
# whose item brand differs from the shelf keyword that ended them (NULL = unjudged, kept).
dd = {}
for r in c.execute('''
    SELECT brand, category, COUNT(DISTINCT external_id) AS n,
           AVG(item_price) AS ap
    FROM (SELECT brand, category, external_id,
                 MAX(CASE WHEN price_eur > 0 THEN price_eur END) AS item_price
          FROM listings
          WHERE sold_observed = 1 AND sold_at >= datetime('now', '-30 days')
            AND platform LIKE 'vinted_%' AND COALESCE(is_deleted, 0) = 0
            AND departure_shelf_match IS NOT 0 AND brand IS NOT NULL
          GROUP BY brand, category, external_id)
    GROUP BY brand, category
'''):
    dd[(r['brand'], r['category'])] = (r['n'], r['ap'])

if ALLOWED is not None:
    allowed = set(tuple(x) for x in ALLOWED)
    rows = [r for r in rows if (r['brand'], r['category']) in allowed]
    have = set((r['brand'], r['category']) for r in rows)
    stub = ['avg_price_eur', 'median_price_eur', 'min_price_eur', 'max_price_eur',
            'avg_days_to_sell', 'sell_through_rate', 'active_listings', 'updated_at']
    for (b, cat) in sorted(allowed - have):  # frozen page set: never drop a URL
        pv = PREV.get(b + '||' + cat, {})  # no live market_stats row: keep last published figures
        rows.append({'brand': b, 'category': cat, **{k: None for k in stub},
                     'avg_price_eur': pv.get('avg_price_eur'), 'median_price_eur': pv.get('median_price_eur'),
                     'avg_days_to_sell': pv.get('avg_days_to_sell'), 'active_listings': pv.get('active_listings')})
else:
    rows = [r for r in rows if dd.get((r['brand'], r['category']), (0, 0))[0] >= 3]
rows = [dict(r) if not isinstance(r, dict) else r for r in rows]
for r in rows:
    n, ap = dd.get((r['brand'], r['category']), (0, None))
    r['sold_30d_avg'] = n
    if ap: r['avg_price_eur'] = ap
rows.sort(key=lambda r: -r['sold_30d_avg'])

# demand_index for signals
di_rows = c.execute('SELECT brand, category, signal, confidence, investment_score FROM demand_index').fetchall()
di_map = {(r['brand'], r['category']): dict(r) for r in di_rows}

from collections import defaultdict
by_brand = defaultdict(list)
for r in rows:
    by_brand[r['brand']].append(dict(r))

brands_data = []
for brand, pairs in sorted(by_brand.items(), key=lambda x: -sum(p['sold_30d_avg'] for p in x[1])):
    slug = EXISTING_SLUGS.get(brand, make_slug(brand))
    pairs_sorted = sorted(pairs, key=lambda x: -x['sold_30d_avg'])
    total_sold = sum(p['sold_30d_avg'] for p in pairs_sorted)
    avg_price = sum(p['avg_price_eur'] * p['sold_30d_avg'] for p in pairs_sorted if p['avg_price_eur']) / max(sum(p['sold_30d_avg'] for p in pairs_sorted if p['avg_price_eur']), 1)
    
    categories = []
    for p in pairs_sorted:
        key = (brand, p['category'])
        di = di_map.get(key, {})
        buy_below = round(p['avg_price_eur'] * 0.70, 2) if p['avg_price_eur'] else None
        categories.append({
            'category': p['category'], 'slug': make_slug(p['category']),
            'sold_30d': round(p['sold_30d_avg']),
            'avg_price_eur': round(p['avg_price_eur'], 0) if p['avg_price_eur'] else None,
            'median_price_eur': round(p['median_price_eur'], 0) if p.get('median_price_eur') else None,
            'buy_below': buy_below,
            'avg_days_to_sell': round(p['avg_days_to_sell'], 1) if p.get('avg_days_to_sell') else None,
            'active_listings': round(p['active_listings']) if p.get('active_listings') else None,
            'signal': di.get('signal'), 'confidence': di.get('confidence'),
        })
    
    top_cats = sorted(categories, key=lambda x: -x['sold_30d'])[:3]
    brands_data.append({
        'brand': brand, 'slug': slug, 'sold_30d': round(total_sold),
        'avg_price_eur': round(avg_price, 0),
        'top_categories': [c['category'] for c in top_cats], 'categories': categories,
    })

from datetime import date
result = {
    'generated_at': date.today().isoformat(),
    'source': 'listings: distinct external_id departures (Vinted DE/FR/ES/IT/PT), prices/signals from market_stats',
    'formula': 'buy_below = avg_price_eur * 0.70 (30% gross margin; no fee factor, Vinted charges private sellers no selling fee - same as engine/insight.buy_below_from_avg)',
    'threshold': 'sold_30d >= 3 (30-day departures)',
    'total_pairs': sum(len(b['categories']) for b in brands_data),
    'total_brands': len(brands_data),
    'brands': brands_data,
}
sys.stdout.write(json.dumps(result, ensure_ascii=False))
`.trim()

try {
  console.log("Getting container name...")
  const container = execSync(`ssh resaleiq "docker ps --format '{{.Names}}' | grep ph5cl"`, { encoding: "utf8" }).trim()
  console.log(`Container: ${container}`)

  // Pipe the script over stdin: read-only, nothing is copied into the container.
  console.log("Running DB query (this may take a moment)...")
  const output = execSync(`ssh resaleiq "docker exec -i ${container} python3 -"`, { input: PY, encoding: "utf8", timeout: 120000, maxBuffer: 64 * 1024 * 1024 })

  const data = JSON.parse(output)
  console.log(`Got ${data.total_brands} brands, ${data.total_pairs} pairs`)
  
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), "utf8")
  console.log(`Written to ${OUT_PATH}`)
  console.log("Done! Commit src/data/buy-data.json to deploy.")
} catch (err) {
  console.error("Error:", err.message)
  process.exit(1)
}
