import { expect, test } from "@playwright/test"
import { captureTrackEvents } from "./track-events"

/**
 * The bug this file exists to close: localized routes with no test coverage
 * shipped 24/24 green (commit 44704fc) while three of five markets served
 * English and the URL/hreflang/lang layer did not exist at all (commit
 * 9ae467d). Every assertion here reads the actual served response — not the
 * dictionary source — because a passing dictionary test previously coexisted
 * with a broken page.
 */

const LOCALES: Array<{ path: string; lang: string; signIn: RegExp }> = [
  { path: "/es", lang: "es", signIn: /Entrar/ },
  { path: "/fr", lang: "fr", signIn: /Connexion|Se connecter/ },
  { path: "/de", lang: "de", signIn: /Anmelden/ },
  { path: "/it", lang: "it", signIn: /Accedi/ },
  { path: "/pt", lang: "pt", signIn: /Entrar/ },
]

for (const { path, lang, signIn } of LOCALES) {
  test(`${path} serves its own language, not English`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.ok()).toBeTruthy()

    // <html lang> must match the served locale (was "en" on every page,
    // including this one, before this branch).
    const htmlLang = await page.locator("html").getAttribute("lang")
    expect(htmlLang).toBe(lang)

    await expect(page.locator("#check")).toBeVisible()
    await expect(page.getByRole("link").filter({ hasText: signIn }).first()).toBeVisible()

    // Reciprocal hreflang: this page must declare itself AND every sibling,
    // including x-default pointing at the English root. A one-way hreflang
    // is ignored by Google, so this checks all six links exist together.
    const hreflangs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(
      (els) => els.map((el) => ({
        hreflang: el.getAttribute("hreflang"),
        href: el.getAttribute("href"),
      }))
    )
    const byLang = Object.fromEntries(hreflangs.map((h) => [h.hreflang, h.href]))
    expect(byLang.en).toBe("https://resaleiq.dev")
    expect(byLang.es).toBe("https://resaleiq.dev/es")
    expect(byLang.fr).toBe("https://resaleiq.dev/fr")
    expect(byLang.de).toBe("https://resaleiq.dev/de")
    expect(byLang.it).toBe("https://resaleiq.dev/it")
    expect(byLang.pt).toBe("https://resaleiq.dev/pt")
    expect(byLang["x-default"]).toBe("https://resaleiq.dev")
  })
}

test("/ always serves English regardless of who last requested it", async ({ page }) => {
  const res = await page.goto("/")
  expect(res?.ok()).toBeTruthy()
  const htmlLang = await page.locator("html").getAttribute("lang")
  expect(htmlLang).toBe("en")
  await expect(page.locator("#check")).toBeVisible()
  // "/" carries the same reciprocal hreflang set as every locale sibling.
  const es = await page.locator('link[rel="alternate"][hreflang="es"]').getAttribute("href")
  expect(es).toBe("https://resaleiq.dev/es")
  const xDefault = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute("href")
  expect(xDefault).toBe("https://resaleiq.dev")
})

test("/en 404s -- English is unprefixed at \"/\", not duplicated at \"/en\"", async ({ page }) => {
  const res = await page.goto("/en")
  expect(res?.status()).toBe(404)
})

/**
 * #65 gave signed-out /calculator the public fee tool and correctly passed
 * `locale` into PublicProfitCalculator -- but left the page's own <h1> and
 * subtitle as English literals. Live result on 44d6ccc: /es/calculator served
 * "Precio de compra (€)" under the heading "Profit calculator", in all five
 * non-English markets. The form was translated and the chrome above it was
 * not, which is the half-translated surface this suite exists to catch.
 *
 * How the locale actually reaches this page, which is worth stating because
 * the first version of this test got it wrong: /calculator is in
 * APP_LOCALE_PREFIXES (src/proxy.ts), so the proxy reads the NEXT_LOCALE
 * cookie and stamps `x-resaleiq-locale` itself. Setting that header on the
 * request does nothing -- the proxy overwrites it. The cookie is the input,
 * and it is the same one production sets on any /<locale> visit, which is why
 * /es/calculator (a 307 to /calculator) served Spanish form labels at all.
 */
const CALC_TITLES: Array<{ locale: string; title: string }> = [
  { locale: "es", title: "Calculadora de beneficios" },
  { locale: "fr", title: "Calculateur de profit" },
  { locale: "de", title: "Gewinnrechner" },
  { locale: "it", title: "Calcolatore di profitto" },
  { locale: "pt", title: "Calculadora de lucro" },
]

for (const { locale, title } of CALC_TITLES) {
  test(`signed-out /calculator heading is ${locale}, not English`, async ({ page, baseURL }) => {
    await page.context().addCookies([
      { name: "NEXT_LOCALE", value: locale, url: baseURL! },
    ])
    const res = await page.goto("/calculator")
    expect(res?.ok()).toBeTruthy()

    const h1 = page.getByRole("heading", { level: 1 })
    await expect(h1).toHaveText(title)
    // The exact literal #65 shipped. Asserting its absence is what makes this
    // a regression test rather than a restatement of the dictionary.
    await expect(h1).not.toHaveText(/Profit calculator/i)

    // The form under it was already translated; it must stay that way, so a
    // future "fix" cannot pass by making the whole page English again.
    await expect(page.getByTestId("riq-calc-result")).toHaveCount(0)
    await expect(page.getByRole("button").first()).toBeVisible()
  })
}

test("a browser preferring German is redirected from \"/\" to \"/de\" (307, not a silent swap)", async ({ request }) => {
  const res = await request.get("/", {
    headers: { "Accept-Language": "de-DE,de;q=0.9" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(307)
  expect(res.headers()["location"]).toMatch(/\/de$/)
})

test("\"/de\" serves German even when the browser prefers English -- the URL is canonical, not the header", async ({ request }) => {
  const res = await request.get("/de", { headers: { "Accept-Language": "en-US,en;q=0.9" } })
  expect(res.ok()).toBeTruthy()
  const body = await res.text()
  expect(body).toMatch(/<html lang="de"/)
  expect(body).toMatch(/Wissen, was du zahlen solltest/)
})

test("a visitor who already chose English is not bounced back to \"/de\" on a later visit", async ({ request }) => {
  const first = await request.get("/", { headers: { "Accept-Language": "de-DE" }, maxRedirects: 0 })
  expect(first.status()).toBe(307)
  const cookie = first.headers()["set-cookie"]
  expect(cookie).toMatch(/NEXT_LOCALE=de/)

  // Same request but with an explicit NEXT_LOCALE=en cookie (as if the
  // visitor had switched back to English) must NOT redirect again.
  const second = await request.get("/", {
    headers: { "Accept-Language": "de-DE", Cookie: "NEXT_LOCALE=en" },
    maxRedirects: 0,
  })
  expect(second.status()).toBe(200)
})

test("sitemap.xml lists every locale homepage with reciprocal alternates", async ({ request }) => {
  const res = await request.get("/sitemap.xml")
  expect(res.ok()).toBeTruthy()
  const xml = await res.text()
  for (const locale of ["es", "fr", "de", "it", "pt"]) {
    expect(xml).toContain(`<loc>https://resaleiq.dev/${locale}</loc>`)
  }
  // Every locale entry must declare all five siblings + en + x-default (7
  // hreflang links) reciprocally -- not just point at English.
  const deBlock = xml.split("<loc>https://resaleiq.dev/de</loc>")[1]?.split("</url>")[0] || ""
  for (const hreflang of ["en", "es", "fr", "de", "it", "pt", "x-default"]) {
    expect(deBlock).toContain(`hreflang="${hreflang}"`)
  }
})

// ---------------------------------------------------------------------------
// REGRESSION: an English speaker with a second language must get English.
//
// detectLocale() used to test only fr/es/de/it/pt inside its loop and fall
// through to "en" afterwards. That reads like "default to English" and is not:
// it walked the visitor's ENTIRE preference list and returned the first
// non-English match anywhere in it. `Accept-Language: en-GB,es-ES` -- an
// English speaker who merely has Spanish configured -- got Spanish, and the
// NEXT_LOCALE cookie then pinned it for a year.
//
// Found 2026-09-01 by walking the funnel in a real browser: /register rendered
// fully in Spanish ("Cree su cuenta", "Crear cuenta") with no language switcher,
// for a visitor arriving from the English homepage. Server-side curl saw
// English, so this was invisible to every check that did not run a browser.
// Three visitors reached /register that day and none signed up.
//
// Both directions are asserted on purpose. Serving English to everyone would
// "fix" this test and break the five markets we actually sell to.
// ---------------------------------------------------------------------------
test("an English-first visitor with a second language gets English, not the second language", async ({ request }) => {
  const res = await request.get("/register", {
    headers: { "Accept-Language": "en-GB,es-ES;q=0.9" },
  })
  expect(res.status()).toBe(200)
  const html = await res.text()
  expect(html).toContain('lang="en"')
  expect(html).not.toContain("Cree su cuenta")
})

// Asserted on "/" and NOT on "/register", which is where I first wrote it and
// where it was WRONG. `src/proxy.ts`'s W19 comment documents that a cookie-less
// direct visit to /register serves English deliberately -- the four unprefixed
// auth routes read NEXT_LOCALE, and a visitor arriving from an email link or a
// bookmark has no cookie to read. My original version asserted behaviour the
// system does not have and never claimed to, so it failed on main from the
// moment I wrote it. `frontend-eng` caught it rather than quietly rewriting
// proxy.ts to satisfy a bad test, which is the failure this comment exists to
// prevent next time.
//
// "/" is where locale is actually decided, so it is where the guarantee lives:
// a Spanish speaker must still be sent to Spanish. This is the half that would
// break if anyone "fixed" the English-first bug by serving English to everyone.
test("a genuine Spanish-first visitor is still routed to Spanish", async ({ request }) => {
  const res = await request.get("/", {
    headers: { "Accept-Language": "es-ES,es;q=0.9,en;q=0.8" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(307)
  expect(res.headers()["location"]).toContain("/es")
})

// ---------------------------------------------------------------------------
// W61: only the homepage is translated. Verified live 2026-09-02 that every
// deeper locale path -- /es/pricing, /es/blog, /es/methodology, /es/deals,
// /es/terms, same for fr/de/it/pt -- 404'd, on the only five markets we
// sell to. src/app/[locale]/[...rest]/page.tsx closes it: a locale-prefixed
// deep path now redirects to its real page instead of a dead end. Asserted
// per-status, not just "not 404" -- a 200 here would mean the catch-all
// swallowed the request instead of redirecting it.
//
// 2026-09-02, 621e25f: /methodology stopped being an untranslated path. It now
// has a real page in all six locales, so /es/methodology and /de/methodology
// legitimately serve 200 with Spanish and German bodies and this test kept
// asserting the redirect they no longer do -- it failed on main from the merge
// onward. The list below is now only paths that genuinely have no translation.
// The translated ones moved to their own test rather than being deleted: the
// case that matters is that a 200 here is the *right* answer for a translated
// path and the *wrong* answer for an untranslated one, and only asserting both
// keeps that distinction.
// ---------------------------------------------------------------------------
test("a locale-prefixed deep path that has no translation redirects to the real page instead of 404ing", async ({ request }) => {
  for (const path of ["/es/blog", "/es/terms", "/es/deals", "/fr/blog", "/de/terms"]) {
    const res = await request.get(path, { maxRedirects: 0 })
    expect(res.status(), path).toBe(307)
    const location = res.headers()["location"]
    expect(location, path).not.toMatch(/^\/[a-z]{2}\//) // must have shed the locale prefix
  }
})

// A translated path must NOT be swallowed by the catch-all redirect. If this
// starts 307ing again it means the locale page was lost and Spanish visitors
// are being handed the English methodology, which is the regression 621e25f
// shipped to end.
test("a locale-prefixed path that IS translated serves its own page, not a redirect", async ({ request }) => {
  for (const path of ["/es/methodology", "/fr/methodology", "/de/methodology", "/it/methodology", "/pt/methodology"]) {
    const res = await request.get(path, { maxRedirects: 0 })
    expect(res.status(), path).toBe(200)
  }
})

// These two asserted a 307 to "/<locale>#pricing", which was correct while
// /pricing was itself only a redirect to an anchor. It is a real page now
// (src/app/pricing/page.tsx + src/app/[locale]/pricing/page.tsx), so the five
// translated markets get the real page rather than a locale-flavoured anchor.
// The thing worth guarding is unchanged and still asserted: a Spanish visitor
// must not be handed English.
test("/es/pricing serves the Spanish pricing page, not a redirect and not English", async ({ page }) => {
  const res = await page.goto("/es/pricing")
  expect(res?.status()).toBe(200)
  expect(page.url()).toMatch(/\/es\/pricing$/)
  // EX-PRICING-OFFER — Spanish mirror of the locked flips offer.
  await expect(page.locator("h1")).toContainText(/Encuentra flips rentables/i)
  await expect(page.locator("section.riq-pricing")).toContainText(/BUY \/ WATCH \/ SKIP/)
  await expect(page.locator("section.riq-pricing")).toContainText(/19 €/)
  await expect(page.getByTestId("riq-starter-trust")).toContainText(/anuncios seguidos/)
  await expect(page.getByTestId("riq-public-data-line")).toContainText(/Solo datos públicos \(no comprobaciones de artículos\)/)
  await expect(page.locator("html")).toHaveAttribute("lang", "es")
})

test("/fr/pricing serves the French pricing page, not a redirect and not English", async ({ page }) => {
  const res = await page.goto("/fr/pricing")
  expect(res?.status()).toBe(200)
  expect(page.url()).toMatch(/\/fr\/pricing$/)
  await expect(page.locator("h1")).toContainText(/Trouvez des flips rentables/i)
})

test("all five locale pricing routes serve their own page", async ({ request }) => {
  for (const path of ["/es/pricing", "/fr/pricing", "/de/pricing", "/it/pricing", "/pt/pricing"]) {
    const res = await request.get(path, { maxRedirects: 0 })
    expect(res.status(), path).toBe(200)
  }
})

test("a deep path under an unsupported locale segment still 404s -- the catch-all does not widen PATH_LOCALES", async ({ request }) => {
  const res = await request.get("/en/pricing")
  expect(res.status()).toBe(404)
})

// ---------------------------------------------------------------------------
// W61, second half of the same finding: the free checker's own LIMIT_REACHED
// CTA linked "/#pricing" -- an ABSOLUTE path to the ENGLISH root. A Spanish
// visitor who ran out of daily free checks and clicked "Ver planes" was sent
// to the English homepage mid-funnel, exactly the failure the founder named
// ("clicks anything, and the entire rest of the site is English"). Fixed in
// free-checker.tsx with canonicalPath(locale). Proven end to end here, not
// just read from source: exhaust the real quota through the mock backend,
// trigger the real LIMIT_REACHED render, and check the real href.
// ---------------------------------------------------------------------------
async function exhaustQuotaAndReachLimit(page: import("@playwright/test").Page, homePath: string) {
  const res = await page.goto(homePath)
  expect(res?.ok()).toBeTruthy()
  // Send 25 pre-requests so the quota (FREE_VERDICT_DAILY_LIMIT=10) is
  // exhausted even if ~14 are dropped by the Next.js dev-server proxy under
  // parallel CI workers (ECONNRESET at the proxy level; tracked failures 2026-09-16).
  for (let i = 0; i < 25; i++) {
    await page.request.get(`/api/verdict?q=${encodeURIComponent("Nike Air Force 1")}`)
  }
  const responsePromise = page.waitForResponse((r) => r.url().includes("/api/verdict"))
  await page.locator("#check").getByRole("textbox").fill("Nike Air Force 1")
  await page.locator("#check").getByRole("button").first().click()
  const body = await (await responsePromise).json()
  expect(body.verdict).toBe("LIMIT_REACHED")
}

test("an exhausted Spanish visitor's free-account link stays on /es — H47 LIMIT_REACHED upgrade", async ({ page }) => {
  await exhaustQuotaAndReachLimit(page, "/es")
  // H47 replaced the old "Ver planes → /#pricing" secondary link with a GuestCheckoutButton
  // (primary paid CTA) + a locale-aware "create free account" link (secondary).
  // The locale regression we guard: the free-account link must point to /es/register,
  // not the English /register, so a Spanish visitor stays in their locale path.
  const upgrade = page.getByTestId("riq-limit-reached-upgrade")
  await expect(upgrade).toBeVisible()
  const freeAccountLink = page.getByRole("link", { name: /cuenta gratis/i })
  await expect(freeAccountLink).toHaveAttribute("href", /^\/es\/register/)
})

test("an exhausted French visitor's free-account link stays on /fr — H47 LIMIT_REACHED upgrade", async ({ page }) => {
  await exhaustQuotaAndReachLimit(page, "/fr")
  // Same locale regression guard as the Spanish test above.
  const upgrade = page.getByTestId("riq-limit-reached-upgrade")
  await expect(upgrade).toBeVisible()
  const freeAccountLink = page.getByRole("link", { name: /compte gratuit/i })
  await expect(freeAccountLink).toHaveAttribute("href", /^\/fr\/register/)
})

test("an exhausted English visitor sees the H47 LIMIT_REACHED upgrade card with paid CTA", async ({ page }) => {
  await exhaustQuotaAndReachLimit(page, "/")
  // H47 removed the old bare "See plans → /#pricing" anchor and replaced with
  // GuestCheckoutButton (green paid CTA) + "Create a free account →" link.
  // Guard: upgrade card renders and the free account link goes to /register (no locale prefix).
  const upgrade = page.getByTestId("riq-limit-reached-upgrade")
  await expect(upgrade).toBeVisible()
  const freeAccountLink = page.getByRole("link", { name: /free account/i })
  await expect(freeAccountLink).toHaveAttribute("href", /^\/register/)
})

// Funnel events were keyed on the raw pathname, so every locale-prefixed visit
// was invisible to the funnel. Measured on production 2026-09-06: the
// `pageviews` table holds 7 rows for "/es/register" and every one has
// `event IS NULL` -- signup_started never once fired for a Spanish visitor,
// and "/es" had the same hole against landing_view. That silently understated
// the top of the funnel by every non-English visit, which is exactly the
// measurement the register-form change depends on.
async function funnelEvents(page: import("@playwright/test").Page, url: string) {
  const events = captureTrackEvents(page)
  await page.goto(url)
  await expect.poll(() => events.length, { timeout: 10_000 }).toBeGreaterThan(0)
  return events
}

for (const prefix of ["", "/es", "/fr", "/de", "/it", "/pt"]) {
  test(`signup_started fires on ${prefix || ""}/register`, async ({ page }) => {
    expect(await funnelEvents(page, `${prefix}/register`)).toContain("signup_started")
  })
}

test("landing_view fires on /es, not only on /", async ({ page }) => {
  expect(await funnelEvents(page, "/es")).toContain("landing_view")
})

// The guard on stripLocalePrefix: a two-letter segment that is not a locale
// must not be eaten. /pt is Portuguese; a page named /pricing is not.
test("signup_started does not fire on a non-register page", async ({ page }) => {
  expect(await funnelEvents(page, "/es/pricing")).not.toContain("signup_started")
})
