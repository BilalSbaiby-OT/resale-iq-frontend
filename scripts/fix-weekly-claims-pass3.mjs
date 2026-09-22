#!/usr/bin/env node
/**
 * fix-weekly-claims-pass3.mjs — final cleanup of remaining weekly framing
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DATA_DIR = 'src/data'
let changed = 0

for (const fname of readdirSync(DATA_DIR).filter(f => f.endsWith('.ts')).sort()) {
  const fpath = join(DATA_DIR, fname)
  let text = readFileSync(fpath, 'utf8')
  const orig = text

  // "drive the N weekly EU Vinted departures" → 30 days
  text = text.replace(/drive the (\d+) weekly EU Vinted departures/gi,
    'drive the $1 EU Vinted departures in the last 30 days')

  // "N weekly EU Vinted departures"
  text = text.replace(/(\d+) weekly EU Vinted departures/gi,
    '$1 EU Vinted departures in the last 30 days')

  // "weekly EU Vinted departures" (without number)
  text = text.replace(/\bweekly EU Vinted departures\b/gi,
    'EU Vinted departures in the last 30 days')

  // "the N weekly departures" (singular or plural)
  text = text.replace(/the (\d+) weekly departures\b/gi,
    'the $1 departures in the last 30 days')

  // "N weekly departures" (standalone)
  text = text.replace(/\b(\d+) weekly departures\b/gi,
    '$1 departures in the last 30 days')

  // "total observed weekly [hoodie/shirt/etc] revenue on EU Vinted"
  text = text.replace(/total observed weekly ([\w-]+ ?[\w-]+) revenue on EU Vinted/gi,
    'total observed $1 revenue on EU Vinted in the last 30 days')

  // Specific: "in the week to X" adjacent to "in the last 30 days" (inconsistent framing)  
  // Keep the 30-day framing but note the observation date
  text = text.replace(/in the last 30 days across EU Vinted in the week to (\d{1,2} \w+ \d{4})/gi,
    'in the last 30 days (observation window to 22 September 2026) across EU Vinted')

  // "second overall by weekly departures at N departures in the last 30 days"
  text = text.replace(/by weekly departures at (\d[\d,]*) departures in the last 30 days/gi,
    'by 30-day departures at $1 departures in the last 30 days')

  // "Patagonia brand is #2 by weekly departures at N departures"
  text = text.replace(/brand is #(\d) by weekly departures at (\d[\d,]*) departures in the last 30 days/gi,
    'brand ranks #$1 by 30-day departures at $2 departures in the last 30 days')

  if (text !== orig) {
    writeFileSync(fpath, text)
    changed++
    console.log(`✓ ${fname}`)
  }
}

console.log(`\nPass 3: ${changed} files changed`)
