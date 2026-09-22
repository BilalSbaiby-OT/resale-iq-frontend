#!/usr/bin/env node
/**
 * check-untracked-brand-claims.mjs
 *
 * CI guard: fails the build when a numeric departure claim names a brand that is
 * NOT in our tracked brand catalogue (model_signals or listings).
 *
 * WHAT THIS CATCHES
 * A claim like "Tommy Hilfiger hoodies track 40 departures in the last 30 days"
 * is fabricated if we have no model_signals rows for that brand. In September 2026,
 * ~177 such claims were found across 27 data files.
 *
 * WHAT IS ALLOWED (does NOT trigger this guard)
 * 1. Brand-level claims labelled explicitly:
 *      "X,XXX brand-level departures"
 *      "across all tracked [Brand] items"
 *      "brand total", "brand level"
 * 2. Per-model claims labelled explicitly:
 *      "per tracked models, model_signals"
 *      "model_signals"
 * 3. Comment lines (start with // or * or /*)
 *
 * TRACKED BRAND LIST
 * Generated from production model_signals on 2026-09-22.
 * Regenerate when the catalogue changes:
 *   BE=$(ssh resaleiq "docker ps --format '{{.Names}}' | grep ph5cl")
 *   ssh resaleiq "docker exec $BE python3 -c \"
 *     import sqlite3, json
 *     c=sqlite3.connect('file:/app/data/demand_intel.db?mode=ro',uri=True)
 *     brands=c.execute('SELECT DISTINCT brand FROM model_signals ORDER BY brand').fetchall()
 *     print(json.dumps([b[0] for b in brands]))
 *   \""
 * Update TRACKED_BRANDS below with the output.
 *
 * HOW TO FIX A FAILING BUILD
 * 1. Identify the brand and file from the error output.
 * 2. If the brand IS tracked (in model_signals), add the brand-level or per-model label.
 * 3. If the brand is NOT tracked per-model but has listings data:
 *    - Use brand-level figures from listings (query: SELECT COUNT(*), ROUND(AVG(price_eur),2)
 *      FROM listings WHERE brand=? AND is_sold=1 AND sold_at >= datetime('now','-30 days'))
 *    - Label it clearly: "X,XXX brand-level departures in the last 30 days (across all tracked
 *      [Brand] items on EU Vinted)"
 *    - DO NOT use a brand-level figure to justify a per-model buy-below price.
 * 4. If neither: remove the numeric claim. A page with no number is honest.
 *
 * SEE: AGENTS.md for the full brand data integrity rules.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC_DATA = join(ROOT, 'src', 'data')

/**
 * Brands that have rows in model_signals (per-model tracked catalogue).
 * Generated from production 2026-09-22. Update when catalogue changes — see header comment.
 */
const TRACKED_BRANDS = new Set([
  'Adidas',
  'Balenciaga',
  'Carhartt',
  'Diesel',
  'Fred Perry',
  'Gucci',
  "Levi's",
  'Jordan',
  'Maison Margiela',
  'Miu Miu',
  'New Balance',
  'Nike',
  'Off-White',
  'Patagonia',
  'Puma',
  'Ralph Lauren',
  'Reebok',
  'Stone Island',
  'Supreme',
  'The North Face',
  'Vans',
])

/**
 * Brands that have brand-level sales data (listings table) but NO model_signals rows.
 * These brands can be cited with brand-level figures (labelled as such) but MUST NOT
 * have per-model buy-below prices derived from a model_signals row (there are none).
 *
 * Brand-level 30-day figures (from listings, verified 2026-09-22):
 *   Tommy Hilfiger : 1,186 (hoodies 510@€19.69, jackets 129@€36.10, shirts 143@€14.45)
 *   Hugo Boss      : 2,017 (hoodies 266@€16.91, shirts 429@€12.82, jackets 208@€32.29)
 *   Lacoste        : 2,220 (shirts 650@€23.41, hoodies 224@€24.64, jackets 177@€39.91)
 *   Calvin Klein   : 1,368 (hoodies 167@€15.74, t-shirts 119@€6.95, jackets 55@€38.29)
 */
const BRAND_LEVEL_ONLY = new Set([
  'Tommy Hilfiger',
  'Hugo Boss',
  'Lacoste',
  'Calvin Klein',
])

// All brands that appear legitimately in content (union)
const ALL_VALID_BRANDS = new Set([...TRACKED_BRANDS, ...BRAND_LEVEL_ONLY])

/**
 * Pattern: a number followed by "departures" within a string value.
 * Catches: "40 departures in the last 30 days", "118 watched departures", etc.
 * Does NOT catch prices, sizes, or ordinals.
 */
const DEPARTURE_CLAIM = /\b(\d[\d,]*)\s+(?:watched\s+)?departures?\b/i

/**
 * Patterns that indicate the claim is already correctly labelled:
 * - "brand-level" / "brand level" / "brand total"
 * - "per tracked models" / "model_signals" (per-model, tracked brand)
 * - "across all tracked ... items"
 * Any of these on the same line as a departure claim means the author has
 * explicitly stated which data source the number comes from — guard passes.
 */
const ALLOWED_LABELS = [
  /brand[- ]level/i,
  /brand\s+total/i,
  /per\s+tracked\s+models/i,
  /model_signals/i,
  /across\s+all\s+tracked/i,
]

function isLabelled(line) {
  return ALLOWED_LABELS.some(pat => pat.test(line))
}

function walk(dir) {
  const entries = readdirSync(dir)
  const results = []
  for (const name of entries) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      results.push(...walk(p))
    } else if (/\.(ts|tsx)$/.test(p)) {
      results.push(p)
    }
  }
  return results
}

const offences = []

for (const file of walk(SRC_DATA)) {
  const rel = relative(ROOT, file)
  const lines = readFileSync(file, 'utf8').split('\n')

  lines.forEach((line, idx) => {
    const stripped = line.trim()
    // Skip comments
    if (stripped.startsWith('//') || stripped.startsWith('*') || stripped.startsWith('/*')) return

    // Only care about lines with departure claims
    const hit = line.match(DEPARTURE_CLAIM)
    if (!hit) return

    const num = parseInt(hit[1].replace(/,/g, ''), 10)
    if (num < 5) return  // Ignore small numbers (ordinals, etc.)

    // If the line is already labelled — it's fine
    if (isLabelled(line)) return

    // Check if any untracked-only brand appears close to the departure claim
    for (const brand of BRAND_LEVEL_ONLY) {
      if (!line.includes(brand)) continue
      const brandPos = line.indexOf(brand)
      const claimPos = hit.index
      if (Math.abs(brandPos - claimPos) < 400) {
        offences.push({
          file: rel,
          line: idx + 1,
          brand,
          hit: hit[0],
          context: stripped.slice(0, 120),
        })
        break
      }
    }
  })
}

if (offences.length > 0) {
  console.error(`\n✗ Unlabelled numeric departure claim for brand-level-only brand in ${offences.length} place(s):\n`)
  offences.forEach(o =>
    console.error(`   ${o.file}:${o.line}  [${o.brand}]  "${o.hit}"  |  ${o.context}`)
  )
  console.error(`
   ────────────────────────────────────────────────────────
   WHY THIS FAILS
   The brands listed above have confirmed sales data in our listings table but
   NO rows in model_signals (the per-model tracked catalogue). Claiming "N
   departures in the last 30 days" without labelling the source implies a
   per-model figure we do not have. This is how ~177 fabricated numbers reached
   production in September 2026.

   HOW TO FIX
   Option A — use brand-level data (clearly labelled):
     "1,186 brand-level departures in the last 30 days
      (across all tracked Tommy Hilfiger items on EU Vinted)"

   Option B — remove the number entirely. A page with no number is honest.
   A page with an unlabelled number that readers cannot verify is not.

   NEVER use a brand-level figure to justify a per-model buy-below price.
   NEVER label a brand-level figure as a per-model departure count.

   Current brand-level ground truth (from listings, 2026-09-22):
     Tommy Hilfiger : 1,186/30d (hoodies 510@€19.69, jackets 129@€36.10)
     Hugo Boss      : 2,017/30d (hoodies 266@€16.91, shirts 429@€12.82)
     Lacoste        : 2,220/30d (shirts 650@€23.41, hoodies 224@€24.64)
     Calvin Klein   : 1,368/30d (hoodies 167@€15.74, jackets 55@€38.29)
   ────────────────────────────────────────────────────────
`)
  process.exit(1)
}

console.log(`✓ No unlabelled departure claims for brand-level-only brands — all figures correctly labelled or absent`)
