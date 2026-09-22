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
 */

import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_PATH = path.join(__dirname, "../src/data/buy-data.json")

// Python script to run inside the container
const PY = `
import sqlite3, json, sys, re

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
    FROM market_stats WHERE sold_30d >= 3
    GROUP BY brand, category
    ORDER BY sold_30d_avg DESC
''').fetchall()

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
        buy_below = round(p['avg_price_eur'] * 0.665, 2) if p['avg_price_eur'] else None
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
    'source': 'market_stats (Vinted DE/FR/ES/IT/PT)',
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

  // Write the script to a temp file on the server
  const escaped = PY.replace(/'/g, "'\\''")
  const cmd = `ssh resaleiq "echo '${escaped}' > /tmp/riq_buy_refresh.py && docker cp /tmp/riq_buy_refresh.py ${container}:/tmp/riq_buy_refresh.py && docker exec ${container} python3 /tmp/riq_buy_refresh.py"`
  
  console.log("Running DB query (this may take a moment)...")
  const output = execSync(cmd, { encoding: "utf8", timeout: 60000 })
  
  const data = JSON.parse(output)
  console.log(`Got ${data.total_brands} brands, ${data.total_pairs} pairs`)
  
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), "utf8")
  console.log(`Written to ${OUT_PATH}`)
  console.log("Done! Commit src/data/buy-data.json to deploy.")
} catch (err) {
  console.error("Error:", err.message)
  process.exit(1)
}
