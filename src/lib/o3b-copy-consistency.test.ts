import test from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

// O3b: every buy-below / max-buy statement matches the shipped O3 card —
// whole euros, "= 70% of the typical resale price", never "after fees", no cents.
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name)) out.push(p)
  }
  return out
}

const files = walk(join(process.cwd(), "src"))
const read = (p: string) => readFileSync(p, "utf8")

test("no buy-below / max-buy copy says 'after fees' (any locale)", () => {
  const bad = [
    /most (to pay|you (can|should) pay)[^.\n]{0,40}after (selling |platform )?fees/i,
    /(buy-below|max buy)[^.\n]{0,80}after (selling |platform )?fees/i,
    /(maximum à payer|maximum que vous pouvez payer)[^.\n]{0,60}après frais/i,
    /(máximo a pagar|máximo que puedes pagar)[^.\n]{0,60}(tras|después de) comisiones/i,
    /Höchstpreis[^.\n]{0,60}nach Gebühren/i,
    /massimo (da pagare|che puoi pagare)[^.\n]{0,60}dopo le commissioni/i,
    /máximo (a pagar|que podes pagar)[^.\n]{0,60}(após|depois de) taxas/i,
    /Buy-below,? (after fees|tras comisiones|après frais|nach Gebühren|dopo commissioni|após taxas)/i,
  ]
  const hits: string[] = []
  for (const f of files) {
    const s = read(f)
    for (const re of bad) if (re.test(s)) hits.push(`${f} ${re}`)
  }
  assert.deepEqual(hits, [])
})

test("buy_below / max_buy are never rendered with cents", () => {
  const hits: string[] = []
  for (const f of files) {
    const lines = read(f).split("\n")
    lines.forEach((l, i) => {
      if (/(buy_below|max_buy|buyBelow)[^\n]*toFixed\(2\)/.test(l)) hits.push(`${f}:${i + 1}`)
    })
  }
  assert.deepEqual(hits, [])
})
