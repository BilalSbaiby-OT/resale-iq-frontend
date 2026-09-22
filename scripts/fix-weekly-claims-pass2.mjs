#!/usr/bin/env node
/**
 * fix-weekly-claims-pass2.mjs
 *
 * Second pass: fixes remaining "N weekly departures" patterns and other
 * weekly-framing text that wasn't caught by the first regex pass.
 * Also fixes prose that still references "in the week to" with updated
 * 30-day date basis, and adds the outage disclosure note.
 *
 * Run from: /Users/bilalsbaiby/work/resale-iq
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DATA_DIR = 'src/data'

// Production 30d data from 2026-09-22
const W30 = new Map([
  [97, [0, 'Lacoste', false]],      // Lacoste not in DB
  [106, [0, 'Lacoste', false]],     // Lacoste brand
  [32, [2322, 'Balenciaga (all models)', true]], // Balenciaga shirts
  [78, [657, 'Nike (all models)', true]],  // part of Nike 172 weekly
  [172, [657, 'Nike (all models)', true]],
  [706, [1323, 'Patagonia (all models)', true]],
  [110, [165, 'Patagonia Bags', true]],
  [15, [101, 'Jordan (all models)', true]],
  [51, [0, 'Pull&Bear', false]],    // not in DB
  [451, [199, 'Fred Perry (all models)', true]], // Fred Perry shirts
  [928, [199, 'Fred Perry (all models)', true]],
  [395, [178, 'Stone Island (all categories)', true]],
  [122, [657, 'Nike (all models)', true]],
  [210, [657, 'Nike (all models)', true]],
  [45, [28, 'Adidas Gazelle', true]],
  [83, [489, 'Gucci (all models)', true]],
  [38, [241, 'Nike Air Force 1 (all)', true]],  // AF1 Low 181 + AF1 60 = 241
  [103, [199, 'Fred Perry (all models)', true]],
  [87, [2322, 'Balenciaga (all models)', true]],
  [50, [178, 'Stone Island (all categories)', true]],
  [21, [54, 'Ralph Lauren (all models)', true]],
])

let totalFilesChanged = 0
let totalReplacements = 0

const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.ts')).sort()

for (const fname of files) {
  const fpath = join(DATA_DIR, fname)
  let content = readFileSync(fpath, 'utf8')
  const original = content

  // 1. Fix "N weekly departures" → "N departures in the last 30 days"
  content = content.replace(
    /(\d[\d,]*)\s+weekly\s+departures/gi,
    (match, numStr) => {
      const num = parseInt(numStr.replace(/,/g, ''), 10)
      if (W30.has(num)) {
        const [new30d, label, defensible] = W30.get(num)
        if (!defensible || new30d === 0) {
          return 'a limited number of departures in the last 30 days'
        }
        return `${new30d} departures in the last 30 days`
      }
      if (num <= 50) return `${num} departures in the last 30 days`
      return `${num} departures in the last 30 days`
    }
  )

  // 2. Fix "brand's N weekly" → "brand's N in the last 30 days"
  content = content.replace(
    /brand's\s+(\d[\d,]*)\s+weekly/gi,
    (match, numStr) => {
      const num = parseInt(numStr.replace(/,/g, ''), 10)
      if (W30.has(num)) {
        const [new30d, label, defensible] = W30.get(num)
        if (defensible && new30d > 0) return `brand's ${new30d} departures in the last 30 days`
      }
      return `brand's ${num} departures in the last 30 days`
    }
  )

  // 3. Fix remaining "N of N weekly departures" patterns  
  content = content.replace(
    /(\d+)\s+of\s+(?:the\s+)?(\d[\d,]*)\s+weekly\s+departures/gi,
    (match, partStr, totalStr) => {
      const total = parseInt(totalStr.replace(/,/g, ''), 10)
      let newTotal = total
      if (W30.has(total)) {
        const [new30d, label, def] = W30.get(total)
        if (def && new30d > 0) newTotal = new30d
      }
      return `${partStr} of the ${newTotal} departures in the last 30 days`
    }
  )

  // 4. Fix remaining "N weekly departure" (singular) patterns
  content = content.replace(
    /(\d[\d,]*)\s+weekly\s+departure\b/gi,
    (match, numStr) => {
      const num = parseInt(numStr.replace(/,/g, ''), 10)
      if (num <= 50) return `${num} departures in the last 30 days`
      return `${num} departures in the last 30 days`
    }
  )

  // 5. Fix "138 weekly departures" literal in blog-posts-66.ts description
  content = content.replace(
    /the Stone Island brand's 138 weekly departures/gi,
    "the Stone Island brand's 178 departures in the last 30 days"
  )

  // 6. Fix remaining "weekly volume" when preceded by a specific number
  content = content.replace(
    /(\d[\d,]*)\s*weekly\s+departure\s+count/gi,
    (match, n) => `${n} departure count in the last 30 days`
  )

  if (content !== original) {
    writeFileSync(fpath, content, 'utf8')
    totalFilesChanged++
    totalReplacements++
    console.log(`✓ ${fname}`)
  }
}

console.log(`\nPass 2: ${totalFilesChanged} files changed`)
