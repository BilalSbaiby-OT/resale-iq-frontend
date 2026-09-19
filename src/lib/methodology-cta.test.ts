import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { methodologyCopy } from "./methodology-copy.ts"

const PAGE_SRC = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../app/methodology/page.tsx"),
  "utf8",
)

// Same labels as i18n.ts operator CTAs — /methodology is a public trust page
// under HARD_PAYWALL, so the green button sells Starter, not a free account.
const STARTER_CTA = {
  en: "Start for €19",
  es: "Empieza por 19 €",
  fr: "Démarrer pour 19 €",
  de: "Für 19 € starten",
  it: "Inizia a 19 €",
  pt: "Começa por 19 €",
} as const

test("H61 /methodology primary CTA routes to Starter, never ?plan=free", () => {
  assert.match(PAGE_SRC, /\?plan=operator&src=methodology/)
  assert.doesNotMatch(PAGE_SRC, /\?plan=free/)
})

test("H61 methodology text29 is the Starter CTA in all 6 locales", () => {
  for (const locale of Object.keys(STARTER_CTA) as Array<keyof typeof STARTER_CTA>) {
    assert.equal(methodologyCopy[locale].text29, STARTER_CTA[locale])
  }
})

test("H61 methodology copy does not promise a free account or 'no card'", () => {
  for (const locale of Object.keys(STARTER_CTA) as Array<keyof typeof STARTER_CTA>) {
    const t = methodologyCopy[locale]
    assert.doesNotMatch(
      t.text29,
      /free account|cuenta gratuita|compte gratuit|Kostenloses Konto|account gratuito|conta gratuita/i,
    )
    assert.doesNotMatch(
      t.g_cta_b,
      /No card|Sin tarjeta|Sans carte|Keine Kreditkarte|Nessuna carta|Sem cartão/i,
    )
  }
})
