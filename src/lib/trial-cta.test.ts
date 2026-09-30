import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { copy } from "./i18n.ts"
import { CTA_VARIANT } from "./cta-variant.ts"
import { trialCtaLabel, trialLine, trialPrice, firstChargeDate } from "./trial-cta.ts"

const LOCALES = ["en", "fr", "es", "de", "it", "pt"] as const
const src = join(dirname(fileURLToPath(import.meta.url)), "..")

test("default variant is A and every locale has an A label", () => {
  assert.equal(CTA_VARIANT, "A")
  for (const l of LOCALES) assert.ok(copy[l].trial.cta.A.length > 5, l)
})

test("EN button + disclosure match the approved copy (2026-09-30)", () => {
  assert.equal(trialCtaLabel("en"), "Start my 7-day free trial")
  assert.equal(trialCtaLabel("de"), "7 Tage kostenlos testen")
  assert.equal(
    trialLine("en", 19, "month", "7 October"),
    "€0 today. Then €19/month from 7 October. Cancel anytime before then and pay nothing.",
  )
  assert.match(trialLine("en", 49, "month", "7 October"), /€49\/month/)
  assert.match(trialLine("en", 190, "year", "7 October"), /€190\/year/)
  assert.match(trialLine("fr", 19, "month", "7 octobre"), /0 € aujourd'hui, puis 19 €\/mois à partir du 7 octobre/)
})

test("without a date (SSR) the line still discloses price and trial, no placeholder leaks", () => {
  for (const l of LOCALES) {
    const line = trialLine(l, 19, "month", null)
    assert.doesNotMatch(line, /[{](date|price|n)[}]/)
    assert.match(line, /19/)
  }
})

test("first charge date is today+7 days, localized", () => {
  const d = firstChargeDate("en", new Date("2026-09-30T10:00:00Z"))
  assert.equal(d, "7 October")
  assert.equal(trialPrice("es", 19), "19 €/mes")
})

test("no trial button label is hardcoded outside i18n: GuestCheckoutButton call sites pass no label", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(f) ? [p] : []
    })
  for (const f of walk(src)) {
    const t = readFileSync(f, "utf8")
    for (const m of t.matchAll(/<GuestCheckoutButton\b[^>]*?>/g)) {
      assert.doesNotMatch(m[0], /\blabel=/, `${f} hardcodes a GuestCheckoutButton label`)
    }
  }
})

test("cta_variant is attached to checkout_started / checkout_intent_guest / checkout_from_blog only", () => {
  const a = readFileSync(join(src, "lib/analytics.ts"), "utf8")
  assert.match(a, /"checkout_started",\s*"checkout_intent_guest",\s*"checkout_from_blog"/)
  assert.match(a, /cta_variant=\$\{CTA_VARIANT\}/)
})
