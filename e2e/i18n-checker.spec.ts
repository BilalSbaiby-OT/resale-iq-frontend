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
 */

// Chromium treats `Accept-Language` as a browser-managed header: it ignores
// page.setExtraHTTPHeaders() for it (confirmed by inspecting the actual
// request — the override was silently dropped and every locale rendered
// English, which is exactly the class of false-green this suite exists to
// prevent). The context `locale` option is the one lever that actually
// changes the header Chromium sends, so that is what sets the market here.
const LOCALES: Record<string, { ctxLocale: string; checkFree: RegExp; buyBelow: string; marketPrice: string; tryTheseInstead: RegExp; insufficientStatement: string; insufficientNLabel: string; enterBrandModel: string }> = {
  fr: {
    ctxLocale: "fr-FR",
    checkFree: /Vérifier gratuitement/,
    buyBelow: "Prix d'achat max",
    marketPrice: "Prix de marché",
    tryTheseInstead: /Essayez plutôt/i,
    insufficientStatement: "Pas assez de départs observés pour chiffrer ceci.",
    insufficientNLabel: "observés, pas assez",
    enterBrandModel: "Indiquez une marque et un modèle",
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
  })
}
