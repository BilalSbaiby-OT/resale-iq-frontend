import { expect, test } from "@playwright/test"

/**
 * Partner/affiliate programme discoverability + AI-agent surfaces.
 *
 * Founder found /partners worked (200) but was unreachable: no page linked to
 * it, and /en/partners 404'd while the other locales redirected. This file
 * locks in the fix, plus the new AI-agent sections on /partners itself.
 */

test("homepage footer has a Partners link that navigates to /partners", async ({ page }) => {
  await page.goto("/")
  const link = page.getByRole("link", { name: "Partners" })
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(/\/partners$/)
  await expect(page.locator("h1")).toBeVisible()
})

test("/en/partners redirects to /partners, matching the other locales", async ({ request }) => {
  const res = await request.get("/en/partners", { maxRedirects: 0 })
  expect([307, 308]).toContain(res.status())
  const location = res.headers()["location"]
  expect(location).toMatch(/\/partners$/)
})

test("/de/partners, /fr/partners, /es/partners still redirect to /partners", async ({ request }) => {
  for (const path of ["/de/partners", "/fr/partners", "/es/partners"]) {
    const res = await request.get(path, { maxRedirects: 0 })
    expect([307, 308], path).toContain(res.status())
  }
})

test("/partners has #ai-agents and #terms sections with the curl examples", async ({ page }) => {
  const res = await page.goto("/partners")
  expect(res?.ok()).toBeTruthy()
  await expect(page.locator("#ai-agents")).toBeVisible()
  await expect(page.locator("#terms")).toBeVisible()
  await expect(page.locator("#ai-agents")).toContainText(/curl -X POST/)
  await expect(page.locator("#ai-agents")).toContainText(/api\/public\/affiliate\/register/)
  await expect(page.locator("#ai-agents")).toContainText(/api\/public\/affiliate\/stats/)
  await expect(page.locator("#terms")).toContainText(/30%/)
  await expect(page.locator("#terms")).toContainText(/60-day/)
  await expect(page.locator("#terms")).toContainText(/€25/)
  await expect(page.getByTestId("riq-affiliate-register-form")).toBeVisible()
})

test("/partners links to the /affiliate.json sibling via link rel=alternate", async ({ page }) => {
  await page.goto("/partners")
  const href = await page.locator('link[rel="alternate"][type="application/json"]').getAttribute("href")
  expect(href).toMatch(/\/affiliate\.json$/)
})

test("/affiliate.json is valid JSON with the founder-approved terms", async ({ request }) => {
  const res = await request.get("/affiliate.json")
  expect(res.ok()).toBeTruthy()
  expect(res.headers()["content-type"]).toContain("application/json")
  const body = await res.json()
  expect(body.commission.rate).toBe(0.3)
  expect(body.commission.months).toBe(12)
  expect(body.commission.cookie_days).toBe(60)
  expect(body.commission.min_payout_eur).toBe(25)
  expect(body.register.method).toBe("POST")
  expect(body.register.url).toContain("/api/public/affiliate/register")
  expect(body.stats.method).toBe("GET")
  expect(Array.isArray(body.rules)).toBeTruthy()
  expect(body.rules.length).toBeGreaterThan(5)
})

test("/llms.txt has the affiliate programme section", async ({ request }) => {
  // /llms.txt is served by src/app/llms.txt/route.ts (public/llms.txt was removed — it shadowed the route).
  const res = await request.get("/llms.txt")
  expect(res.ok()).toBeTruthy()
  const text = await res.text()
  expect(text).toContain("## Affiliate programme")
  expect(text).toContain("/affiliate.json")
  expect(text).toContain("/partners")
})

test("/robots.txt allows the affiliate API path, /affiliate.json and /partners", async ({ request }) => {
  const res = await request.get("/robots.txt")
  expect(res.ok()).toBeTruthy()
  const text = await res.text()
  expect(text).toContain("Allow: /partners")
  expect(text).toContain("Allow: /affiliate.json")
  expect(text).toContain("Allow: /api/public/affiliate/")
})

test("/pricing and /blog also link to /partners", async ({ page }) => {
  await page.goto("/pricing")
  await expect(page.getByRole("link", { name: /Partners.*Affiliate/i })).toBeVisible()
  await page.goto("/blog")
  await expect(page.getByRole("link", { name: /Partners.*Affiliate/i })).toBeVisible()
})
