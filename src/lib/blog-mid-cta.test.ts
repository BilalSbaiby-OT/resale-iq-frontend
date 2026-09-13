/**
 * Mid-article paid CTAs must hit /pricing with UTMs — never /register?plan=.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { pricingMidCta, pricingMidCtaHref } from "./blog-mid-cta.ts"

test("pricing mid-CTA href is /pricing with organic blog UTMs", () => {
  const href = pricingMidCtaHref("ctr_views_20260913")
  assert.equal(
    href,
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_views_20260913&utm_content=mid_cta",
  )
  assert.doesNotMatch(href, /register/)
})

test("pricing mid-CTA copy is the conversion block, not a free check", () => {
  const cta = pricingMidCta("ctr_price_20260913")
  assert.equal(cta.headline, "Know what to pay before you buy")
  assert.equal(cta.label, "Get buy-below on any item")
  assert.equal(cta.secondaryHref, "/data")
  assert.doesNotMatch(cta.body, /free check/i)
  assert.doesNotMatch(cta.href, /register\?plan=/)
  assert.equal(
    cta.href,
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_price_20260913&utm_content=mid_cta",
  )
})
