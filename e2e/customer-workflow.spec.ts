import { expect, test, type Page } from "@playwright/test"

/**
 * Browser workflows against the in-memory mock backend.
 * Server-side IDOR is locked in demand-intel/tests/test_user_isolation.py.
 * These tests prove the customer loop in the actual UI.
 */
test.describe.configure({ mode: "serial" })

async function login(page: Page, email: string, password: string) {
  await page.goto("/login")
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole("button", { name: /Sign in/i }).click()
  // C134: login now redirects to /verdict?q=... (pre-seeded activation path)
  // Wait for the verdict page to load rather than the cold-state element.
  await page.waitForURL(/\/verdict/, { timeout: 20_000 })
}

test.describe("customer watchlist workflow", () => {
  test("login → watchlist add → refresh still there", async ({ page }) => {
    await login(page, "alice@example.com", "password12345")
    await page.goto("/watchlist")
    // The "+ Watch item" button is always present (top-right), regardless of
    // whether the watchlist is empty or not. The empty-state heading only renders
    // when items.length === 0, which is not guaranteed when the mock server is
    // reused across runs (serial mode, reuseExistingServer:true locally).
    await expect(page.getByRole("button", { name: /Watch item|Watch your first model/i }).first()).toBeVisible({ timeout: 15_000 })
    await page.getByRole("button", { name: /Watch item|Watch your first model/i }).first().click()
    await page.getByPlaceholder("Nike").fill("Nike")
    await page.getByPlaceholder("Air Max 90").fill("Air Max 90")
    await page.getByRole("button", { name: /^Add$/ }).click()
    await expect(page.getByText("Air Max 90")).toBeVisible()
    await page.reload()
    await expect(page.getByText("Air Max 90")).toBeVisible()
  })

  test("user B does not see user A's watchlist item", async ({ browser }) => {
    const a = await browser.newContext()
    const b = await browser.newContext()
    const pageA = await a.newPage()
    const pageB = await b.newPage()

    await login(pageA, "alice@example.com", "password12345")
    await pageA.goto("/watchlist")
    await pageA.getByRole("button", { name: /Watch item|Watch your first model/i }).first().click()
    await pageA.getByPlaceholder("Nike").fill("SecretBrand")
    await pageA.getByPlaceholder("Air Max 90").fill("SecretModelA")
    await pageA.getByRole("button", { name: /^Add$/ }).click()
    await expect(pageA.getByText("SecretModelA")).toBeVisible()

    await login(pageB, "bob@example.com", "password12345")
    await pageB.goto("/watchlist")
    await expect(pageB.getByText("SecretModelA")).toHaveCount(0)

    const itemId = await pageA.evaluate(async () => {
      const token = localStorage.getItem("di_jwt")
      const r = await fetch("/api/watchlist", { headers: { Authorization: `Bearer ${token}` } })
      const d = await r.json()
      return (d.items || []).find((i: { model: string }) => i.model === "SecretModelA")?.id
    })
    expect(itemId).toBeTruthy()

    const denied = await pageB.evaluate(async (id) => {
      const token = localStorage.getItem("di_jwt")
      const r = await fetch(`/api/watchlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      return r.status
    }, itemId)
    expect(denied).toBe(404)
    await expect(pageA.getByText("SecretModelA")).toBeVisible()
    await a.close()
    await b.close()
  })

  test("unauthenticated API writes are denied", async ({ request }) => {
    const r = await request.post("/api/watchlist", {
      data: { brand: "Nike", model: "Air Force 1" },
    })
    expect(r.status()).toBe(401)
  })
})
