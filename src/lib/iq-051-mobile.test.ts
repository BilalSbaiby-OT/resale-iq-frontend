import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (rel: string) => readFileSync(join(root, rel), "utf8")

test("IQ-051: /data table does not force 620px minWidth; dashboard sections are not all riq-scroll-x", () => {
  const data = read("app/data/page.tsx")
  assert.doesNotMatch(data, /minWidth:\s*620/)
  assert.match(data, /riq-data-brands/)
  assert.match(data, /riq-data-cats/)
  const dash = read("app/(dashboard)/dashboard/dashboard-content.tsx")
  assert.doesNotMatch(dash, /className="riq-scroll-x">\{children\}/)
  const css = read("app/globals.css")
  assert.match(css, /\.riq-data-brands \.riq-data-cats \{ display: none; \}/)
})

test("390px: verdict check stacks via riq-checker-row; metrics do not use 4-col divide-x", () => {
  const verdict = read("app/(dashboard)/verdict/verdict-content.tsx")
  assert.match(verdict, /className="riq-checker-row mb-8"/)
  assert.doesNotMatch(verdict, /className="flex gap-2 mb-8"/)
  assert.match(verdict, /riq-metric-grid/)
  assert.match(verdict, /riq-verdict-head/)
  assert.doesNotMatch(verdict, /grid-cols-2 sm:grid-cols-4/)
  assert.match(verdict, /formatStrPctString\(result\.sell_through_rate\)/)
  // STR-null must not skip the insight grid — UnlockPanel sits inside it.
  assert.doesNotMatch(
    verdict,
    /\) : result\.sell_through_rate == null \? \(/,
  )
  const css = read("app/globals.css")
  assert.match(css, /overflow-x: clip/)
  assert.match(css, /\.riq-checker-row/)
  assert.match(css, /\.riq-metric-grid/)
  assert.match(css, /minmax\(min\(100%, 280px\), 1fr\)/)
})

test("paid insight chrome is collected from real + reconstructed API fields, never invented", () => {
  const intel = read("lib/verdict-intelligence.ts")
  assert.match(intel, /reconstructed_buy_below/)
  assert.match(intel, /active_comps/)
  assert.match(intel, /null is not 0/)
  const verdict = read("app/(dashboard)/verdict/verdict-content.tsx")
  assert.match(verdict, /collectVerdictMetrics/)
  assert.match(verdict, /hasVerdictIntelligence/)
  assert.match(verdict, /riq-verdict-insights/)
})
