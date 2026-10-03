/**
 * Exit survey contract (O2). Run: npm run test:unit
 *
 * The enums must match api/routes.py (EXIT_SURVEY_CONTEXTS / _REASONS): the
 * backend answers 422 to anything else and the card swallows send failures,
 * so a drifted value would silently lose every answer.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  EXIT_FREE_TEXT_MAX,
  EXIT_QUERY_MAX,
  EXIT_SURVEY_CONTEXTS,
  EXIT_SURVEY_REASONS,
  buildExitSurveyPayload,
  exitSurveySeen,
  exitSurveySeenKey,
  markExitSurveySeen,
} from "./exit-survey.ts"
import { exitSurveyCopy } from "./exit-survey-copy.ts"

function memStorage() {
  const m = new Map<string, string>()
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
  }
}

test("enums match the backend whitelist", () => {
  assert.deepEqual([...EXIT_SURVEY_CONTEXTS], ["checkout_cancel", "paywall", "limit"])
  assert.deepEqual(
    [...EXIT_SURVEY_REASONS],
    ["too_expensive", "dont_trust", "not_covered", "seller_not_buyer", "just_looking", "other"],
  )
  assert.equal(EXIT_FREE_TEXT_MAX, 500)
  assert.equal(EXIT_QUERY_MAX, 200)
})

test("shown at most once per visitor per context", () => {
  const s = memStorage()
  assert.equal(exitSurveySeen(s, "paywall"), false)
  markExitSurveySeen(s, "paywall")
  assert.equal(exitSurveySeen(s, "paywall"), true)
  // another context is independent
  assert.equal(exitSurveySeen(s, "limit"), false)
  assert.equal(exitSurveySeen(s, "checkout_cancel"), false)
  assert.notEqual(exitSurveySeenKey("paywall"), exitSurveySeenKey("limit"))
})

test("blocked storage never throws and never hides the card forever", () => {
  const broken = {
    getItem: () => { throw new Error("denied") },
    setItem: () => { throw new Error("denied") },
  }
  assert.equal(exitSurveySeen(broken, "limit"), false)
  assert.doesNotThrow(() => markExitSurveySeen(broken, "limit"))
  assert.equal(exitSurveySeen(null, "limit"), false)
})

test("payload: trimmed, capped, free text only for 'other'", () => {
  const p = buildExitSurveyPayload({
    context: "paywall", reason: "other", freeText: "  " + "x".repeat(900) + " ",
    query: " " + "q".repeat(300), locale: "fr",
  })
  assert.equal(p.free_text!.length, EXIT_FREE_TEXT_MAX)
  assert.equal(p.query!.length, EXIT_QUERY_MAX)
  assert.equal(p.locale, "fr")

  const tap = buildExitSurveyPayload({ context: "limit", reason: "too_expensive", freeText: "leftover" })
  assert.deepEqual(tap, { context: "limit", reason: "too_expensive" })

  const blank = buildExitSurveyPayload({ context: "limit", reason: "other", freeText: "   " })
  assert.equal("free_text" in blank, false)
})

test("all six locales carry every reason, the question and the thank-you", () => {
  assert.deepEqual(Object.keys(exitSurveyCopy).sort(), ["de", "en", "es", "fr", "it", "pt"])
  for (const [loc, c] of Object.entries(exitSurveyCopy)) {
    for (const r of EXIT_SURVEY_REASONS) assert.ok(c.reasons[r]?.trim(), `${loc}.${r}`)
    for (const k of ["question", "otherPlaceholder", "send", "dismiss", "thanks"] as const) {
      assert.ok(c[k].trim(), `${loc}.${k}`)
    }
  }
  assert.equal(exitSurveyCopy.en.question, "What stopped you?")
  // non-English locales must not just repeat the English strings
  for (const loc of ["fr", "es", "de", "it", "pt"] as const) {
    assert.notEqual(exitSurveyCopy[loc].question, exitSurveyCopy.en.question, loc)
    assert.notEqual(exitSurveyCopy[loc].reasons.dont_trust, exitSurveyCopy.en.reasons.dont_trust, loc)
  }
})
