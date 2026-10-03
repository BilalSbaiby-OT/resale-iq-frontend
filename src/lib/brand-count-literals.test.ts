/**
 * No hard-coded brand counts in evergreen copy (founder decision 2026-10-02).
 *
 * WHY THIS EXISTS
 * "How many brands do we cover" was typed into 60+ strings and went 22 -> 26 ->
 * 28+ -> 61 in six weeks; on 2026-10-02 "22 tracked brands" (pricing FAQ), "26
 * brands" (API docs), "28+ brands" (home, pricing) and "32 brands ranked" (/flip)
 * were all live at once, next to a page that said 61. src/lib/stats.ts already
 * documents the cure for the listings figure (a sentinel filled at render) and
 * names a guard test that never existed. This is that guard for brands.
 *
 * THE RULE
 *   - coverage ("we track N brands"): write {{BRANDS}} in static copy and pass it
 *     through fillBrands(); in server code read market.brandsTracked. An unknown
 *     count drops the number from the sentence — it never falls back to a literal.
 *   - published ("N brands with published weekly data"): market.brandCount, only
 *     beside a departures figure.
 *   - A literal is allowed ONLY on a line that carries a date ("week to 14
 *     September 2026", "As of 20 September 2026", "2026-09-23"): that is a
 *     snapshot, true on that day, and says so.
 *
 * Reads source as text (like manual-aeo.test.ts) because the data modules import
 * "@/..." paths that plain `node --test` cannot resolve.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { BRANDS_TRACKED, fillBrands, ofTracked } from "./fill-brands.ts"
import { copy } from "./i18n.ts"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const SRC = join(ROOT, "src")

const NOUN = "(?:brands|marcas|marques|Marken|marchi|marche)"
const NUM = "\\d{2,3}\\+?"
// Words between the number and the noun: "26 clothing & sneaker brands", "26 marcas de ropa".
const MID = "(?:[\\p{L}&-]+\\s+){0,3}(?:[\\p{L}]+-)?"
// A count that asserts coverage: "28 tracked brands", "across 28 brands", "we track 22
// brands", "all 28 brands", "the 22 marques suivies", "11 of the tracked brands".
// "top 20 brands" / "top-15" are rankings, not coverage, and fit none of these shapes.
const CLAIMS: RegExp[] = [
  new RegExp(`\\b${NUM}\\s+(?:tracked|published|clothing|EU|Vinted|priced)\\s+(?:EU\\s+)?${NOUN}\\b`, "iu"),
  new RegExp(`\\b(?:across|all|of|for|the|our|unlock|see|view|browse|among|las|les|die|der|dei|le|dalle|das|nos|nuestras)\\s+(?:the\\s+)?${NUM}\\s+${NOUN}\\b`, "iu"),
  new RegExp(`\\b(?:track|tracks|tracked|cover|covers|watch|monitor|seguimos|suivons|erfassen|monitoriamo|acompanhamos|couvrons|cubrimos|copriamo|cobrimos)\\s+(?:the\\s+)?${NUM}\\s+${MID}${NOUN}\\b`, "iu"),
  new RegExp(`\\b${NUM}\\s+${NOUN}\\s+(?:we|Resale|tracked|ranked|que|suivies|erfasst|monitorati|acompanhadas)`, "iu"),
  // "11 of the tracked brands", "11 de las marcas monitorizadas", "11 der erfassten Marken", "11 dei brand monitorati".
  new RegExp(`\\b${NUM}\\s+(?:of the|de las|de los|des|der|dei|das)\\s+(?:[\\p{L}]+\\s+)?(?:${NOUN}|brand)\\b`, "iu"),
  // "28+ brands" in any shape.
  new RegExp(`\\b\\d{2,3}\\+\\s+${NOUN}\\b`, "iu"),
]

// Whole month names or standard abbreviations only. A loose "Mar[a-z]*" read "26 marques" /
// "26 marcas" as "26 March" and exempted exactly the strings this guard exists to catch.
const MONTH =
  "(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\\b\\.?"
const DATED = new RegExp(
  `\\b\\d{1,2}\\s+${MONTH}|\\b${MONTH}\\s+(?:20\\d\\d|\\d{1,2}\\b)|\\b20\\d\\d-\\d\\d-\\d\\d\\b|septiembre de 20\\d\\d|\\bweek to\\b`,
  "i",
)

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return walk(p)
    return /\.(ts|tsx)$/.test(p) && !/\.test\.ts$/.test(p) ? [p] : []
  })
}

function isComment(line: string): boolean {
  const t = line.trim()
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")
}

test("no hard-coded brand count outside a dated snapshot line", () => {
  const offences: string[] = []
  for (const file of walk(SRC)) {
    const rel = relative(ROOT, file)
    const lines = readFileSync(file, "utf8").split("\n")
    lines.forEach((line, i) => {
      // A sentence split across string-concatenation lines carries its date on the
      // line above ("As of 23 September 2026, ... " + "... across the 19 brands").
      const prevDated = i > 0 && !isComment(lines[i - 1]) && /\+\s*$/.test(lines[i - 1]) && DATED.test(lines[i - 1])
      if (isComment(line) || DATED.test(line) || prevDated) return
      const hit = CLAIMS.map((re) => line.match(re)).find(Boolean)
      if (hit) offences.push(`${rel}:${i + 1}  "${hit[0]}"`)
    })
  }
  assert.deepEqual(
    offences,
    [],
    `hard-coded brand count(s) — use {{BRANDS}} + fillBrands(), market.brandsTracked, or add the date to a snapshot line:\n  ${offences.join("\n  ")}`,
  )
})

test("the guard actually catches the strings that went stale", () => {
  const stale = [
    "We currently track 139 brand/model combinations across 21 brands.",
    "the 22 brands we track cover",
    "28+ brands, 5 EU markets",
    "demand signals for 26 brands.",
    "→ See the 28 brands we track",
    "completely outside our current 22 tracked brands",
    "Unlock 55 brands →",
    // Every locale of the unknown-brand copy said 26, and the methodology said 11.
    "We track 26 clothing & sneaker brands (ES/FR/DE/IT/PT) — not electronics or homeware.",
    "Nous couvrons 26 marques de vêtements et sneakers (ES/FR/DE/IT/PT)",
    "Cubrimos 26 marcas de ropa y sneakers (ES/FR/DE/IT/PT)",
    "Wir erfassen 26 Kleidungs- & Sneaker-Marken (ES/FR/DE/IT/PT)",
    "Copriamo 26 marchi di abbigliamento e sneaker (ES/FR/DE/IT/PT)",
    "Cobrimos 26 marcas de roupa e sneakers (ES/FR/DE/IT/PT)",
    "For 11 of the tracked brands we have no per-model breakdown",
    "Para 11 de las marcas monitorizadas no disponemos de desglose",
    "Pour 11 des marques suivies, nous ne disposons d'aucune",
    "Für 11 der erfassten Marken haben wir keine",
    "Per 11 dei brand monitorati non abbiamo",
    "complètement hors de nos 22 marques suivies",
    "völlig außerhalb der 22 Marken, die wir verfolgen",
  ]
  for (const line of stale) {
    assert.ok(CLAIMS.some((re) => re.test(line)), `guard missed: ${line}`)
    assert.ok(!DATED.test(line), `stale line must not look dated: ${line}`)
  }
  const ok = [
    "Week to 14 September 2026, Resale IQ tracked 28 brands across Spain",
    "As of 20 September 2026 we watched 566 listings across 20 published brands",
  ]
  for (const line of ok) assert.ok(DATED.test(line), `dated snapshot line must pass: ${line}`)
})

test("fillBrands never prints a brand count (founder no-counts rule 2026-10-03): the number leaves, the sentence stays", () => {
  const copy = {
    a: `We track ${BRANDS_TRACKED} brands across 5 EU markets.`,
    nested: [{ q: "x", a: "outside the {{BRANDS}} brands we track, you see 'Not in this catalog'." }],
    n: 3,
  }
  const live = fillBrands(copy, 61)
  assert.equal(live.a, "We track brands across 5 EU markets.")
  assert.equal(live.nested[0].a, "outside the brands we track, you see 'Not in this catalog'.")
  assert.equal(live.n, 3)

  const dropped = fillBrands(copy, null)
  assert.equal(dropped.a, "We track brands across 5 EU markets.")
  assert.equal(dropped.nested[0].a, "outside the brands we track, you see 'Not in this catalog'.")

  // Pure: the source structure is never mutated, so one render cannot leak into the next.
  assert.equal(copy.a, `We track ${BRANDS_TRACKED} brands across 5 EU markets.`)
  // Idempotent on copy that carries no sentinel.
  assert.deepEqual(fillBrands({ s: "no number here" }, 61), { s: "no number here" })
})

test("ofTracked only appends a denominator it actually knows", () => {
  assert.equal(ofTracked(48, 61), " (of 61 tracked)")
  assert.equal(ofTracked(48, null), "")
  assert.equal(ofTracked(61, 61), "")
  assert.equal(ofTracked(60, 59), "")
})

test("no render site can leak the raw sentinel: every static-copy reader fills it", () => {
  const read = (rel: string) => readFileSync(join(SRC, rel), "utf8")
  // Blog posts (page, index, llms.txt) and the pricing FAQ in all six locales.
  for (const rel of ["app/blog/[slug]/page.tsx", "app/blog/page.tsx", "app/llms.txt/route.ts"]) {
    assert.match(read(rel), /fillBrands\(/, `${rel} reads blog data and must fill {{BRANDS}}`)
  }
  assert.match(read("components/landing/pricing-section.tsx"), /fillBrands\(t\.faq/)
  assert.match(read("components/landing/pricing-faq.tsx"), /fillBrands\(FAQS/)
  assert.match(read("components/landing/landing-content.tsx"), /fillBrands\(t\.howToCoverage/)
  // The one place that strips titles for link labels must also drop it.
  assert.match(read("lib/related-links.ts"), /fillBrands\(s, null\)/)
})

test("the pricing FAQ and home coverage line never print a brand count in any locale, and read cleanly", () => {
  for (const locale of ["en", "es", "fr", "de", "it", "pt"] as const) {
    const faq = JSON.stringify(copy[locale].pricingSection.faq)
    assert.equal((faq.match(/\{\{BRANDS\}\}/g) ?? []).length, 2, `${locale}: the not-in-catalog answer names the count twice`)
    const live = JSON.stringify(fillBrands(copy[locale].pricingSection.faq, 61))
    assert.doesNotMatch(live, /\{\{BRANDS\}\}/)
    assert.doesNotMatch(live, /\b61\b/, `${locale}: no brand count printed`)
    assert.doesNotMatch(live, /\s{2}/, `${locale}: dropped count leaves no gap`)
    // No old literal survives next to the live one (22 was the stale pricing-FAQ figure).
    assert.doesNotMatch(live, /\b22 (?:tracked|brands|marques|marcas|Marken|marche)/)
    const dropped = JSON.stringify(fillBrands(copy[locale].pricingSection.faq, null))
    assert.doesNotMatch(dropped, /\{\{BRANDS\}\}|\s{2}/, `${locale}: dropped count leaves no gap`)
  }
  assert.equal(
    fillBrands(copy.en.howToCoverage, null).slice(0, 60),
    "We track brands across 5 EU markets. Samba, Air Force 1 and ",
  )
})
