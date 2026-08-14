#!/usr/bin/env node
/**
 * Fails the build if the dataset size is written as a literal anywhere.
 *
 * WHY THIS EXISTS
 * The figure has now gone stale twice. First as "500,000+" in 35 places, which
 * understated the real number by ~45% by the time anyone checked. src/lib/stats.ts
 * was written to end that — and it did, for the pages that were migrated. But 34
 * copies of "900,000+" survived in files nobody thought of as "the number": the
 * root layout's meta description, the Organization JSON-LD, static blog and
 * tool prose, the OG image, llms.txt. On 2026-08-14 the live count was 966,236
 * and every one of those was still telling Google, answer engines and customers
 * 900,000 — drifting further every scrape.
 *
 * A convention that has failed twice is not a convention, it is a hope. This is
 * the check that makes it a rule.
 *
 * Server components must call listingsTrackedLabel(); static data modules write
 * the TRACKED sentinel and their render sites pass it through fillTracked();
 * client components use the fetch-on-mount hook. Two literals are allowed and
 * enumerated below: the API-unreachable fallbacks, which are floors and so can
 * only ever understate.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const SRC = join(ROOT, "src")

// A number of 6+ digits with thousands separators, followed by a "+" or the
// word "listings"/"items"/"sales" — i.e. a dataset-size claim, not a price,
// a timeout or a year.
const CLAIM = /\b\d{3},\d{3}\+|\b\d{1,2}(\.\d+)?M\+?\s*(unique\s+)?(listings|items|sales)/gi

/** Fallbacks that are floors: they can understate, never overstate. */
const ALLOWED = new Set([
  "src/lib/stats.ts",
  "src/components/layout/paywall.tsx",
])

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return walk(p)
    return /\.(ts|tsx)$/.test(p) ? [p] : []
  })
}

const offences = []
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file)
  if (ALLOWED.has(rel)) continue
  const lines = readFileSync(file, "utf8").split("\n")
  lines.forEach((line, i) => {
    const code = line.trim()
    // Comments explain the rule and must be free to quote the old values.
    if (code.startsWith("//") || code.startsWith("*") || code.startsWith("/*")) return
    const hits = line.match(CLAIM)
    if (hits) offences.push(`${rel}:${i + 1}  ${hits[0]}  |  ${code.slice(0, 90)}`)
  })
}

if (offences.length) {
  console.error(`\n✗ hardcoded dataset figure in ${offences.length} place(s):\n`)
  offences.forEach(o => console.error("   " + o))
  console.error(`
   The number moves. A literal does not.

   server component  ->  const tracked = await listingsTrackedLabel()
   static data file  ->  \${TRACKED}, then fillTracked(data, tracked) at render
   client component  ->  the fetch-on-mount hook, as in paywall.tsx
`)
  process.exit(1)
}

/**
 * --built: the other half of the trade.
 *
 * Replacing literals with a sentinel removes the staleness but creates a new
 * way to be wrong — shipping the raw "{{TRACKED}}" to a reader. That is exactly
 * what happened to llms.txt on the first build: its INTENT titles were rendered
 * without fillTracked, so the file whose entire audience is machines that quote
 * it verbatim went out advertising "{{TRACKED}} Listings".
 *
 * Source-clean is not the same as output-clean, so this scans what is actually
 * emitted. JS chunks and sourcemaps legitimately contain the sentinel — it is a
 * string constant in the module — so only rendered artefacts are checked.
 */
if (process.argv.includes("--built")) {
  const OUT = join(ROOT, ".next", "server", "app")
  const RENDERED = /\.(html|body|rsc|txt|json)$/
  let scanned = 0
  const leaks = []
  const walkOut = dir => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) { walkOut(p); continue }
      if (!RENDERED.test(p)) continue
      scanned++
      const body = readFileSync(p, "utf8")
      if (body.includes("{{TRACKED}}")) leaks.push(relative(ROOT, p) + "  (raw sentinel)")
      // An un-evaluated ${...} means an interpolation was written into an
      // ordinary quoted string instead of a template literal. /support shipped
      // "... — ${tracked} items, recomputed hourly" exactly this way: it type-
      // checks, it builds, and it renders the source text to the customer.
      // Only plain-text outputs are scanned; .rsc and .json embed JS payloads
      // where a ${...} is legitimate.
      if (/\.(html|body|txt)$/.test(p)) {
        const m = body.match(/\$\{[a-zA-Z_$][\w$.]*\}/)
        if (m) leaks.push(`${relative(ROOT, p)}  (un-evaluated ${m[0]})`)
      }
    }
  }
  try { walkOut(OUT) } catch {
    console.error("✗ no build output at .next/server/app — run `next build` first")
    process.exit(1)
  }
  if (leaks.length) {
    console.error(`\n✗ unresolved placeholder shipped in ${leaks.length} rendered file(s):\n`)
    leaks.forEach(l => console.error("   " + l))
    console.error(`
   raw sentinel      -> a render site reads a data module without fillTracked()
   un-evaluated \${} -> an interpolation sits in a quoted string; use a template literal
`)
    process.exit(1)
  }
  console.log(`✓ ${scanned} rendered artefact(s) clean — no sentinel reached the output`)
}

console.log("✓ no hardcoded dataset figures — every claim reads the live count")
