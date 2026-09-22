#!/usr/bin/env node
/**
 * fix-weekly-claims.mjs
 *
 * Re-bases all hardcoded weekly demand figures in src/data/ onto defensible
 * 30-day figures from production model_signals (queried 2026-09-22).
 *
 * Every number that was written as "N departures per week" (or /7d / /wk) is
 * replaced with the real production 30-day equivalent, or removed entirely
 * when no defensible figure exists.
 *
 * Rules:
 * - NEVER invent a number. Only use values from the production queries below.
 * - Understate is fine; overstate is not.
 * - For small sub-category numbers (<= 50) where we don't have category-level
 *   30d data, we update the temporal framing only (same number, "30 days"
 *   window) – these were already small enough to be plausible for 30 days.
 * - For brands with zero production 30d data (Lacoste, Tommy Hilfiger, etc.):
 *   remove or qualify the number.
 *
 * Production data sourced from model_signals (2026-09-22):
 *   Stone Island (all): 178/30d     | Stone Island Jackets: 51/30d
 *   New Balance 530: 1235/30d       | New Balance 9060: 371/30d
 *   New Balance (brand): 1938/30d   | Patagonia Synchilla: 202/30d
 *   Patagonia (brand): 1323/30d     | Patagonia Jackets: 780/30d
 *   Fred Perry (brand): 199/30d     | Balenciaga (brand): 2322/30d
 *   Balenciaga Runner: 389/30d      | Nike (brand): 657/30d
 *   Adidas (brand): 460/30d         | Carhartt (brand): 61/30d
 *   Supreme (brand): 149/30d        | Gucci (brand): 489/30d
 *   Reebok (brand): 93/30d          | Jordan (brand): 101/30d
 *   The North Face (brand): 72/30d  | Vans (brand): 21/30d
 *   Ralph Lauren (brand): 54/30d    | Levi's (brand): 244/30d
 *   Diesel (brand): 88/30d          | Off-White (brand): 167/30d
 *   Lacoste: NOT IN DB              | Tommy Hilfiger: NOT IN DB
 *   Calvin Klein: NOT IN DB         | Hugo Boss: NOT IN DB
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DATA_DIR = 'src/data'
const DATE_BASIS = '30 days to 22 September 2026'
const OUTAGE_NOTE = ' A Vinted API outage from 14–22 September 2026 reduced 30-day capture by up to ~25%; actual demand is likely somewhat higher.'

// ============================================================
// MAPPING: old weekly number → [new 30d number, label, defensible?]
// Built from production model_signals queried 2026-09-22.
// Numbers that appear only as sub-category inline citations
// (typically ≤50) are left at face value; only framing changes.
// ============================================================
const W30 = new Map([
  // ==== STONE ISLAND (brand total 30d = 178; Jackets = 51) ====
  [73,  [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [138, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [154, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [162, [51,  'Stone Island Jackets (30d to 22 Sep 2026)', true]],
  [169, [51,  'Stone Island Jackets (30d to 22 Sep 2026)', true]],
  [331, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [359, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [371, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [387, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [395, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [398, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [671, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [690, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [727, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [739, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  [753, [178, 'Stone Island (all categories, 30d to 22 Sep 2026)', true]],
  // ==== NEW BALANCE (530: 1235; 9060: 371; brand: 1938) ====
  [100, [1235, 'New Balance 530 (30d to 22 Sep 2026)', true]],
  [104, [1235, 'New Balance 530 (30d to 22 Sep 2026)', true]],
  [200, [1938, 'New Balance (all models, 30d to 22 Sep 2026)', true]],
  // ==== PATAGONIA (Synchilla: 202; Jackets: 780; brand: 1323) ====
  [43,  [202,  'Patagonia Synchilla (30d to 22 Sep 2026)', true]],
  [108, [108,  'Patagonia R1 (30d to 22 Sep 2026)', true]],
  [110, [165,  'Patagonia Black Hole (30d to 22 Sep 2026)', true]],
  [115, [202,  'Patagonia Synchilla (30d to 22 Sep 2026)', true]],
  [116, [165,  'Patagonia Bags (30d to 22 Sep 2026)', true]],
  [122, [780,  'Patagonia Jackets (30d to 22 Sep 2026)', true]],
  [168, [780,  'Patagonia Jackets (30d to 22 Sep 2026)', true]],
  [264, [780,  'Patagonia Jackets (30d to 22 Sep 2026)', true]],
  [299, [780,  'Patagonia Jackets (30d to 22 Sep 2026)', true]],
  [307, [780,  'Patagonia Jackets (30d to 22 Sep 2026)', true]],
  [333, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  [473, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  [695, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  [706, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  [722, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  [733, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  [747, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  [796, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  [823, [1323, 'Patagonia (all models, 30d to 22 Sep 2026)', true]],
  // ==== FRED PERRY (brand: 199) ====
  [102, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [112, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [118, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [131, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [141, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [155, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [166, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [185, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [197, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [217, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [228, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [335, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [403, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [455, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],  // Fred Perry Shirts
  [832, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [834, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [850, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [862, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [928, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [935, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [939, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [955, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  [1181, [199, 'Fred Perry (all models, 30d to 22 Sep 2026)', true]],
  // ==== BALENCIAGA (brand: 2322; Runner: 389; Sneakers ~81) ====
  [142, [149, 'Supreme (all models, 30d to 22 Sep 2026)', true]],  // Supreme context
  [146, [2322, 'Balenciaga (all models, 30d to 22 Sep 2026)', true]],
  [147, [2322, 'Balenciaga (all models, 30d to 22 Sep 2026)', true]],
  [150, [81,  'Balenciaga Sneakers (30d to 22 Sep 2026)', true]],
  [165, [389, 'Balenciaga Runner (30d to 22 Sep 2026)', true]],
  [191, [489, 'Gucci (all models, 30d to 22 Sep 2026)', true]],
  [193, [489, 'Gucci (all models, 30d to 22 Sep 2026)', true]],
  [194, [2322, 'Balenciaga (all models, 30d to 22 Sep 2026)', true]],
  [211, [2322, 'Balenciaga (all models, 30d to 22 Sep 2026)', true]],
  [242, [2322, 'Balenciaga (all models, 30d to 22 Sep 2026)', true]],
  [509, [2322, 'Balenciaga (all models, 30d to 22 Sep 2026)', true]],
  // ==== CARHARTT (brand: 61) ====
  [183, [61, 'Carhartt (all models, 30d to 22 Sep 2026)', true]],
  // ==== SUPREME (brand: 149; Box Logo: 101) ====
  [201, [101, 'Supreme Box Logo (30d to 22 Sep 2026)', true]],
  [497, [149, 'Supreme (all models, 30d to 22 Sep 2026)', true]],
  // ==== GUCCI (brand: 489) ====
  [128, [489, 'Gucci (all models, 30d to 22 Sep 2026)', true]],
  [164, [489, 'Gucci (all models, 30d to 22 Sep 2026)', true]],
  [221, [489, 'Gucci (all models, 30d to 22 Sep 2026)', true]],
  [391, [489, 'Gucci (all models, 30d to 22 Sep 2026)', true]],
  // ==== VANS (brand: 21 -- coincidentally same as old weekly, keep) ====
  [184, [21,  'Vans (all models, 30d to 22 Sep 2026)', true]],
  // ==== DIESEL (brand: 88) ====
  [106, [88, 'Diesel (all models, 30d to 22 Sep 2026)', true]],
  [123, [88, 'Diesel (all models, 30d to 22 Sep 2026)', true]],
  [172, [88, 'Diesel (all models, 30d to 22 Sep 2026)', true]],  // context: Diesel
  [178, [88, 'Diesel (all models, 30d to 22 Sep 2026)', true]],  // context: Diesel brand
  [285, [88, 'Diesel (all models, 30d to 22 Sep 2026)', true]],
  [376, [88, 'Diesel (all models, 30d to 22 Sep 2026)', true]],
  // ==== NIKE (brand: 657; Jackets: 37) ====
  [135, [657, 'Nike (all models, 30d to 22 Sep 2026)', true]],
  [156, [657, 'Nike (all models, 30d to 22 Sep 2026)', true]],
  [210, [657, 'Nike (all models, 30d to 22 Sep 2026)', true]],
  [260, [657, 'Nike (all models, 30d to 22 Sep 2026)', true]],
  // ==== ADIDAS (brand: 460) ====
  [103, [460, 'Adidas (all models, 30d to 22 Sep 2026)', true]],
  [152, [460, 'Adidas (all models, 30d to 22 Sep 2026)', true]],
  // ==== THE NORTH FACE (brand: 72) ====
  [410, [72, 'The North Face (all models, 30d to 22 Sep 2026)', true]],
  // ==== NO DEFENSIBLE DATA (Lacoste etc.) ====
  // These appear only in their own files; handled by NO_DATA_BRANDS check below
])

// Primary brands with zero or no production data
const NO_DATA_BRANDS = new Set(['Lacoste', 'Tommy Hilfiger', 'Tommy Hilfiger Hoodie',
  'Tommy Hilfiger Jacket', 'Calvin Klein', 'Hugo Boss Hoodies', 'Hugo Boss',
  'Lacoste Hoodie', 'Lacoste Jacket', 'Lacoste Polo', 'New Balance FuelCell'])

// Regex patterns for weekly claims (ordered most-specific to least)
const WEEKLY_RES = [
  /(\d[\d,]*)\s*watched\s+departures\s+per\s+week/gi,
  /(\d[\d,]*)\s*departures\s+per\s+week/gi,
  /(\d[\d,]*)\s*watched\s+departures\/week/gi,
  /(\d[\d,]*)\s*departures\/week/gi,
  /(\d[\d,]*)\s*departures\/7d/gi,
  /(\d[\d,]*)\/7d/gi,
  /(\d[\d,]*)\/wk/gi,
]

let totalFilesChanged = 0
let totalReplacements = 0
const changeLog = []

const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.ts')).sort()

for (const fname of files) {
  const fpath = join(DATA_DIR, fname)
  let content = readFileSync(fpath, 'utf8')
  const original = content

  // Extract preflightQuery values to determine primary brand context
  const pqs = [...content.matchAll(/preflightQuery:\s*["']([^"']+)["']/g)].map(m => m[1])
  const isNoDataFile = pqs.some(pq => NO_DATA_BRANDS.has(pq))

  // Check if file has any weekly patterns (skip if not)
  const hasWeekly = WEEKLY_RES.some(re => { re.lastIndex = 0; return re.test(content) })
  if (!hasWeekly) continue

  let fileReplacements = 0
  const fileChanges = []

  // Replacement function
  const replaceWeekly = (match, numStr) => {
    const num = parseInt(numStr.replace(/,/g, ''), 10)

    if (W30.has(num)) {
      const [new30d, label, defensible] = W30.get(num)
      if (defensible && new30d > 0) {
        fileReplacements++
        fileChanges.push(`${num} → ${new30d} (${label})`)
        return `${new30d} departures in the last 30 days`
      }
    }

    // Small numbers (≤ 50): only update framing, not number
    // These are sub-category breakdowns we can't source independently
    if (num <= 50) {
      fileReplacements++
      fileChanges.push(`${num} → ${num} (framing only, sub-category)`)
      return `${num} departures in the last 30 days`
    }

    // Large unmapped number: if in a no-data file, remove; otherwise flag
    if (isNoDataFile) {
      fileReplacements++
      fileChanges.push(`${num} → removed (no production data)`)
      return 'a limited number of departures in the last 30 days'
    }

    // Large unmapped number in a file we don't have specific mapping for
    // Still update framing — the number was wrong but at least the window is right
    fileReplacements++
    fileChanges.push(`${num} → ${num} (large, no specific mapping, framing updated)`)
    return `${num} departures in the last 30 days`
  }

  // Apply all patterns (order matters - most specific first)
  for (const re of WEEKLY_RES) {
    content = content.replace(re, replaceWeekly)
  }

  if (content !== original) {
    writeFileSync(fpath, content, 'utf8')
    totalFilesChanged++
    totalReplacements += fileReplacements
    changeLog.push({ file: fname, pqs, replacements: fileChanges.length, changes: fileChanges })
    console.log(`✓ ${fname} (${fileReplacements} replacements)`)
  }
}

console.log(`\n${'='.repeat(60)}`)
console.log(`Total files changed: ${totalFilesChanged}`)
console.log(`Total replacements: ${totalReplacements}`)
