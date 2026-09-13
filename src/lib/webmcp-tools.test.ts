/**
 * EX-WEBMCP-TOOLS — declarative money tools + /llms.txt.
 * Checkout/payment forms stay unannotated. Money CTAs stay intact.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  CALCULATE_VINTED_PROFIT_DESCRIPTION,
  CALCULATE_VINTED_PROFIT_NAME,
  CHECK_VINTED_ITEM_DESCRIPTION,
  CHECK_VINTED_ITEM_NAME,
  CHECK_VINTED_ITEM_QUERY_DESCRIPTION,
} from "./webmcp-tools.ts"
import {
  GOOGLE_SEARCH_TEST_CAMPAIGN,
  PRICE_CHECKER_MONEY_HREF,
  PROFIT_CALC_MONEY_HREF,
  TOOLS_MONEY_HREF,
} from "./money-cta.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

const checker = read("components/tools/free-checker.tsx")
const profit = read("components/tools/public-profit-calculator.tsx")
const register = read("components/tools/register-check-vinted-item-tool.tsx")
const llms = read("app/llms.txt/route.ts")
const registerForm = read("app/(auth)/register/register-form.tsx")
const loginForm = read("components/auth/login-form.tsx")
const pricing = read("components/landing/pricing-section.tsx")

test("FreeChecker is a native form with check_vinted_item WebMCP attrs", () => {
  assert.match(checker, /<form/)
  assert.match(checker, /toolname=\{CHECK_VINTED_ITEM_NAME\}/)
  assert.match(checker, /tooldescription=\{CHECK_VINTED_ITEM_DESCRIPTION\}/)
  assert.match(checker, /name="query"/)
  assert.match(checker, /toolparamdescription=\{CHECK_VINTED_ITEM_QUERY_DESCRIPTION\}/)
  assert.match(checker, /<RegisterCheckVintedItemTool/)
  assert.doesNotMatch(checker, /toolautosubmit[={\s]/)
  assert.equal(CHECK_VINTED_ITEM_NAME, "check_vinted_item")
  assert.match(CHECK_VINTED_ITEM_DESCRIPTION, /BUY, WATCH or SKIP/)
  assert.match(CHECK_VINTED_ITEM_DESCRIPTION, /buy-below/)
  assert.match(CHECK_VINTED_ITEM_DESCRIPTION, /ES, FR, DE, IT and PT/)
  assert.match(CHECK_VINTED_ITEM_DESCRIPTION, /Does not process payments/)
  assert.equal(
    CHECK_VINTED_ITEM_QUERY_DESCRIPTION,
    "Vinted item URL, title, or search query to check.",
  )
})

test("price-checker reuses FreeChecker (one shared check_vinted_item tool)", () => {
  const page = read("app/tools/[slug]/page.tsx")
  assert.match(page, /slug === "vinted-profit-calculator"/)
  assert.match(page, /<FreeChecker locale=\{locale\} \/>/)
  assert.match(page, /<PublicProfitCalculator locale=\{locale\} \/>/)
})

test("profit calculator form is calculate_vinted_profit with real field names", () => {
  assert.match(profit, /toolname=\{CALCULATE_VINTED_PROFIT_NAME\}/)
  assert.match(profit, /tooldescription=\{CALCULATE_VINTED_PROFIT_DESCRIPTION\}/)
  assert.match(profit, /name="buy_price"/)
  assert.match(profit, /name="sell_price"/)
  assert.match(profit, /toolparamdescription=\{CALCULATE_VINTED_PROFIT_BUY_DESCRIPTION\}/)
  assert.match(profit, /toolparamdescription=\{CALCULATE_VINTED_PROFIT_SELL_DESCRIPTION\}/)
  assert.doesNotMatch(profit, /toolautosubmit[={\s]/)
  assert.equal(CALCULATE_VINTED_PROFIT_NAME, "calculate_vinted_profit")
  assert.match(CALCULATE_VINTED_PROFIT_DESCRIPTION, /does not process payments/i)
})

test("imperative registerTool feature-detects and never registers checkout", () => {
  assert.match(register, /document\.modelContext/)
  assert.match(register, /navigator\.modelContext/)
  assert.match(register, /registerTool/)
  assert.match(register, /inputSchema/)
  assert.match(register, /query/)
  assert.doesNotMatch(register, /toolname=["']?(checkout|createCheckout|stripe)/i)
  assert.match(register, /CHECK_VINTED_ITEM_NAME/)
  assert.doesNotMatch(register, /createCheckout|STRIPE_/)
})

test("llms.txt tells agents the money tools and the free-check boundary", () => {
  assert.match(llms, /## For agents/)
  assert.match(llms, /CHECK_VINTED_ITEM_NAME/)
  assert.match(llms, /CALCULATE_VINTED_PROFIT_NAME/)
  assert.match(llms, /\$\{BASE\}\/tools/)
  assert.match(llms, /\$\{BASE\}\/tools\/vinted-price-checker/)
  assert.match(llms, /\$\{BASE\}\/tools\/vinted-profit-calculator/)
  assert.match(llms, /\$\{BASE\}\/data/)
  assert.match(llms, /\$\{BASE\}\/flip/)
  assert.match(llms, /\$\{BASE\}\/pricing/)
  assert.match(llms, /\$\{BASE\}\/manual/)
  assert.match(llms, /free one-item checker/)
  assert.match(llms, /Free-forever/)
  assert.match(llms, /Automate checkout or payment/)
  assert.match(llms, /ES, FR, DE, IT and PT/)
  assert.doesNotMatch(llms, /no anonymous item-level check/)
})

test("auth and pricing surfaces are not WebMCP tools", () => {
  assert.doesNotMatch(registerForm, /toolname|tooldescription/)
  assert.doesNotMatch(loginForm, /toolname|tooldescription/)
  assert.doesNotMatch(pricing, /toolname|tooldescription/)
})

test("Get the numbers google_search_test doors stay intact", () => {
  assert.match(TOOLS_MONEY_HREF, new RegExp(GOOGLE_SEARCH_TEST_CAMPAIGN))
  assert.match(PRICE_CHECKER_MONEY_HREF, /utm_content=price_checker/)
  assert.match(PROFIT_CALC_MONEY_HREF, /utm_content=profit_calc/)
  const toolsPage = read("app/tools/page.tsx")
  assert.match(toolsPage, /TOOLS_MONEY_HREF/)
  assert.match(toolsPage, /<MoneyCta href=\{TOOLS_MONEY_HREF\}/)
})
