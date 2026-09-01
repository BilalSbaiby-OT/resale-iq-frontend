#!/usr/bin/env node
/**
 * INVENTORY — the answer to "does X exist?", so nobody has to guess.
 *
 *   node scripts/build-inventory.mjs           # regenerate
 *   node scripts/build-inventory.mjs --check    # fail if stale
 *
 * WHY THIS EXISTS
 *
 * "Asserting absence" was one of five failure classes in the 2026-09-01
 * post-mortem, and it is the one with the worst payoff-to-effort ratio: you
 * search a few plausible names, find nothing, and report that the thing does
 * not exist. The claim sounds authoritative. It is the single hardest kind of
 * claim to make honestly, because absence is only provable by exhaustion.
 *
 * The CEO did it twice in one evening:
 *
 *   - "There is no per-user request log in production." There is:
 *     `verdict_logs`, 432 rows, with a `user_id` column. Four names were tried,
 *     including `verdict_log` SINGULAR. The real table was one character away.
 *     The founder pushed back and was right. The answer it gave — every
 *     registered user had run ZERO checks — turned out to be the most important
 *     finding of the day, and we nearly never looked.
 *   - "We have no usage telemetry, so a CRM cannot fix this." Built on the same
 *     bad search.
 *
 * **A grep that finds nothing proves you did not find it. It does not prove it
 * is not there.** So: enumerate once, write it down, and make "does X exist?" a
 * lookup instead of a guess.
 *
 * Deliberately NOT a live query. It is a committed artifact so it is diffable —
 * a table appearing or vanishing shows up in review, which is itself worth
 * having.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { execSync } from "node:child_process"

const ROOT = process.cwd()
const OUT = join(ROOT, "docs", "company", "INVENTORY.md")

function walk(dir, re, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    const p = join(dir, e)
    if (/node_modules|\.next|\.git|__pycache__|\.venv|scratchpad|dist|build/.test(p)) continue
    let st
    try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) walk(p, re, out)
    else if (re.test(e)) out.push(relative(ROOT, p))
  }
  return out
}

/** Production tables, read from the schema in the sibling repo. */
function tables() {
  const schema = join(ROOT, "..", "demand-intel", "db", "schema.py")
  if (!existsSync(schema)) return ["(demand-intel/db/schema.py not readable from here)"]
  const src = readFileSync(schema, "utf8")
  return [...src.matchAll(/CREATE TABLE(?: IF NOT EXISTS)? (\w+)/g)].map(m => m[1]).sort()
}

const checks = walk(join(ROOT, "scripts"), /^check-.*\.(mjs|js|py)$/).sort()
const npmScripts = Object.keys(JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts || {}).sort()
const workflows = existsSync(join(ROOT, ".github", "workflows"))
  ? readdirSync(join(ROOT, ".github", "workflows")).sort() : []
// INVENTORY.md is excluded from its own listing. Including it made the file
// describe a state that only existed AFTER it was written, so --check failed
// immediately after a successful generate -- a check that could never pass, the
// same shape as the stop-gate that demanded a clean tree while its own logger
// dirtied it.
const companyDocs = walk(join(ROOT, "docs", "company"), /\.md$/)
  .filter(d => !d.endsWith("INVENTORY.md")).sort()
const tbl = tables()

let head = ""
try { head = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim() } catch {}

const body = `# INVENTORY — generated, do not hand-edit

**Regenerate:** \`node scripts/build-inventory.mjs\` · **Verify fresh:** \`--check\` · commit \`${head}\`

This file exists so that **"does X exist?" is a lookup, not a guess.** Asserting an absence after an
incomplete search is one of the five failure classes in \`POST-MORTEM.md\`, and the most expensive
instance was searching four names for a usage log, missing \`verdict_logs\` by one character, and
telling the founder we had no telemetry at all.

**Before writing "there is no ...", look here. A grep that finds nothing proves you did not find it.**

## Production tables (${tbl.length}) — from \`demand-intel/db/schema.py\`

${tbl.map(t => `- \`${t}\``).join("\n")}

## Check scripts (${checks.length})

${checks.map(c => `- \`${c}\``).join("\n")}

## npm scripts (${npmScripts.length})

${npmScripts.map(s => `- \`${s}\``).join("\n")}

## CI workflows (${workflows.length})

${workflows.map(w => `- \`.github/workflows/${w}\``).join("\n")}

## Company docs (${companyDocs.length})

${companyDocs.map(d => `- \`${d}\``).join("\n")}
`

if (process.argv.includes("--check")) {
  if (!existsSync(OUT)) {
    console.log("\n✗ INVENTORY.md missing — run: node scripts/build-inventory.mjs\n")
    process.exit(1)
  }
  const cur = readFileSync(OUT, "utf8")
  // Compare everything except the commit line, which changes every commit.
  const strip = t => t.split("\n").filter(l => !l.startsWith("**Regenerate:**")).join("\n")
  if (strip(cur) !== strip(body)) {
    console.log(`\n✗ INVENTORY.md is STALE — something was added or removed and the inventory
  still describes the old shape. That is exactly how "it does not exist" gets
  asserted about something that does.

  Run: node scripts/build-inventory.mjs\n`)
    process.exit(1)
  }
  console.log(`\n✓ inventory fresh — ${tbl.length} tables, ${checks.length} checks, ${companyDocs.length} docs\n`)
  process.exit(0)
}

writeFileSync(OUT, body)
console.log(`\n✓ wrote ${relative(ROOT, OUT)} — ${tbl.length} tables, ${checks.length} checks, ${npmScripts.length} npm scripts, ${companyDocs.length} docs\n`)
