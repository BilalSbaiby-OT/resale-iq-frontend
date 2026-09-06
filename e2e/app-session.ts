import type { Page } from "@playwright/test"

/**
 * Sign in and pin a locale, for the authenticated app specs.
 *
 * Not a `*.spec.ts`, so Playwright's default testMatch does not collect it.
 *
 * WHY THE COOKIE. `/dashboard` and `/deals` do not live under `[locale]`.
 * `src/proxy.ts` reads `NEXT_LOCALE` back for every `APP_LOCALE_PREFIXES` path
 * and re-stamps it as `x-resaleiq-locale`, which the root layout turns into
 * `<LocaleProvider>`. Setting the cookie is therefore exactly what a customer
 * does with the sidebar language control — not a test-only shortcut around
 * the mechanism under test.
 *
 * WHY NOT `waitForURL("/dashboard")`. Login lands on `/verdict`
 * (src/app/(auth)/login/page.tsx). Callers navigate on themselves; this only
 * guarantees the redirect has left `/login`, so a slow auth round-trip cannot
 * race the next `goto`.
 */
export async function loginAs(page: Page, locale: string) {
  await page.context().addCookies([{
    name: "NEXT_LOCALE", value: locale, domain: "localhost", path: "/",
  }])
  await page.goto("/login")
  await page.locator('input[type="email"]').fill("alice@example.com")
  await page.locator('input[type="password"]').fill("password12345")
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30_000 })
}
