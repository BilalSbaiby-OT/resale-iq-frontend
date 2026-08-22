#!/usr/bin/env node
/**
 * Fails CI if the warehouse / last-good contract is silently undone.
 *
 * 1. last-good snapshot must refuse empty brand arrays (the /data=0 bug).
 * 2. market-numbers must be the only numeric warehouse — no ?? frozen JSON.
 * 3. Math.round(null) is 0 — that landmine must stay commented, not used.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const lastGood = readFileSync(join(ROOT, "src/lib/last-good-snapshot.ts"), "utf8")
const warehouse = readFileSync(join(ROOT, "src/lib/market-numbers.ts"), "utf8")

const offences = []

if (!lastGood.includes("brands!.length > 0") && !lastGood.includes("brands.length > 0")) {
  offences.push("last-good-snapshot.ts: isUsable no longer requires brands.length > 0")
}
if (!lastGood.includes("if (!isUsable(snap)) return")) {
  offences.push("last-good-snapshot.ts: writeLastGood must refuse unusable snapshots")
}
if (!warehouse.includes("isUsable(snap)")) {
  offences.push("market-numbers.ts: live fetch must go through isUsable")
}
if (!warehouse.includes("readLastGood")) {
  offences.push("market-numbers.ts: must fall back to last-good, not empty")
}
if (warehouse.includes("?? b.sold") || warehouse.includes("?? b.avg")) {
  offences.push("market-numbers.ts: frozen seo-brands.json fallback reintroduced")
}

const roundNull = warehouse.split("\n").filter(l => {
  const t = l.trim()
  if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return false
  return /Math\.round\(\s*null/.test(l)
})
if (roundNull.length) {
  offences.push(`market-numbers.ts: Math.round(null) — ${roundNull[0].trim()}`)
}

if (offences.length) {
  console.error("\n✗ warehouse contract broken:\n")
  offences.forEach(o => console.error("   " + o))
  process.exit(1)
}

console.log("✓ warehouse + last-good contract intact")
