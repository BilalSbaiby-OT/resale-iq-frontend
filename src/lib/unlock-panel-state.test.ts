import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { unlockPanelBranch } from "./unlock-panel-state.ts"

const PANEL_SRC = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../components/ui/unlock-panel.tsx"),
  "utf8",
)

// The founder-reported regression, pinned: a PAYING / entitled user on a
// provisional verdict (deep fields still maturing) must NEVER be shown the
// "create a free account" register wall.
test("authenticated paid account (no unlocks field) never sees the register wall", () => {
  const branch = unlockPanelBranch(
    { sell_through_rate: null, unlocks_remaining: undefined, verification_required: false },
    true, // logged in
  )
  assert.notEqual(branch, "register")
  assert.equal(branch, "entitled")
})

test("genuinely logged-out visitor gets the register branch (Starter pitch, not a free door)", () => {
  const branch = unlockPanelBranch(
    { sell_through_rate: null, unlocks_remaining: undefined },
    false,
  )
  assert.equal(branch, "register")
})

test("present deep fields render nothing", () => {
  assert.equal(
    unlockPanelBranch({ sell_through_rate: "62%", unlocks_remaining: 5 }, true),
    "hidden",
  )
  // even logged out, if the data is there there is nothing to gate
  assert.equal(
    unlockPanelBranch({ sell_through_rate: "62%" }, false),
    "hidden",
  )
})

test("logged-in unverified account is asked to verify, not to register", () => {
  const branch = unlockPanelBranch(
    { sell_through_rate: null, unlocks_remaining: 10, verification_required: true },
    true,
  )
  assert.equal(branch, "verify")
})

test("free account with unlocks left gets the quiet unlock button", () => {
  assert.equal(
    unlockPanelBranch({ sell_through_rate: null, unlocks_remaining: 4 }, true),
    "unlock",
  )
})

test("free account that spent its allowance gets the upgrade case", () => {
  assert.equal(
    unlockPanelBranch({ sell_through_rate: null, unlocks_remaining: 0 }, true),
    "upgrade",
  )
})

// The OVER-BLOCK direction (per demand-intel CLAUDE.md): confirm we do not
// accidentally wall an authenticated user in ANY quota state.
test("no authenticated state ever resolves to the register wall", () => {
  const states = [
    { sell_through_rate: null, unlocks_remaining: undefined },
    { sell_through_rate: null, unlocks_remaining: 0 },
    { sell_through_rate: null, unlocks_remaining: 10 },
    { sell_through_rate: null, unlocks_remaining: 3, verification_required: true },
  ]
  for (const s of states) {
    assert.notEqual(unlockPanelBranch(s, true), "register")
  }
})

// H60 CRO: AppShell login-walls /verdict, so this branch is currently unreachable
// for logged-out visitors — but the copy still shipped a 7-day trial + ?plan=free
// lie. Pin the source so it cannot come back if the shell ever lets anons through.
test("H60 register-branch copy sells Starter, never a 7-day trial or ?plan=free", () => {
  assert.match(PANEL_SRC, /GuestCheckoutButton/)
  assert.match(PANEL_SRC, /Start for €19/)
  assert.doesNotMatch(PANEL_SRC, /href="\/register\?plan=operator/)
  assert.match(PANEL_SRC, /Starter \(€19\/mo\)/)
  assert.doesNotMatch(PANEL_SRC, />Create a free account</)
  assert.doesNotMatch(PANEL_SRC, /href="\/register\?plan=free/)
  assert.doesNotMatch(PANEL_SRC, /after a 7-day trial/)
})
