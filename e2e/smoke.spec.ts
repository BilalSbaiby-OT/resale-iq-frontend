import { expect, test } from "@playwright/test"

test("landing page loads and is not empty", async ({ page }) => {
  const res = await page.goto("/")
  expect(res?.ok()).toBeTruthy()
  await expect(page.getByRole("link", { name: "Resale IQ home" })).toBeVisible()
  await expect(page.locator("h1")).toBeVisible()
  await expect(page.locator("#check").getByRole("textbox")).toBeVisible()
  await expect(page.locator("#check").getByRole("button").first()).toBeVisible()
  const text = await page.locator("body").innerText()
  expect(text.trim().length).toBeGreaterThan(80)
})

test("homepage hero has one primary Check CTA and free-plan unlocks", async ({ page }) => {
  await page.goto("/")
  const hero = page.locator("section.riq-apple-hero")
  await expect(hero.getByText(/EU Vinted resellers/i)).toBeVisible()
  // One Check control in the hero — do not count nav/footer chrome.
  await expect(hero.getByRole("button", { name: /check/i })).toHaveCount(1)
  await expect(hero.getByRole("link", { name: /open dashboard/i })).toHaveCount(0)
  await expect(hero.getByRole("link", { name: /sign in/i })).toHaveCount(0)
  // Remaining unlock (gated sell-through tile) still registers Free, never Pro bait.
  const locked = hero.getByTestId("riq-locked-stat")
  await expect(locked).toBeVisible()
  await expect(locked).toHaveAttribute("href", /\/register\?plan=free$/)
  const unlocks = hero.locator('a[href*="/register"]')
  const n = await unlocks.count()
  expect(n).toBeGreaterThan(0)
  for (let i = 0; i < n; i++) {
    await expect(unlocks.nth(i)).toHaveAttribute("href", /plan=free/)
    await expect(unlocks.nth(i)).not.toHaveAttribute("href", /plan=pro/)
  }
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

test("methodology explains sell-through, buy-below and confidence", async ({ page }) => {
  const res = await page.goto("/methodology")
  expect(res?.ok()).toBeTruthy()
  const body = await page.locator("body").innerText()
  expect(body).toMatch(/sold_observed/i)
  expect(body).toMatch(/0\.95/i)
  expect(body).toMatch(/HIGH/i)
  expect(body).not.toMatch(/undefined|NaN/)
})

test("/tools checker is the free holy-shit moment, not a register wall", async ({ page }) => {
  const res = await page.goto("/tools")
  expect(res?.ok()).toBeTruthy()
  await expect(page.getByLabel(/Item to check/i)).toBeVisible()
})

test("public profit calculator shows a result or a visible error after Calculate", async ({ page }) => {
  await page.goto("/tools/vinted-profit-calculator")
  await page.getByLabel(/buy price/i).fill("45")
  await page.getByLabel(/expected sale price/i).fill("70")
  await page.getByRole("button", { name: /^Calculate$/i }).click()
  const result = page.getByTestId("riq-calc-result")
  const error = page.locator("#riq-calc-error")
  await expect(result.or(error)).toBeVisible()
  await expect(result).toBeVisible()
  await expect(result).toContainText(/€/)
})

test("unauthenticated /dashboard redirects to auth", async ({ page }) => {
  await page.goto("/dashboard")
  await page.waitForURL(/\/login/, { timeout: 20_000 })
  await expect(page.locator("h1")).toContainText(/Welcome back/i)
})
