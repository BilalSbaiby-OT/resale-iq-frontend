import { test, type Page } from "@playwright/test"

/**
 * Evidence dumper. Prints the RENDERED text of the authenticated panel and
 * deal scanner at both viewports in both locales, so a before/after can be
 * quoted rather than described. Not part of the required suite — it asserts
 * nothing, it only reports.
 */

async function login(page: Page, locale: string) {
  await page.context().addCookies([{
    name: "NEXT_LOCALE", value: locale, domain: "localhost", path: "/",
  }])
  await page.goto("/login")
  await page.locator('input[type="email"]').fill("alice@example.com")
  await page.locator('input[type="password"]').fill("password12345")
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30_000 })
}

for (const locale of ["es", "en"]) {
  for (const vp of [{ n: "390", w: 390, h: 844 }, { n: "1280", w: 1280, h: 900 }]) {
    for (const route of ["/deals", "/dashboard"]) {
      test(`dump ${locale} ${vp.n} ${route}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.w, height: vp.h })
        await login(page, locale)
        await page.goto(route)
        await page.waitForTimeout(3500)
        const main = await page.locator("main").innerText().catch(() => "(no main)")
        const nav = await page.locator("aside").innerText().catch(() => "(no aside)")
        console.log(`\n===== ${locale.toUpperCase()} ${vp.n} ${route} =====`)
        console.log("--- MAIN ---")
        console.log(main)
        console.log("--- SIDEBAR ---")
        console.log(nav)
      })
    }
  }
}
