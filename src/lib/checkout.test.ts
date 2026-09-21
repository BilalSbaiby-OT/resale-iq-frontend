import { test } from "node:test"
import assert from "node:assert/strict"
import {
  BAKED_PRICE_IDS,
} from "./pricing.ts"
import {
  FIRST_CHECK_HREF,
  FIRST_CHECK_QUERY,
  buildCheckoutBody,
  countryFromLocale,
  isCheckoutCountry,
  productCopy,
  resolveCheckoutCountry,
} from "./checkout.ts"

test("first-check CTA is a pre-filled verdict, not an empty dashboard", () => {
  assert.equal(FIRST_CHECK_QUERY, "Nike Air Force 1")
  assert.equal(FIRST_CHECK_HREF, "/verdict?q=Nike%20Air%20Force%201")
})

test("locale maps to the VAT country Stripe Tax needs", () => {
  assert.equal(countryFromLocale("es"), "ES")
  assert.equal(countryFromLocale("es-ES"), "ES")
  assert.equal(countryFromLocale("fr"), "FR")
  assert.equal(countryFromLocale("de"), "DE")
  assert.equal(countryFromLocale("it"), "IT")
  assert.equal(countryFromLocale("pt"), "PT")
  assert.equal(countryFromLocale("en"), undefined)
  assert.equal(countryFromLocale(undefined), undefined)
})

test("only EU5 billing countries are forwarded", () => {
  assert.equal(isCheckoutCountry("ES"), true)
  assert.equal(isCheckoutCountry("GB"), false)
  assert.equal(isCheckoutCountry("US"), false)
  assert.equal(isCheckoutCountry(""), false)
})

test("explicit country wins over locale default", () => {
  assert.equal(resolveCheckoutCountry({ country: "IT", locale: "es" }), "IT")
  assert.equal(resolveCheckoutCountry({ locale: "es" }), "ES")
  assert.equal(resolveCheckoutCountry({ stored: "DE", locale: "en" }), "DE")
  assert.equal(resolveCheckoutCountry({ country: "US", locale: "en" }), undefined)
})

test("product copy is Resale IQ, never Demand Intel", () => {
  const starter = productCopy("operator")
  const pro = productCopy("power")
  assert.equal(starter.product_name, "Resale IQ Starter")
  assert.equal(pro.product_name, "Resale IQ Pro")
  assert.match(starter.product_description, /buy-below/i)
  assert.match(pro.product_description, /Live Deal Finder/)
  assert.doesNotMatch(starter.product_name, /Demand Intel/i)
  assert.doesNotMatch(pro.product_description, /Demand Intel/i)
  assert.equal(productCopy(undefined, BAKED_PRICE_IDS.power).product_name, "Resale IQ Pro")
})

test("checkout body brands Resale IQ, sends description, country, and guest cancel to /pricing", () => {
  const body = buildCheckoutBody({
    price_id: BAKED_PRICE_IDS.operator,
    origin: "https://resaleiq.dev",
    locale: "es",
    plan: "operator",
  })
  assert.equal(body.price_id, BAKED_PRICE_IDS.operator)
  assert.equal(body.locale, "es")
  assert.equal(body.display_name, "Resale IQ")
  assert.equal(body.product_name, "Resale IQ Starter")
  assert.match(body.product_description, /ES\/FR\/DE\/IT\/PT/)
  assert.equal(body.country, "ES")
  assert.equal(body.success_url, "https://resaleiq.dev/billing/success")
  assert.equal(body.cancel_url, "https://resaleiq.dev/es/pricing?checkout=cancelled")
  assert.doesNotMatch(JSON.stringify(body), /Demand Intel/i)
  assert.doesNotMatch(body.cancel_url, /\/account/)
})

test("English checkout omits country until the visitor picks one", () => {
  const body = buildCheckoutBody({
    price_id: BAKED_PRICE_IDS.operator,
    origin: "https://resaleiq.dev",
    locale: "en",
  })
  assert.equal(body.country, undefined)
  assert.equal(body.cancel_url, "https://resaleiq.dev/pricing?checkout=cancelled")
})

test("missing price_id throws instead of posting a 422 body", () => {
  assert.throws(
    () => buildCheckoutBody({ price_id: "", origin: "https://resaleiq.dev" }),
    /price_id/,
  )
})
