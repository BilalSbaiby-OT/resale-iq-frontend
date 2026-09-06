/**
 * Locale regression for the backend confidence notes.
 *
 * Run: npm run test:unit  (node --test, native TS type-stripping.)
 *
 * The bug being pinned: on 2026-09-06 production /es rendered the English
 * string "162 comparables in the sample — not shelf departures" underneath a
 * Spanish label, on the landing fold, for the default New Balance 530 demo.
 *
 * Cause: `localizeConfidenceNote` matched four backend patterns and returned
 * the raw English for anything else. The backend had since added a fifth. The
 * fallback itself is deliberate and stays (dropping an unrecognised note would
 * hide true evidence to make a card look tidy) — so the fix is to translate the
 * fifth pattern, and the guard is this file: `check:locale-english` is a static
 * copy scanner and cannot see a string that arrives at runtime from the API.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { localizeConfidenceNote, NUMBER_LOCALE } from "./verdict-words.ts"
import type { Locale } from "./i18n.ts"

const LOCALES: Locale[] = ["en", "es", "fr", "de", "it", "pt"]

/** The exact payload production served for the landing demo. */
const SAMPLE_NOTE = "162 comparables in the sample — not shelf departures"

test("the sample-size note is translated in every locale, not passed through", () => {
  for (const locale of LOCALES) {
    const out = localizeConfidenceNote(SAMPLE_NOTE, locale)
    assert.ok(out, `${locale}: expected a note`)
    assert.equal(out, out!.trim())
    if (locale === "en") continue
    assert.notEqual(out, SAMPLE_NOTE, `${locale}: returned the raw English note`)
    assert.ok(
      !/comparables in the sample|shelf departures/i.test(out!),
      `${locale}: English leaked through: ${out}`,
    )
  }
})

test("every locale keeps the count, in its own digit grouping", () => {
  for (const locale of LOCALES) {
    const out = localizeConfidenceNote("1,234 comparables in the sample — not shelf departures", locale)!
    const expected = (1234).toLocaleString(NUMBER_LOCALE[locale])
    assert.ok(out.includes(expected), `${locale}: expected "${expected}" in "${out}"`)
  }
})

test("the singular spelling and a trailing-clause variant both match", () => {
  for (const note of ["1 comparable in the sample", "162 comparables in the sample — anything at all"]) {
    const out = localizeConfidenceNote(note, "es")!
    assert.ok(!/in the sample/i.test(out), `es: unmatched variant leaked: ${out}`)
  }
})

test("the four pre-existing patterns still translate", () => {
  const es = (n: string) => localizeConfidenceNote(n, "es")!
  assert.ok(es("Only 20 comparable departures").startsWith("Solo 20"))
  assert.ok(!/Too few/i.test(es("Too few comparable departures")))
  assert.ok(!/48 hours/i.test(es("Market snapshot is more than 48 hours old")))
  assert.ok(!/widely spread/i.test(es("Sold prices are widely spread — treat the average as a range")))
})

test("an unrecognised note is still returned verbatim — evidence beats tidiness", () => {
  const novel = "Backend shipped a brand new sentence"
  assert.equal(localizeConfidenceNote(novel, "es"), novel)
})

test("empty and missing notes stay null", () => {
  assert.equal(localizeConfidenceNote(null, "es"), null)
  assert.equal(localizeConfidenceNote(undefined, "es"), null)
  assert.equal(localizeConfidenceNote("", "es"), null)
})
