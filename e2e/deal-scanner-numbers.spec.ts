import { expect, test } from "@playwright/test"

/**
 * Every number on a Deal Scanner card must be the number its label claims.
 *
 * Audit, 2026-09-06, against the live authenticated board (100 deals served).
 * Fixtures in e2e/mock-backend.mjs are three of those rows, unedited except
 * where noted there.
 *
 * What was wrong, and is pinned here:
 *
 *  - "Avg at exit €92 · n 344" on Balenciaga Track. The mean is computed from
 *    the IQR-fenced comp set — 98 rows, verified by recomputing it inside the
 *    production container to the cent — while 344 is sold_7d, every watched
 *    departure. The tooltip called 344 "the sample size behind this mean".
 *    #54 fixed exactly this collision on /verdict; the deal board, the
 *    dashboard and the watchlist were the surfaces it did not cover.
 *
 *  - A withheld opportunity_score rendering as a number. The score has two
 *    scales in one field (see api/resale_routes._publishable_opportunity_score)
 *    and the backend now sends null for the liquidity-only branch, so the bar
 *    must render its "not rated" dash rather than a red digit.
 *
 *  - Sell-through below 1%. 0.19% must never reach the screen as "0%".
 *
 *  - A LOW-tier row (n < 8) must show no price at all, not a zero.
 */

async function loginAndOpenDeals(page) {
  await page.goto("/login")
  await page.locator('input[type="email"]').fill("alice@example.com")
  await page.locator('input[type="password"]').fill("password12345")
  await page.getByRole("button", { name: /Sign in/i }).click()
  await expect(page.getByRole("link", { name: "Check" })).toBeVisible({ timeout: 20_000 })
  await page.goto("/deals")
  await expect(page.getByText("Track", { exact: true })).toBeVisible({ timeout: 20_000 })
}

/**
 * The innermost element holding both this model's title and its price grid —
 * i.e. one card. Matched on content, not on class names, so the Panel/Deal
 * Scanner restyle in flight can move every colour and box without breaking
 * these assertions.
 */
function card(page, model: string) {
  return page
    .locator("div")
    .filter({ has: page.getByText(model, { exact: true }) })
    .filter({ hasText: "Buy Below" })
    .last()
}

test.describe("Deal Scanner — the numbers on the card", () => {
  test("the sample beside a price is comparable_n, never the departure count", async ({ page }) => {
    await loginAndOpenDeals(page)
    const track = card(page, "Track")

    // comparable_n = 98. The mean is taken over those 98 rows.
    await expect(track.getByText("n 98")).toBeVisible()
    // sold_7d = 344. It is a real number answering a different question, and
    // it must not appear in the sample slot.
    await expect(track.getByText("n 344")).toHaveCount(0)

    // And the tooltip must name the count it is actually reporting.
    const sample = track.locator('[title*="Sample size"]').first()
    await expect(sample).toHaveAttribute("title", /comparable departures/)
    await expect(sample).not.toHaveAttribute("title", /watched departures/)
  })

  test("buy-below and target net hold to the published formulas", async ({ page }) => {
    await loginAndOpenDeals(page)
    const track = card(page, "Track")
    // avg 92.22 -> 92.22 * 0.95 * 0.70 = 61.33, rendered to whole euros.
    await expect(track.getByText("€61", { exact: true })).toBeVisible()
    // 92.22 * 0.95 - 61.33 = 26.28. Target net is derived from buy-below, so
    // it sits inline on the quiet meta line rather than in a figure of its
    // own — there is no element whose whole text is "+€26" and there should
    // not be. Pin the label to the value instead: a number in the wrong slot
    // is the exact class of bug this file exists to catch.
    await expect(track.getByText(/^Target net \+€26$/)).toBeVisible()
  })

  test("a real sub-1% sell-through never prints as 0%", async ({ page }) => {
    await loginAndOpenDeals(page)
    const samba = card(page, "Samba")
    // 43 departures against 22,720 still listed is 0.19% — real demand.
    await expect(samba.getByText("0.2%")).toBeVisible()
    await expect(samba.getByText("0%", { exact: true })).toHaveCount(0)
    await expect(samba.getByText("0.0%", { exact: true })).toHaveCount(0)
  })

  test("a withheld opportunity score does not render as a red zero", async ({ page }) => {
    await loginAndOpenDeals(page)
    const jordan = card(page, "Jordan 1")
    // ScoreBar was removed in the density pass; the contract is: no fake 0.
    await expect(jordan.getByText("0", { exact: true })).toHaveCount(0)
    await expect(jordan.getByText(/not enough to name a buy-below|sell-through sample is still thin/i)).toBeVisible()
  })

  test("below the evidence floor the card shows no price rather than a zero", async ({ page }) => {
    await loginAndOpenDeals(page)
    const jordan = card(page, "Jordan 1")
    // max_buy_price, avg_price_eur and est_profit_eur are all withheld.
    await expect(jordan.getByText("€0", { exact: true })).toHaveCount(0)
    await expect(jordan.getByText("+€0", { exact: true })).toHaveCount(0)
    // The supply count it CAN stand behind is still shown.
    await expect(jordan.getByText("3,807")).toBeVisible()
  })

  test("a withheld sell-through says so instead of showing a zero share", async ({ page }) => {
    await loginAndOpenDeals(page)

    // Jordan 1 carries its own note — comparable_n is 7, below the evidence
    // floor — and a specific true sentence outranks the generic one, so that
    // is the sentence the card must show. Either way: no zero share.
    const jordan = card(page, "Jordan 1")
    await expect(jordan.getByText("0%", { exact: true })).toHaveCount(0)
    await expect(jordan.getByText("0.0%", { exact: true })).toHaveCount(0)
    await expect(jordan.getByText(/not enough to name a buy-below/i)).toBeVisible()

    // The generic sentence is the fallback for a row with str_pct null and no
    // note of its own. Air Force 1 Low is that row, and it is the only place
    // the fallback branch is actually reachable.
    const af1 = card(page, "Air Force 1 Low")
    await expect(af1.getByText("0%", { exact: true })).toHaveCount(0)
    await expect(af1.getByText(/sell-through sample is still thin/i)).toBeVisible()
  })
})
