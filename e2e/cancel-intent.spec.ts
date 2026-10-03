import { expect, test, type Page } from "@playwright/test"

/**
 * "Thinking of cancelling?" on /account: a question BEFORE the Stripe portal,
 * never a gate. The survey POST and the portal URL are intercepted, so this
 * pins what the frontend sends and that cancelling is always one click away.
 */
async function loginPro(page: Page) {
  await page.goto("/login")
  await page.locator('input[type="email"]').fill("pro@example.com")
  await page.locator('input[type="password"]').fill("password12345")
  await page.getByRole("button", { name: /Sign in/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
}

async function capture(page: Page): Promise<Record<string, unknown>[]> {
  const sent: Record<string, unknown>[] = []
  await page.route("**/api/feedback/exit", async (route) => {
    sent.push(route.request().postDataJSON() as Record<string, unknown>)
    await route.fulfill({ status: 204, body: "" })
  })
  await page.route("**/mock-portal", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>portal</h1>" }))
  return sent
}

test.describe("cancel intent on /account", () => {
  test("link shows nothing until clicked; chip + comment are sent, then the portal opens", async ({ page }) => {
    const sent = await capture(page)
    await loginPro(page)
    await page.goto("/account")
    await expect(page.getByTestId("riq-cancel-intent")).toHaveCount(0)
    await page.getByTestId("riq-cancel-intent-link").click()
    const card = page.getByTestId("riq-cancel-intent")
    await expect(card).toContainText("What would make Resale IQ worth keeping?")
    await page.getByTestId("riq-cancel-intent-too_expensive").click()
    await page.getByTestId("riq-cancel-intent-text").fill("alerts for my brands would do it")
    await page.getByTestId("riq-cancel-intent-continue").click()
    await page.waitForURL(/mock-portal/, { timeout: 20_000 })
    await expect.poll(() => sent.length).toBe(1)
    expect(sent[0]).toMatchObject({ context: "cancel_intent", reason: "too_expensive", free_text: "alerts for my brands would do it", locale: "en" })
  })

  test("nothing is required: continue with an empty form sends no answer and still opens the portal", async ({ page }) => {
    const sent = await capture(page)
    await loginPro(page)
    await page.goto("/account")
    await page.getByTestId("riq-cancel-intent-link").click()
    await page.getByTestId("riq-cancel-intent-continue").click()
    await page.waitForURL(/mock-portal/, { timeout: 20_000 })
    expect(sent.length).toBe(0)
  })

  test("a failing survey endpoint never blocks the portal; 'Keep my plan' closes the card", async ({ page }) => {
    await page.route("**/api/feedback/exit", (route) => route.fulfill({ status: 500, body: "" }))
    await page.route("**/mock-portal", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>portal</h1>" }))
    await loginPro(page)
    await page.goto("/account")
    await page.getByTestId("riq-cancel-intent-link").click()
    await page.getByTestId("riq-cancel-intent-back").click()
    await expect(page.getByTestId("riq-cancel-intent")).toHaveCount(0)
    await page.getByTestId("riq-cancel-intent-link").click()
    await page.getByTestId("riq-cancel-intent-other").click()
    await page.getByTestId("riq-cancel-intent-continue").click()
    await page.waitForURL(/mock-portal/, { timeout: 20_000 })
  })

  test("localised: French card, locale fr in the payload", async ({ page }) => {
    const sent = await capture(page)
    await loginPro(page)
    await page.goto("/fr/account")
    await page.getByTestId("riq-cancel-intent-link").click()
    await expect(page.getByTestId("riq-cancel-intent")).toContainText("Qu'est-ce qui rendrait Resale IQ utile à garder ?")
    await page.getByTestId("riq-cancel-intent-dont_trust").click()
    await page.getByTestId("riq-cancel-intent-continue").click()
    await page.waitForURL(/mock-portal/, { timeout: 20_000 })
    expect(sent[0]).toMatchObject({ context: "cancel_intent", reason: "dont_trust", locale: "fr" })
  })
})
