/**
 * verdict_logs.flow contract (O2). Run: npm run test:unit
 *
 * The five values must match the backend whitelist (db/queries.py
 * VERDICT_FLOWS); a value the backend does not know is stored as NULL, which
 * would silently blank a column of the funnel.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, extname } from "node:path"
import { fileURLToPath } from "node:url"
import { VERDICT_FLOWS, flowParam, flowFromSrc, typedFlow, isPaidPlan } from "./verdict-flow.ts"

test("exactly the six backend-whitelisted flows", () => {
  assert.deepEqual([...VERDICT_FLOWS], ["sample_button", "own_item", "typed", "buylist", "blog_example", "ssr"])
})

test("flowParam builds an appendable query fragment, or nothing", () => {
  assert.equal(flowParam("typed"), "&flow=typed")
  assert.equal(flowParam(undefined), "")
  assert.equal(flowParam(null), "")
})

test("typedFlow: unpaid + non-sample = own_item, otherwise typed", () => {
  assert.equal(typedFlow("Stone Island Hoodie", null), "own_item")
  assert.equal(typedFlow("Stone Island Hoodie", "free"), "own_item")
  assert.equal(typedFlow("Stone Island Hoodie", "operator"), "typed")
  assert.equal(typedFlow("Stone Island Hoodie", "power"), "typed")
  assert.equal(typedFlow("  nike air force 1 ", null), "typed") // a free sample typed by hand
})

test("isPaidPlan", () => {
  assert.equal(isPaidPlan("operator"), true)
  assert.equal(isPaidPlan("power"), true)
  assert.equal(isPaidPlan("free"), false)
  assert.equal(isPaidPlan(undefined), false)
})

test("flowFromSrc maps entry points; unknown / missing say nothing", () => {
  assert.equal(flowFromSrc("dashboard_buy_list"), "buylist")
  assert.equal(flowFromSrc("buy_list_locked"), "buylist")
  assert.equal(flowFromSrc("blog-check"), "blog_example")
  assert.equal(flowFromSrc("blog_index_try"), "blog_example")
  assert.equal(flowFromSrc("home_free_sample"), "sample_button")
  assert.equal(flowFromSrc("pricing_try"), undefined)
  assert.equal(flowFromSrc(null), undefined)
  assert.equal(flowFromSrc("constructor"), undefined)
})

test("every mapped flow is a whitelisted value", () => {
  for (const s of ["buy_list_locked", "dashboard_buy_list", "blog-check", "blog_proof", "home_free_sample", "signup_seed"]) {
    assert.ok((VERDICT_FLOWS as readonly string[]).includes(flowFromSrc(s)!), s)
  }
})

// Drift guard: a new fetch to /api/verdict must say where it came from. These
// files are deliberately untagged: no user action is behind the call (SSR hero
// / pricing demo / crawler teaser) or it is an agent tool call, so NULL is the
// honest value.
const UNTAGGED_ON_PURPOSE = new Set([
  "src/lib/hero-verdict.ts",
  "src/lib/teaser-verdict.ts",
  "src/components/landing/pricing-verdict-demo.tsx",
  "src/components/tools/register-check-vinted-item-tool.tsx",
])

test("every /api/verdict fetch in src carries a flow (or is allow-listed)", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
  const hits: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if ([".ts", ".tsx"].includes(extname(p)) && !/\.test\.tsx?$/.test(p)) {
        const rel = p.slice(root.length + 1)
        if (UNTAGGED_ON_PURPOSE.has(rel)) continue
        readFileSync(p, "utf8").split("\n").forEach((line, i) => {
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) return
          if (line.includes("/api/verdict?q=") && !/flow/.test(line)) hits.push(`${rel}:${i + 1}`)
        })
      }
    }
  }
  walk(join(root, "src"))
  assert.deepEqual(hits, [], `untagged /api/verdict calls: ${hits.join(", ")}`)
})

test("server-side verdict fetches (hero, teaser, pricing demo) all send flow=ssr", () => {
  const here = dirname(fileURLToPath(import.meta.url))
  for (const rel of ["hero-verdict.ts", "teaser-verdict.ts", "../components/landing/pricing-verdict-demo.tsx"]) {
    const src = readFileSync(join(here, rel), "utf8")
    const calls = src.split("${backendUrl()}/api/verdict?q=").slice(1)
    assert.ok(calls.length > 0, rel)
    for (const c of calls) assert.match(c.slice(0, 160), /flowParam\("ssr"\)/, `${rel}: verdict call without flow=ssr`)
  }
})
