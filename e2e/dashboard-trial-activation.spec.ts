import { expect, test } from "@playwright/test"

/**
 * First-session value for a trialing/paid account on /dashboard (login always lands here):
 * full unlocked buy list (buy-below + exit), check box, honest trial line, return hook.
 * alice@example.com is the mock's mid-trial Starter account; pro@example.com is a paying one.
 */
async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login")
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill("password12345")
  await page.getByRole("button", { name: /Sign in/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
}

test.describe("dashboard — trial activation", () => {
  test("trialing user sees full buy list, check box, trial line and return hook", async ({ page }) => {
    await login(page, "alice@example.com")
    const list = page.getByTestId("riq-weekly-buy-list")
    await expect(list).toBeVisible({ timeout: 20_000 })
    await expect(list.getByTestId("riq-buy-row")).toHaveCount(6)
    // every row unlocked: a buy-below and an exit price on each, no dashes, no locks
    await expect(list.getByTestId("riq-buy-row").first()).toContainText("€41")
    await expect(list.getByTestId("riq-buy-row").first()).toContainText("€62")
    for (const r of await list.getByTestId("riq-buy-row").all()) await expect(r).not.toContainText("—")
    await expect(list.getByText(/Buy below/i).first()).toBeVisible()
    await expect(page.getByTestId("riq-buy-list-updated")).toContainText(/Updated 29 Sep — new list every Monday/)
    // check box above the list
    const box = page.getByTestId("riq-dashboard-quick-check")
    await expect(box).toBeVisible()
    const boxY = (await box.boundingBox())!.y
    const listY = (await list.boundingBox())!.y
    expect(boxY).toBeLessThan(listY)
    // honest trial line
    const line = page.getByTestId("riq-trial-line")
    await expect(line).toContainText(/Free trial — [56] days left · first charge €19 on \d{1,2} \w{3}/)
    await expect(line.getByTestId("riq-trial-manage")).toBeVisible()
    // watch action reuses the watchlist
    await list.getByTestId("riq-buy-row-watch").first().click()
    await expect(list.getByTestId("riq-buy-row-watch").first()).toContainText("Watching")
    // no fold-eating stacked banners
    await page.screenshot({ path: "test-results/dashboard-trial-390.png", fullPage: false })
  })

  test("a paying (non-trial) user gets the list but no trial line", async ({ page }) => {
    await login(page, "pro@example.com")
    await expect(page.getByTestId("riq-weekly-buy-list")).toBeVisible({ timeout: 20_000 })
    await expect(page.getByTestId("riq-trial-line")).toHaveCount(0)
  })
})
