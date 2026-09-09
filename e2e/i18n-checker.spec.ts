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
  // W19: (auth)/register — the post-signup funnel's highest-value surface.
  // See src/proxy.ts's W19 comment for why this route is reached via a
  // NEXT_LOCALE cookie rather than a `/<locale>` URL prefix.
  registerHeading: string
  registerSubmit: string
  registerEmailLabel: string
  registerPasswordLabel: string
  // src/lib/verdict-words.ts — the three English orphans caught on the live
  // /es hero at 390px on 2026-09-05: the verdict word itself ("BUY"), the
  // confidence band beside an already-translated label ("Confianza MEDIUM"),
  // and the catalogue category ("Sneakers"). Plus the backend-owned
  // confidence note, which is English prose the frontend re-states itself.
  verdictBuy: string
  confidenceMedium: string
  categorySneakers: string
  confidenceNoteFew: RegExp
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
    registerHeading: "Créez votre compte",
    registerSubmit: "Créer le compte",
    registerEmailLabel: "E-mail",
    registerPasswordLabel: "Mot de passe",
    verdictBuy: "ACHETER",
    confidenceMedium: "MOYENNE",
    categorySneakers: "Sneakers",
    confidenceNoteFew: /Seulement 11 départs comparables/,
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
    registerHeading: "Cree su cuenta",
    registerSubmit: "Crear cuenta",
    registerEmailLabel: "Correo electrónico",
    registerPasswordLabel: "Contraseña",
    verdictBuy: "COMPRA",
    confidenceMedium: "MEDIA",
    categorySneakers: "Zapatillas",
    confidenceNoteFew: /Solo 11 salidas comparables/,
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
    registerHeading: "Konto erstellen",
    registerSubmit: "Konto erstellen",
    registerEmailLabel: "E-Mail",
    registerPasswordLabel: "Passwort",
    verdictBuy: "KAUFEN",
    confidenceMedium: "MITTEL",
    categorySneakers: "Sneaker",
    confidenceNoteFew: /Nur 11 vergleichbare Abgänge/,
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
    registerHeading: "Crea il tuo account",
    registerSubmit: "Crea account",
    registerEmailLabel: "Email",
    registerPasswordLabel: "Password",
    verdictBuy: "COMPRA",
    confidenceMedium: "MEDIA",
    categorySneakers: "Sneakers",
    confidenceNoteFew: /Solo 11 uscite comparabili/,
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
    registerHeading: "Crie a sua conta",
    registerSubmit: "Criar conta",
    registerEmailLabel: "Email",
    registerPasswordLabel: "Palavra-passe",
    verdictBuy: "COMPRAR",
    confidenceMedium: "MÉDIA",
    categorySneakers: "Ténis",
    confidenceNoteFew: /Apenas 11 saídas comparáveis/,
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

      // Landing prefills Nike Air Force 1 Low. Empty-input is still the conversion
      // error state — clear the field first so we are testing that, not the hero.
      await page.locator("#check").getByRole("textbox").fill("")
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

    // The three orphans an external review found on the live /es hero at 390px,
    // 2026-09-05: a 26px green "BUY", "Confianza MEDIUM" and "Sneakers", all
    // English inside a fully translated Spanish card — plus the amber
    // "Only 11 watched departures" underneath it. "Nike Air Force 1 Low" is
    // the fixture that reproduces all four at once (BUY / MEDIUM / Sneakers /
    // an "Only N" note), which is why it stayed in the mock catalogue after
    // being retired as the hero seed.
    test(`the verdict word, confidence band, category and note render in ${locale}, not English`, async ({ page }) => {
      await gotoHomepage(page)
      const response = await search(page, "Nike Air Force 1 Low")
      const body = await response.json()
      expect(body.verdict).toBe("BUY")
      expect(body.confidence).toBe("MEDIUM")

      const checker = page.locator("#check")
      await expect(checker.getByText(l.verdictBuy, { exact: true })).toBeVisible()
      await expect(checker).toContainText(l.confidenceMedium)
      await expect(checker).toContainText(l.categorySneakers)
      await expect(checker).toContainText(l.confidenceNoteFew)

      // ...and the English source strings are gone. A new untranslated verdict
      // word goes red here instead of shipping onto the homepage quietly.
      await expect(checker.getByText("BUY", { exact: true })).toHaveCount(0)
      await expect(checker).not.toContainText("Confidence MEDIUM")
      await expect(checker).not.toContainText("Only 11 comparable departures")
      await expect(checker).not.toContainText("Only 11 watched departures")
      // fr and it genuinely use "Sneakers" as the native word, so an absence
      // assertion there would be asserting a translation we did not make.
      if (l.categorySneakers !== "Sneakers") {
        await expect(checker).not.toContainText(/\bSneakers\b/)
      }
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
      // localised label; chips lead with New Balance 530 (live WATCH). Brand/
      // model names do not translate.
      await expect(panel.getByText(l.tryTheseInstead)).toBeVisible()
      await expect(panel.getByRole("button", { name: "New Balance 530" })).toBeVisible()
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

    // W19: the highest-commitment moment on the site — a visitor who reads a
    // translated pitch and clicks a CTA off it must not land on an English
    // form. `gotoHomepage` first (not a direct `page.goto("/register")`) so
    // the NEXT_LOCALE cookie src/proxy.ts stamps on "/" is set before the
    // navigation to /register — that cookie, not this route's own URL, is
    // what src/proxy.ts's COOKIE_LOCALE_PATHS reads (see its W19 comment).
    test(`the register form renders localised in ${locale}, not English`, async ({ page }) => {
      await gotoHomepage(page)
      const res = await page.goto("/register")
      expect(res?.ok()).toBeTruthy()

      await expect(page.locator("html")).toHaveAttribute("lang", locale)
      await expect(page.getByRole("heading", { name: l.registerHeading })).toBeVisible()
      await expect(page.getByRole("button", { name: l.registerSubmit })).toBeVisible()
      await expect(page.getByText(l.registerEmailLabel, { exact: true })).toBeVisible()
      await expect(page.getByText(l.registerPasswordLabel, { exact: true })).toBeVisible()
      await expect(page.getByRole("heading", { name: "Create your account" })).toHaveCount(0)

      // The EU 14-day withdrawal-waiver consent is a legal string, not
      // marketing copy — src/lib/i18n.ts's WITHDRAWAL_WAIVER_TEXT comment and
      // the W19 workboard entry: render it in English on every locale until
      // legal-compliance signs off on translated wording, rather than ship a
      // guessed translation of a consent. Assert it is present, in English,
      // on every locale — a silent translation of this string later must
      // fail this test, not slip through as "some native text exists."
      await expect(page.getByText(
        "I want access immediately and I understand that by starting the subscription now I lose my 14-day right of withdrawal.",
      )).toBeVisible()
    })
  })
}
