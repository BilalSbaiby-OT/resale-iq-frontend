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
  // Seed is the best-EVIDENCED live row, not the best-sounding word. It was
  // Nike Air Force 1 Low (#53) — a BUY, but a provisional one on n=11
  // comparables. No non-provisional BUY exists anywhere in the catalogue, so
  // the hero shows a HIGH-confidence WATCH on n=153 instead. The enumeration
  // that establishes that is in src/lib/hero-verdict.ts.
  await expect(hero.getByRole("textbox")).toHaveValue("New Balance 530")
  // H1 is the JOB, not the SKU. The SKU stays as the caption on the evidence card.
  await expect(hero.getByRole("heading", { level: 1 })).toContainText(/what to pay/i)
  await expect(hero.getByRole("heading", { level: 1 })).not.toContainText(/New Balance 530/)
  await expect(hero.getByText("New Balance 530", { exact: true }).first()).toBeVisible()
  await expect(hero.getByText("WATCH", { exact: true })).toBeVisible()
  // The seed must never be a provisional call again. #54 renders the
  // provisional badge honestly wherever it applies; the point here is that
  // the FACE of the product is not a call the API hedged.
  await expect(hero).not.toContainText(/provisional/i)
  // #54 removed the bare "n=" chip card-wide; XOR: left-the-shelf is sold_7d
  // only, and the slim fold does not print n at all.
  await expect(hero.getByText(/\bn=\d/)).toHaveCount(0)
  // Slim proof card: one figure (buy-below) + quiet gated sell-through.
  // Market price / left-the-shelf / still-listed live on /tools, not the fold.
  await expect(hero.getByText(/Buy-below/i)).toBeVisible()
  await expect(hero.getByText("Market price", { exact: true })).toHaveCount(0)
  await expect(hero.getByText(/left the shelf/i)).toHaveCount(0)
  await expect(hero.getByText("Left shelf (watched)", { exact: true })).toHaveCount(0)
  await expect(hero.getByText("Still listed", { exact: true })).toHaveCount(0)
  // One Check control in the hero — do not count nav/footer chrome.
  await expect(hero.getByRole("button", { name: /check/i })).toHaveCount(1)
  await expect(hero.getByRole("link", { name: /open dashboard/i })).toHaveCount(0)
  await expect(hero.getByRole("link", { name: /sign in/i })).toHaveCount(0)
  // Remaining unlock (gated sell-through tile) still registers Free, never Pro bait.
  const locked = hero.getByTestId("riq-locked-stat")
  await expect(locked).toBeVisible()
  await expect(locked).toHaveAttribute("href", /\/register\?plan=free$/)
  await expect(hero.getByText(/Sell-through/i)).toBeVisible()
  await expect(hero.locator("[data-locked-field=sell_through_rate]")).not.toContainText("0%")
  // QUIET, BUT STILL UNMISTAKABLY GATED. The tile keeps its label and its
  // plan word so it reads as locked rather than as a bare dash (the P0 in
  // src/lib/locked-fields.ts), and it keeps routing ?plan=free — but the
  // green inline "Unlock the rest →" line is gone from above the fold.
  await expect(locked).toContainText(/Plan/i)
  await expect(locked).not.toContainText("—")
  await expect(locked).not.toContainText(/Unlock the rest/i)
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

// Was "/pricing redirects to /#pricing". That redirect was a stopgap for a
// 404 and it is gone: /pricing is a real, landable, measurable page now. This
// test is inverted rather than deleted so the redirect cannot quietly come
// back — a 307 here is the regression, not the expectation.
test("/pricing is a real page, not a redirect to the homepage anchor", async ({ request }) => {
  const res = await request.get("/pricing", { maxRedirects: 0 })
  expect(res.status()).toBe(200)
  expect(res.headers()["location"]).toBeUndefined()
})

test("/pricing renders the tiers with one h1 and exactly one filled accent CTA", async ({ page }) => {
  const res = await page.goto("/pricing")
  expect(res?.ok()).toBeTruthy()
  expect(page.url()).toMatch(/\/pricing$/)
  // The section heading is the document h1 here, not an h2 under the landing
  // page's own h1.
  await expect(page.locator("h1")).toHaveCount(1)
  await expect(page.locator("h1")).toContainText(/Know what to pay/i)
  // All three tiers and their prices, from the same TIERS source of truth.
  for (const name of ["Free", "Starter", "Pro"]) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
  }
  await expect(page.getByText("€49", { exact: true })).toBeVisible()
  await expect(page.getByText("€19", { exact: true })).toBeVisible()
  // One filled accent CTA on the page; the other tier buttons are ghosts.
  const buttons = page.locator("section.riq-pricing button")
  const filled: string[] = []
  for (let i = 0; i < (await buttons.count()); i++) {
    const bg = await buttons.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor)
    if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") filled.push(bg)
  }
  expect(filled).toHaveLength(1)
  expect(filled[0]).toBe("rgb(34, 197, 94)")
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
