#!/usr/bin/env node
/**
 * STALE GATES — a document forbidding something the founder already allowed.
 *
 *   node scripts/check-stale-gates.mjs
 *
 * WHY THIS EXISTS
 *
 * On 2026-09-01 a stale rule stopped correct work FOUR times in one day:
 *
 *   - `ACCESS.md` still called writes and deploys founder gates, hours after
 *     the founder removed that gate twice in plain words. `devops` logged a
 *     DEVIATION for doing exactly what it had been told to do.
 *   - `docs/eng/PUBLISHING.md` §5 said publishing was founder-gated.
 *     `content-social` rendered SIX finished, verified posts and then stopped
 *     at the send step — hours after A22 cleared it.
 *   - `GTM.md` asserted the same posting gate in three more places.
 *   - `OS.md` still listed "Postiz publish" among things only the founder can
 *     click.
 *
 * **A rule nobody updated does not become safe by being old. It becomes a
 * silent stop-work order, and it is worse than no rule because it looks like
 * caution.** AM-10 makes correcting these explicitly allowed. This makes
 * finding them automatic, because AM-10 is itself a prose rule and prose rules
 * are the thing that does not run.
 *
 * HOW: `docs/company/cleared-gates.json` lists gates the founder has cleared —
 * each with the approval that cleared it and the phrases that would indicate a
 * document still asserting it. A match that is not struck through or marked
 * SUPERSEDED fails the check.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.cwd()
const SPEC = join(ROOT, "docs", "company", "cleared-gates.json")

if (!existsSync(SPEC)) {
  console.log(`\n? no cleared-gates spec at ${relative(ROOT, SPEC)} — nothing to check\n`)
  process.exit(0)
}

const gates = JSON.parse(readFileSync(SPEC, "utf8"))

function mdFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      if (!/node_modules|\.git/.test(p)) mdFiles(p, out)
    } else if (e.name.endsWith(".md")) out.push(p)
  }
  return out
}

/**
 * A line is FINE if it acknowledges the change. We deliberately accept several
 * spellings — the point is that a human reading it learns the rule is dead, not
 * that they typed a magic word.
 */
const acknowledged = (line) =>
  /~~|SUPERSEDED|NO LONGER|CLEARED BY|AMENDED|REMOVED|was:|Cleared by/i.test(line)

const findings = []
for (const file of mdFiles(join(ROOT, "docs"))) {
  const rel = relative(ROOT, file)
  // The spec itself, the amendment that authorises this, and the audit trail
  // all necessarily quote the dead rules in order to describe them.
  if (/cleared-gates\.json|AMENDMENTS\.md|POST-MORTEM\.md|SESSION\.md|SECURITY-LOG\.md/.test(rel)) continue

  const lines = readFileSync(file, "utf8").split("\n")
  lines.forEach((line, i) => {
    for (const g of gates) {
      for (const phrase of g.phrases) {
        if (!line.toLowerCase().includes(phrase.toLowerCase())) continue
        if (acknowledged(line)) continue
        findings.push({ file: rel, line: i + 1, gate: g.gate, approval: g.approval,
                        text: line.trim().slice(0, 110) })
      }
    }
  })
}

if (!findings.length) {
  console.log(`\n✓ no stale gates — ${gates.length} cleared gate(s) checked across docs/\n`)
  process.exit(0)
}

console.log(`\n✗ STALE GATES — ${findings.length} line(s) still forbid something the founder allowed\n`)
for (const f of findings) {
  console.log(`  ${f.file}:${f.line}`)
  console.log(`    asserts: ${f.gate}   (cleared by ${f.approval})`)
  console.log(`    "${f.text}"`)
  console.log()
}
console.log(`  A stale gate is a silent stop-work order. On 2026-09-01 four of them
  stopped correct work: an agent rendered six finished posts and refused to send
  them, and another logged a DEVIATION for doing what it was told.

  Correct the line — strike it through, mark it SUPERSEDED, say which approval
  cleared it — per AM-10. Do not delete the history; say it changed.\n`)
process.exit(1)
