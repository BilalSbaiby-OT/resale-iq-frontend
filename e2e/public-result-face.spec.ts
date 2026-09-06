import { expect, test, type Page } from "@playwright/test"

/**
 * THE PUBLIC RESULT FACE — the card a stranger sees after running a free check
 * on `/`.
 *
 * Why this file exists. The homepage fold was rebuilt on the graphite scale;
 * this surface — the one that only appears once somebody actually USES the
 * product — was not, and kept the dashboard aesthetic: a row of raised tiles,
 * a green figure and an amber verdict arguing over the same card, and a gated
 * slot that had been reduced to a label with a padlock and no words under it.
 *
 * `e2e/smoke.spec.ts` pins WHAT the fold says (the seed, the verdict word,
 * sold_7d not n, E-13's no-CTA rule). Nothing pinned HOW MUCH it says or how
 * loudly, which is the axis it drifted on. These assert the shape:
 *
 *   1. the gated field states its condition in WORDS, not a lone glyph;
 *   2. at most three figures;
 *   3. no competing call to action inside the card;
 *   4. one surface colour — no raised tiles nested inside the card;
 *   5. all of the above in a non-English market.
 *
 * Deliberately NOT asserted: exact hex values or font sizes. Those are the
 * design system's to change (src/app/globals.css @theme); a test that pinned
 * them would fail on the next token pass without anything being wrong.
 */

async function check(page: Page, q: string) {
  const checker = page.locator("#check")
  await checker.getByRole("textbox").fill(q)
  const response = page.waitForResponse((r) => r.url().includes("/api/verdict"))
  await checker.getByRole("button").first().click()
  await response
  return page.getByTestId("riq-result-card")
}

test.describe("the public result face on /", () => {
  test("the gated field states its condition in words, not a bare padlock", async ({ page }) => {
    await page.goto("/")
    const card = await check(page, "Adidas Samba")

    const locked = card.getByTestId("riq-locked-stat")
    await expect(locked).toBeVisible()

    // The regression this replaces: E-13 (#59) stripped the Plan/Unlock CTA out
    // of the fold, correctly, but left a label above an empty line. Production
    // innerText, 2026-09-06, was "SELL-THROUGH" and then nothing — a hole where
    // a deliberately withheld field should be, which is the same wordless state
    // src/lib/locked-fields.ts exists to stop ("—" was the previous spelling of
    // it). The field must NAME itself and SAY why it is empty.
    await expect(locked).toContainText(/sell-through/i)
    const words = (await locked.innerText()).replace(/sell-through/i, "").trim()
    expect(words.length, "the gated slot must say something, not just show a glyph").toBeGreaterThan(3)
    expect(words).not.toMatch(/^(—|-|N\/A)$/i)

    // ...and it is still not a CTA. E-13's rule, restated here because this
    // file is what would catch someone "fixing" the wording by re-adding a
    // button.
    await expect(locked).not.toContainText(/unlock|plan/i)
    await expect(locked.locator("a")).toHaveCount(0)

    // ABSENT, NOT BLURRED — no sell-through value anywhere in the card.
    await expect(card).not.toContainText(/\d+(\.\d+)?\s*%/)
  })

  test("at most three figures, and no competing call to action", async ({ page }) => {
    await page.goto("/")
    const card = await check(page, "Adidas Samba")

    // Three rows is the ceiling: buy-below, watched departures, and the gated
    // sell-through. The card this replaced carried five tiles, which is what
    // made an answer read as a telemetry board.
    const rows = card.getByTestId("riq-answer-rows")
    expect(await rows.evaluate((el) => el.childElementCount)).toBeLessThanOrEqual(3)

    // `n` is comparable_n, not a departure count (#54). It must never appear as
    // a second number beside sold_7d.
    await expect(card).not.toContainText(/\bn\s*=\s*\d/)

    // No anchor or button inside the card. The one primary CTA in this fold is
    // the Check control above it (E-13, #59); a second one here is the "two
    // Unlock CTAs on one card" defect.
    await expect(card.locator("a, button")).toHaveCount(0)
  })

  test("one surface: the card holds no raised tiles", async ({ page }) => {
    await page.goto("/")
    const card = await check(page, "Adidas Samba")

    // The bingo board, expressed as a property. Every tile was a descendant
    // with its own opaque background; a card that reads as an answer has
    // exactly one surface colour — its own.
    const painted = await card.evaluate((el) =>
      [...el.querySelectorAll("*")]
        .map((n) => getComputedStyle(n).backgroundColor)
        .filter((c) => c !== "rgba(0, 0, 0, 0)" && c !== "transparent"),
    )
    expect(painted, "no descendant of the result card may paint its own background").toEqual([])
  })

  test("a provisional verdict keeps its qualifier", async ({ page }) => {
    await page.goto("/")
    const card = await check(page, "Nike Air Force 1 Low")

    // The worst sentence this site could print is an unqualified BUY on a call
    // the API itself hedged (api/routes.py `_provisional_verdict`). #54 fixed
    // it; the redesign must not quietly drop the word while tidying the line.
    await expect(card.getByText("BUY", { exact: true })).toBeVisible()
    await expect(card).toContainText(/provisional/i)
  })

  test.describe("in Spanish", () => {
    test.use({ locale: "es-ES" })

    test("the whole card is Spanish, including the gated condition", async ({ page }) => {
      await page.goto("/")
      const card = await check(page, "Adidas Samba")

      await expect(card).toContainText("Tasa de venta")
      await expect(card).toContainText("con una cuenta gratuita")
      // A new string that ships English into five markets goes red here rather
      // than onto the homepage — the gap e2e/i18n-checker.spec.ts was written
      // for, applied to the strings this pass added.
      await expect(card).not.toContainText(/with a free account/i)
      await expect(card).not.toContainText("Sell-through")
      await expect(card.locator("a, button")).toHaveCount(0)
    })
  })
})
