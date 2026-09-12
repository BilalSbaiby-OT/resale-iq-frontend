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
  await page.waitForURL(/\/verdict/, { timeout: 20_000 })
}

test("the side panel renders in French, collapsed to Check / Finds / Account", async ({ page, context }) => {
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "fr", url: "http://localhost:3100" },
  ])
  await login(page)

  await expect(page.getByRole("link", { name: "Vérifier" })).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole("link", { name: "Offres" })).toBeVisible()
  await expect(page.locator("aside").getByRole("link", { name: "Compte" })).toBeVisible()

  await expect(page.getByRole("link", { name: "Watchlist" })).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Deal Scanner" })).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Check" })).toHaveCount(0)
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
    { link: "Offres", url: /\/deals/ },
    { link: "Compte", url: /\/account/ },
    { link: "Vérifier", url: /\/verdict/ },
  ]

  for (const { link, url } of hops) {
    await page.locator("aside").getByRole("link", { name: link }).click()
    await page.waitForURL(url, { timeout: 20_000 })

    expect(await page.locator("html").getAttribute("lang"), `${link}: <html lang>`).toBe("fr")
    await expect(page.locator("aside").getByRole("link", { name: "Vérifier" }), `${link}: sidebar`).toBeVisible()
  }

  await page.goto("/watchlist")
  expect(await page.locator("html").getAttribute("lang")).toBe("fr")
  await expect(page.locator("aside").getByRole("link", { name: "Vérifier" })).toBeVisible()
  await page.goto("/brands")
  expect(await page.locator("html").getAttribute("lang")).toBe("fr")
  await expect(page.locator("aside").getByRole("link", { name: "Vérifier" })).toBeVisible()
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
  await expect(page.locator("aside").getByRole("link", { name: "Consultar" })).toBeVisible({ timeout: 20_000 })

  await page.locator("aside").getByRole("link", { name: "Cuenta" }).click()
  await page.waitForURL(/\/account/, { timeout: 20_000 })
  await page.getByRole("link", { name: "Lista de seguimiento" }).click()
  await page.waitForURL(/\/watchlist/, { timeout: 20_000 })
  expect(await page.locator("html").getAttribute("lang")).toBe("es")
})

// ---------------------------------------------------------------------------
// A SWITCHER ON EVERY LOCALISED ROUTE.
//
// The control existed and worked, but was rendered on only 5 surfaces
// (landing, register, check-email, verify-email, dashboard). Every other
// route — including all 14 the dashboard side panel navigates to — had no way
// to change language at all. It is now mounted once in the sidebar (app) and
// once in (auth)/layout.tsx, so a new route in either group cannot ship
// without one.
//
// Asserted per-route rather than "it exists somewhere", because per-route is
// exactly the distinction that was wrong: /dashboard HAD a switcher while
// /deals, one click away in the same side panel, did not.
// ---------------------------------------------------------------------------
const AUTH_ROUTES_WITH_SWITCHER = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/check-email",
]

for (const path of AUTH_ROUTES_WITH_SWITCHER) {
  test(`${path} offers a language switcher`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('select[aria-label="Language"]')).toBeVisible({ timeout: 20_000 })
  })
}

test("the auth switcher actually changes the language, it is not inert", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()

  await page.locator('select[aria-label="Language"]').selectOption("fr")

  // A full navigation, so the proxy re-reads the cookie — asserting the
  // rendered heading, not just the dropdown value, because the bug this
  // guards against is a control that updates itself and nothing else.
  await expect(page.getByRole("heading", { name: "Bon retour" })).toBeVisible({ timeout: 20_000 })
  expect(await page.locator("html").getAttribute("lang")).toBe("fr")
})

test("every side-panel destination offers a switcher, not just /dashboard", async ({ page, context }) => {
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "fr", url: "http://localhost:3100" },
  ])
  await login(page)

  for (const path of ["/dashboard", "/watchlist", "/brands", "/trends", "/portfolio", "/verdict"]) {
    await page.goto(path)
    await expect(
      page.locator('aside select[aria-label="Language"]'),
      `${path} has no language switcher`,
    ).toBeVisible({ timeout: 20_000 })
  }
})

// ---------------------------------------------------------------------------
// BUG 1, the worst instance: "/" itself ignored a returning visitor's stored
// language. Measured live 2026-09-04 with `curl -b "NEXT_LOCALE=fr"
// https://resaleiq.dev/`: <html lang="en">, reproduced 3x, not a cache
// artifact. src/app/page.tsx always renders English by design (the real
// French homepage is src/app/[locale]/page.tsx at "/fr") -- "/" was simply
// never on any list that sends a returning cookie-holder there. A visitor
// who picked French, then clicked the logo or "home", was bounced straight
// back to English.
//
// Same failure reached /check and /tools -- the acquisition path: the one
// UTM-attributed signup this company has ever had landed on /fr, a French
// visitor. Losing the language between "/" and the free checker loses the
// customer.
// ---------------------------------------------------------------------------
test("a returning visitor with NEXT_LOCALE=fr is sent from \"/\" to \"/fr\", not served English", async ({ request }) => {
  const res = await request.get("/", { headers: { Cookie: "NEXT_LOCALE=fr" }, maxRedirects: 0 })
  expect(res.status()).toBe(307)
  expect(res.headers()["location"]).toMatch(/\/fr$/)
})

test("every market's cookie sends \"/\" to its own locale root, not just French", async ({ request }) => {
  for (const locale of ["es", "fr", "de", "it", "pt"]) {
    const res = await request.get("/", { headers: { Cookie: `NEXT_LOCALE=${locale}` }, maxRedirects: 0 })
    expect(res.status(), locale).toBe(307)
    expect(res.headers()["location"], locale).toMatch(new RegExp(`/${locale}$`))
  }
})

// /check has no content of its own (client redirect to /verdict or /tools) --
// asserted anyway so <html lang> does not flash English for the instant it
// is on screen mid-hop.
test("/check carries the stored language instead of defaulting to English", async ({ request }) => {
  const res = await request.get("/check", { headers: { Cookie: "NEXT_LOCALE=fr" } })
  expect(res.status()).toBe(200)
  expect(await res.text()).toContain('lang="fr"')
})

// /tools is the top-of-funnel page a checked-out visitor actually reads: the
// hero (h1/lede) and the free-checker widget are translated; the deeper
// search-intent cards are not (real content task, out of scope -- see
// src/app/tools/page.tsx). Asserting the checker button text, not just
// <html lang>, catches exactly the "lang flips but content stays English"
// failure mode this bug already produced once.
test("/tools carries the stored language into both the chrome and the free checker", async ({ request }) => {
  const res = await request.get("/tools", { headers: { Cookie: "NEXT_LOCALE=fr" } })
  expect(res.status()).toBe(200)
  const html = await res.text()
  expect(html).toContain('lang="fr"')
  expect(html).toContain("Vérifiez le marché avant d'acheter")
  expect(html).toContain("Vérifier cet article")
  expect(html).not.toContain("Check the market before you buy")
})

test("/tools offers a language switcher", async ({ page, context }) => {
  await context.addCookies([{ name: "NEXT_LOCALE", value: "fr", url: "http://localhost:3100" }])
  await page.goto("/tools")
  await expect(page.locator('select[aria-label="Language"]')).toBeVisible({ timeout: 20_000 })
})

// The founder's actual journey, unauthenticated: pick French, then follow
// real in-app links from the homepage through the top of the funnel. Every
// prior test in this file reads a single response or a post-login route --
// this is the one that walks the acquisition path a genuine visitor takes,
// which is exactly where the bug lived.
test("French survives / -> /check -> /tools -> /register through real link clicks", async ({ page, context }) => {
  await context.addCookies([{ name: "NEXT_LOCALE", value: "fr", url: "http://localhost:3100" }])

  await page.goto("/")
  await page.waitForURL(/\/fr$/, { timeout: 20_000 })
  expect(await page.locator("html").getAttribute("lang")).toBe("fr")

  await page.goto("/check")
  // /check immediately client-redirects to /tools (no token) or /verdict.
  await page.waitForURL(/\/(tools|verdict)/, { timeout: 20_000 })

  await page.goto("/tools")
  expect(await page.locator("html").getAttribute("lang")).toBe("fr")
  await expect(page.getByRole("heading", { name: "Vérifiez le marché avant d'acheter" })).toBeVisible()

  await page.getByRole("link", { name: "← Resale IQ" }).click()
  await page.waitForURL(/\/fr$/, { timeout: 20_000 })
  expect(await page.locator("html").getAttribute("lang")).toBe("fr")
})
