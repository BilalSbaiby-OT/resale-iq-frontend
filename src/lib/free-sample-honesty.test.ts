/**
 * Guard: New Balance 530 is HARD_PAYWALL (402 for anonymous visitors,
 * measured live 2026-09-29) and New Balance FuelCell only 200s anonymously
 * as a brand-average BRAND_CATEGORIES fallback (buy_below null) — neither
 * is a usable free/no-account sample. This scans every copy source under
 * src/data and src/lib (and public/) for a sentence that names either model
 * in the same breath as a free/no-account claim, in any of the six locales
 * this site ships (en/es/fr/de/it/pt).
 *
 * Run: npm run test:unit (node --test, native TS type-stripping.)
 *
 * A false positive here means a real bug: some copy module is telling a
 * visitor they can check New Balance 530 or FuelCell for free. Fix the
 * copy, do not weaken this test.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, extname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

const TARGET_RE = /New Balance 530|FuelCell/i
// English + es/fr/de/it/pt phrasings for "free" and "no account".
const FREE_RE =
  /\bfree\b|no account|no-account|gratis|gratuit|kostenlos|gratuito|sem conta|sin cuenta|sans compte|ohne konto|senza account/i
// Split on sentence-ending punctuation or a newline (incl. escaped \n inside
// a JS string literal) so a violation must be in the SAME sentence, not just
// the same file or paragraph.
const SENT_SPLIT = /(?<=[.!?])\s+|\\n|\n/

const SCAN_DIRS = ["src/data", "src/lib", "src/app", "src/components", "public"]
const SCAN_EXT = new Set([".ts", ".tsx", ".json", ".txt"])
// Test files assert the ABSENCE of these strings (e.g. this file, or
// pricing-faq-free-checker.test.ts) — scanning them would self-trigger.
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
    const st = statSync(full)
    if (st.isDirectory()) {
      walk(full, out)
    } else if (SCAN_EXT.has(extname(entry)) && !SKIP_SUFFIXES.some((s) => entry.endsWith(s))) {
      out.push(full)
    }
  }
}

test("no copy sentence claims New Balance 530 or FuelCell as free/no-account, in any locale", () => {
  const files: string[] = []
  for (const d of SCAN_DIRS) walk(join(root, d), files)
  assert.ok(files.length > 100, "sanity: scan should touch well over 100 files")

  const violations: { file: string; sentence: string }[] = []
  for (const path of files) {
    let content: string
    try {
      content = readFileSync(path, "utf8")
    } catch {
      continue
    }
    for (const sentence of content.split(SENT_SPLIT)) {
      if (TARGET_RE.test(sentence) && FREE_RE.test(sentence)) {
        violations.push({ file: path.replace(root + "/", ""), sentence: sentence.trim().slice(0, 200) })
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `New Balance 530 is HARD_PAYWALL and FuelCell is a brand-average fallback (buy_below null) — ` +
      `neither may be named as free/no-account. Violations:\n${violations
        .map((v) => `  ${v.file}: ${v.sentence}`)
        .join("\n")}`,
  )
})

// 2026-10-02: the guard above only fires for "New Balance 530" / "FuelCell", which
// is how the register page's "Try Nike AF1, Adidas Samba or New Balance free" and the
// blog clones' "Samba, AF1 and NB 530 show a live BUY" slipped through. This one
// fires for ANY New Balance model (or "NB 530") next to a free claim, unless the
// sentence is itself the denial ("... is not a free sample", "402", "paywall").
test("no sentence pairs any New Balance model with a free claim unless it denies it", () => {
  const BROAD_TARGET = /New Balance|\bNB ?530\b/i
  const DENIAL = /not (a )?free|never|isn't|is not|\b402\b|paywall|returns free 200/i
  const files: string[] = []
  for (const d of SCAN_DIRS) walk(join(root, d), files)
  const violations: { file: string; sentence: string }[] = []
  for (const path of files) {
    let content: string
    try {
      content = readFileSync(path, "utf8")
    } catch {
      continue
    }
    for (const sentence of content.split(SENT_SPLIT)) {
      if (sentence.trim().startsWith("//")) continue // a code comment documenting history
      if (BROAD_TARGET.test(sentence) && FREE_RE.test(sentence) && !DENIAL.test(sentence)) {
        violations.push({ file: path.replace(root + "/", ""), sentence: sentence.trim().slice(0, 200) })
      }
    }
  }
  assert.deepEqual(
    violations,
    [],
    `New Balance is not a free sample. Violations:\n${violations.map((v) => `  ${v.file}: ${v.sentence}`).join("\n")}`,
  )
})
