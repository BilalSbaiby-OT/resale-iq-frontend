import { expect, test, type Page } from "@playwright/test"

/**
 * Closes the exact gap that shipped three markets in English: no spec ever
 * set Accept-Language and asserted on rendered copy, so a page whose hero was
 * translated and whose free checker was not still went green. h1-only
 * coverage (e2e/smoke.spec.ts) proves the hero translates; it says nothing
 * about the conversion path below it.
 *
 * This suite renders the homepage under each of the five served markets
 * (market-numbers.ts: ES/FR/DE/IT/PT — never claim UK, CLAUDE.md) via a real
 * Accept-Language header, and asserts native copy on the free checker itself:
 * the button, the BUY stat labels, and the INSUFFICIENT_DATA refusal screen
 * (the state 37/100 board models land on, per free-checker.tsx). It also
 * asserts the ENGLISH string is *absent* for each locale — a translation
 * that silently falls back to English on one branch must fail this, not
 * just "some French text exists somewhere on the page."
 *
 * W9 (2026-09-01): three more surfaces, same shape of bug. Locale routing
 * (seo/i18n-routing-hreflang) shipped real indexable /es /fr /de /it /pt URLs
 * with the checker path above already covered — but live-market-proof.tsx,
 * extension-hero.tsx and lib/watched-sample.ts's honesty line were still
 * English underneath a translated hero on every one of them. Same rule as
 * above: assert the native string is present AND the English source string
 * is absent, so a future string added to any of these three without a
 * translation goes red here instead of shipping quietly, the way the first
 * pass of this gap did.
 */

// Chromium treats `Accept-Language` as a browser-managed header: it ignores
// page.setExtraHTTPHeaders() for it (confirmed by inspecting the actual
// request — the override was silently dropped and every locale rendered
// English, which is exactly the class of false-green this suite exists to
// prevent). The context `locale` option is the one lever that actually
// changes the header Chromium sends, so that is what sets the market here.
interface LocaleFixture {
  ctxLocale: string
  checkFree: RegExp
  buyBelow: string
  marketPrice: string
  tryTheseInstead: RegExp
  insufficientStatement: string
  insufficientNLabel: string
  enterBrandModel: string
  // live-market-proof.tsx (W9)
  liveProofHeading: string
  liveProofSeeHow: string
  liveProofPlanAddsHeading: string
  // extension-hero.tsx (W9) — "Nike Air Force 1" panel is Adidas Samba
  // regardless of query; this is the static hero mock, not a search result.
  extHeroDomain: string
  extHeroSize: string
  extHeroCondition: string
  extHeroMatched: string
  extHeroCaption: string
  // lib/watched-sample.ts (W9) — the sentence under a BUY/WATCH/SKIP that
  // states the watched sample size. "Nike Air Force 1" is sold_7d 120 /
  // active_listings 300 in e2e/mock-backend.mjs, and neither number takes a
  // thousands separator in any of these locales, so the digits are stable
  // across the whole set.
  watchedSampleHead: string
}

const LOCALES: Record<string, LocaleFixture> = {
  fr: {
    ctxLocale: "fr-FR",
    checkFree: /Vérifier gratuitement/,
    buyBelow: "Prix d'achat max",
    marketPrice: "Prix de marché",
    tryTheseInstead: /Essayez plutôt/i,
    insufficientStatement: "Pas assez de départs observés pour chiffrer ceci.",
    insufficientNLabel: "observés, pas assez",
    enterBrandModel: "Indiquez une marque et un modèle",
    liveProofHeading: "En vente sur Vinted cette semaine",
    liveProofSeeHow: "Voir comment on calcule ça →",
    liveProofPlanAddsHeading: "Ce qu'un abonnement ajoute, par modèle",
    extHeroDomain: "vinted.fr",
    extHeroSize: "Taille",
    extHeroCondition: "Très bon état",
    extHeroMatched: "correspondance :",
    extHeroCaption: "Exemple du panneau Chrome sur une annonce Adidas Samba",
    watchedSampleHead: "Sur les annonces observées, 120 ont quitté le rayon contre 300 encore en ligne.",
  },
  es: {
    ctxLocale: "es-ES",
    checkFree: /Comprobar gratis/,
    buyBelow: "Precio máximo de compra",
    marketPrice: "Precio de mercado",
    tryTheseInstead: /Prueba con uno de estos/i,
    insufficientStatement: "Aún no hay suficientes salidas observadas para calcular un precio.",
    insufficientNLabel: "observadas, insuficientes",
    enterBrandModel: "Indica una marca y un modelo",
    liveProofHeading: "A la venta en Vinted esta semana",
    liveProofSeeHow: "Ver cómo lo calculamos →",
    liveProofPlanAddsHeading: "Lo que añade un plan, por modelo",
    extHeroDomain: "vinted.es",
    extHeroSize: "Talla",
    extHeroCondition: "Muy bueno",
    extHeroMatched: "coincide con:",
    extHeroCaption: "Ejemplo del panel de Chrome en un anuncio de Adidas Samba",
    watchedSampleHead: "En los anuncios que observamos, 120 salieron del catálogo frente a 300 que siguen en venta.",
  },
  de: {
    ctxLocale: "de-DE",
    checkFree: /Kostenlos prüfen/,
    buyBelow: "Kaufobergrenze",
    marketPrice: "Marktpreis",
    tryTheseInstead: /Probier stattdessen/i,
    insufficientStatement: "Noch nicht genug beobachtete Abgänge für einen Preis.",
    insufficientNLabel: "beobachtet, nicht genug",
    enterBrandModel: "Marke und Modell eingeben",
    liveProofHeading: "Diese Woche auf Vinted im Angebot",
    liveProofSeeHow: "So berechnen wir das →",
    liveProofPlanAddsHeading: "Was ein Tarif zusätzlich bringt, pro Modell",
    extHeroDomain: "vinted.de",
    extHeroSize: "Größe",
    extHeroCondition: "Sehr gut",
    extHeroMatched: "gefunden:",
    extHeroCaption: "Beispiel des Chrome-Panels bei einem Adidas-Samba-Angebot",
    watchedSampleHead: "In den von uns beobachteten Angeboten sind 120 aus dem Bestand gegangen, 300 sind noch inseriert.",
  },
  it: {
    ctxLocale: "it-IT",
    checkFree: /Controlla gratis/,
    buyBelow: "Prezzo massimo di acquisto",
    marketPrice: "Prezzo di mercato",
    tryTheseInstead: /Prova uno di questi/i,
    insufficientStatement: "Non ci sono ancora abbastanza partenze osservate per calcolare un prezzo.",
    insufficientNLabel: "osservate, non abbastanza",
    enterBrandModel: "Inserisci un marchio e un modello",
    liveProofHeading: "In vendita su Vinted questa settimana",
    liveProofSeeHow: "Guarda come lo calcoliamo →",
    liveProofPlanAddsHeading: "Cosa aggiunge un piano, per modello",
    extHeroDomain: "vinted.it",
    extHeroSize: "Taglia",
    extHeroCondition: "Molto buono",
    extHeroMatched: "corrispondenza:",
    extHeroCaption: "Esempio del pannello Chrome su un annuncio Adidas Samba",
    watchedSampleHead: "Negli annunci osservati, 120 sono usciti dallo scaffale contro 300 ancora in vendita.",
  },
  pt: {
    ctxLocale: "pt-PT",
    checkFree: /Verificar grátis/,
    buyBelow: "Preço máximo de compra",
    marketPrice: "Preço de mercado",
    tryTheseInstead: /Experimenta um destes/i,
    insufficientStatement: "Ainda não há saídas observadas suficientes para calcular um preço.",
    insufficientNLabel: "observadas, insuficientes",
    enterBrandModel: "Indica uma marca e um modelo",
    liveProofHeading: "À venda na Vinted esta semana",
    liveProofSeeHow: "Vê como calculamos isto →",
    liveProofPlanAddsHeading: "O que um plano acrescenta, por modelo",
    extHeroDomain: "vinted.pt",
    extHeroSize: "Tamanho",
    extHeroCondition: "Muito bom",
    extHeroMatched: "correspondência:",
    extHeroCaption: "Exemplo do painel Chrome num anúncio Adidas Samba",
    watchedSampleHead: "Nos anúncios que observámos, 120 saíram da prateleira contra 300 ainda anunciados.",
  },
}

async function gotoHomepage(page: Page) {
  const res = await page.goto("/")
  expect(res?.ok()).toBeTruthy()
}

async function search(page: Page, q: string) {
  const responsePromise = page.waitForResponse((r) => r.url().includes("/api/verdict"))
  await page.locator("#check").getByRole("textbox").fill(q)
  await page.locator("#check").getByRole("button").first().click()
  return responsePromise
}

for (const [locale, l] of Object.entries(LOCALES)) {
  test.describe(`P0 — free checker conversion path in ${locale}`, () => {
    test.use({ locale: l.ctxLocale })

    test(`button, placeholder and empty-input error render in ${locale}, not English`, async ({ page }) => {
      await gotoHomepage(page)

      const button = page.locator("#check").getByRole("button").first()
      await expect(button).toHaveText(l.checkFree)
      await expect(button).not.toHaveText(/Check it free/)

      // Empty-input validation message — a real conversion-path error state,
      // not a network round trip.
      await button.click()
      await expect(page.locator("#check")).toContainText(l.enterBrandModel)
      await expect(page.locator("#check")).not.toContainText("Enter a brand and model")
    })

    test(`a BUY result renders localised stat labels in ${locale}, not English`, async ({ page }) => {
      await gotoHomepage(page)
      const response = await search(page, "Nike Air Force 1")
      const body = await response.json()
      expect(body.verdict).toBe("BUY")

      const checker = page.locator("#check")
      await expect(checker.getByText(l.buyBelow, { exact: true })).toBeVisible()
      await expect(checker.getByText(l.marketPrice, { exact: true })).toBeVisible()
      await expect(checker.getByText("Buy-below", { exact: true })).toHaveCount(0)
      await expect(checker.getByText("Market price", { exact: true })).toHaveCount(0)
    })

    test(`the INSUFFICIENT_DATA refusal renders in ${locale}, not the English default`, async ({ page }) => {
      await gotoHomepage(page)
      const response = await search(page, "Thin Sample Sneaker")
      const body = await response.json()
      expect(body.verdict).toBe("INSUFFICIENT_DATA")

      const panel = page.getByTestId("riq-insufficient")
      await expect(panel).toBeVisible()
      await expect(panel).toContainText(l.insufficientStatement)
      await expect(panel).toContainText(l.insufficientNLabel)
      await expect(panel).not.toContainText("Not enough watched departures to price this yet.")

      // The "try one of these instead" row is a next step, not just text —
      // localised label, same three product names (brand/model names do not
      // translate).
      await expect(panel.getByText(l.tryTheseInstead)).toBeVisible()
      await expect(panel.getByRole("button", { name: "Nike Air Force 1" })).toBeVisible()
    })

    // W9: live-market-proof.tsx — the "Selling on Vinted this week" band.
    test(`the live market proof band renders localised copy in ${locale}, not English`, async ({ page }) => {
      await gotoHomepage(page)

      await expect(page.getByText(l.liveProofHeading, { exact: true })).toBeVisible()
      await expect(page.getByText(l.liveProofPlanAddsHeading, { exact: true })).toBeVisible()
      await expect(page.getByRole("link", { name: l.liveProofSeeHow })).toBeVisible()

      await expect(page.getByText("Selling on Vinted this week", { exact: true })).toHaveCount(0)
      await expect(page.getByText("What a plan adds, per model", { exact: true })).toHaveCount(0)
      await expect(page.getByRole("link", { name: "See how we calculate it →" })).toHaveCount(0)
    })

    // W9: extension-hero.tsx — the mock Chrome panel on the hero. Desktop
    // viewport only (`hidden md:block` in the component); the Playwright
    // chromium project here runs at Desktop Chrome's default size.
    test(`the extension panel mock renders localised copy in ${locale}, not English`, async ({ page }) => {
      await gotoHomepage(page)

      await expect(page.getByText(`${l.extHeroDomain} ·`, { exact: false })).toBeVisible()
      await expect(page.getByText(`${l.extHeroSize} 42 · ${l.extHeroCondition}`, { exact: true })).toBeVisible()
      await expect(page.getByText(l.extHeroMatched, { exact: false })).toBeVisible()
      await expect(page.getByText(l.extHeroCaption, { exact: false })).toBeVisible()

      await expect(page.getByText("vinted.es · listing", { exact: true })).toHaveCount(0)
      await expect(page.getByText("Size 42 · Very good", { exact: true })).toHaveCount(0)
      await expect(page.getByText("matched: Adidas Samba", { exact: true })).toHaveCount(0)
      await expect(page.getByText("most you can pay for your margin", { exact: true })).toHaveCount(0)
    })

    // W9: lib/watched-sample.ts — the honesty line under a real BUY/WATCH/SKIP
    // ("Nike Air Force 1" is BUY, sold_7d 120 / active_listings 300 in
    // e2e/mock-backend.mjs), not the extension-hero mock above.
    test(`the watched-sample honesty line renders localised in ${locale}, not English`, async ({ page }) => {
      await gotoHomepage(page)
      const response = await search(page, "Nike Air Force 1")
      const body = await response.json()
      expect(body.verdict).toBe("BUY")

      const checker = page.locator("#check")
      await expect(checker.getByText(l.watchedSampleHead, { exact: false })).toBeVisible()
      await expect(checker.getByText("In the listings we watched", { exact: false })).toHaveCount(0)
    })
  })
}
