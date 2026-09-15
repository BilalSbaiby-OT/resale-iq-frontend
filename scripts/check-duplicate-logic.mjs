#!/usr/bin/env node
/**
 * DUPLICATE LOGIC — the same rule implemented in two places.
 *
 *   node scripts/check-duplicate-logic.mjs          # this repo
 *   node scripts/check-duplicate-logic.mjs --all    # also ../demand-intel
 *
 * Exits 1 when two files contain the same normalised block of logic.
 *
 * WHY THIS EXISTS
 *
 * On 2026-09-01 the same failure shape cost us three separate times in one day,
 * and each time the fix FELT complete:
 *
 *   - The credential scrubber lived in `build_dashboard.py`. `org.py` writes a
 *     second dashboard file and had the same hole. Fixing one froze the
 *     frontend for 9 commits; fixing it again froze it for 2 more.
 *   - `capture_demo2..5.mjs` were four 82-line copies of `capture_demo.mjs`
 *     differing by ONE hardcoded line.
 *   - `detectLocale()` in `lib/i18n.ts` and `acceptLanguageLocale()` in
 *     `proxy.ts` both walked Accept-Language and both forgot English. I fixed
 *     the first, announced it as done, and only found the second by testing the
 *     deployed result — an English visitor was still being sent to Spanish.
 *
 * **A fix that lives in one of two copies is not a fix. It is a coincidence
 * that holds until someone runs the other path.** And you cannot see it by
 * reading the file you are editing, which is precisely why it needs a machine.
 *
 * This does NOT try to be clever. It finds blocks that are literally the same
 * after normalisation. That is the case that bit us every time — not subtle
 * semantic clones. A checker that guesses produces noise, and a noisy check
 * gets disabled, which is worse than no check.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { walkFiles } from "./lib/walk.mjs"

const ROOT = process.cwd()
const MIN_LINES = 8          // shorter blocks collide innocently (imports, guards)
const EXT = /\.(ts|tsx|mjs|js|py)$/

// Blocks that are SUPPOSED to be identical. Each entry needs a reason, because
// an allow-list with no reasons becomes the place where real duplicates hide.
const ALLOW = [
  // The generateMetadata({params}: {params: Promise<{locale:string}>}) shape
  // + `if (!isPathLocale(locale)) ...` guard repeats verbatim across every
  // src/app/[locale]/<root>/page.tsx route (methodology, register, support,
  // ...) because Next.js's App Router requires that exact function signature
  // per route file -- there is no shared function to extract it into, the
  // framework's file-based routing IS the extraction point. The one piece
  // that WAS real shared logic (building the locale param list) is already
  // pulled out as localeStaticParams() in locale-routes.ts; this allows only
  // the remaining framework-mandated boilerplate, not a business rule that
  // could silently drift the way detectLocale()/acceptLanguageLocale() did.
  "params: Promise<{ locale: string }>\n}): Promise<Metadata> {",
  // The /data catalogue muted link appears in both verdict-content.tsx
  // (UNKNOWN branch) and free-checker.tsx (UNKNOWN/LIMIT_REACHED branches).
  // Extracting as a shared component requires threading locale+canonicalPath --
  // more code than the dupe. UI micro-copy, no business logic, no drift risk.
  // Added after CRO-UNKNOWN landed in both files 2026-09-15 (Elon).
  "<div style={{ marginTop: 10 }}>",
]


/** Strip comments, blank lines and indentation — compare logic, not layout. */
function normalise(line) {
  return line
    .replace(/\/\/.*$/, "")
    .replace(/#.*$/, "")
    .trim()
}

/**
 * Sliding windows of MIN_LINES normalised non-empty lines, hashed by content.
 * A window rather than whole functions: the locale bug was a shared LOOP inside
 * two differently-named functions, and a function-level comparison would have
 * missed it entirely.
 */
function blocks(file) {
  const lines = readFileSync(file, "utf8").split("\n").map(normalise)
  const kept = []
  lines.forEach((l, i) => { if (l) kept.push({ text: l, line: i + 1 }) })
  const out = []
  for (let i = 0; i + MIN_LINES <= kept.length; i++) {
    const win = kept.slice(i, i + MIN_LINES)
    out.push({ key: win.map(w => w.text).join("\n"), line: win[0].line })
  }
  return out
}

const roots = [ROOT]
if (process.argv.includes("--all")) roots.push(join(ROOT, "..", "demand-intel"))

const seen = new Map()
for (const r of roots) {
  for (const f of walkFiles(r, EXT)) {
    for (const b of blocks(f)) {
      if (ALLOW.some(a => b.key.includes(a))) continue
      if (!seen.has(b.key)) seen.set(b.key, [])
      seen.get(b.key).push({ file: relative(ROOT, f), line: b.line })
    }
  }
}

// Report each duplicated block once, at its longest extent, in distinct files.
const hits = []
for (const [key, locs] of seen) {
  const files = [...new Set(locs.map(l => l.file))]
  if (files.length < 2) continue
  hits.push({ key, locs, files })
}

// Collapse overlapping windows: consecutive windows in the same file pair are
// one finding, not MIN_LINES findings.
const byPair = new Map()
for (const h of hits) {
  const pair = h.files.slice().sort().join(" | ")
  if (!byPair.has(pair)) byPair.set(pair, { pair, count: 0, sample: h })
  byPair.get(pair).count++
}

const findings = [...byPair.values()].sort((a, b) => b.count - a.count)

// BASELINE, not a blanket pass.
//
// This repo already had 8 duplicated pairs the day the check was written.
// Failing CI on all of them would have meant one of two things, and both are
// worse than the bug: someone deletes the check, or someone rushes eight
// refactors at midnight to make it green. So the existing pairs are recorded
// and the check fails only on NEW duplication.
//
// The baseline is a debt list, not an amnesty. It is committed, it is visible,
// and every entry is a place a future fix can land in one copy and miss the
// other. Shrink it; never grow it.
import { existsSync, writeFileSync } from "node:fs"
const BASELINE = join(ROOT, "scripts", "duplicate-logic-baseline.json")

if (process.argv.includes("--update-baseline")) {
  writeFileSync(BASELINE, JSON.stringify(findings.map(f => f.pair).sort(), null, 2) + "\n")
  console.log(`\nbaseline written: ${findings.length} known pair(s)\n`)
  process.exit(0)
}

const known = existsSync(BASELINE)
  ? new Set(JSON.parse(readFileSync(BASELINE, "utf8")))
  : new Set()
const fresh = findings.filter(f => !known.has(f.pair))

if (!findings.length) {
  console.log(`\n✓ no duplicated logic — ${roots.length} root(s), blocks of ${MIN_LINES}+ lines\n`)
  process.exit(0)
}

if (!fresh.length) {
  console.log(`\n✓ no NEW duplicated logic (${findings.length} known pair(s) in the baseline)\n`)
  console.log("  The baseline is debt, not permission. Each entry is a place where a")
  console.log("  future fix can land in one copy and silently miss the other.\n")
  process.exit(0)
}

console.log(`\n✗ NEW DUPLICATED LOGIC in ${fresh.length} file pair(s)\n`)
for (const f of fresh) {
  console.log(`  ${f.pair}`)
  console.log(`    ${f.count} overlapping block(s) of ${MIN_LINES}+ identical lines`)
  for (const l of f.sample.locs.slice(0, 4)) console.log(`      ${l.file}:${l.line}`)
  console.log(`      first line: ${f.sample.key.split("\n")[0].slice(0, 88)}`)
  console.log()
}
console.log("  Two copies of a rule means two places to be wrong, and fixing the one")
console.log("  you are looking at feels exactly like fixing the bug. Extract it, or add")
console.log("  it to ALLOW in this file WITH A REASON.\n")
process.exit(1)
