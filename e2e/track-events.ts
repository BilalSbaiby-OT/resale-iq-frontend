import type { Page } from "@playwright/test"

/**
 * Collect the first-party funnel events a page fires, by intercepting the
 * /api/track POSTs the real client sends.
 *
 * Not a `*.spec.ts`, so Playwright's default testMatch does not collect it —
 * same convention as app-session.ts.
 *
 * Extracted 2026-09-06 because check:dupes caught three identical copies of
 * this block across signup-verify.spec.ts and locale-routing.spec.ts, which is
 * exactly the shape that check exists to stop: a funnel assertion is only worth
 * anything if every spec agrees on what "an event fired" means, and three
 * hand-copied route handlers had already started to drift on whether a
 * malformed body should fail the test.
 *
 * Returns a live array. Call it BEFORE page.goto — the route has to be
 * installed before the navigation that fires the event.
 */
export function captureTrackEvents(page: Page): string[] {
  const events: string[] = []
  void page.route("**/api/track", async (route) => {
    try {
      const body = route.request().postDataJSON() as { event?: string } | null
      if (body?.event) events.push(body.event)
    } catch {
      // why: a malformed track body must never fail the flow under test.
      // Analytics is allowed to be wrong; the signup is not.
    }
    await route.fulfill({ status: 204, body: "" })
  })
  return events
}
