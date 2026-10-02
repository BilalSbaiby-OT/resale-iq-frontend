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

// Founder feedback 2026-09-29 ("why you dont show pricing on homepage?"):
// before this, the homepage only mentioned a bare "€19/mo" in body text plus
// a dim "Pricing →" link — the Pro tier and both plan cards never rendered
// on "/" at all (2026-09-22 CRO restructure replaced the inline PricingSection
// with a teaser). This locks in the fix: the homepage now embeds the SAME
// PricingSection component /pricing renders (compact mode, headingLevel=2 so
// the document keeps exactly one h1), showing both Starter €19 and Pro €49
// plan cards, right on the front door.
test("homepage shows Starter €19 and Pro €49 plan cards, with exactly one h1", async ({ page }) => {
  const res = await page.goto("/")
  expect(res?.ok()).toBeTruthy()
  await expect(page.locator("h1")).toHaveCount(1)
  const pricing = page.locator("section.riq-pricing")
  await expect(pricing).toBeVisible()
  // Heading inside the embedded section must be an h2, not a second h1.
  await expect(pricing.locator("h1")).toHaveCount(0)
  await expect(pricing.locator("h2")).toHaveCount(1)
  await expect(page.getByTestId("riq-pricing-amount-operator")).toHaveText("€19")
  await expect(page.getByTestId("riq-pricing-amount-power")).toHaveText("€49")
  await expect(page.getByText("Starter", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("Pro", { exact: true }).first()).toBeVisible()
  await expect(page.getByTestId("riq-pricing-cta-operator")).toHaveText(/Start my 7-day free trial/i)
  await expect(page.getByTestId("riq-pricing-cta-power")).toHaveText(/Start my 7-day free trial/i)
  // 2026-09-30 text-diet pass: the standalone "See full comparison →
  // Pricing" text link was removed from the homepage (it duplicated the nav
  // Pricing link one screen up) — the nav link is now the only route to
  // /pricing from the front door, and the compact cards on "/" already show
  // both prices, so nothing is lost.
  await expect(page.getByRole("link", { name: /See full comparison/i })).toHaveCount(0)
})

test("homepage hero has one primary Check CTA and free-plan unlocks", async ({ page }) => {
  await page.goto("/")
  const hero = page.locator("section.riq-apple-hero")
  // H1 asserts the ranked buy list framing (2026-09-22) — not the old per-item "buy-below price before you source" copy.
  await expect(hero.getByRole("heading", { level: 1 })).toContainText(/buy|resell|Vinted/i)
  // Verdict system names appear in the SSR buy list (BUY badge) or the checker result
  await expect(hero.getByText(/BUY|WATCH|SKIP/i).first()).toBeVisible()
  await expect(hero.getByText(/For people who resell second-hand clothes/i)).toHaveCount(0)
  await expect(hero.getByText(/live second-hand clothing listings/i)).toHaveCount(0)
  await expect(hero.getByTestId("riq-home-teaser-cite")).toBeHidden()
  // Input starts EMPTY on purpose (2026-09-10 funnel fix).
  // initialResult removed 2026-09-28: the WATCH example was taking above-fold space
  // on mobile — the SSR buy list BUY rows are the proof story now.
  await expect(hero.getByRole("textbox")).toHaveValue("")
  // Example card no longer pre-rendered (initialResult=null) — SSR buy list is the proof
  await expect(hero.getByText("Example", { exact: true })).toHaveCount(0)
  await expect(hero.getByRole("heading", { level: 1 })).not.toContainText(/Adidas Samba/)
  // H139: free-sample chips are now buttons (inline fetch), not links (navigation).
  await expect(hero.getByRole("button", { name: "Adidas Samba" })).toBeVisible()
  await expect(hero.getByRole("button", { name: "Nike Air Force 1" })).toBeVisible()
  await expect(hero.getByRole("button", { name: "Fred Perry Polo" })).toBeVisible()
  // Non-free-model queries must not appear as chip buttons.
  await expect(hero.getByRole("button", { name: "Levi's 501" })).toHaveCount(0)
  await expect(hero.getByRole("button", { name: "New Balance 550" })).toHaveCount(0)
  // riq-free-scope is the trust/speed line (anon checks are paywalled, so it must not promise a free check).
  await expect(hero.getByTestId("riq-free-scope")).toContainText(/guru/i)
  // The SSR buy list shows live buy-list rows — check buy-below is visible
  await expect(hero.getByText(/BUY|WATCH/i).first()).toBeVisible()
  // The seed must never be a provisional call again. #54 renders the
  // provisional badge honestly wherever it applies; the point here is that
  // the FACE of the product is not a call the API hedged.
  await expect(hero).not.toContainText(/provisional/i)
  // #54 removed the bare "n=" chip card-wide; XOR: left-the-shelf is sold_7d
  // only, and the slim fold does not print n at all.
  await expect(hero.getByText(/\bn=\d/)).toHaveCount(0)
  // SSR buy list: live BUY/WATCH rows are the proof above the fold
  // (the Samba WATCH example card was removed 2026-09-28 to free up above-fold mobile space).
  // The durable invariant is: live buy-list rows with buy-below prices are visible
  // on the homepage hero — the product's core output without requiring interaction.
  await expect(hero.getByText(/BUY|WATCH/i).first()).toBeVisible()
  // Checker buy-below row still visible when a check is run (not tested here — no API call).
  // Market price label is not shown (confirmed removed). Still listed (confirmed removed).
  await expect(hero.getByText("Market price", { exact: true })).toHaveCount(0)
  await expect(hero.getByText("Still listed", { exact: true })).toHaveCount(0)
  // One Check control in the hero — do not count nav/footer chrome.
  await expect(hero.getByRole("button", { name: /check/i })).toHaveCount(1)
  await expect(hero.getByRole("link", { name: /open dashboard/i })).toHaveCount(0)
  await expect(hero.getByRole("link", { name: /sign in/i })).toHaveCount(0)
  // E-13 retargeted (2026-09-28): initialResult removed from hero — locked sell-through
  // no longer shown on page load (checker starts empty). The durable invariant is that
  // locked rows in the SSR buy list (Revenue showLockedFomo) never link to /register —
  // the paywall fires inline on /tools after a real query.
  await expect(hero.locator('a[href*="/register"]')).toHaveCount(0)
  // 2026-09-30 text-diet pass: LiveMarketPulse ("This is what's actually
  // selling right now" data table, riq-market-showing) was removed from the
  // homepage embed — same live-data honesty now lives in the brand strip's
  // "+N more" link to /data and the how-it-works coverage line. LiveMarketPulse
  // itself is untouched and still renders on /pricing (see smoke.spec.ts's
  // /pricing test + homepage-conv.test.ts's source-level assertions on it).
  await expect(page.getByTestId("riq-market-showing")).toHaveCount(0)
  await expect(page.getByTestId("riq-brand-more")).toHaveAttribute("href", "/data")
})

test("homepage checker is centered, Free: is above the 1280x800 fold, logos are marks", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/")
  const form = page.locator("#check form.riq-checker-row")
  const box = await form.boundingBox()
  expect(box).toBeTruthy()
  const mid = box!.x + box!.width / 2
  expect(Math.abs(mid - 640)).toBeLessThan(48)

  const scope = page.getByTestId("riq-free-scope")
  await expect(scope).toBeVisible()
  const scopeBox = await scope.boundingBox()
  expect(scopeBox).toBeTruthy()
  // 2026-09-22: SSR buy list now sits above the checker and pushes the scope
  // line down. The FOLD test is satisfied by the SSR buy list teaser (which
  // is above the form and proves value). The scope line just needs to be
  // BELOW the form and ABOVE the chips — the original content-ordering intent.
  const formBottom = box!.y + box!.height
  expect(scopeBox!.y).toBeGreaterThan(formBottom - 4)
  const chips = page.getByTestId("riq-hero-try-chips")
  const chipsBox = await chips.boundingBox()
  expect(chipsBox).toBeTruthy()
  expect(chipsBox!.y).toBeGreaterThan(scopeBox!.y)

  const strip = page.getByTestId("riq-brand-strip")
  await expect(strip.locator("img")).toHaveCount(9)
  for (const img of await strip.locator("img").all()) {
    await expect(img).toHaveAttribute("src", /\/brand-marks\/.+\.svg$/)
  }
  await expect(strip.getByText("Patagonia")).toHaveCount(0)
  await expect(strip.getByText("Balenciaga")).toHaveCount(0)
  await expect(strip.getByText("Fred Perry")).toHaveCount(0)
  await expect(strip.getByText("These are the brands we watch")).toHaveCount(0)
  const more = strip.getByTestId("riq-brand-more")
  await expect(more).toBeVisible()
  await expect(more).toHaveText(/\+\d+ more/)
  await expect(more).toHaveAttribute("href", "/data")
})

test("/data shows a number or last-good snapshot, never crashes on null", async ({ page }) => {
  const res = await page.goto("/data")
  expect(res?.ok()).toBeTruthy()
  await expect(page.locator("h1")).toContainText(/Weekly brand volumes on Vinted/i)
  const body = await page.locator("body").innerText()
  expect(body).not.toMatch(/undefined|NaN/)
  // Either live/last-good figures or the honest empty state — not a 500.
  expect(body.includes("Nike") || body.includes("being refreshed") || body.includes("Sold")).toBeTruthy()
  const weekly = page.getByRole("table", { name: /Weekly market snapshot/i })
  await expect(weekly).toBeVisible()
  await expect(weekly).toContainText(/Sold \(7 days\)/)
  // The exact distinct-item count is published here, labelled as distinct items;
  // the headline ("2M+ listing records" from the mock's COUNT(*)) sits beside it.
  await expect(weekly).toContainText(/Distinct items/)
  await expect(page.getByTestId("riq-data-distinct")).toHaveText("966,236")
  await expect(page.locator(".riq-data-cite")).toContainText(/Listing records\s*2M\+/)
  await expect(weekly).toContainText(/Freshness/)
})

test("/es/login is Spanish and is not a 307 to English Welcome back", async ({ page }) => {
  const res = await page.goto("/es/login")
  expect(res?.ok()).toBeTruthy()
  expect(page.url()).toMatch(/\/es\/login/)
  await expect(page.locator("h1")).toContainText(/Bienvenido/i)
  await expect(page.locator("body")).not.toContainText("Welcome back")
  await expect(page.locator("body")).not.toContainText("Sign in to access")
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
  // Demand OS hero — not the old Vinted-sourcing / “Know what to pay” line.
  await expect(page.locator("h1")).toContainText(/Source the right stock at the right price/i)
  const hero = page.locator("section.riq-pricing")
  await expect(hero).toContainText(/BUY \/ WATCH \/ SKIP/)
  await expect(hero).toContainText(/€19/)
  // Paid ladder only. Free is a one-line public-data link, not a competing €0 card.
  for (const name of ["Starter", "Pro"]) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
  }
  await expect(page.getByTestId("riq-public-data-line")).toContainText(/Public data only \(not item checks\)/i)
  // ONE headline: the records count floored to the whole million, named as records.
  // The mock's distinct count (966,236) must NOT be what the trust line quotes.
  await expect(page.getByTestId("riq-starter-trust")).toContainText(/2M\+ listing records/)
  await expect(page.getByTestId("riq-starter-trust")).not.toContainText(/960,000|listings watched/)
  await expect(page.getByText("€49", { exact: true })).toBeVisible()
  await expect(page.getByText("€19", { exact: true })).toBeVisible()
  // Free forever must not lead — first tier CTA is Starter (trial CTA, 2026-09-30: "Start my 7-day free trial").
  // Use data-testid to skip TryFreeInput's submit button which is also in the section (H61).
  await expect(page.getByTestId("riq-pricing-cta-operator")).toHaveText(/Start my 7-day free trial/i)
  // One filled accent CTA among the TIER buttons (not TryFreeInput submit, which is also green).
  // Scope to data-testid pattern so we only count tier plan buttons.
  const buttons = page.locator("[data-testid^='riq-pricing-cta-']")
  const filled: string[] = []
  for (let i = 0; i < (await buttons.count()); i++) {
    const bg = await buttons.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor)
    if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") filled.push(bg)
  }
  expect(filled).toHaveLength(1)
  // Apple system green #30D158 on the light front door (was #34C759 /
  // rgb(52,199,89)). Dark-app verdict chips stay #34C759.
  expect(filled[0]).toBe("rgb(48, 209, 88)")
})

test("methodology explains sell-through, buy-below and confidence", async ({ page }) => {
  const res = await page.goto("/methodology")
  expect(res?.ok()).toBeTruthy()
  const body = await page.locator("body").innerText()
  expect(body).toMatch(/sold_observed/i)
  expect(body).toMatch(/0\.95/i)
  expect(body).toMatch(/HIGH/i)
  expect(body).not.toMatch(/undefined|NaN/)
  // H61 CRO: public trust page sells Starter via guest Stripe, not a register wall.
  const cta = page.getByRole("button", { name: /Start my 7-day free trial/i })
  await expect(cta).toBeVisible()
  await expect(page.locator('a[href*="/register?plan=operator"]')).toHaveCount(0)
  await expect(page.getByRole("link", { name: /Create a free account/i })).toHaveCount(0)
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

test("/calculator is a public tool when signed out, not a login shell", async ({ page }) => {
  const res = await page.goto("/calculator")
  expect(res?.ok()).toBeTruthy()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 })
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/profit calculator/i)
  await expect(page.getByRole("button", { name: /^Calculate$/i })).toBeVisible()
  await expect(page.getByLabel(/buy price/i)).toBeVisible()
})

test("unauthenticated /dashboard redirects to auth", async ({ page }) => {
  await page.goto("/dashboard")
  await page.waitForURL(/\/login/, { timeout: 20_000 })
  await expect(page.locator("h1")).toContainText(/Welcome back/i)
})
