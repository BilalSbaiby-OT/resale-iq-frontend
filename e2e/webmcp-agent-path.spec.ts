import { test, expect } from "@playwright/test"

// WebMCP declarative forms submit GET ?query= (not ?q=). Both must render the
// same server-side result, and paid models must stay paywalled.
const VERDICT = /\b(BUY|WATCH|SKIP)\b/

for (const path of ["/tools", "/tools/vinted-price-checker"]) {
  test(`${path}?query= renders verdict + price for a free sample (no JS)`, async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    await page.goto(`${path}?query=Nike%20Air%20Force%201`)
    const cite = page.getByTestId("riq-teaser-cite")
    await expect(cite).toContainText(VERDICT)
    await expect(cite).toContainText(/€\d/)
    await ctx.close()
  })

  test(`${path}?query= paid model shows paywall, never a buy-below price`, async ({ page }) => {
    // Same 402 the backend returns to an anonymous caller for a non-sample model.
    await page.route("**/api/verdict**", (route) =>
      route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({ verdict: "PAYWALL", locked: true, message: "A Resale IQ subscription is required to check items.", upgrade_url: "/register", plans: [] }),
      }),
    )
    await page.goto(`${path}?query=Stone%20Island%20Hoodie`)
    await expect(page.getByTestId("riq-hard-paywall")).toBeVisible()
    await expect(page.getByTestId("riq-teaser-cite")).toHaveCount(0)
    expect(await page.content()).not.toMatch(/most to pay after fees is €/i)
  })
}

test("hidden WebMCP forms carry a GET action", async ({ request }) => {
  const html = await (await request.get("/tools")).text()
  expect(html).toMatch(/<form action="\/tools" method="get" toolname="check_vinted_item"/)
})

test("profit calculator ?buy_price&sell_price renders +€22.75", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto("/tools/vinted-profit-calculator?buy_price=20&sell_price=45")
  await expect(page.getByTestId("riq-calc-result")).toContainText("+€22.75")
  await ctx.close()
})
