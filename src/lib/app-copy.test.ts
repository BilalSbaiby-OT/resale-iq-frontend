/**
 * The momentum vocabulary is pinned to what the backend actually computes.
 *
 * Run: npm run test:unit  (node --test, native TS type-stripping — no runner
 * dependency, so this stays runnable in CI and in the container build.)
 *
 * WHY THIS FILE EXISTS. `momentum_label` is a PERCENTILE RANK
 * (`momentum_label_from_percentile`, demand-intel/db/queries.py). It divides
 * each model's 7d/30d sell-share by the board's own 7d/30d ratio and buckets
 * the result by rank, so it is invariant to the direction of sales: replayed
 * against the live production board (100 models, 2026-09-06) with every model's
 * weekly sales cut by 50%, 90% and 99%, all 100 labels came back identical, and
 * eighteen models still fell in the "RISING" bucket. The bands are also a
 * quota — production read STABLE 50 · RISING 20 · FADING 18 · DEAD 9 · HOT 3,
 * which is the split the percentile cut-offs hand out by construction.
 *
 * So the enum name is a direction and the statistic is a rank. The screen must
 * follow the statistic. This test fails the build if any locale's momentum
 * string reintroduces a direction word — the regression is one careless
 * translation away, and it was live for weeks in six languages
 * ("Rising"/"Subiendo"/"En hausse"/"Steigend"/"In crescita"/"A subir").
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { appCopy, momentumHint, momentumWord, type MomentumWord } from "./app-copy.ts"
import type { Locale } from "./i18n.ts"

const LOCALES: Locale[] = ["en", "fr", "es", "de", "it", "pt"]
const BUCKETS: MomentumWord[] = ["HOT", "RISING", "STABLE", "FADING", "DEAD"]

/**
 * Words that assert a time-derivative, in the six languages we ship. Every one
 * of these was on the screen before 2026-09-06. A percentile rank of a
 * self-normalising ratio cannot support any of them.
 *
 * Matched on word boundaries so a legitimate substring never trips it.
 */
const DIRECTION_WORDS = [
  // en
  "rising", "rise", "falling", "fall", "climbing", "cooling", "heating",
  "trending", "growing", "declining", "slowing", "surging", "dead", "stable",
  // es
  "subiendo", "subida", "bajando", "enfriándose", "enfriandose", "creciendo",
  "cayendo", "parado", "estable",
  // fr
  "hausse", "baisse", "croissance", "chute", "monte", "refroidit", "arrêt",
  "arret", "stable",
  // de
  "steigend", "fallend", "wachsend", "nachlassend", "stillstand", "stabil",
  "abkühlend", "abkuehlend",
  // it
  "crescita", "calo", "salendo", "scendendo", "fermo", "stabile",
  // pt
  "subir", "descer", "abrandar", "crescimento", "queda", "parado", "estável",
  "estavel",
]

function directionWordsIn(s: string): string[] {
  const lower = s.toLowerCase()
  return DIRECTION_WORDS.filter(w =>
    new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, "u").test(lower),
  )
}

test("the direction-word detector actually detects the strings we shipped", () => {
  // Guards the guard: a matcher that matches nothing would pass every other
  // test in this file silently.
  for (const shipped of ["Rising", "Subiendo", "En hausse", "Steigend", "In crescita", "A subir"]) {
    assert.ok(
      directionWordsIn(shipped).length > 0,
      `detector missed a string that was live in production: "${shipped}"`,
    )
  }
  assert.deepEqual(directionWordsIn("Top 30%"), [], "detector false-positives on a rank label")
})

test("no momentum label in any locale asserts a direction", () => {
  for (const locale of LOCALES) {
    for (const bucket of BUCKETS) {
      const label = appCopy[locale].momentum[bucket]
      const hits = directionWordsIn(label)
      assert.deepEqual(
        hits, [],
        `${locale}.momentum.${bucket} = "${label}" claims ${hits.join("/")}, ` +
        `but momentum_label is a percentile rank and cannot measure direction.`,
      )
    }
  }
})

test("every momentum label states a position in the ranking", () => {
  // The bands are percentile cut-offs (.90/.70/.30/.10), so each label has to
  // carry the share of the board it names. A label with no quantity in it is
  // back to being an adjective, which is how "Rising" got here.
  for (const locale of LOCALES) {
    for (const bucket of BUCKETS) {
      const label = appCopy[locale].momentum[bucket]
      assert.match(
        label, /\d+\s?%/,
        `${locale}.momentum.${bucket} = "${label}" names no share of the board`,
      )
    }
  }
})

test("the labels partition the board the way the percentile bands do", () => {
  // p>=.90 HOT · p>=.70 RISING · p>=.30 STABLE · p>=.10 FADING · else DEAD.
  // Each English label must be the true statement about that band.
  assert.equal(appCopy.en.momentum.HOT, "Top 10%")
  assert.equal(appCopy.en.momentum.RISING, "Top 30%")
  assert.equal(appCopy.en.momentum.STABLE, "Mid 40%")
  assert.equal(appCopy.en.momentum.FADING, "Bottom 30%")
  assert.equal(appCopy.en.momentum.DEAD, "Bottom 10%")
})

test("no locale reuses one label for two different bands", () => {
  for (const locale of LOCALES) {
    const labels = BUCKETS.map(b => appCopy[locale].momentum[b])
    assert.equal(
      new Set(labels).size, BUCKETS.length,
      `${locale} collapses two bands onto the same words: ${labels.join(" / ")}`,
    )
  }
})

test("every locale explains that the rank is not a trend", () => {
  for (const locale of LOCALES) {
    const tip = appCopy[locale].momentumTip.rank
    assert.ok(tip.length > 40, `${locale}.momentumTip.rank is too short to explain anything`)
    // The caption on /deals carries the same promise where there is no hover.
    assert.ok(appCopy[locale].deals.momentumCaption.length > 40, `${locale} deals caption missing`)
  }
})

test("momentumWord translates the enum instead of leaking it", () => {
  assert.equal(momentumWord("RISING", "es"), "30% superior")
  assert.equal(momentumWord("HOT", "de"), "Top 10 %")
  assert.equal(momentumWord(null, "en"), null)
  // An enum we have no word for is still true — it passes through rather than
  // vanishing, same rule as categoryName().
  assert.equal(momentumWord("SOMETHING_NEW", "en"), "SOMETHING_NEW")
})

test("the hover states the measured share, with the bias that makes it not a trend", () => {
  // Balenciaga Track, live production 2026-09-06: 338 of 657.
  const hint = momentumHint("en", 338, 657)
  assert.match(hint, /338/)
  assert.match(hint, /657/)
  assert.match(hint, /51%/, "the real share must be stated, not rounded away")
  assert.match(hint, /23%/, "the even-rate comparison must be stated")
  assert.match(hint, /not proof of a rise/i, "the sold_at caveat must travel with the number")
})

test("no share is printed below the sample the backend will rank on", () => {
  // rel_momentum returns None under sold_30d 10, so the UI must not invent a
  // share the ranking itself refused to compute.
  const thin = momentumHint("en", 4, 9)
  assert.equal(thin, appCopy.en.momentumTip.rank)
  assert.equal(momentumHint("en", null, null), appCopy.en.momentumTip.rank)
  assert.equal(momentumHint("en"), appCopy.en.momentumTip.rank)
})
