/**
 * Mid-article paid CTAs must hit /pricing with UTMs — never /register.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  pricingMidCta,
  pricingMidCtaHref,
  pricingBodyCta,
  pricingBodyCtaHref,
  dataCiteHref,
  pricingFooterSeePlansHref,
  footerSeePlansHrefForPost,
} from "./blog-mid-cta.ts"

test("pricing mid-CTA href is /pricing with organic blog UTMs", () => {
  const href = pricingMidCtaHref("body_views_20260913")
  assert.equal(
    href,
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=body_views_20260913&utm_content=mid_cta",
  )
  assert.doesNotMatch(href, /register/)
})

test("pricing mid-CTA copy is the QC-passed conversion block", () => {
  const cta = pricingMidCta("ctr_price_20260913")
  assert.equal(cta.headline, "Know what to pay before you buy")
  assert.equal(cta.body, "Buy-below + demand before cash sticks.")
  assert.equal(cta.label, "Get the numbers")
  assert.equal(cta.secondaryHref, "/data")
  assert.doesNotMatch(cta.body, /free check/i)
  assert.doesNotMatch(cta.href, /register/)
  assert.equal(
    cta.href,
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_price_20260913&utm_content=mid_cta",
  )
})

test("footer See plans uses the post campaign + footer_see_plans", () => {
  assert.equal(
    pricingFooterSeePlansHref("ctr_price_20260913"),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_price_20260913&utm_content=footer_see_plans",
  )
  assert.equal(
    footerSeePlansHrefForPost([{ cta: pricingMidCta("body_views_20260913") }]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=body_views_20260913&utm_content=footer_see_plans",
  )
  assert.doesNotMatch(pricingFooterSeePlansHref("ctr_price_20260913"), /register/)
  assert.doesNotMatch(pricingFooterSeePlansHref("ctr_price_20260913"), /src=blog/)
})

test("BODY-001 paid CTA uses blog/organic + body_cta", () => {
  const href = pricingBodyCtaHref("body_price_20260913")
  assert.equal(
    href,
    "/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_price_20260913&utm_content=body_cta",
  )
  const cta = pricingBodyCta("body_price_20260913")
  assert.equal(cta.label, "Get the numbers")
  assert.equal(cta.body, "Buy-below + demand before cash sticks.")
  assert.equal(cta.href, href)
  assert.doesNotMatch(href, /register/)
})

test("BODY-001 soft cite is /data with data_cite UTM", () => {
  assert.equal(
    dataCiteHref("body_price_20260913"),
    "/data?utm_source=organic&utm_medium=blog&utm_campaign=body_price_20260913&utm_content=data_cite",
  )
})

test("how-to-price footer stays on ctr_price when BODY-001 CTA is also present", () => {
  assert.equal(
    footerSeePlansHrefForPost([
      { cta: pricingMidCta("ctr_price_20260913") },
      { cta: pricingBodyCta("body_price_20260913") },
    ]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_price_20260913&utm_content=footer_see_plans",
  )
})

test("how-to-price post ships BODY-001 demand section and keeps ctr_price mid-CTA", () => {
  const posts = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/blog-posts.ts"),
    "utf8",
  )
  const start = posts.indexOf('slug: "how-to-price-items-on-vinted"')
  const end = posts.indexOf('slug: "best-brands-to-resell-on-vinted"')
  assert.ok(start >= 0 && end > start)
  const post = posts.slice(start, end)
  assert.match(post, /Demand is the other half of the price/)
  assert.match(post, /Fred Perry 1,027 watched departures at €19/)
  assert.match(post, /Stone Island 892 at €66/)
  assert.match(post, /Gucci 230 at €197/)
  assert.match(post, /pricingMidCta\("ctr_price_20260913"\)/)
  assert.match(post, /pricingBodyCta\("body_price_20260913"\)/)
  assert.match(post, /dataCiteHref\("body_price_20260913"\)/)
  // Demand section sits after buy-below and before FAQ / price-to-sell.
  const buyBelow = post.indexOf("Work backwards to your buy-below price")
  const demand = post.indexOf("Demand is the other half of the price")
  const priceToSell = post.indexOf("Price to sell in a reasonable window")
  assert.ok(buyBelow < demand && demand < priceToSell)
})
