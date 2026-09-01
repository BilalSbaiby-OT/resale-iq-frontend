import { expect, test } from "@playwright/test"

/**
 * Four specs, each locked to a REAL incident, not coverage theatre. See
 * docs/eng/QA.md for the incident write-up and what these do NOT prove.
 *
 * The mock backend (e2e/mock-backend.mjs) hand-mirrors the documented
 * contract from demand-intel's own regression tests:
 *   - tests/test_anon_quota_cookie.py  (spec 1)
 *   - tests/test_verdict_leak.py       (spec 2)
 *   - api/routes.py `data_sufficient` branch (spec 3)
 * It does not run the Python gate itself — that stays demand-intel's job,
 * already gated in its own CI. This suite proves the FRONTEND holds up its
 * end of that contract: it does not invent a rejection the server never
 * sent, it does not render a field the server withheld, and it renders the
 * honest state rather than a blank or a zero.
 */

const PAID_ONLY_FIELDS = [
  "sell_through_rate", "top_sizes", "size_velocity", "opportunity_score",
  "reasons", "months_supply", "data_quality", "str_pct",
]

async function search(page: import("@playwright/test").Page, q: string) {
  await page.goto("/tools")
  await page.getByLabel(/Item to check/i).fill(q)
  const responsePromise = page.waitForResponse((r) => r.url().includes("/api/verdict"))
  await page.getByRole("button", { name: /Check it free/i }).click()
  return responsePromise
}

test.describe("P0 — a brand-new anonymous visitor's first search", () => {
  // Incident: a visitor with NO cookies, no localStorage, no sessionStorage —
  // the opening click of every new visitor — got LIMIT_REACHED on their
  // FIRST EVER request, because the quota bucket was shared/keyed before any
  // identity existed for them. Fixed server-side by minting the visitor
  // cookie and judging THAT SAME request against the fresh, empty bucket.
  test("never returns LIMIT_REACHED, and a visitor cookie is minted", async ({ page, context }) => {
    expect(await context.cookies()).toHaveLength(0) // fresh context = the incident's exact starting state

    const response = await search(page, "Nike Air Force 1")
    const body = await response.json()

    expect(body.verdict).not.toBe("LIMIT_REACHED")
    expect(body.verdict).toBe("BUY")

    await expect(page.getByText("LIMIT REACHED")).toHaveCount(0)
    await expect(page.getByText("BUY", { exact: true })).toBeVisible()

    const cookies = await context.cookies()
    expect(cookies.some((c) => c.name === "riq_vid")).toBe(true)
  })

  // The quota must be real, not a stub that never limits anyone — otherwise
  // the test above proves nothing. Same visitor, 11 requests: the first 10
  // succeed, the 11th (and only the 11th) is turned away. Uses page.request
  // so it shares the context's cookie jar without redriving the UI 11 times.
  test("the SAME visitor is capped after their quota, proving the check above is not vacuous", async ({ page }) => {
    await page.goto("/tools") // establishes the mock backend as same-origin via the Next rewrite
    const verdicts: string[] = []
    for (let i = 0; i < 11; i++) {
      const r = await page.request.get(`/api/verdict?q=${encodeURIComponent("Nike Air Force 1")}`)
      verdicts.push((await r.json()).verdict)
    }
    expect(verdicts.slice(0, 10), "the visitor's own 10 free checks must all succeed").not.toContain("LIMIT_REACHED")
    expect(verdicts[10], "the 11th request from the SAME visitor must be capped").toBe("LIMIT_REACHED")
  })
})

test.describe("P0 — paywall must not leak paid fields to anonymous callers", () => {
  // Incident: three separate return paths bypassed the paywall gate at once
  // (_provisional_verdict, INSUFFICIENT_DATA, and the main path) and shipped
  // buy_below/sell_avg/top_sizes/reasons/data_quality to anonymous callers.
  // One assertion per path, run against an anonymous (cookie-less) context.
  for (const [label, q] of [
    ["the main BUY/WATCH/SKIP path", "Nike Air Force 1"],
    ["the provisional (momentum-only) path", "Provisional Momentum Item"],
    ["the INSUFFICIENT_DATA path", "Thin Sample Sneaker"],
  ] as const) {
    test(`${label} — no PAID_ONLY_FIELDS reach the anonymous JSON response`, async ({ page }) => {
      const response = await search(page, q)
      const body = await response.json()
      const leaked = PAID_ONLY_FIELDS.filter((f) => body[f] !== undefined && body[f] !== null)
      expect(leaked, `anonymous caller received paid fields: ${JSON.stringify(leaked)}`).toEqual([])
    })
  }

  test("the UI never renders a real Sell-through number for an anonymous caller", async ({ page }) => {
    await search(page, "Nike Air Force 1")
    // The component renders a paid-locked placeholder ("—" or "Plan") when
    // sell_through_rate is absent — it must never show "62%", the number
    // only a paying/unlocked account is meant to see.
    await expect(page.getByText("62%")).toHaveCount(0)
  })
})

test.describe("P0 — INSUFFICIENT_DATA renders the honest state", () => {
  // 40.9% of answered searches take this path in production — the
  // most-seen non-answer in the product. It must render as an honest state,
  // never a blank card or a zero that reads as "worthless."
  test("shows NOT MEASURED, the real reason, and never a blank or a €0", async ({ page }) => {
    await search(page, "Thin Sample Sneaker")

    // Scoped to the result panel itself: /tools also lists unrelated
    // "Buy-below" copy in its search-intent links further down the page, so
    // a page-wide text search would pass even if the checker leaked one.
    // The confidence-note paragraph is a direct child of the result panel
    // (see FreeChecker JSX), so its parent is exactly that scope.
    const checker = page.locator("p", { hasText: /Only 3 comparable sold items/i }).locator("xpath=..")

    await expect(checker.getByText("NOT MEASURED")).toBeVisible()
    await expect(checker.getByText(/Only 3 comparable sold items/i)).toBeVisible()

    const text = await checker.innerText()
    expect(text).not.toMatch(/undefined|NaN/)
    expect(text).not.toMatch(/€0\b/)

    // The priced-metrics grid (Buy-below / Market price / Sold / Listed)
    // must not render at all — there is no price to show, and rendering the
    // grid with dashes reads as "we have this and it is zero." Exact match:
    // the honest message text itself legitimately says "...to name a
    // buy-below" in a sentence, which a substring match would wrongly flag.
    await expect(checker.getByText("Buy-below", { exact: true })).toHaveCount(0)
    // The upsell CTA is for a verdict the free tier withheld numbers on, not
    // for "we do not have this" — showing it here reads as a paywall on
    // honesty rather than on data.
    await expect(checker.getByText(/Unlock sell-through, demand, sizes and history/i)).toHaveCount(0)
  })
})
