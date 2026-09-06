import { test, expect, type Page } from "@playwright/test"
import { captureTrack } from "./track-events"

/**
 * The instrument, not the funnel.
 *
 * Everything here pins a case where production recorded NOTHING and we read
 * that absence as "nobody did it". Measured against the production DB on
 * 2026-09-06:
 *
 *   - 8 distinct visitors fired `pricing_view`. ZERO logged-out visitors have
 *     ever fired `checkout_started`, because they structurally cannot: the auth
 *     redirect in pricing-section.tsx returned above the tracking call. Every
 *     stranger who pressed a paid tier and stopped at the register wall was
 *     invisible.
 *   - 367 non-bot pageviews, ONE with a referrer host, while the platforms we
 *     publish to reported 4,047 TikTok views and 46 on X. A bare arrival (X
 *     strips utm_content from live tweets) was stored as `(null)` and became
 *     indistinguishable from someone typing the domain.
 *
 * These are assertions about what the client SENDS. They do not assert that
 * anyone converts — that is the funnel's problem, and inventing a number here
 * would be the same mistake in a new place.
 */

/** Seed document.referrer for the very first document, before any app code
 *  runs. Playwright's `referer` header alone is not enough: captureAttribution
 *  reads document.referrer, which a header does not populate on a direct goto. */
async function arriveFrom(page: Page, referrer: string) {
  await page.addInitScript((r) => {
    Object.defineProperty(document, "referrer", { get: () => r, configurable: true })
  }, referrer)
}

test.describe("guest checkout intent", () => {
  test("a logged-out visitor pressing a paid tier is recorded, with the tier they pressed", async ({ page }) => {
    const { events, payloads } = captureTrack(page)
    await page.goto("/pricing")

    // The one filled CTA belongs to the highlighted paid tier. Pressing by role
    // rather than by test id, because the thing under test is what a real
    // visitor's click produces.
    const buy = page.getByRole("button", { name: /Get the numbers|Let it find the deals/i }).first()
    await expect(buy).toBeVisible()
    await buy.click()

    await expect.poll(() => events, { timeout: 10_000 }).toContain("checkout_intent_guest")

    // It must NOT masquerade as a real Stripe session. This is the assertion
    // that keeps the two events from being conflated later.
    expect(events).not.toContain("checkout_started")

    const intent = payloads.find((p) => p.event === "checkout_intent_guest")
    expect(intent, "the intent event must carry a payload").toBeTruthy()
    // The tier rides on the path because /api/track persists no extra body
    // fields. Losing it would reduce the event to "someone wanted to pay",
    // which does not tell us WHAT to price.
    expect(intent!.path).toMatch(/[?&]plan=(operator|power)\b/)
  })

  test("the visitor still lands on register — instrumenting the wall did not move it", async ({ page }) => {
    captureTrack(page)
    await page.goto("/pricing")
    const buy = page.getByRole("button", { name: /Get the numbers|Let it find the deals/i }).first()
    await buy.click()
    await expect(page).toHaveURL(/\/register\?plan=(operator|power)/)
  })
})

test.describe("arrival attribution", () => {
  test("a bare t.co arrival is attributed to X instead of (null)", async ({ page }) => {
    await arriveFrom(page, "https://t.co/aBcD1234")
    const { payloads } = captureTrack(page)
    // No UTM at all: exactly the shape an X post arrives as once Postiz has
    // stripped utm_content from the live tweet.
    await page.goto("/")

    await expect.poll(() => payloads.length, { timeout: 10_000 }).toBeGreaterThan(0)
    const first = payloads[0]
    expect(first.utm_source).toBe("x")
    expect(first.utm_medium).toBe("social")
    // Auditable as `where utm_term='referrer'` — derived, never a tagged click.
    expect(first.utm_term).toBe("referrer")
  })

  test("a tagged link keeps its own campaign and is not marked derived", async ({ page }) => {
    await arriveFrom(page, "https://t.co/aBcD1234")
    const { payloads } = captureTrack(page)
    await page.goto("/?utm_source=tiktok&utm_medium=bio&utm_campaign=sept&utm_content=r191")

    await expect.poll(() => payloads.length, { timeout: 10_000 }).toBeGreaterThan(0)
    const first = payloads[0]
    expect(first.utm_source).toBe("tiktok")
    expect(first.utm_medium).toBe("bio")
    expect(first.utm_content).toBe("r191")
    expect(first.utm_term).toBeFalsy()
  })

  test("a direct visit stays direct — no channel is invented", async ({ page }) => {
    await arriveFrom(page, "")
    const { payloads } = captureTrack(page)
    await page.goto("/")

    await expect.poll(() => payloads.length, { timeout: 10_000 }).toBeGreaterThan(0)
    expect(payloads[0].utm_source).toBeFalsy()
  })

  test("internal navigation does not manufacture a channel from our own host", async ({ page }) => {
    // The producthunt failure in miniature: this is a Next SPA, document.referrer
    // is fixed at document load, so a same-site value must never be attributed.
    await arriveFrom(page, "http://localhost:3100/pricing")
    const { payloads } = captureTrack(page)
    await page.goto("/")

    await expect.poll(() => payloads.length, { timeout: 10_000 }).toBeGreaterThan(0)
    expect(payloads[0].utm_source).toBeFalsy()
  })
})
