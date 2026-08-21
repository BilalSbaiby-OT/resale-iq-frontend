import { expect, test } from "@playwright/test"

/**
 * Read-only GETs against production. Skipped when resaleiq.dev is unreachable
 * so the local suite still passes offline.
 */
const PROD = "https://resaleiq.dev"

test.describe("production (read-only)", () => {
  test.beforeAll(async ({ request }) => {
    try {
      const r = await request.get(`${PROD}/api/health`, { timeout: 12_000 })
      test.skip(!r.ok(), "production health not reachable")
    } catch {
      test.skip(true, "production not reachable")
    }
  })

  test("GET / returns HTML", async ({ request }) => {
    const r = await request.get(PROD)
    expect(r.ok()).toBeTruthy()
    const body = await r.text()
    expect(body.length).toBeGreaterThan(200)
    expect(body).toMatch(/Resale IQ|Stop guessing/i)
  })

  test("GET /data does not 500", async ({ request }) => {
    const r = await request.get(`${PROD}/data`)
    expect(r.status()).toBeLessThan(500)
    const body = await r.text()
    expect(body).not.toMatch(/\bNaN\b/)
  })

  test("GET /login returns a sign-in form", async ({ request }) => {
    const r = await request.get(`${PROD}/login`)
    expect(r.ok()).toBeTruthy()
    const body = await r.text()
    expect(body.toLowerCase()).toMatch(/password|sign in|welcome back/)
  })
})
