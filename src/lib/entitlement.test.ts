/**
 * Pins the two defects that shipped on the account page, so neither can return.
 *
 * Run: npm run test:unit  (node --test, native TS type-stripping — no runner
 * dependency, same as str-pct.test.ts).
 *
 * 1. The plan chip was hardcoded English in app/(dashboard)/account/page.tsx,
 *    on a page where every other string is localised.
 * 2. It promised "days of unlimited left". Checks are genuinely uncapped during
 *    the trial, but the same trial grants 5 live finds TOTAL, 1 order plan
 *    TOTAL, and no Price Compare at all (demand-intel config.py:104-105,
 *    api/routes.py:2943). An unqualified "unlimited" is therefore a promise we
 *    do not keep, and it erases the difference between the trial and the paid
 *    tiers. "Unlimited" stays legal for operator/power, which really are
 *    uncapped (api/routes.py:993).
 *
 * Plus the structural fix: the sidebar chip and the account chip must resolve
 * through this one module, because they drifted apart ("Free" vs "Free trial"
 * for the same user, at the same moment).
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { planChip, planEntitlement, planState, PLAN_COPY_TABLE } from "./entitlement.ts"
import type { Locale } from "./i18n.ts"
import type { User } from "../types/index.ts"

const LOCALES: Locale[] = ["en", "fr", "es", "de", "it", "pt"]

/** Every way any of the six languages says "unlimited". */
const UNLIMITED_WORDS = [
  "unlimited", "ilimitado", "ilimitada", "illimité", "illimitée",
  "unbegrenzt", "illimitato", "illimitati",
]

const trialUser = (daysLeft: number): User => ({
  id: 1, email: "a@b.c", plan: "free", trial_active: true,
  trial_days_left: daysLeft, trial_ends_at: "2026-09-13T00:00:00Z",
})
const lapsedUser: User = {
  id: 1, email: "a@b.c", plan: "free", trial_active: false,
  trial_days_left: 0, trial_ends_at: "2026-08-01T00:00:00Z",
}
const pendingUser: User = {
  id: 1, email: "a@b.c", plan: "free", trial_active: false, trial_days_left: 0,
}

test("no trial copy in any locale claims 'unlimited'", () => {
  for (const locale of LOCALES) {
    const strings = [
      PLAN_COPY_TABLE[locale].trial.chip,
      PLAN_COPY_TABLE[locale].trial.sub(5),
      PLAN_COPY_TABLE[locale].trial_lapsed.chip,
      PLAN_COPY_TABLE[locale].trial_lapsed.sub,
      PLAN_COPY_TABLE[locale].trial_pending.chip,
      PLAN_COPY_TABLE[locale].trial_pending.sub,
    ]
    for (const s of strings) {
      for (const word of UNLIMITED_WORDS) {
        assert.ok(
          !s.toLowerCase().includes(word),
          `${locale} trial copy claims "${word}" — the trial caps live finds at 5, order plans at 1, and excludes Price Compare: ${s}`,
        )
      }
    }
  }
})

test("the paid tiers may still say unlimited, because they are", () => {
  // Guards the opposite failure: over-correcting and stripping a true claim
  // from the tiers we are asking people to pay for.
  assert.ok(PLAN_COPY_TABLE.en.starter.sub.toLowerCase().includes("unlimited"))
  assert.ok(PLAN_COPY_TABLE.en.pro.sub.toLowerCase().includes("unlimited"))
})

test("every locale is complete — no English leaking through a missing key", () => {
  for (const locale of LOCALES) {
    const c = PLAN_COPY_TABLE[locale]
    for (const [state, entry] of Object.entries(c)) {
      const sub = typeof entry.sub === "function" ? entry.sub(3) : entry.sub
      assert.ok(entry.chip.length > 0, `${locale}.${state}.chip is empty`)
      assert.ok(sub.length > 0, `${locale}.${state}.sub is empty`)
    }
    if (locale !== "en") {
      // The sentence must actually differ from English. A copy-paste of the
      // English string into a locale slot is the exact bug this lane fixes,
      // and it passes a naive "key exists" check.
      assert.notEqual(c.trial.sub(3), PLAN_COPY_TABLE.en.trial.sub(3), `${locale} trial sentence is still English`)
      assert.notEqual(c.trial_lapsed.sub, PLAN_COPY_TABLE.en.trial_lapsed.sub, `${locale} lapsed sentence is still English`)
      assert.notEqual(c.trial_pending.sub, PLAN_COPY_TABLE.en.trial_pending.sub, `${locale} pending sentence is still English`)
    }
  }
})

test("every locale states the real numbers: 10 a day, 10 a month, 5 finds, 1 plan", () => {
  for (const locale of LOCALES) {
    const trial = PLAN_COPY_TABLE[locale].trial.sub(3)
    assert.ok(trial.includes("5"), `${locale} trial sentence omits the 5 live finds`)
    assert.ok(trial.includes("10"), `${locale} trial sentence omits what happens after`)
    for (const state of ["trial_lapsed", "trial_pending"] as const) {
      assert.ok(
        PLAN_COPY_TABLE[locale][state].sub.includes("10"),
        `${locale}.${state} omits the 10/day and 10/month it must state`,
      )
    }
  }
})

test("chip and entitlement resolve from one module for the same user", () => {
  // The regression itself: sidebar and /account disagreeing. Both call these
  // two functions now, so identical input must give identical output.
  for (const locale of LOCALES) {
    const u = trialUser(4)
    assert.equal(planChip(u, locale), PLAN_COPY_TABLE[locale].trial.chip)
    assert.equal(planEntitlement(u, locale), PLAN_COPY_TABLE[locale].trial.sub(4))
  }
})

test("a trialling user is never labelled the same as a lapsed one", () => {
  for (const locale of LOCALES) {
    assert.notEqual(planChip(trialUser(3), locale), planChip(lapsedUser, locale))
  }
})

test("a trial that never started is not reported as ended", () => {
  assert.equal(planState(pendingUser), "trial_pending")
  assert.equal(planState(lapsedUser), "trial_lapsed")
  // trial_ends_at is NULL until email confirmation, so the pending sentence
  // must point at that click rather than announce a trial that never ran.
  assert.ok(!planEntitlement(pendingUser, "en").toLowerCase().includes("over"))
  assert.ok(planEntitlement(pendingUser, "en").toLowerCase().includes("confirm"))
})

test("plan states map from the user, not from a bare plan string", () => {
  assert.equal(planState({ id: 1, email: "a@b.c", plan: "power" }), "pro")
  assert.equal(planState({ id: 1, email: "a@b.c", plan: "operator" }), "starter")
  assert.equal(planState(null), null)
  assert.equal(planChip(null, "en"), "—")
  assert.equal(planEntitlement(null, "en"), "")
})

test("day counts read naturally at the singular boundary", () => {
  assert.match(planEntitlement(trialUser(1), "en"), /^1 day of full Starter left/)
  assert.match(planEntitlement(trialUser(2), "en"), /^2 days of full Starter left/)
  assert.match(planEntitlement(trialUser(1), "es"), /^Queda 1 día/)
  assert.match(planEntitlement(trialUser(2), "es"), /^Quedan 2 días/)
  assert.match(planEntitlement(trialUser(1), "fr"), /^Il reste 1 jour /)
  assert.match(planEntitlement(trialUser(1), "de"), /^Noch 1 Tag /)
  assert.match(planEntitlement(trialUser(1), "it"), /^Resta 1 giorno/)
  assert.match(planEntitlement(trialUser(1), "pt"), /^Falta 1 dia/)
})
