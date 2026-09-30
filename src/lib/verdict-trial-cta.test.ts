import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { verdictTrialCtaVisible } from "./verdict-trial-cta.ts"

const R = (verdict: string, extra: Record<string, unknown> = {}) =>
  ({ verdict, sell_through_rate: null, ...extra }) as never

test("free logged-in account with unlocks left or spent gets the trial CTA under BUY/WATCH/SKIP", () => {
  for (const v of ["BUY", "WATCH", "SKIP"]) {
    assert.equal(verdictTrialCtaVisible({ result: R(v, { unlocks_remaining: 4 }), isPaid: false, isAuthenticated: true }), true, v)
    assert.equal(verdictTrialCtaVisible({ result: R(v, { unlocks_remaining: 0 }), isPaid: false, isAuthenticated: true }), true, v)
  }
})

test("brand-average verdict (no other CTA on the card) gets it for unpaid viewers", () => {
  assert.equal(verdictTrialCtaVisible({ result: R("BRAND_AVERAGE"), isPaid: false, isAuthenticated: false }), true)
  assert.equal(verdictTrialCtaVisible({ result: R("BRAND_AVERAGE"), isPaid: false, isAuthenticated: true }), true)
})

test("never for paid plans, on any verdict", () => {
  for (const v of ["BUY", "WATCH", "SKIP", "BRAND_AVERAGE"]) {
    assert.equal(verdictTrialCtaVisible({ result: R(v, { unlocks_remaining: 0 }), isPaid: true, isAuthenticated: true }), false, v)
  }
})

test("no duplicate: logged-out (UnlockPanel already has the trial button) and unverified get none", () => {
  assert.equal(verdictTrialCtaVisible({ result: R("WATCH"), isPaid: false, isAuthenticated: false }), false)
  assert.equal(
    verdictTrialCtaVisible({ result: R("WATCH", { unlocks_remaining: 3, verification_required: true }), isPaid: false, isAuthenticated: true }),
    false,
  )
})

test("verdicts with no number to sell never get it", () => {
  for (const v of ["UNKNOWN", "INSUFFICIENT_DATA", "OVERSUPPLIED", "BRAND_CATEGORIES", "LIMIT_REACHED", "PAYWALL"]) {
    assert.equal(verdictTrialCtaVisible({ result: R(v, { unlocks_remaining: 0 }), isPaid: false, isAuthenticated: true }), false, v)
  }
})

test("component reuses the single-source checkout button + existing analytics event", () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../components/ui/verdict-trial-cta.tsx"), "utf8")
  assert.match(src, /GuestCheckoutButton/)
  assert.match(src, /trackEvent\("verdict_upsell_click", src\)/)
  assert.doesNotMatch(src, /import .*createCheckout|await fetch/)
})
