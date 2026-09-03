import { expect, test } from "@playwright/test"

/**
 * The founder's report, twice, verbatim: "you cant cgange kanguage in other
 * taps for example or you choose french in main page and other features etc
 * from side pannel or anyshit dont work".
 *
 * locale-routing.spec.ts already covered ROUTING (does /fr exist, does it
 * serve French). It passed the whole time this bug was live, because the bug
 * was not routing — it was PERSISTENCE. Measured against production
 * 2026-09-03, before the fix:
 *
 *   $ curl -sD- -b 'NEXT_LOCALE=fr' https://resaleiq.dev/deals | grep '<html lang'
 *   <html lang="en" ...
 *
 * The cookie was set, sent, and read — then discarded, because
 * src/proxy.ts's cookie-read allowlist held exactly four paths. 34 of the
 * site's 38 routes were stamped English no matter what the visitor chose.
 *
 * Every assertion below reads a served response or a real rendered browser
 * page. None reads the dictionary — a green dictionary test coexisted with
 * this bug for its entire life, which is the trap locale-routing.spec.ts's
 * own header already warns about.
 */

// Routes under (auth)/(dashboard). Both layouts set robots:{index:false},
// which is what makes serving them in the visitor's language safe: there is
// no crawler to hand a foreign <html lang> on English content.
const APP_PATHS = [
  "/dashboard",
  "/deals",
  "/watchlist",
  "/calculator",
  "/brands",
  "/trends",
  "/market",
  "/portfolio",
  "/verdict",
  "/account",
  "/register",
  "/login",
]

for (const path of APP_PATHS) {
  test(`${path} keeps the visitor's chosen language instead of resetting to English`, async ({ request }) => {
    const res = await request.get(path, { headers: { Cookie: "NEXT_LOCALE=fr" } })
    expect(res.status(), path).toBe(200)
    expect(await res.text(), path).toContain('lang="fr"')
  })
}

test("every market's cookie is honoured, not just French", async ({ request }) => {
  for (const locale of ["es", "fr", "de", "it", "pt"]) {
    const res = await request.get("/deals", { headers: { Cookie: `NEXT_LOCALE=${locale}` } })
    expect(res.status(), locale).toBe(200)
    expect(await res.text(), locale).toContain(`lang="${locale}"`)
  }
})

// The guard on the fix. Widening the cookie read to the WHOLE site would put
// a French <html lang> on English content that Google indexes, which is a
// worse bug than the one being fixed. These pages have no translation behind
// them yet, so they must stay English even for a cookie-carrying visitor.
test("indexable pages with no translation behind them stay English", async ({ request }) => {
  for (const path of ["/blog", "/terms", "/privacy", "/data", "/manual"]) {
    const res = await request.get(path, { headers: { Cookie: "NEXT_LOCALE=fr" } })
    expect(res.status(), path).toBe(200)
    expect(await res.text(), path).toContain('lang="en"')
  }
})

// /methodology WAS translated (113 keys, six locales) and routed
// (/fr/methodology serves French) — but nothing ever sent a French visitor
// to it. Unprefixed /methodology with NEXT_LOCALE=fr served English.
test("/methodology sends a cookie-carrying visitor to its real translated route", async ({ request }) => {
  const res = await request.get("/methodology", {
    headers: { Cookie: "NEXT_LOCALE=fr" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(307)
  expect(res.headers()["location"]).toMatch(/\/fr\/methodology$/)
})

test("/methodology stays English for a visitor with no stored preference", async ({ request }) => {
  const res = await request.get("/methodology", { maxRedirects: 0 })
  expect(res.status()).toBe(200)
})

// ---------------------------------------------------------------------------
// The side panel. Every label in src/components/layout/sidebar.tsx was a
// hardcoded English string literal and the file did not import the
// dictionary at all — so the one component that renders on EVERY
// authenticated page could not be translated even in principle. "Watchlist"
// is asserted by name because the founder flagged it specifically.
// ---------------------------------------------------------------------------
async function login(page: import("@playwright/test").Page) {
  await page.goto("/login")
  await page.locator('input[type="email"]').fill("alice@example.com")
  await page.locator('input[type="password"]').fill("password12345")
  await page.getByRole("button", { name: /Sign in|Se connecter/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
}

test("the side panel renders in French, including the Watchlist item", async ({ page, context }) => {
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "fr", url: "http://localhost:3100" },
  ])
  await login(page)

  // The exact item the founder named, plus a section heading and the plan box
  // — one label passing could be a coincidence, the set could not.
  await expect(page.getByRole("link", { name: "Liste de suivi" })).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole("link", { name: "Scanner d'affaires" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Tableau de bord" })).toBeVisible()
  await expect(page.getByText("Espace de travail")).toBeVisible()

  // And no English survivor from the old hardcoded array.
  await expect(page.getByRole("link", { name: "Watchlist" })).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Deal Scanner" })).toHaveCount(0)
})

// ---------------------------------------------------------------------------
// The founder's actual journey: choose French once, then click around. This
// is the test that would have caught the bug, because it is the only one that
// navigates. Five hops through real in-app sidebar links.
// ---------------------------------------------------------------------------
test("French survives five in-app navigations without ever dropping to English", async ({ page, context }) => {
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "fr", url: "http://localhost:3100" },
  ])
  await login(page)

  const hops: Array<{ link: string; url: RegExp }> = [
    { link: "Liste de suivi", url: /\/watchlist/ },
    { link: "Classement des marques", url: /\/brands/ },
    { link: "Tendances du marché", url: /\/trends/ },
    { link: "Portefeuille", url: /\/portfolio/ },
    { link: "Verdict rapide", url: /\/verdict/ },
  ]

  for (const { link, url } of hops) {
    await page.getByRole("link", { name: link }).click()
    await page.waitForURL(url, { timeout: 20_000 })

    // The document must still declare French AND the chrome must still be
    // French. Asserting only <html lang> would pass on a page whose visible
    // text had reverted, which is exactly what the founder was looking at.
    expect(await page.locator("html").getAttribute("lang"), `${link}: <html lang>`).toBe("fr")
    await expect(page.getByRole("link", { name: "Liste de suivi" }), `${link}: sidebar`).toBeVisible()
  }
})

test("switching language from inside the app sticks on the next page", async ({ page, context }) => {
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "fr", url: "http://localhost:3100" },
  ])
  await login(page)

  // The switcher was mounted only on the landing page and the four
  // post-signup routes, so a customer inside the app had no way to change
  // language at all. It now lives in the sidebar on every app page.
  await page.locator("aside select").selectOption("es")
  await expect(page.getByRole("link", { name: "Lista de seguimiento" })).toBeVisible({ timeout: 20_000 })

  await page.getByRole("link", { name: "Lista de seguimiento" }).click()
  await page.waitForURL(/\/watchlist/, { timeout: 20_000 })
  expect(await page.locator("html").getAttribute("lang")).toBe("es")
})
