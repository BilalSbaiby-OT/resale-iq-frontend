import { expect, test } from "@playwright/test"

const ROUTES = ["/", "/verdict", "/tools", "/pricing", "/data"] as const

test.describe("390px: no horizontal page scroll, checker not clipped", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const path of ROUTES) {
    test(`${path} does not overflow the viewport`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.ok()).toBeTruthy()
      const box = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))
      expect(box.scroll).toBeLessThanOrEqual(box.client + 1)
    })
  }

  test("homepage checker stacks full-width under 640px", async ({ page }) => {
    await page.goto("/")
    const form = page.locator("#check form.riq-checker-row")
    const input = form.locator("input")
    const button = form.locator("button")
    const ib = await input.boundingBox()
    const bb = await button.boundingBox()
    expect(ib && bb).toBeTruthy()
    expect(bb!.y).toBeGreaterThan(ib!.y + ib!.height - 8)
    expect(ib!.x + ib!.width).toBeLessThanOrEqual(390)
    expect(bb!.x + bb!.width).toBeLessThanOrEqual(390)
  })

  test("/verdict check row stacks and a STR-null result still shows shelf numbers", async ({ page }) => {
    await page.goto("/verdict")
    const row = page.locator("div.riq-checker-row")
    const input = row.locator("input")
    const button = row.locator("button")
    await expect(input).toBeVisible()
    const ib = await input.boundingBox()
    const bb = await button.boundingBox()
    expect(ib && bb).toBeTruthy()
    expect(bb!.y).toBeGreaterThan(ib!.y + ib!.height - 8)

    await input.fill("New Balance 530")
    await button.click()
    const insights = page.getByTestId("riq-verdict-insights")
    await expect(insights).toBeVisible()
    await expect(insights).toContainText("€27")
    await expect(insights).toContainText("562")
    await expect(page.getByText(/See plans/i)).toHaveCount(0)
  })
})
