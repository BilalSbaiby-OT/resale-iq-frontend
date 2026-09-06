import { test, expect } from "@playwright/test"

/**
 * The momentum chip, as a customer actually sees it, in two languages.
 *
 * `src/lib/app-copy.test.ts` proves the dictionary holds no direction word.
 * This proves the dictionary reaches the screen — the other half, and the half
 * that has failed before: `deals/page.tsx` never called `useLocale()` once, so
 * a Spanish session rendered English chips while the dictionary sat there
 * correct. A copy test alone would have passed straight through that bug.
 *
 * Asserted here: every chip states a rank, no chip states a direction, and the
 * caption explaining "a rank, not a trend" is on the page in both locales. The
 * caption is not decoration — a touch device never gets the badge's hover, so
 * it is the only place those readers can learn what the chip means.
 */

const BANNED = [
  "Rising", "Hot", "Fading", "Stable", "Dead",
  "Subiendo", "Al rojo", "Enfriándose", "Estable", "Parado",
]

const CASES = [
  { locale: "en", rank: "Top 30%", caption: /rank, not a trend/i },
  { locale: "es", rank: "30% superior", caption: /clasificación, no una tendencia/i },
] as const

async function openDeals(page, locale: string) {
  // The proxy reads NEXT_LOCALE and stamps x-resaleiq-locale itself, so the
  // cookie is the input — setting the header does nothing. Same mechanism as
  // locale-routing.spec.ts. It must be scoped to the host the page is actually
  // served from (localhost, not 127.0.0.1) or it is silently ignored and the
  // test quietly checks English twice.
  await page.context().addCookies([{ name: "NEXT_LOCALE", value: locale, url: "http://localhost:3100" }])
  await page.goto("/login")
  await page.locator('input[type="email"]').fill("alice@example.com")
  await page.locator('input[type="password"]').fill("password12345")
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL(/verdict|dashboard|panel/, { timeout: 20_000 })
  await page.goto("/deals")
  await expect(page.getByText("Track", { exact: true })).toBeVisible({ timeout: 20_000 })
}

for (const { locale, rank, caption } of CASES) {
  test(`momentum chips state a rank and never a direction (${locale})`, async ({ page }) => {
    await openDeals(page, locale)

    const chips = page.getByTestId("riq-momentum")
    await expect(chips.first()).toBeVisible()
    const texts = await chips.allTextContents()
    const rendered = texts.join(" | ")

    expect(rendered, `no chip named a rank in ${locale}: ${rendered}`).toContain(rank)
    for (const word of BANNED) {
      expect(rendered, `"${word}" claims a direction the percentile method cannot measure`)
        .not.toContain(word)
    }

    // Every chip names a share of the board. An adjective with no quantity in
    // it is exactly how "Rising" got onto the screen in the first place.
    for (const text of texts) {
      expect(text.trim(), `chip "${text}" names no share of the board`).toMatch(/\d+\s?%/)
    }

    await expect(page.getByText(caption)).toBeVisible()
  })
}
