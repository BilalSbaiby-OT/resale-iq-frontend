import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

// Founder rule (2026-09-28): customer emails at most MONTHLY, opt-in only.
// No weekly-cadence promise may ever ship in the digest capture copy again —
// this test pins the wording and (just as important) makes sure the capture
// stays a small, secondary, non-blocking element: no popup/modal wrapper.
const SRC = readFileSync("src/components/tools/digest-subscribe.tsx", "utf8")

test("digest capture copy promises monthly cadence, not weekly", () => {
  assert.match(SRC, /1 email a month/i)
  assert.match(SRC, /Monthly buy list by email/i)
})

test("digest capture copy contains no weekly-cadence wording", () => {
  const lower = SRC.toLowerCase()
  assert.ok(!lower.includes("every monday"), "must not promise 'every Monday'")
  assert.ok(!lower.includes("weekly buy list"), "must not say 'weekly buy list'")
  assert.ok(!lower.includes("next week's buy list"), "must not say 'next week's buy list'")
  assert.ok(!lower.includes("lands monday"), "must not promise 'lands Monday'")
})

test("digest capture is never rendered as a modal/popup", () => {
  // The component must not import or render any Modal/Dialog/Popup wrapper —
  // founder rule: email capture must never be a popup or the main CTA.
  // Strip comments first so a doc comment describing the "no modal" design
  // rule (which legitimately contains the word "modal") doesn't false-positive.
  const withoutComments = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
  assert.ok(
    !/import.*modal|import.*dialog|<Modal|<Dialog|<Popup/i.test(withoutComments),
    "digest-subscribe.tsx must not import or render a Modal/Dialog/Popup wrapper"
  )
})
