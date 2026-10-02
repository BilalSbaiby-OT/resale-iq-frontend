#!/usr/bin/env node
/**
 * INVENTORY — the answer to "does X exist?", so nobody has to guess.
 *
 *   node scripts/build-inventory.mjs           # regenerate
 *   node scripts/build-inventory.mjs --check    # fail if stale
 *
 * Runs identically from the main checkout, from any git worktree, and from a
 * subdirectory of either — see `repoRoot()` and `schemaPath()` below for why
 * that needed saying. `INVENTORY_REQUIRE_SIBLING=1` additionally makes an
 * unresolvable `demand-intel` a hard failure instead of a loud skip.
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
import { join, relative, dirname, resolve } from "node:path"
import { execSync } from "node:child_process"

const git = (args, cwd) => execSync(`git ${args}`, { cwd, stdio: ["ignore", "pipe", "ignore"] }).toString().trim()

/**
 * ROOT is the repo root, not the cwd, so `npm run check:inventory` gives the
 * same answer from `scripts/` as from the top. Falls back to cwd outside git.
 */
function repoRoot() {
  try { return git("rev-parse --show-toplevel", process.cwd()) } catch { return process.cwd() }
}

const ROOT = repoRoot()
const OUT = join(ROOT, "docs", "company", "INVENTORY.md")

/**
 * The production schema lives in a SIBLING repo, `../demand-intel`. "../" from
 * where, though, was the bug: this check ran green in the main checkout and red
 * in every git worktree, because `.worktrees/<name>/../demand-intel` does not
 * exist. The generator then quietly emitted a 1-line placeholder in place of 52
 * tables, so regenerating from a worktree DELETED 54 lines of real inventory,
 * and --check failed for a reason that had nothing to do with the change under
 * test. Three deploys in one day stepped over that red.
 *
 * So anchor the sibling to the MAIN checkout, which every worktree can name:
 * `--git-common-dir` always points at the main checkout's `.git`, from any
 * worktree, wherever on disk that worktree lives (several of ours are under
 * /private/tmp). Its grandparent is the directory `demand-intel` sits beside.
 */
function schemaPath() {
  const candidates = []
  try {
    const commonDir = resolve(ROOT, git("rev-parse --git-common-dir", ROOT))
    candidates.push(join(dirname(dirname(commonDir)), "demand-intel", "db", "schema.py"))
  } catch {}
  candidates.push(join(dirname(ROOT), "demand-intel", "db", "schema.py"))
  return candidates.find(existsSync) ?? null
}

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
  const schema = schemaPath()
  if (!schema) return null
  const src = readFileSync(schema, "utf8")
  return [...src.matchAll(/CREATE TABLE(?: IF NOT EXISTS)? (\w+)/g)].map(m => m[1]).sort()
}

const TABLES_HEADING = "## Production tables"

/** The committed tables section, verbatim — used when the sibling is absent. */
function committedTablesBlock() {
  if (!existsSync(OUT)) return null
  const lines = readFileSync(OUT, "utf8").split("\n")
  const start = lines.findIndex(l => l.startsWith(TABLES_HEADING))
  if (start === -1) return null
  let end = start + 1
  while (end < lines.length && !lines[end].startsWith("## ")) end++
  return lines.slice(start, end).join("\n").replace(/\s+$/, "")
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

// Two parts, deliberately separated. The repo-local part (checks, npm scripts,
// workflows, docs) is always asserted. The cross-repo part is asserted whenever
// the sibling resolves — which, after the anchor fix above, is everywhere we
// actually run. If it genuinely is not on disk (a bare CI checkout), carry the
// COMMITTED block through unchanged and say so loudly, rather than silently
// overwriting 52 real table names with a placeholder. Set
// INVENTORY_REQUIRE_SIBLING=1 to make an unresolved sibling a hard failure.
const carried = tbl === null ? committedTablesBlock() : null
const tablesBlock = tbl !== null
  ? `${TABLES_HEADING} (${tbl.length}) — from \`demand-intel/db/schema.py\`\n\n${tbl.map(t => `- \`${t}\``).join("\n")}`
  : carried ?? `${TABLES_HEADING} (UNRESOLVED) — from \`demand-intel/db/schema.py\`\n\n- _sibling repo \`demand-intel\` not found on disk; this section has never been generated here_`

let head = ""
try { head = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim() } catch {}

const body = `# INVENTORY — generated, do not hand-edit

**Regenerate:** \`node scripts/build-inventory.mjs\` · **Verify fresh:** \`--check\` · commit \`${head}\`

This file exists so that **"does X exist?" is a lookup, not a guess.** Asserting an absence after an
incomplete search is one of the five failure classes in \`POST-MORTEM.md\`, and the most expensive
instance was searching four names for a usage log, missing \`verdict_logs\` by one character, and
telling the founder we had no telemetry at all.

**Before writing "there is no ...", look here. A grep that finds nothing proves you did not find it.**

${tablesBlock}

## Check scripts (${checks.length})

${checks.map(c => `- \`${c}\``).join("\n")}

## npm scripts (${npmScripts.length})

${npmScripts.map(s => `- \`${s}\``).join("\n")}

## CI workflows (${workflows.length})

${workflows.map(w => `- \`.github/workflows/${w}\``).join("\n")}

## Company docs (${companyDocs.length})

${companyDocs.map(d => `- \`${d}\``).join("\n")}
`

const siblingNote = tbl !== null
  ? `  cross-repo: production tables read from ${relative(ROOT, schemaPath())}`
  : `  cross-repo: SKIPPED — sibling repo \`demand-intel\` is not on disk (looked beside the
              main checkout and beside ${ROOT}). The committed table list was
              carried through unchanged; it was NOT re-verified this run.`

if (tbl === null && process.env.INVENTORY_REQUIRE_SIBLING === "1") {
  console.log(`\n✗ INVENTORY: sibling repo \`demand-intel\` not found and INVENTORY_REQUIRE_SIBLING=1.\n${siblingNote}\n`)
  process.exit(1)
}

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

  Run: node scripts/build-inventory.mjs\n\n${siblingNote}\n`)
    process.exit(1)
  }
  console.log(`\n✓ inventory fresh — ${tbl === null ? "tables carried (not re-read)" : `${tbl.length} tables`}, ${checks.length} checks, ${companyDocs.length} docs\n${siblingNote}\n`)
  process.exit(0)
}

writeFileSync(OUT, body)
console.log(`\n✓ wrote ${relative(ROOT, OUT)} — ${tbl === null ? "tables carried (not re-read)" : `${tbl.length} tables`}, ${checks.length} checks, ${npmScripts.length} npm scripts, ${companyDocs.length} docs\n${siblingNote}\n`)
