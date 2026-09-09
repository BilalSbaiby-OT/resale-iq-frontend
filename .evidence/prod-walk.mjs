// PRODUCTION purchase-path walk. Anonymous stranger -> pricing -> register -> Stripe Checkout.
// STOPS at the Stripe payment form. Never enters card details. Never pays.
import { chromium } from "@playwright/test"
import fs from "node:fs"

const BASE = "https://resaleiq.dev"
const OUT = new URL("./", import.meta.url).pathname
const stamp = () => new Date().toISOString()

// @example.com => backend marks is_internal=1 (api/auth.py is_qa_shaped_email),
// so these walks do not pollute real funnel/conversion metrics.
const mkEmail = tag => `e2e-walk-${tag}-${Date.now()}@example.com`
const PASSWORD = "Wr3nch-Harbour-92!"

const log = []
function step(name, detail) {
  const line = { t: stamp(), name, ...detail }
  log.push(line)
  console.log(`[${name}] ${JSON.stringify(detail)}`)
}

async function walk(browser, { locale, planId, planLabel, expectPrice }) {
  const tag = `${locale}-${planId}`
  const ctx = await browser.newContext({
    locale: locale === "es" ? "es-ES" : "en-US",
    viewport: { width: 1280, height: 1000 },
  })
  const page = await ctx.newPage()
  const netErrors = []
  const apiCalls = []
  page.on("response", async r => {
    const u = r.url()
    if (/\/(auth|stripe)\//.test(u)) {
      apiCalls.push({ url: u.replace(BASE, ""), status: r.status() })
      if (r.status() >= 400) netErrors.push({ url: u.replace(BASE, ""), status: r.status() })
    }
  })
  page.on("pageerror", e => netErrors.push({ pageerror: String(e).slice(0, 200) }))

  const result = { tag, locale, planId, steps: [], apiCalls, netErrors }
  const rec = (n, d) => { result.steps.push({ t: stamp(), name: n, ...d }); step(`${tag}:${n}`, d) }

  try {
    // ---- STEP 1: land anonymously on the site root for this locale
    const root = locale === "es" ? `${BASE}/es` : `${BASE}/`
    const r1 = await page.goto(root, { waitUntil: "domcontentloaded", timeout: 45000 })
    rec("1-land", { url: page.url(), status: r1?.status() })

    // ---- STEP 2: reach pricing and choose the paid tier
    const pricing = locale === "es" ? `${BASE}/es#pricing` : `${BASE}/#pricing`
    await page.goto(pricing, { waitUntil: "domcontentloaded", timeout: 45000 })
    await page.waitForTimeout(2500)
    const pricingText = await page.locator("body").innerText()
    rec("2-pricing", {
      url: page.url(),
      shows19: /€\s?19/.test(pricingText),
      shows49: /€\s?49/.test(pricingText),
    })

    // Click the real CTA for the tier rather than typing a URL, so the plan id
    // that reaches /register is the one the product actually carries.
    const ctaMap = {
      operator: [/Get the numbers/i, /Consigue los n[uú]meros/i],
      power: [/Let it find the deals/i, /Que encuentre/i],
    }
    let clicked = false
    for (const rx of ctaMap[planId]) {
      const btn = page.getByRole("button", { name: rx }).first()
      if (await btn.count() && await btn.isVisible().catch(() => false)) {
        await btn.click(); clicked = true; break
      }
    }
    rec("2b-cta", { clicked, tier: planId })
    if (!clicked) {
      // Fall back to the canonical register URL with the REAL plan id.
      const reg = locale === "es" ? `${BASE}/es/register?plan=${planId}` : `${BASE}/register?plan=${planId}`
      await page.goto(reg, { waitUntil: "domcontentloaded" })
      rec("2c-fallback-nav", { url: page.url(), note: "CTA not found; navigated with real plan id" })
    }
    await page.waitForTimeout(2500)

    // ---- STEP 3: register a fresh account
    rec("3-register-page", { url: page.url() })
    const regText = await page.locator("body").innerText()

    // Which radio is actually selected? This is where a carried plan id dies.
    const selected = await page.evaluate(() => {
      const r = document.querySelector('input[name="plan"]:checked')
      if (!r) return null
      const label = r.closest("label")
      return label ? label.innerText.replace(/\s+/g, " ").trim() : "checked-but-no-label"
    })
    rec("3b-selected-plan", { selected, expectLabel: planLabel })

    const email = mkEmail(tag)
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(PASSWORD)
    const boxes = page.locator('input[type="checkbox"]')
    const n = await boxes.count()
    for (let i = 0; i < n; i++) await boxes.nth(i).check().catch(() => {})
    rec("3c-form", { email, checkboxes: n })

    // ---- STEP 4: submit and follow to Stripe
    await page.locator('button[type="submit"]').click()
    let reachedStripe = false
    try {
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 45000 })
      reachedStripe = true
    } catch { /* captured below */ }

    const afterUrl = page.url()
    const afterText = await page.locator("body").innerText().catch(() => "")
    rec("4-after-submit", {
      url: afterUrl.slice(0, 120),
      reachedStripe,
      onCheckEmail: /check-email/.test(afterUrl),
      visibleError: (afterText.match(/.{0,90}(error|Error|fall|problema|no pudimos|could not).{0,90}/) || [""])[0].trim().slice(0, 160),
    })

    if (!reachedStripe) {
      result.verdict = `BLOCKED at step 4 — never reached Stripe. Landed: ${afterUrl}`
      await page.screenshot({ path: `${OUT}/fail-${tag}.png`, fullPage: true }).catch(() => {})
      return result
    }

    // ---- STEP 5: verify the PRICE on the Stripe page, then STOP.
    await page.waitForTimeout(5000)
    const stripeText = await page.locator("body").innerText()
    // Stripe localises BOTH the symbol position and the decimal separator:
    // EN renders "€19.00", ES renders "19,00 €". Matching only the EN shape
    // reported a false "price wrong" on the Spanish walk while the page was in
    // fact correct — assert both forms.
    const amounts = [...stripeText.matchAll(/(?:€\s?([\d.,]+))|(?:([\d.,]+)\s?€)/g)]
      .map(m => m[1] ?? m[2])
    const money = n => new RegExp(`(?:€\\s?${n}(?:[.,]00)?|${n}(?:[.,]00)?\\s?€)`)
    const hasExpected = money(expectPrice).test(stripeText)
    const wrongTier = expectPrice === 19 ? 49 : 19
    const hasWrong = money(wrongTier).test(stripeText)
    // Language of the Stripe page itself — a Spanish buyer must not hit English chrome.
    const stripeLang = await page.evaluate(() => document.documentElement.lang || "")
    const esMarkers = /(Pagar|Datos de la tarjeta|Correo electr[oó]nico|Suscribirse|Titular|Pa[ií]s|Prueba gratuita)/i.test(stripeText)
    const enMarkers = /(Card information|Subscribe|Email|Cardholder|Country or region|day free trial|Pay )/i.test(stripeText)

    await page.screenshot({ path: `${OUT}/stripe-${tag}.png`, fullPage: true }).catch(() => {})
    rec("5-stripe", {
      url: page.url().slice(0, 90),
      amountsSeen: [...new Set(amounts)],
      correctPriceShown: hasExpected,
      wrongTierPriceShown: hasWrong,
      productLine: (stripeText.match(/(Starter|Pro|Resale ?IQ)[^\n]{0,60}/) || [""])[0].trim(),
      trialMentioned: /trial|prueba/i.test(stripeText),
      stripeHtmlLang: stripeLang,
      spanishChrome: esMarkers,
      englishChrome: enMarkers,
    })

    result.verdict = hasExpected && !hasWrong
      ? `REACHED Stripe Checkout at the CORRECT price (€${expectPrice})`
      : `REACHED Stripe but PRICE WRONG (expected €${expectPrice}; saw ${[...new Set(amounts)].join(",")})`
  } catch (e) {
    result.verdict = `ERROR: ${String(e).slice(0, 300)}`
    await page.screenshot({ path: `${OUT}/err-${tag}.png`, fullPage: true }).catch(() => {})
  } finally {
    await ctx.close()
  }
  return result
}

// Same as playwright.config.ts: use the installed Chrome, not the bundled build.
const browser = await chromium.launch({ headless: true, channel: "chrome" })
const results = []
for (const w of [
  { locale: "en", planId: "operator", planLabel: "Starter", expectPrice: 19 },
  { locale: "en", planId: "power", planLabel: "Pro", expectPrice: 49 },
  { locale: "es", planId: "operator", planLabel: "Starter", expectPrice: 19 },
  { locale: "es", planId: "power", planLabel: "Pro", expectPrice: 49 },
]) {
  results.push(await walk(browser, w))
  await new Promise(r => setTimeout(r, 4000)) // stay under 10 signups / 5 min
}
await browser.close()
fs.writeFileSync(`${OUT}/prod-walk-result.json`, JSON.stringify(results, null, 2))
console.log("\n================ VERDICTS ================")
for (const r of results) console.log(`${r.tag.padEnd(14)} ${r.verdict}`)
