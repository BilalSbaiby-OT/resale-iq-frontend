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

// The verdict palette — a refusal must never wear one of these (design/tokens.json
// color.verdict, defect 2 in the 2026-09-01 designer pass). Checked as computed
// `color` on every element inside the INSUFFICIENT_DATA panel, not just text.
// Apple system palette (dark) — buy #34C759, watch #FF9F0A, skip #FF453A.
// Was Tailwind #22c55e/#f59e0b/#ef4444 before the 2026-09 token change. The
// refusal panel must use NONE of these, so the list must track the live tokens.
const VERDICT_COLORS = ["#34C759", "#FF9F0A", "#FF453A"]

async function search(page: import("@playwright/test").Page, q: string) {
  await page.goto("/tools")
  await page.getByLabel(/Item to check/i).fill(q)
  const responsePromise = page.waitForResponse((r) => r.url().includes("/api/verdict"))
  await page.getByRole("button", { name: /Check this item/i }).click()
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
  // most-seen non-answer in the product. It must render as an honest,
  // DELIBERATE REFUSAL, never a blank card, a zero that reads as
  // "worthless," or a state indistinguishable from a broken lookup.
  //
  // 2026-09-01 (defect 2/3 fix): this used to assert the literal sentence
  // "Only 3 comparable sold items" and the label "NOT MEASURED". Both are
  // now gone on purpose — the panel no longer renders a big verdict-style
  // tag for a refusal, and the exact wording is backend copy
  // (demand-intel/engine/listing_identity.py) that is expected to change
  // once backend-eng sweeps the "sold" claim it was never swept for. A test
  // pinned to that sentence would break on every copy pass and teach people
  // to edit the test instead of reading it. Assert the PROPERTY instead:
  // never blank, never €0, a real reason from the API is shown, the honest
  // n is shown, a next step exists, and no verdict colour is used.
  test("shows a deliberate refusal — real reason, honest n, no verdict colour, never blank or €0", async ({ page }) => {
    const response = await search(page, "Thin Sample Sneaker")
    const body = await response.json()
    expect(body.verdict).toBe("INSUFFICIENT_DATA")
    // Sanity on the fixture itself — if this ever stops holding, the
    // assertions below are testing nothing.
    expect(body.n ?? body.sold_7d).not.toBeNull()
    expect(body.confidence_note || body.message).toBeTruthy()

    const panel = page.getByTestId("riq-insufficient")
    await expect(panel).toBeVisible()

    // Never blank, never a zero that reads as "worthless."
    const text = (await panel.innerText()).trim()
    expect(text.length).toBeGreaterThan(0)
    expect(text).not.toMatch(/undefined|NaN/)
    expect(text).not.toMatch(/€0\b/)

    // A real reason from the API is shown — not invented, not dropped. Uses
    // whatever the server actually sent for this fixture, not a hardcoded
    // sentence, so this does not re-pin the exact backend copy.
    const reason = body.confidence_note || body.message
    await expect(panel.getByText(reason, { exact: false })).toBeVisible()

    // The honest n is shown, not hidden — the product's own rule (design/
    // extension-panel/insufficient.html) is that a number without n is
    // unknown, so the panel with no price still owns its n. Scoped to the
    // dedicated testid, not a loose text search, since "3" alone would match
    // too much.
    const n = body.n ?? body.sold_7d
    await expect(page.getByTestId("riq-insufficient-n")).toHaveText(String(n))

    // No verdict colour: a refusal is not a call on the item. Checks the
    // computed `color` of every element in the panel, not just text, so a
    // colour reintroduced via a class or a parent style still fails this.
    const verdictColored = await panel.evaluate((el, colors) => {
      const hexToRgb = (hex: string) => {
        const n = parseInt(hex.slice(1), 16)
        return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
      }
      const bad = colors.map(hexToRgb)
      const all = [el, ...el.querySelectorAll("*")]
      return all.some((node) => bad.includes(getComputedStyle(node).color))
    }, VERDICT_COLORS)
    expect(verdictColored, "no element in the refusal panel may use a BUY/WATCH/SKIP colour").toBe(false)

    // A next step exists — this is not a dead end (defect 3). The rescue chips
    // are WORKING_MODELS / TRY_EXAMPLES, which now lead with New Balance 530
    // (a live WATCH). The old assertion looked for Nike Air Force 1, which
    // returns SKIP live — a stuck user was sent to a second dead end.
    await expect(panel.getByText(/try one of these instead/i)).toBeVisible()
    await expect(panel.getByRole("button", { name: "New Balance 530" })).toBeVisible()

    // The priced-metrics grid (Buy-below / Market price / Left shelf / Listed)
    // must not render at all — there is no price to show, and rendering the
    // grid with dashes reads as "we have this and it is zero."
    await expect(panel.getByText("Buy-below", { exact: true })).toHaveCount(0)
    // The upsell CTA is for a verdict the free tier withheld numbers on, not
    // for "we do not have this" — showing it here reads as a paywall on
    // honesty rather than on data.
    await expect(page.getByText(/Unlock sell-through, demand, sizes and history/i)).toHaveCount(0)
  })
})

test.describe("P0 — a withheld field reads as gated, never as a broken dash", () => {
  // Incident (2026-09-05): the homepage hero rendered the sell-through slot as
  // a bare "—" for every anonymous visitor. Nothing was broken and no data was
  // missing — the field is deliberately gated, and the API had been naming it
  // in `locked_fields` all along:
  //
  //   curl -s "https://resaleiq.dev/api/verdict?q=Adidas%20Samba"
  //   → "locked": false,
  //     "locked_fields": ["sell_through_rate","top_sizes", ...]
  //
  // The UI branched on the `locked` BOOLEAN, which W1 (demand-intel 5019fa0)
  // had made a constant false on every backend branch. So the gated-copy path
  // was dead code and the dash always won. The first thing a stranger saw of
  // the product was a metric that looked broken instead of one worth paying
  // for.
  //
  // These assert the PROPERTY, not the wording — copy is localised in six
  // locales and will change. What must not change: the API said this field was
  // withheld, so the screen says so too, and offers a way through.
  test("the gated sell-through slot shows a lock and a route, not a dash", async ({ page }) => {
    const body = await (await search(page, "Adidas Samba")).json()

    // Guard the premise. If the backend ever stops gating this field these
    // assertions are testing nothing, and the test should fail loudly rather
    // than pass vacuously.
    expect(body.locked_fields, "the mock must still gate this field").toContain("sell_through_rate")
    expect(body.sell_through_rate, "a gated field is ABSENT, never blurred").toBeUndefined()

    const locked = page.getByTestId("riq-locked-stat")
    await expect(locked).toBeVisible()

    // The field is named, so the visitor learns the product measures it.
    await expect(locked).toContainText(/sell-through|taux d'écoulement|tasa de venta|verkaufsrate|tasso di vendita|taxa de venda/i)

    // The regression itself: not a dash, not "N/A", not empty.
    await expect(locked).not.toHaveText(/^\s*$/)
    const shown = (await locked.innerText()).trim()
    expect(shown, "a gated field must never render as a bare dash or N/A").not.toMatch(/^(—|-|N\/A)$/i)

    // A lock with no way through is the same dead end as the dash it replaced.
    await expect(locked).toHaveAttribute("href", /\/register\?plan=free$/)

    // ABSENT, NOT BLURRED: the withheld values must not be anywhere in the DOM
    // for CSS to reveal. This is the rule tests/test_verdict_leak.py enforces
    // server-side; the lock affordance must not be the thing that breaks it.
    //
    // Matched as `"field":` — the shape a serialised payload takes — and NOT as
    // a bare `"field"`, which also matches an HTML attribute like
    // data-locked-field="sell_through_rate". The lock tile names the field it
    // is standing in for, on purpose; naming a withheld field is the fix, and
    // only shipping its VALUE would be the leak.
    const html = await page.content()
    for (const field of PAID_ONLY_FIELDS) {
      expect(html, `${field} must not be serialised into the DOM`).not.toContain(`"${field}":`)
    }
  })

  test("no bare dash is left standing in the hero's metric grid", async ({ page }) => {
    await search(page, "Adidas Samba")
    // Every tile either carries a real value or is the lock above. An element
    // whose entire text is "—" is the bug, in whatever slot it appears.
    await expect(
      page.getByText("—", { exact: true }),
      "no metric may render its value as a bare dash",
    ).toHaveCount(0)
  })
})

test.describe("P0 — bare-brand is priced, next click is an item-level WATCH", () => {
  for (const q of ["Nike", "Ralph Lauren", "Nike Nocta"] as const) {
    test(`${q} is not NO DATA / create-account, and offers a live WATCH chip`, async ({ page }) => {
      await search(page, q)
      await expect(page.getByText("NO DATA")).toHaveCount(0)
      await expect(page.getByText(/create a free account/i)).toHaveCount(0)
      // Rescue chips lead with New Balance 530 (live WATCH). Old assertion
      // wanted Air Force 1 + Samba, both SKIP live — a second dead end.
      await expect(page.getByRole("button", { name: "New Balance 530" })).toBeVisible()
    })
  }

  test("Nike → New Balance 530 chip is a live item-level call with buy-below", async ({ page }) => {
    await search(page, "Nike")
    const next = page.waitForResponse((r) => r.url().includes("/api/verdict") && r.url().includes("Balance"))
    await page.getByRole("button", { name: "New Balance 530" }).click()
    const body = await (await next).json()
    expect(["BUY", "WATCH", "SKIP"]).toContain(body.verdict)
    expect(body.buy_below).toEqual(expect.any(Number))
    await expect(page.getByText("WATCH", { exact: true })).toBeVisible()
  })
})

test.describe("P0 — DATA TRUTH on the public verdict card", () => {
  // Incident: every BUY the live catalogue issues comes from
  // api/routes.py `_provisional_verdict` — a call resting on momentum, speed
  // and sold prices alone, with sell-through still maturing. The server has
  // always sent `provisional: true` on the anonymous payload, and this card
  // was the one verdict surface that dropped it, printing a bare
  // "BUY · Confidence MEDIUM" over a call the API never settled. The
  // authenticated /verdict card has shown it since it shipped.
  test("a provisional call says so — the public card never presents it as settled", async ({ page }) => {
    const body = await (await search(page, "Nike Air Force 1 Low")).json()
    expect(body.provisional, "fixture must exercise the provisional path").toBe(true)
    expect(body.verdict).toBe("BUY")

    await expect(page.getByText("BUY", { exact: true })).toBeVisible()
    await expect(
      page.getByText(/provisional/i),
      "a provisional verdict must be labelled provisional on the public card",
    ).toBeVisible()
  })

  // Incident: `sold_7d ?? n`. `n` is comparable_n — the fenced subset of clean
  // comps the price and confidence band are computed from — NOT a departure
  // count. The fallback put it under the "Left shelf (watched)" label and into
  // "N left the shelf vs M still listed", answering a different question than
  // the label asks. Live Samba is 43 departures against 20 comparables; the
  // fixture keeps them distinct (48 vs 20) so a swap cannot pass.
  test("the departures count is sold_7d, never the comparable count n", async ({ page }) => {
    const body = await (await search(page, "Adidas Samba")).json()
    expect(body.sold_7d).not.toEqual(body.n) // the fixture must be able to tell them apart

    const departures = String(body.sold_7d)
    const comparables = String(body.n)

    await expect(
      page.getByText(new RegExp(`${departures} left the shelf`, "i")),
      "the sample sentence must count watched departures (sold_7d)",
    ).toBeVisible()
    await expect(
      page.getByText(new RegExp(`\\b${comparables} left the shelf`, "i")),
      "comparable_n must never be rendered as a departures count",
    ).toHaveCount(0)
  })

  // Incident: a real non-zero sell-through printing as "0%". Anonymous callers
  // get the rate withheld entirely, so the assertion the PUBLIC card can carry
  // is the stronger one — a withheld rate is a lock, and "0%" appears nowhere
  // on the card at all. The formatter's own boundaries are pinned as a unit
  // spec in src/lib/str-pct.test.ts (npm run test:unit).
  test("no sell-through slot ever reads 0%", async ({ page }) => {
    await search(page, "Adidas Samba")
    await expect(page.getByTestId("riq-locked-stat")).toBeVisible()
    await expect(page.getByText(/\b0(\.0)?%/)).toHaveCount(0)
  })
})

test.describe("P0 — HARD_PAYWALL 402 is a checkout card, not an error or a leaked teaser", () => {
  // Live 2026-09-12: anon /api/verdict → 402 PAYWALL, no buy_below.
  // The public checker used to throw "Could not check that item" on any !ok,
  // so the conversion face was a red error. This pins the replacement: a
  // Start — €19/mo CTA and zero teaser fields.
  test("402 PAYWALL shows Start €19 and never leaks the locked buy_below price", async ({ page }) => {
    await page.route("**/api/verdict**", async route => {
      await route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({ verdict: "PAYWALL", locked: true, message: "A Resale IQ subscription is required to check items.", upgrade_url: "/register", plans: [{ tier: "operator", label: "Starter", price_eur: 19 }, { tier: "power", label: "Pro", price_eur: 49 }], buy_below: 32.01, sell_avg: 48.14 }),
      })
    })
    await page.goto("/tools")
    await page.getByLabel(/Item to check/i).fill("Adidas Samba")
    await page.getByRole("button", { name: /Check this item/i }).click()
    const wall = page.getByTestId("riq-hard-paywall")
    await expect(wall).toBeVisible()
    await expect(wall).toContainText(/Start — €19/)
    // The locked buy_below value (32.01) and sell_avg (48.14) must never render.
    // Note: the copy intentionally says "buy-below price" as CRO — the test guards
    // the numeric value leaking, not the word.
    await expect(wall).not.toContainText(/32\.01/)
    await expect(wall).not.toContainText(/48\.14/)
    await expect(page.getByText(/Could not check that item/i)).toHaveCount(0)
    await expect(page.getByText(/Unlock the rest/i)).toHaveCount(0)
  })
})
