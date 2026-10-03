/**
 * Guard: marketing/UI copy must not frame the buy-below as a profit/margin
 * promise ("~30% margin before fees", "marge de ~30 %", ...). The max buy price
 * is explained factually: 70% of the typical resale price (avg x 0.70).
 *
 * Scans every non-test source file under src/ (components, app, lib, data and
 * the JSON data files), so a new locale string, blog post or landing page that
 * reintroduces the wording fails here. The e2e twin (e2e/locale-copy.spec.ts)
 * checks the same patterns on the rendered /, /pricing and /tools pages in all
 * six locales.
 */
import test from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const SRC = join(fileURLToPath(new URL(".", import.meta.url)), "..")

const PROFIT_PROMISE = [
  // EN: "30% margin", "~30% gross margin", "30% target margin", "for ~30% margin before fees"
  /(?:~|≈)?\s?30\s?%\s?(?:gross |net |target )?margin/i,
  /margin (?:of|at) (?:about |roughly |~)?30\s?%/i,
  /~\s?30\s?%\s?(?:margin|room)/i,
  // FR / ES / IT / PT / DE: "30 % de marge", "marge de 30", "margen del 30 %", "margine del 30", "margem de 30", "Marge von ~30"
  /30\s?%\s?(?:de |di )?(?:marge|margen|margine|margem|Marge)\b/i,
  /(?:marge|margen|margine|margem|Marge)\s+(?:de|del|di|von)\s+(?:(?:cerca|circa|etwa|environ|aproximadamente)\s+)?(?:~\s?)?(?:il\s+)?30/i,
  /~\s?30\s?%\s?(?:de |di )?(?:marge|margen|margine|margem|Marge)/i,
  // explicit promise verbs around the buy-below
  /(?:and|to) still profit/i,
  /\bfor ~30%/i,
]

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(tsx?|json)$/.test(name) && !/\.test\./.test(name)) out.push(p)
  }
  return out
}

test("no profit/margin-promise wording in any shipped copy (all locales)", () => {
  const hits: string[] = []
  for (const f of walk(SRC)) {
    const lines = readFileSync(f, "utf8").split("\n")
    lines.forEach((line, i) => {
      for (const re of PROFIT_PROMISE) {
        const m = line.match(re)
        if (m) hits.push(`${relative(SRC, f)}:${i + 1}  «${m[0]}»`)
      }
    })
  }
  assert.deepEqual(hits, [], `profit-promise wording found (use "70% of the typical resale price"):\n${hits.join("\n")}`)
})

test("the max buy price is defined factually in every locale of the how-it-works step", async () => {
  const { copy } = await import("./i18n.ts")
  for (const loc of ["fr", "es", "de", "it", "pt"] as const) {
    const steps = copy[loc].howToSteps.join(" ")
    assert.match(steps, /70\s?%/, `${loc} howToSteps should state the 70% definition`)
    assert.doesNotMatch(steps, /30\s?%/, `${loc} howToSteps must not mention a 30% margin`)
  }
})
