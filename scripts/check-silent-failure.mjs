#!/usr/bin/env node
/**
 * SILENT FAILURE — code that knows something is wrong and says nothing.
 *
 *   node scripts/check-silent-failure.mjs           # this repo
 *   node scripts/check-silent-failure.mjs --all     # also ../demand-intel
 *   node scripts/check-silent-failure.mjs --update-baseline
 *
 * WHY THIS EXISTS
 *
 * The 2026-09-01 post-mortem classified **34 of 222 fix commits** as this one
 * shape — the largest class by count. Every instance had the same anatomy: a
 * component detected a problem, swallowed it, and returned as if fine.
 *
 *   - `existsSync` dropped a missing video and posted the caption alone. TikTok
 *     answered `{"message":"No video"}`. Six records sat in ERROR all day and
 *     the cause read as "unobtainable" — while the ONE component that knew the
 *     file was missing said nothing.
 *   - Ten videos published with no audio track. The mux exited 0.
 *   - Every published link went out untagged for weeks. `signup_attribution`
 *     held zero rows and looked like a working table with no signups.
 *   - A brand parser returned `None` on an empty title and the shelf detector
 *     read that as a departure.
 *
 * **A failure that returns quietly is worse than a crash.** A crash gets fixed
 * in an hour. This gets found in a week, by a customer, or never.
 *
 * WHAT IT FLAGS: an exception handler that discards the error with no re-raise,
 * no log above DEBUG, and no comment explaining why swallowing is correct.
 *
 * Sometimes swallowing IS correct — attribution must never break a
 * registration. That is why a `# why:` / `// why:` comment inside the handler
 * silences this check. The bar is not "never swallow", it is **"say why, in
 * writing, next to the code"**.
 */
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.cwd()
const SKIP = /node_modules|\.next|\.git|dist|build|coverage|__pycache__|\.venv|scratchpad|test|spec/
const BASELINE = join(ROOT, "scripts", "silent-failure-baseline.json")

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    const p = join(dir, e)
    if (SKIP.test(p)) continue
    let st
    try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) walk(p, out)
    else if (/\.(ts|tsx|mjs|js|py)$/.test(p)) out.push(p)
  }
  return out
}

/** Does this handler body do anything about the error? */
function handled(body) {
  if (/\bwhy:/i.test(body)) return true                        // explicit reason, in writing
  if (/\b(raise|throw)\b/.test(body)) return true              // re-raised
  if (/logger?\.(error|warning|warn|critical|exception)/.test(body)) return true
  if (/console\.(error|warn)/.test(body)) return true
  if (/\b(sys\.exit|process\.exit)\b/.test(body)) return true
  return false
}

const findings = []

for (const root of [ROOT, ...(process.argv.includes("--all") ? [join(ROOT, "..", "demand-intel")] : [])]) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, "utf8").split("\n")
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i]

      // Python: except ...:  /  bare except:
      const py = /^\s*except\b.*:\s*$/.test(l)
      // JS/TS: catch (e) {  /  catch {
      const js = /\bcatch\s*(\([^)]*\))?\s*\{\s*$/.test(l)
      if (!py && !js) continue

      // Take the handler body: next non-empty lines until dedent / closing brace.
      const body = []
      for (let j = i + 1; j < Math.min(i + 12, lines.length); j++) {
        const b = lines[j]
        if (js && /^\s*\}/.test(b)) break
        if (py && b.trim() && !/^\s/.test(b)) break
        body.push(b)
      }
      const text = body.join("\n")
      if (!text.trim()) {                       // completely empty handler
        findings.push({ file: relative(ROOT, file), line: i + 1, why: "empty handler" })
        continue
      }
      if (!handled(text)) {
        findings.push({ file: relative(ROOT, file), line: i + 1, why: "swallowed, no log/raise/why:" })
      }
    }
  }
}

const key = f => `${f.file}:${f.why}`

if (process.argv.includes("--update-baseline")) {
  writeFileSync(BASELINE, JSON.stringify([...new Set(findings.map(key))].sort(), null, 2) + "\n")
  console.log(`\nbaseline written: ${new Set(findings.map(key)).size} known site(s)\n`)
  process.exit(0)
}

const known = existsSync(BASELINE) ? new Set(JSON.parse(readFileSync(BASELINE, "utf8"))) : new Set()
const fresh = findings.filter(f => !known.has(key(f)))

if (!fresh.length) {
  console.log(`\n✓ no NEW silent failures (${new Set(findings.map(key)).size} known site(s) baselined)\n`)
  process.exit(0)
}

console.log(`\n✗ SILENT FAILURE — ${fresh.length} new site(s) swallow an error without saying so\n`)
for (const f of fresh.slice(0, 25)) console.log(`  ${f.file}:${f.line}  — ${f.why}`)
if (fresh.length > 25) console.log(`  … and ${fresh.length - 25} more`)
console.log(`
  A failure that returns quietly is worse than a crash. A crash gets fixed in an
  hour; this gets found in a week, by a customer, or never.

  Fix it by logging at warning or above, re-raising, or writing "why:" inside the
  handler explaining why swallowing is correct here. Saying why is enough — the
  bar is not "never swallow".
`)
process.exit(1)
