import { expect, test } from "@playwright/test"
import { loginAs } from "./app-session"
import { captureTrackEvents } from "./track-events"

/**
 * THE FIRST SCREEN A VERIFIED ACCOUNT LANDS ON.
 *
 * verify-email-content.tsx does `router.replace("/verdict")`, so this page is
 * the product for anyone who has just confirmed their address. It used to
 * arrive empty — an input box and two chips.
 *
 * Production, read-only, 2026-09-06: 7 genuine registered users, verdict_logs
 * counts 0,0,0,0,0,3,4. Five of seven never ran a single check. Zero users had
 * ever spent an unlock or hit the 10/day cap, so the funnel was not dying at
 * any limit — it died before the first query, on this screen.
 *
 * These tests pin the two halves of the fix, and the second matters as much as
 * the first: the screen shows a real priced answer, AND it does not pretend the
 * visitor ran it.
 */
test.describe("first screen: a worked answer, not an empty box", () => {
  test("cold /verdict opens with a real verdict carrying a buy-below number", async ({ page }) => {
    await loginAs(page, "en")
    await page.goto("/verdict")

    const seed = page.getByTestId("riq-seed-verdict")
    await expect(seed).toBeVisible()
    // The item-level answer, not a brand average and not a marketing line.
    await expect(seed).toContainText("New Balance 530")
    await expect(seed).toContainText(/WATCH|BUY|SKIP/)
    // The buy-below tile IS the argument — a label with a dash under it would
    // pass a "the card rendered" assertion and fail the actual point.
    await expect(seed).toContainText(/Buy below/i)
    await expect(seed).toContainText(/€\d/)
  })

  test("the example says it is an example, so nobody reads it as their own result", async ({ page }) => {
    await loginAs(page, "en")
    await page.goto("/verdict")
    await expect(page.getByTestId("riq-seed-verdict")).toContainText(/Live example/i)
    await expect(page.getByTestId("riq-seed-verdict")).toContainText(/not your check/i)
  })

  /**
   * The one that protects the scoreboard rather than the UI.
   *
   * OPERATING-RULES §1 defines an activated user as "a registered user who ran
   * a real sourcing analysis and got an item-level answer", and `verdict_seen`
   * / `analysis_completed` are how that is counted. Auto-running a check on
   * arrival would have made every new account activated on signup and made the
   * company's first-priority metric unreadable. The seed is server-rendered
   * from the shared hero cache: no call carries the visitor's token, no
   * verdict_logs row is written for them, none of their 10 daily checks is
   * spent, and no funnel event fires.
   */
  test("the seed does not count itself as an analysis", async ({ page }) => {
    const events = captureTrackEvents(page)
    await loginAs(page, "en")
    await page.goto("/verdict")
    await expect(page.getByTestId("riq-seed-verdict")).toBeVisible()
    // The events under test are fire-and-forget, so give them room to arrive
    // before asserting their absence — an instant assertion would pass even if
    // they were firing.
    await page.waitForTimeout(2_000)
    expect(events).not.toContain("verdict_seen")
    expect(events).not.toContain("analysis_completed")
  })

  test("running a real check replaces the example with the visitor's own answer", async ({ page }) => {
    await loginAs(page, "en")
    await page.goto("/verdict")
    await expect(page.getByTestId("riq-seed-verdict")).toBeVisible()

    // By placeholder, not `.first()` — AppShell renders its own inputs and the
    // Check button stays disabled until THIS one carries a query.
    await page.getByPlaceholder(/Adidas Samba, Nike Air Force 1/).fill("Adidas Samba")
    await page.getByRole("button", { name: /^Check$/ }).click()

    await expect(page.getByTestId("riq-seed-verdict")).toHaveCount(0)
    await expect(page.getByText("Adidas Samba").first()).toBeVisible()
  })

  /**
   * A `?q=` deep link is about to run its own query. The seed must not flash in
   * the tick between mount and the effect firing — a card that appears and is
   * replaced reads as a glitch, and worse, as an answer that changed its mind.
   */
  test("a ?q= deep link never shows the example", async ({ page }) => {
    await loginAs(page, "en")
    await page.goto("/verdict?q=Adidas%20Samba")
    await expect(page.getByText("Adidas Samba").first()).toBeVisible()
    await expect(page.getByTestId("riq-seed-verdict")).toHaveCount(0)
  })
})
