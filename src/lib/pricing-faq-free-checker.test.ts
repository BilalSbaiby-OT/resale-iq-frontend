import { test } from "node:test"
import assert from "node:assert/strict"
import { copy } from "./i18n.ts"

const LOCALES = ["en", "es", "fr", "de", "it", "pt"] as const

test("pricing FAQ free-checker truth matches EN in every locale (Samba / AF1 / Fred Perry Polo)", () => {
  for (const locale of LOCALES) {
    const faqs = copy[locale].pricingSection.faq
    const free = faqs.find((f) =>
      /free item checker|vérificateur d'articles gratuit|comprobador de artículos gratis|kostenlose Artikelprüfung|controllo articoli gratuito|verificador de artigos grátis/i.test(
        f.q,
      ),
    )
    assert.ok(free, `${locale} pricing FAQ must ask about the free checker`)
    assert.match(free.a, /Samba/, `${locale} must name Samba`)
    assert.match(free.a, /Air Force 1/, `${locale} must name AF1`)
    assert.match(free.a, /Fred Perry/, `${locale} must name Fred Perry Polo`)
    assert.doesNotMatch(free.a, /530/, `${locale} must not claim New Balance 530 is free — it is HARD_PAYWALL`)
    assert.doesNotMatch(free.a, /^(No|Non|Nein|Não)\b/, `${locale} must not deny the free checker`)
  }
})
