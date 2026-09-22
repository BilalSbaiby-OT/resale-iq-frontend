import { test } from "node:test"
import assert from "node:assert/strict"
import { isValidCode, REF_COOKIE, REF_COOKIE_MAX_AGE } from "./referral.ts"

// -------------------------------------------------------------------
// Exported for test access only (captureReferral / readReferral are
// browser-only; we test the validation boundary directly).
// We re-export isValidCode from referral.ts (see note there).
// -------------------------------------------------------------------

test("REF_COOKIE name is riq_ref", () => {
  assert.equal(REF_COOKIE, "riq_ref")
})

test("REF_COOKIE_MAX_AGE is 60 days in seconds", () => {
  assert.equal(REF_COOKIE_MAX_AGE, 60 * 24 * 60 * 60)
})

test("valid ref codes pass validation", () => {
  for (const code of ["PARTNER1", "creator-abc", "aff_123", "a", "A".repeat(64)]) {
    assert.equal(isValidCode(code), true, `Expected ${code} to be valid`)
  }
})

test("invalid ref codes are rejected", () => {
  for (const bad of [
    null,
    undefined,
    "",
    "A".repeat(65),          // too long
    "has space",
    "has.dot",
    "has@at",
    "has/slash",
    "<script>",
  ]) {
    assert.equal(isValidCode(bad), false, `Expected ${String(bad)} to be invalid`)
  }
})
