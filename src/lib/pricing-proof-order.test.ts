/**
 * H180 — /pricing must show a live sample verdict before the plan cards.
 * Source-read: the strip is an async server component; pinning the order in
 * source is the check that survives a later declutter moving cards back up.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("/pricing renders the live sample strip before the plan cards", () => {
  const page = read("app/pricing/page.tsx")
  const stripAt = page.indexOf("<PricingVerdictStrip />")
  const plansAt = page.indexOf('id="pricing-plans"')
  assert.ok(stripAt > 0, "PricingVerdictStrip missing from /pricing")
  assert.ok(plansAt > stripAt, "plan cards must follow the live sample strip")
  assert.match(page, /import \{ PricingVerdictDemo, PricingVerdictStrip \}/)
})

test("pricing proof strip fetches the sample and does not hardcode a price", () => {
  const src = read("components/landing/pricing-verdict-demo.tsx")
  assert.match(src, /export async function PricingVerdictStrip/)
  assert.match(src, /data-testid="riq-pricing-proof-strip"/)
  assert.match(src, /fetchSampleVerdict\(\)/)
  assert.match(src, /href="#pricing-try"/)
  const strip = src.slice(
    src.indexOf("export async function PricingVerdictStrip"),
    src.indexOf("const VERDICT_COLOR"),
  )
  assert.ok(strip.length > 0, "strip source slice empty")
  assert.doesNotMatch(strip, /€\d+/)
  assert.doesNotMatch(strip, /\bsold\b/i)
})
