import { expect, test } from "@playwright/test"

/**
 * The bug this file exists to close: localized routes with no test coverage
 * shipped 24/24 green (commit 44704fc) while three of five markets served
 * English and the URL/hreflang/lang layer did not exist at all (commit
 * 9ae467d). Every assertion here reads the actual served response — not the
 * dictionary source — because a passing dictionary test previously coexisted
 * with a broken page.
 */

const LOCALES: Array<{ path: string; lang: string; h1: RegExp }> = [
  { path: "/es", lang: "es", h1: /Sabe qué pagar antes de comprar/ },
  { path: "/fr", lang: "fr", h1: /Sachez quoi payer avant d.acheter/ },
  { path: "/de", lang: "de", h1: /Wissen, was du zahlen solltest/ },
  { path: "/it", lang: "it", h1: /Sappi quanto pagare prima di comprare/ },
  { path: "/pt", lang: "pt", h1: /Saiba quanto pagar antes de comprar/ },
]

for (const { path, lang, h1 } of LOCALES) {
  test(`${path} serves its own language, not English`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.ok()).toBeTruthy()

    // <html lang> must match the served locale (was "en" on every page,
    // including this one, before this branch).
    const htmlLang = await page.locator("html").getAttribute("lang")
    expect(htmlLang).toBe(lang)

    await expect(page.locator("h1")).toHaveText(h1)

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
  await expect(page.locator("h1")).toHaveText(/Know what to pay before you buy/)
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
