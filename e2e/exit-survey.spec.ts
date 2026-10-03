import { expect, test, type Page } from "@playwright/test"

/**
 * O2 — the one-question exit survey ("What stopped you?") and the verdict
 * `flow` tag. The backend is not involved: both requests are intercepted, so
 * this pins what the FRONTEND sends and when it shows the card.
 */

type Sent = Record<string, unknown>

async function capture(page: Page): Promise<Sent[]> {
  const sent: Sent[] = []
  await page.route("**/api/feedback/exit", async (route) => {
    sent.push(route.request().postDataJSON() as Sent)
    await route.fulfill({ status: 204, body: "" })
  })
  return sent
}

test.describe("exit survey on the Stripe cancel return", () => {
  test("shows once, one tap answers it, thank-you state, never again", async ({ page }) => {
    const sent = await capture(page)
    await page.goto("/pricing?checkout=cancelled")
    const card = page.getByTestId("riq-exit-survey")
    await expect(card).toBeVisible()
    await expect(card).toContainText("What stopped you?")
    await page.getByTestId("riq-exit-survey-too_expensive").click()
    await expect(page.getByTestId("riq-exit-survey-thanks")).toBeVisible()
    await expect.poll(() => sent.length).toBe(1)
    expect(sent[0]).toMatchObject({ context: "checkout_cancel", reason: "too_expensive", locale: "en" })
    expect(sent[0]).not.toHaveProperty("free_text")

    await page.reload()
    await expect(page.getByTestId("riq-checkout-cancelled")).toBeVisible()
    await expect(page.getByTestId("riq-exit-survey")).toHaveCount(0)
    await expect(page.getByTestId("riq-exit-survey-thanks")).toHaveCount(0)
  })

  test("not shown on a normal /pricing visit", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByTestId("riq-exit-survey")).toHaveCount(0)
  })

  test("dismiss hides it and counts as asked", async ({ page }) => {
    const sent = await capture(page)
    await page.goto("/pricing?checkout=cancelled")
    await page.getByTestId("riq-exit-survey-dismiss").click()
    await expect(page.getByTestId("riq-exit-survey")).toHaveCount(0)
    await page.reload()
    await expect(page.getByTestId("riq-exit-survey")).toHaveCount(0)
    expect(sent).toHaveLength(0)
  })

  test("'other' takes free text, capped at 500 characters", async ({ page }) => {
    const sent = await capture(page)
    await page.goto("/pricing?checkout=cancelled")
    await page.getByTestId("riq-exit-survey-other").click()
    const input = page.getByTestId("riq-exit-survey-text")
    await input.fill("x".repeat(700))
    await expect(input).toHaveValue("x".repeat(500))
    await page.getByTestId("riq-exit-survey-send").click()
    await expect(page.getByTestId("riq-exit-survey-thanks")).toBeVisible()
    await expect.poll(() => sent.length).toBe(1)
    expect(sent[0]).toMatchObject({ context: "checkout_cancel", reason: "other" })
    expect((sent[0].free_text as string).length).toBe(500)
  })

  test("renders in the visitor's locale", async ({ page }) => {
    await capture(page)
    await page.goto("/es/pricing?checkout=cancelled")
    await expect(page.getByTestId("riq-exit-survey")).toContainText("¿Qué te ha frenado?")
  })
})

test.describe("exit survey on the paywall result", () => {
  test("402 PAYWALL card carries the survey, context=paywall, with the item", async ({ page }) => {
    const sent = await capture(page)
    await page.route("**/api/verdict**", async (route) => {
      await route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({ verdict: "PAYWALL", locked: true, plans: [{ tier: "operator", label: "Starter", price_eur: 19 }] }),
      })
    })
    await page.goto("/tools")
    await page.getByLabel(/Item to check/i).fill("Adidas Samba")
    await page.getByRole("button", { name: /Check this item/i }).click()
    const wall = page.getByTestId("riq-hard-paywall")
    await expect(wall).toBeVisible()
    await wall.getByTestId("riq-exit-survey-dont_trust").click()
    await expect.poll(() => sent.length).toBe(1)
    expect(sent[0]).toMatchObject({ context: "paywall", reason: "dont_trust", query: "Adidas Samba" })
  })

  test("LIMIT_REACHED result carries the survey, context=limit", async ({ page }) => {
    const sent = await capture(page)
    await page.route("**/api/verdict**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ verdict: "LIMIT_REACHED", reason: "limit_reached", used_today: 10, limit: 10 }),
      })
    })
    await page.goto("/tools")
    await page.getByLabel(/Item to check/i).fill("Adidas Samba")
    await page.getByRole("button", { name: /Check this item/i }).click()
    await expect(page.getByTestId("riq-limit-reached-upgrade")).toBeVisible()
    await page.getByTestId("riq-exit-survey-seller_not_buyer").click()
    await expect.poll(() => sent.length).toBe(1)
    expect(sent[0]).toMatchObject({ context: "limit", reason: "seller_not_buyer" })
  })
})

test.describe("verdict flow tag", () => {
  test("anon typing a free sample -> typed; anon typing their own item -> own_item", async ({ page }) => {
    const urls: string[] = []
    await page.route("**/api/verdict**", async (route) => {
      urls.push(route.request().url())
      await route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({ verdict: "PAYWALL", locked: true, plans: [] }),
      })
    })
    await page.goto("/tools")
    const input = page.getByLabel(/Item to check/i)
    const go = page.getByRole("button", { name: /Check this item/i })

    await input.fill("Nike Air Force 1")
    await go.click()
    await expect.poll(() => urls.length).toBe(1)
    expect(new URL(urls[0]).searchParams.get("flow")).toBe("typed")

    await input.fill("Stone Island Hoodie")
    await go.click()
    await expect.poll(() => urls.length).toBe(2)
    expect(new URL(urls[1]).searchParams.get("flow")).toBe("own_item")
  })

  test("buy-list deep link -> buylist; typing afterwards -> own_item", async ({ page }) => {
    const urls: string[] = []
    await page.route("**/api/verdict**", async (route) => {
      urls.push(route.request().url())
      await route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({ verdict: "PAYWALL", locked: true, plans: [] }),
      })
    })
    await page.goto("/tools?q=Stone%20Island%20Hoodie&src=buy_list_locked")
    // (next dev double-invokes the mount effect, so there may be 2 identical calls)
    await expect.poll(() => urls.length).toBeGreaterThan(0)
    const autoRuns = urls.length
    for (const u of urls) expect(new URL(u).searchParams.get("flow")).toBe("buylist")
    // typing afterwards is the visitor's own action, not the buy-list row
    await page.getByLabel(/Item to check/i).fill("Carhartt Jacket")
    await page.getByRole("button", { name: /Check this item/i }).click()
    await expect.poll(() => urls.length).toBe(autoRuns + 1)
    expect(new URL(urls[autoRuns]).searchParams.get("flow")).toBe("own_item")
  })
})
