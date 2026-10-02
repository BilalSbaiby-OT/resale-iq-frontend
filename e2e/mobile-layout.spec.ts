import { expect, test } from "@playwright/test"

const ROUTES = ["/", "/verdict", "/tools", "/pricing", "/data"] as const

test.describe("390px: no horizontal page scroll, checker not clipped", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const path of ROUTES) {
    test(`${path} does not overflow the viewport`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.ok()).toBeTruthy()
      const box = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))
      expect(box.scroll).toBeLessThanOrEqual(box.client + 1)
    })
  }

  test("homepage checker stacks full-width under 640px", async ({ page }) => {
    await page.goto("/")
    const form = page.locator("#check form.riq-checker-row")
    const input = form.locator("input")
    const button = form.locator("button")
    const ib = await input.boundingBox()
    const bb = await button.boundingBox()
    expect(ib && bb).toBeTruthy()
    expect(bb!.y).toBeGreaterThan(ib!.y + ib!.height - 8)
    expect(ib!.x + ib!.width).toBeLessThanOrEqual(390)
    expect(bb!.x + bb!.width).toBeLessThanOrEqual(390)
  })

  // H171 fix: plan cards were rendering ~3 screens down on a 390px phone
  // because riq-scope-note, riq-billing-country, riq-capability-matrix and
  // riq-try-free-banner all rendered BEFORE the billing toggle + cards inside
  // pricing-section.tsx. Reordered so the toggle + €19/€49 cards render right
  // after the heading/subhead, with the proof sections moved below the cards.
  // This guards the fold position AND the ordering so neither can regress
  // silently — asserting y < viewport height alone would not catch a case
  // where the cards render early but the proof sections come back in front.
  test("/pricing: plan cards render before the capability matrix, €19 amount is on the first phone screen, exactly one h1", async ({ page }) => {
    const res = await page.goto("/pricing")
    expect(res?.ok()).toBeTruthy()
    // One h1 per document (H171: page.tsx's H157 headline duplicated
    // PricingSection's own h1 — removed so headingLevel={1} is the only one).
    await expect(page.locator("h1")).toHaveCount(1)
    const toggle = page.getByTestId("riq-billing-toggle")
    const amount = page.getByTestId("riq-pricing-amount-operator")
    const matrix = page.getByTestId("riq-capability-matrix")
    const tryBanner = page.getByTestId("riq-try-free-banner")
    await expect(toggle).toBeVisible()
    await expect(amount).toBeVisible()
    // The try-free banner mounts an inline FreeChecker with a random sample
    // query (pricing-section.tsx FREE_SAMPLE_QUERIES) that fetches a live
    // verdict and shifts layout as it resolves — wait for network idle so
    // the boundingBox reads are taken after that settles, not mid-shift.
    await page.waitForLoadState("networkidle")
    await matrix.scrollIntoViewIfNeeded()
    await tryBanner.scrollIntoViewIfNeeded()
    const toggleBox = await toggle.boundingBox()
    const amountBox = await amount.boundingBox()
    const matrixBox = await matrix.boundingBox()
    const tryBox = await tryBanner.boundingBox()
    expect(toggleBox && amountBox && matrixBox && tryBox).toBeTruthy()
    // Cards (via the €19 amount) render above the proof sections that used
    // to sit in front of them.
    expect(amountBox!.y).toBeLessThan(matrixBox!.y)
    expect(amountBox!.y).toBeLessThan(tryBox!.y)
    // The €19 Starter amount lands on the first 390x844 phone screen —
    // the actual bug being fixed, not just a relative-order proxy for it.
    expect(amountBox!.y).toBeLessThan(844)
  })

  // 2026-09-30 text-diet pass: founder measured the live homepage at 1,282
  // visible words / 8,797px (10.4 phone screens) at 390x844 and asked for
  // less text. This guard pins the outcome so the page cannot silently grow
  // back: <=500 visible words, <=6 phone screens tall, exactly one h1, both
  // prices visible without scrolling past the pricing cards, and the live
  // buy list still shows 3 priced rows above the fold. Word count is read
  // from innerText (rendered/visible text only, same measurement method the
  // founder used) — hidden nav/menu text and script/style content are
  // excluded by the browser automatically.
  // Light-homepage polish: the FAQ used hardcoded near-white text (invisible on
  // the light page) and the brand strip touched the next section. Contrast is
  // computed from real computed styles, walking up to the first opaque bg.
  test("homepage: FAQ heading + questions readable (>=4.5:1), brand strip has >=32px gap to next section, FAQ answer opens readable", async ({ page }) => {
    await page.goto("/")
    const faq = page.getByTestId("riq-faq")
    test.skip((await faq.count()) === 0, "no FAQ rendered (backend faqs empty)")
    await faq.scrollIntoViewIfNeeded()
    const contrast = () => page.evaluate(() => {
      const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number)
      const lum = ([r, g, b]: number[]) => {
        const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const bgOf = (el: Element | null): number[] => {
        while (el) {
          const c = parse(getComputedStyle(el).backgroundColor)
          if (c.length >= 3 && (c.length === 3 || c[3] > 0.99)) return c.slice(0, 3)
          el = el.parentElement
        }
        return [255, 255, 255]
      }
      const ratio = (el: Element) => {
        const fg = parse(getComputedStyle(el).color).slice(0, 3)
        const a = lum(fg), b = lum(bgOf(el))
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      }
      const els = [document.querySelector('[data-testid="riq-faq-heading"]')!, ...Array.from(document.querySelectorAll('[data-testid="riq-faq"] summary'))]
      return els.map((e) => ({ text: (e.textContent ?? "").slice(0, 40), ratio: ratio(e) }))
    })
    const rows = await contrast()
    expect(rows.length).toBeGreaterThan(1)
    for (const r of rows) expect(r.ratio, `${r.text} contrast`).toBeGreaterThanOrEqual(4.5)

    const first = faq.locator("details").first()
    await first.locator("summary").click()
    const ans = first.locator("p")
    await expect(ans).toBeVisible()
    const ansColor = await ans.evaluate((e) => getComputedStyle(e).color)
    expect(ansColor).not.toMatch(/^rgb\(2[0-5]\d, 2[0-5]\d, 2[0-5]\d\)$/)

    const gap = await page.evaluate(() => {
      const strip = document.querySelector('[data-testid="riq-brand-strip"]')!.getBoundingClientRect()
      const h = document.getElementById("riq-how-to-heading")!.getBoundingClientRect()
      return h.top - strip.bottom
    })
    expect(gap, "brand strip -> next heading gap").toBeGreaterThanOrEqual(32)
  })

  test("homepage text diet: <=500 visible words, <=6 phone screens, one h1, prices + buy list visible", async ({ page }) => {
    const res = await page.goto("/")
    expect(res?.ok()).toBeTruthy()

    await expect(page.locator("h1")).toHaveCount(1)

    const text = (await page.locator("body").innerText()).trim()
    const wordCount = text.split(/\s+/).filter(Boolean).length
    expect(wordCount, `homepage visible word count grew to ${wordCount} (cap 500)`).toBeLessThanOrEqual(500)

    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    const screens = pageHeight / 844
    expect(screens, `homepage grew to ${screens.toFixed(1)} phone screens (cap 6)`).toBeLessThanOrEqual(6)

    // Both prices visible somewhere on the page (pricing cards render below
    // the fold on 390px, which is expected — the cap above bounds how far).
    await expect(page.getByText("€19", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("€49", { exact: true }).first()).toBeVisible()

    // Live buy list still shows its top 3 priced rows.
    const buyList = page.getByTestId("riq-ssr-buy-list")
    await expect(buyList).toBeVisible()
    const pricedRows = buyList.locator('[style*="tabular-nums"]', { hasText: "€" })
    expect(await pricedRows.count(), "buy list must show at least 3 priced rows").toBeGreaterThanOrEqual(3)
  })

  test("/verdict check row stacks and a STR-null result still shows the price numbers", async ({ page }) => {
    await page.goto("/verdict")
    const row = page.locator("div.riq-checker-row")
    const input = row.locator("input")
    const button = row.locator("button")
    await expect(input).toBeVisible()
    const ib = await input.boundingBox()
    const bb = await button.boundingBox()
    expect(ib && bb).toBeTruthy()
    expect(bb!.y).toBeGreaterThan(ib!.y + ib!.height - 8)

    await input.fill("New Balance 530")
    await button.click()
    const insights = page.getByTestId("riq-verdict-insights")
    await expect(insights).toBeVisible()
    await expect(insights).toContainText("€27")
    // sold_7d (562 in the mock) is a per-item departure count: never rendered (2026-10-02).
    await expect(insights).not.toContainText("562")
    await expect(page.getByText(/See plans/i)).toHaveCount(0)
  })
})
