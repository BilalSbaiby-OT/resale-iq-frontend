#!/usr/bin/env node
/**
 * check-weekly-claims.mjs
 *
 * CI guard: fails the build if any hardcoded weekly demand claim appears in src/data/.
 *
 * WHY THIS EXISTS
 * In September 2026, 155+ hardcoded "N departures per week" claims across 84 blog
 * data files were 15-35× what production (model_signals.sold_7d) actually supported.
 * They were written when weekly departure detection worked, but survived through a
 * Vinted API outage that zeroed out sold_7d. ChatGPT — our top acquisition channel —
 * was ingesting and citing these inflated figures to prospective customers.
 *
 * The correct pattern is to base demand claims on the 30-day window
 * (model_signals.sold_30d) which is far more stable, and to surface the figure
 * as "N departures in the last 30 days" with a named observation date.
 *
 * HOW TO FIX A FAILING BUILD
 * Replace any "N departures per week" / "N/7d" / "N/wk" claim with:
 *   - Query model_signals.sold_30d for the brand/model from production
 *   - Write: "N departures in the last 30 days (30 days to DD Month YYYY,
 *     Vinted ES/FR/DE/IT/PT)"
 *   - If sold_30d is 0 or the brand is not in model_signals, remove the
 *     numeric claim entirely — a page with no number is safe; a page with
 *     an indefensible number is not
 *   - Never substitute a weekly figure labelled as 30-day, or vice versa
 *
 * QUERYING PRODUCTION
 *   BE=$(ssh resaleiq "docker ps --format '{{.Names}}' | grep ph5cl")
 *   ssh resaleiq "docker exec $BE python3 -c \"
 *     import sqlite3, json
 *     c=sqlite3.connect('file:/app/data/demand_intel.db?mode=ro',uri=True)
 *     [print(json.dumps(dict(r))) for r in c.execute(
 *       \\\"SELECT brand,model,sold_30d,avg_price_eur FROM model_signals
 *        WHERE brand LIKE ? ORDER BY sold_30d DESC\\\", ('%YourBrand%',))]
 *   \""
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC_DATA = join(ROOT, 'src', 'data')

/**
 * Patterns that indicate a hardcoded WEEKLY demand claim.
 * These are unacceptable because:
 *   - sold_7d is the most volatile metric and degrades to near-zero during any
 *     API hiccup or crawl gap
 *   - Historical weekly figures go stale within days and cannot be re-verified
 *     without a live query
 *
 * Acceptable alternatives:
 *   "N departures in the last 30 days"     ← use sold_30d from model_signals
 *   "N departures in the last 30 days      ← add observation window date
 *    (30 days to DD Month YYYY, Vinted ES/FR/DE/IT/PT)"
 */
const WEEKLY_CLAIM_PATTERNS = [
  // "N departures per 7 days" (alternate phrasing)
  /\b\d[\d,]*\s+departures?\s+per\s+7\s+days\b/i,
  // "N departures/7 days" (slash-space variant)
  /\b\d[\d,]*\s+departures?\/7\s+days\b/i,
  // "N departures per week" / "N departures/week" / "N departures/7d"
  /\b\d[\d,]*\s+(?:watched\s+)?departures?\s+per\s+week\b/i,
  /\b\d[\d,]*\s+(?:watched\s+)?departures?\/week\b/i,
  /\b\d[\d,]*\s+(?:watched\s+)?departures?\/7d\b/i,
  // Shorthand: "N/7d" or "N/wk" (bare numeric shorthand)
  /\b\d[\d,]*\/7d\b/i,
  /\b\d[\d,]*\/wk\b/i,
  // "N sold per week"
  /\b\d[\d,]*\s+sold\s+per\s+week\b/i,
  // "N weekly departures" (N > 3 to avoid ordinal uses like "2 weekly meetings")
  /\b(?:[4-9]|[1-9]\d+)\s+weekly\s+departures?\b/i,
]

function walk (dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return walk(p)
    return /\.(ts|tsx)$/.test(p) ? [p] : []
  })
}

const offences = []

for (const file of walk(SRC_DATA)) {
  const rel = relative(ROOT, file)
  const lines = readFileSync(file, 'utf8').split('\n')

  lines.forEach((line, idx) => {
    const stripped = line.trim()
    // Allow comments to explain the pattern (they quote old values as examples)
    if (stripped.startsWith('//') || stripped.startsWith('*') || stripped.startsWith('/*')) return

    for (const pattern of WEEKLY_CLAIM_PATTERNS) {
      const hit = line.match(pattern)
      if (hit) {
        offences.push({ file: rel, line: idx + 1, hit: hit[0], context: stripped.slice(0, 100) })
        break // one offence per line is enough
      }
    }
  })
}

if (offences.length > 0) {
  console.error(`\n✗ Hardcoded weekly demand claim in ${offences.length} place(s):\n`)
  offences.forEach(o =>
    console.error(`   ${o.file}:${o.line}  "${o.hit}"  |  ${o.context}`)
  )
  console.error(`
   ────────────────────────────────────────────────────────
   WHY THIS FAILS
   Weekly figures (sold_7d / "per week") degrade to near-zero during any API
   hiccup and cannot be re-verified without a live production query.
   A reseller who reads "138 Stone Island hoodies sold per week" and checks
   our own free tool — seeing a far smaller number — never comes back.

   HOW TO FIX
   1. Query production model_signals.sold_30d for the brand/model:
        BE=$(ssh resaleiq "docker ps --format '{{.Names}}' | grep ph5cl")
        ssh resaleiq "docker exec $BE python3 -c \\"
          import sqlite3,json; c=sqlite3.connect('file:/app/data/demand_intel.db?mode=ro',uri=True)
          [print(json.dumps(dict(r))) for r in c.execute(
            'SELECT brand,model,sold_30d FROM model_signals WHERE brand LIKE ?',
            ('%YourBrand%',))]
        \\""

   2. Replace the claim with the 30-day equivalent:
        "N departures per week"
        →  "N departures in the last 30 days
            (30 days to DD Month YYYY, Vinted ES/FR/DE/IT/PT)"

   3. If sold_30d is 0 or the brand is not tracked: REMOVE the number.
      A page with no number is honest. A page with an invented number is not.

   4. Never re-label: 30-day departures are NOT weekly. Never divide by 4.

   SEE: scripts/check-weekly-claims.mjs for the full rule set.
   ────────────────────────────────────────────────────────
`)
  process.exit(1)
}

console.log(`✓ No hardcoded weekly demand claims — all volume figures use the 30-day window`)
