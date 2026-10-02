/**
 * THE free samples contract (founder decision 2026-10-02).
 *
 *  - ONE list: src/lib/free-samples.ts. Adidas Samba, Nike Air Force 1,
 *    Fred Perry Polo. No account needed for these three, nothing else.
 *  - Starter is a 7-day free trial, card required, EUR 0 today. There is no
 *    free tier, no "first check free", no "free checks every day".
 *  - No guru promises ("one good flip pays for the month", "stop guessing"...).
 *
 * This file is what keeps those promises from creeping back: it scans every
 * shipped source file (src/app, src/components, src/lib, src/data, public) for
 * the retired phrasings, for a second hand-typed copy of the list, and for a
 * sentence that names a partial list. It does not scan extension/ — the Chrome
 * extension strings need a Web Store resubmission and are tracked separately.
 *
 * Run: npm run test:unit
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, extname } from "node:path"
import { fileURLToPath } from "node:url"
import { FREE_SAMPLES, FREE_SAMPLE_CHIPS, FREE_SAMPLE_DEMO, freeSampleList, isFreeSample } from "./free-samples.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

test("the list is exactly Samba, AF1 and Fred Perry Polo", () => {
  assert.deepEqual([...FREE_SAMPLES], ["Adidas Samba", "Nike Air Force 1", "Fred Perry Polo"])
  assert.deepEqual(FREE_SAMPLE_CHIPS.map((c) => c.q), [...FREE_SAMPLES])
  assert.ok((FREE_SAMPLES as readonly string[]).includes(FREE_SAMPLE_DEMO))
})

test("isFreeSample matches the three, ignoring case and spacing, and nothing else", () => {
  assert.equal(isFreeSample("adidas  samba"), true)
  assert.equal(isFreeSample("  Nike Air Force 1 "), true)
  assert.equal(isFreeSample("FRED PERRY POLO"), true)
  for (const paid of ["Levi's 501", "New Balance 530", "New Balance 550", "Adidas Gazelle", "Fred Perry", "", null, undefined]) {
    assert.equal(isFreeSample(paid as string | null | undefined), false, String(paid))
  }
})

test("freeSampleList joins the three in each language's own conjunction", () => {
  assert.equal(freeSampleList("en"), "Adidas Samba, Nike Air Force 1 and Fred Perry Polo")
  assert.equal(freeSampleList("fr"), "Adidas Samba, Nike Air Force 1 et Fred Perry Polo")
  assert.equal(freeSampleList("es"), "Adidas Samba, Nike Air Force 1 y Fred Perry Polo")
  assert.equal(freeSampleList("de"), "Adidas Samba, Nike Air Force 1 und Fred Perry Polo")
  assert.equal(freeSampleList("it"), "Adidas Samba, Nike Air Force 1 e Fred Perry Polo")
  assert.equal(freeSampleList("pt"), "Adidas Samba, Nike Air Force 1 e Fred Perry Polo")
  assert.equal(freeSampleList("xx"), freeSampleList("en"), "an unknown locale falls back to English")
})

// ---- source scan -----------------------------------------------------------

const SCAN_DIRS = ["src/app", "src/components", "src/hooks", "src/lib", "src/data", "public"]
const SCAN_EXT = new Set([".ts", ".tsx", ".json", ".txt"])
const SKIP_SUFFIXES = [".test.ts", ".test.tsx"]

function walk(dir: string, out: string[]): void {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next") continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (SCAN_EXT.has(extname(entry)) && !SKIP_SUFFIXES.some((s) => entry.endsWith(s))) out.push(full)
  }
}

function sourceFiles(): string[] {
  const files: string[] = []
  for (const d of SCAN_DIRS) walk(join(root, d), files)
  return files
}

/**
 * Source with code comments blanked out (line numbers preserved). A comment
 * documents history and may quote a retired phrase; shipped copy may not.
 * Block comments incl. JSX {/* ... *\/} are removed, then whole-line // comments.
 * (A trailing // after code is left alone: it could be inside a URL string.)
 */
function codeLines(path: string): string[] {
  const src = readFileSync(path, "utf8")
  const blanked = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""))
  return blanked.split("\n").map((l) => (l.trim().startsWith("//") ? "" : l))
}

test("scan sanity: the scan touches the whole copy surface", () => {
  assert.ok(sourceFiles().length > 300)
})

test("no second hand-typed copy of the free list in code (chips, hints, placeholders read free-samples.ts)", () => {
  const dup = /["'`]Adidas Samba["'`]\s*,\s*["'`]Nike Air Force 1["'`]|["'`]Fred Perry Polo["'`]\s*,\s*["'`]Nike Air Force 1["'`]|["'`]Nike Air Force 1["'`]\s*,\s*["'`]Adidas Samba["'`]/
  const violations: string[] = []
  for (const f of sourceFiles()) {
    if (f.endsWith("src/lib/free-samples.ts")) continue
    if (f.includes("/src/data/") || f.includes("/public/")) continue // prose copy, not a code list
    codeLines(f).forEach((line, i) => {
      if (dup.test(line)) violations.push(`${f.replace(root + "/", "")}:${i + 1}`)
    })
  }
  assert.deepEqual(violations, [], `import FREE_SAMPLES / FREE_SAMPLE_CHIPS instead of retyping the list:\n${violations.join("\n")}`)
})

// Retired promises, English. Case-insensitive, matched on non-comment lines only.
const BANNED: Array<[RegExp, string]> = [
  [/first check (is )?free/i, "there is no 'first check free'"],
  [/check any (item|model) free/i, "only the three samples are free to check"],
  [/check it free on \/tools\]/i, "only the three samples are free to check"],
  [/free daily checks?|free checks every day|checks every day/i, "there is no free daily allowance"],
  [/\b10 (checks|full unlocks|verdicts) (a|per) (day|month)/i, "no free allowance exists under the paywall"],
  [/7-day unlimited window/i, "the trial is 7 days, card required, not an unlimited window"],
  [/pays? for (itself|the whole month|2\+ months)/i, "unsourced ROI promise"],
  [/one (good|avoided bad) (flip|buy) (pays|covers)/i, "unsourced ROI promise"],
  [/one bad buy covers the cost/i, "unsourced ROI promise"],
  [/don.t buy anything without this/i, "guru line"],
  [/stop guessing what/i, "guru line"],
  [/ready to stop guessing/i, "guru line"],
  [/never buy a dead size again/i, "guarantee"],
  [/exactly what a subscriber gets/i, "false: samples carry locked fields"],
  [/New Balance (free|or New Balance)/i, "New Balance is not a free sample"],
  [/\b(Samba|AF1|Air Force 1)\b[^.\n]{0,24}\b(NB ?530|New Balance 530)\b/, "New Balance 530 is paywalled; it is not listed beside the free samples"],
]

test("no retired free-promise or guru phrasing ships in any source file", () => {
  const violations: string[] = []
  for (const f of sourceFiles()) {
    codeLines(f).forEach((line, i) => {
      for (const [re, why] of BANNED) {
        if (re.test(line)) violations.push(`${f.replace(root + "/", "")}:${i + 1} (${why}): ${line.trim().slice(0, 140)}`)
      }
    })
  }
  assert.deepEqual(violations, [], `Retired phrasing found:\n${violations.join("\n")}`)
})

test("a sentence that lists free samples lists all three, never a partial list", () => {
  const fam = {
    samba: /Adidas Samba|\bSamba\b/,
    af1: /Nike Air Force 1|Air Force 1|\bAF1\b/,
    fp: /Fred Perry Polo|\bFP Polo\b/,
  }
  const freeWord = /\bfree\b|gratis|gratuit|kostenlos|gratuito|grátis|no account|sin cuenta|sans compte|ohne Konto|senza account|sem conta|muestra|échantillon|Stichprobe|campion|amostra/i
  // Model-page templates legitimately name ONE or TWO models (a page about
  // Samba, the Samba/AF1 pair that have a dedicated /flip model page), and
  // comments/tests are skipped, so only the shared copy modules are listed here.
  const violations: string[] = []
  for (const f of sourceFiles()) {
    if (f.endsWith("src/lib/free-samples.ts") || f.endsWith("seo-models.json") || f.includes("/data/seo-models") ) continue
    codeLines(f).forEach((line, i) => {
      if (!freeWord.test(line)) return
      const hits = Object.values(fam).filter((re) => re.test(line)).length
      if (hits === 2) violations.push(`${f.replace(root + "/", "")}:${i + 1}: ${line.trim().slice(0, 150)}`)
    })
  }
  assert.deepEqual(violations, [], `Partial free-sample list (name all three or none):\n${violations.join("\n")}`)
})
