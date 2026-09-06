/**
 * Shared source-file walker for the check scripts.
 *
 * Extracted because `check-duplicate-logic.mjs` caught me duplicating it
 * between itself and `check-silent-failure.mjs` within minutes of writing both
 * — the check found its own author committing the exact defect it exists to
 * catch. Baselining that would have been the easy move and the wrong one: a
 * debt list you add to on day one is not a debt list, it is permission.
 *
 * One skip pattern, one place. If a directory should be ignored by the checks,
 * it gets ignored by all of them, which is the whole point.
 */
import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"

// `.evidence` joins `scratchpad` for the same reason: it is untracked per-lane
// scratch (verification walkers, screenshot drivers) that never ships. On
// 2026-09-06 a throwaway `.evidence/prod-walk.mjs` written by one lane failed
// check:silent for a different lane's commit — a guard firing on a file that is
// not in the repo and cannot reach a customer. Shipped code is the subject.
export const SKIP = /node_modules|\.next|\.git|dist|build|coverage|__pycache__|\.venv|scratchpad|\.evidence/

/**
 * @param {string} dir      directory to walk
 * @param {RegExp} match    which filenames to keep
 * @param {RegExp} [skip]   extra skip pattern, ORed with SKIP
 */
export function walkFiles(dir, match, skip) {
  const out = []
  const rec = (d) => {
    let entries
    try { entries = readdirSync(d) } catch { return }
    for (const e of entries) {
      const p = join(d, e)
      if (SKIP.test(p) || (skip && skip.test(p))) continue
      let st
      try { st = statSync(p) } catch { continue }
      if (st.isDirectory()) rec(p)
      else if (match.test(e)) out.push(p)
    }
  }
  rec(dir)
  return out
}
