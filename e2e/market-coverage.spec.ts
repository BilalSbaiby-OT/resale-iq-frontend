import { expect, test } from "@playwright/test"

/**
 * The homepage must not state a market we do not serve.
 *
 * Coverage today is ES/FR/DE/IT/PT only (src/lib/market-numbers.ts,
 * src/lib/i18n.ts). CLAUDE.md records that the UK is "no longer a hard no"
 * as a product direction — the founder lifted the ban on *considering* it —
 * but the data does not exist yet, so a page implying UK/US coverage is
 * still wrong. This is a live risk, not a hypothetical: the ban was lifted
 * on 2026-08-29 specifically because it is tempting to add UK copy ahead of
 * the data. This spec is the guardrail for that gap.
 *
 * Deliberately renders and reads real text, not source grep: SEO/i18n copy
 * changes could add UK/US language into a template string this test would
 * otherwise never see if it only inspected .ts files.
 */
test.describe("homepage market claims", () => {
  test("states the real coverage (5 EU markets) and nothing wider", async ({ page }) => {
    const res = await page.goto("/")
    expect(res?.ok()).toBeTruthy()
    const body = await page.locator("body").innerText()

    // The honest claim must actually be present — this is not just a
    // negative assertion. If this line starts failing because the copy was
    // reworded, update the wording here, not the intent.
    expect(body).toMatch(/five EU markets|5 EU markets/i)

    // Markets we do not serve. Word-boundary, case-SENSITIVE for the two-
    // letter codes ("UK"/"US") so this does not false-positive on ordinary
    // English words ("us", "uk" never appears lowercase as a real word, but
    // keeping case-sensitivity is the cheap, permanent way to avoid ever
    // relitigating a false positive here).
    expect(body).not.toMatch(/\bUK\b/)
    expect(body).not.toMatch(/\bUS\b/)
    expect(body).not.toMatch(/United Kingdom/i)
    expect(body).not.toMatch(/United States/i)
    expect(body).not.toMatch(/\bBritish\b|\bBritain\b/i)

    // "26 markets" is legitimate ONLY when scoped to live asking-price
    // search (Price Compare), never to buy-below/tracked coverage. If this
    // number appears, the surrounding sentence must say so.
    if (/26[- ]market/i.test(body)) {
      expect(body).toMatch(/26[- ]markets? total|live asking-price search across 26/i)
    }
  })
})
