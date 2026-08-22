import { expect, test } from "@playwright/test"

test("landing page loads and is not empty", async ({ page }) => {
  const res = await page.goto("/")
  expect(res?.ok()).toBeTruthy()
  await expect(page.locator("h1")).toContainText(/Stop guessing/i)
  await expect(page.getByRole("link", { name: /Add to Chrome|Ajouter à Chrome|Añadir a Chrome/i })).toBeVisible()
  const chrome = page.getByRole("link", { name: /Add to Chrome|Ajouter à Chrome|Añadir a Chrome/i })
  await expect(chrome).toHaveAttribute("href", /fgpajplglnapkebhbcbhlmbbkmnighcm/)
  const text = await page.locator("body").innerText()
  expect(text.trim().length).toBeGreaterThan(80)
})

test("/data shows a number or last-good snapshot, never crashes on null", async ({ page }) => {
  const res = await page.goto("/data")
  expect(res?.ok()).toBeTruthy()
  await expect(page.locator("h1")).toContainText(/Vinted market data/i)
  const body = await page.locator("body").innerText()
  expect(body).not.toMatch(/undefined|NaN/)
  // Either live/last-good figures or the honest empty state — not a 500.
  expect(body.includes("Nike") || body.includes("being refreshed") || body.includes("Sold")).toBeTruthy()
  const weekly = page.getByRole("table", { name: /Weekly market snapshot/i })
  await expect(weekly).toBeVisible()
  await expect(weekly).toContainText(/Sold \(7 days\)/)
  await expect(weekly).toContainText(/Listings tracked/)
  await expect(weekly).toContainText(/Freshness/)
})

test("login page loads", async ({ page }) => {
  const res = await page.goto("/login")
  expect(res?.ok()).toBeTruthy()
  await expect(page.locator("h1")).toContainText(/Welcome back/i)
  await expect(page.locator('input[type="email"]')).toBeVisible()
})

test("/pricing redirects to /#pricing", async ({ page }) => {
  const res = await page.goto("/pricing")
  expect(res?.status()).toBeLessThan(400)
  await expect(page).toHaveURL(/\/#pricing$/)
})

test("unauthenticated /dashboard redirects to auth", async ({ page }) => {
  await page.goto("/dashboard")
  await page.waitForURL(/\/login/, { timeout: 20_000 })
  await expect(page.locator("h1")).toContainText(/Welcome back/i)
})
