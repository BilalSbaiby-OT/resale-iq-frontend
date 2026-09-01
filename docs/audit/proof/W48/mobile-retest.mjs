// W48 retest: mobile viewport (375x812) search attempt against production,
// with a fresh reload before each attempt so load-time gates re-run.
// Run with: NODE_PATH=<repo>/node_modules node mobile-retest.mjs
import { chromium, devices } from "playwright"

const OUT = process.env.OUT_DIR || "."
const URL = "https://resaleiq.dev/"

async function attempt(browser, n, method) {
  const iphone = devices["iPhone 13"] // 390x844 CSS, close to 375x812; we override viewport explicitly below
  const context = await browser.newContext({
    ...iphone,
    viewport: { width: 375, height: 812 },
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()) })
  page.on("pageerror", err => consoleErrors.push("pageerror: " + err.message))

  const t0 = Date.now()
  let navError = null
  try {
    await page.goto(URL, { waitUntil: "load", timeout: 30000 })
  } catch (e) {
    navError = String(e)
  }
  const loadMs = Date.now() - t0

  let result = { attempt: n, method, loadMs, navError, consoleErrors: [...consoleErrors] }

  try {
    const input = page.locator("input[placeholder*='Adidas'], input[aria-label]").first()
    await input.waitFor({ state: "visible", timeout: 15000 })
    await input.click()
    await input.fill("Adidas Samba")

    // Directly observe the real network call the component makes
    // (fetch(`/api/verdict?q=...`)) rather than guessing from rendered text,
    // which can false-match unrelated static marketing copy elsewhere on
    // the page.
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes("/api/verdict") && resp.request().method() === "GET",
      { timeout: 20000 }
    ).catch(e => ({ __error: String(e) }))

    if (method === "click") {
      const btn = page.locator("button:has-text('Check'), button[aria-label*='heck']").first()
      await btn.click({ timeout: 10000 })
    } else if (method === "enter") {
      await input.press("Enter")
    }

    const resp = await responsePromise
    if (resp && resp.__error) {
      result.apiCallObserved = false
      result.apiWaitError = resp.__error
    } else {
      result.apiCallObserved = true
      result.apiStatus = resp.status()
      result.apiUrl = resp.url()
      try { result.apiBodySnippet = JSON.stringify(await resp.json()).slice(0, 300) } catch { result.apiBodySnippet = "<non-json or unreadable>" }
    }

    // Give the UI a moment to paint the response, then check DOM state.
    await page.waitForTimeout(1500)
    const stillLoading = await page.locator("text=/Checking/i").first().isVisible().catch(() => false)
    const resultVisible = await page.locator("text=/BUY-BELOW|SELL-AVG|INSUFFICIENT|LIMIT_REACHED/").first().isVisible().catch(() => false)
    const unlockCtaVisible = await page.locator("a:has-text('Unlock the rest'), button:has-text('Unlock the rest')").first().isVisible().catch(() => false)
    result.stillShowingCheckingSpinner = stillLoading
    result.verdictLabelVisible = resultVisible
    result.unlockCtaVisible = unlockCtaVisible
    result.inputValueAfter = await input.inputValue().catch(() => "<could not read>")
  } catch (e) {
    result.stepError = String(e)
  }

  await page.screenshot({ path: `${OUT}/attempt-${n}-${method}.png`, fullPage: true }).catch(() => {})
  await context.close()
  return result
}

const browser = await chromium.launch({ channel: "chrome" })
const results = []
try {
  results.push(await attempt(browser, 1, "click"))
  results.push(await attempt(browser, 2, "enter"))
  results.push(await attempt(browser, 3, "click"))
  results.push(await attempt(browser, 4, "enter"))
} finally {
  await browser.close()
}

console.log(JSON.stringify(results, null, 2))
