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
  pricingBodyCtaEs,
  pricingBodyCtaHrefEs,
  dataCiteHref,
  dataCiteHrefEs,
  pricingFooterSeePlansHref,
  footerSeePlansHrefForPost,
  footerSeePlansLabelForPost,
  pricingLegacySignupKillHref,
  legacySignupKillHrefForPost,
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
  assert.equal(
    footerSeePlansLabelForPost([{ cta: pricingMidCta("body_views_20260913") }]),
    "See plans — from €19/mo",
  )
  assert.doesNotMatch(pricingFooterSeePlansHref("ctr_price_20260913"), /register/)
  assert.doesNotMatch(pricingFooterSeePlansHref("ctr_price_20260913"), /src=blog/)
})

test("BODY-001 paid CTA uses blog/organic + body_price campaign", () => {
  const href = pricingBodyCtaHref("body_price_20260913")
  assert.equal(
    href,
    "/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_price_20260913",
  )
  const cta = pricingBodyCta("body_price_20260913")
  assert.equal(cta.label, "Get the numbers")
  assert.equal(cta.body, "Buy-below + demand before cash sticks.")
  assert.equal(cta.href, href)
  assert.doesNotMatch(href, /register/)
})

test("BODY-001 soft cite is /data with body_price campaign", () => {
  assert.equal(
    dataCiteHref("body_price_20260913"),
    "/data?utm_source=blog&utm_medium=organic&utm_campaign=body_price_20260913",
  )
})

test("legacy signup-kill href is /pricing with organic blog UTMs", () => {
  assert.equal(
    pricingLegacySignupKillHref("ctr_price_20260913"),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_price_20260913&utm_content=legacy_signup_kill",
  )
  assert.equal(
    legacySignupKillHrefForPost([{ cta: pricingMidCta("ctr_price_20260913") }]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_price_20260913&utm_content=legacy_signup_kill",
  )
  assert.equal(
    legacySignupKillHrefForPost([]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_blog_20260913&utm_content=legacy_signup_kill",
  )
  assert.doesNotMatch(pricingLegacySignupKillHref("ctr_price_20260913"), /register/)
  assert.doesNotMatch(pricingLegacySignupKillHref("ctr_price_20260913"), /src=blog/)
})

test("how-to-price signup-kill stays on ctr_price when BODY-001 CTA is also present", () => {
  assert.equal(
    legacySignupKillHrefForPost([
      { cta: pricingMidCta("ctr_price_20260913") },
      { cta: pricingBodyCta("body_price_20260913") },
    ]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=ctr_price_20260913&utm_content=legacy_signup_kill",
  )
})

test("blog article template no longer points the paid footer at the signup wall", () => {
  const page = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../app/blog/[slug]/page.tsx"),
    "utf8",
  )
  assert.doesNotMatch(page, /\/register\?src=blog/)
  assert.doesNotMatch(page, /\/register\?plan=/)
  assert.match(page, /legacySignupKillHrefForPost/)
  assert.match(page, /Get the numbers/)
})

test("blog index paid CTA no longer defaults SmartCTA to the signup wall", () => {
  const page = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../app/blog/page.tsx"),
    "utf8",
  )
  assert.doesNotMatch(page, /\/register/)
  assert.match(page, /pricingLegacySignupKillHref\("ctr_blog_20260913"\)/)
  assert.match(page, /Get the numbers/)
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
  assert.match(post, /A departure price without demand is a trap\. The item can look cheap and still sit/)
  assert.match(post, /we watched 5,746 departures across 28 brands/)
  assert.match(post, /Fred Perry — 1,027 left the shelf · avg €19 \(volume play\)/)
  assert.match(post, /Stone Island — 892 · avg €66/)
  assert.match(post, /Gucci — 230 · avg €197 \(price play, thinner volume\)/)
  assert.match(post, /Skip either and you’re guessing/)
  assert.match(post, /pricingMidCta\("ctr_price_20260913"\)/)
  assert.match(post, /pricingBodyCta\("body_price_20260913"\)/)
  assert.match(post, /dataCiteHref\("body_price_20260913"\)/)
  // Demand section sits after buy-below and before FAQ / price-to-sell.
  const buyBelow = post.indexOf("Work backwards to your buy-below price")
  const demand = post.indexOf("Demand is the other half of the price")
  const priceToSell = post.indexOf("Price to sell in a reasonable window")
  assert.ok(buyBelow < demand && demand < priceToSell)
})

test("BODY-ES-001 paid CTA is /es/pricing with blog/organic UTMs — never English /pricing", () => {
  const href = pricingBodyCtaHrefEs("body_price_es_20260913")
  assert.equal(
    href,
    "/es/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913",
  )
  assert.ok(href.startsWith("/es/pricing?"))
  assert.doesNotMatch(href, /register/)
  const cta = pricingBodyCtaEs("body_price_es_20260913")
  assert.equal(cta.label, "Consigue los números")
  assert.equal(cta.body, "Buy-below + demanda antes de inmovilizar cash.")
  assert.equal(cta.href, href)
})

test("BODY-ES-001 soft cite is /es/data — never English /data", () => {
  assert.equal(
    dataCiteHrefEs("body_price_es_20260913"),
    "/es/data?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913",
  )
})

test("Spanish post signup-kill stays on /es/pricing with legacy_signup_kill", () => {
  assert.equal(
    legacySignupKillHrefForPost([{ cta: pricingBodyCtaEs("body_price_es_20260913") }]),
    "/es/pricing?utm_source=organic&utm_medium=blog&utm_campaign=body_price_es_20260913&utm_content=legacy_signup_kill",
  )
})

test("Spanish post footer stays on /es/pricing with Consigue los números", () => {
  const sections = [{ cta: pricingBodyCtaEs("body_price_es_20260913") }]
  assert.equal(
    footerSeePlansHrefForPost(sections),
    "/es/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913",
  )
  assert.equal(footerSeePlansLabelForPost(sections), "Consigue los números")
  assert.ok(footerSeePlansHrefForPost(sections).startsWith("/es/pricing?"))
})

test("EX-LOCALE-CTR-ES: Spanish post is answer-first; EN twin titles stay", () => {
  const posts3 = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/blog-posts-3.ts"),
    "utf8",
  )
  const posts = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/blog-posts.ts"),
    "utf8",
  )
  const start = posts3.indexOf('slug: "como-poner-precio-en-vinted"')
  const end = posts3.indexOf('slug: "vinted-item-not-selling"')
  assert.ok(start >= 0 && end > start)
  const post = posts3.slice(start, end)
  const seoTitle = "¿Cómo poner precio en Vinted? Precio de salida — Resale IQ"
  const h1 = "Cómo poner precio en Vinted: desde el precio de salida"
  const meta =
    "Parte del precio de salida real, no del de tienda, y calcula tu buy-below. Resale IQ lo saca de listados vistos en la UE. Starter 19 €/mes."
  assert.match(post, /title: "Cómo poner precio en Vinted: desde el precio de salida"/)
  assert.match(post, /seoTitle: "¿Cómo poner precio en Vinted\? Precio de salida — Resale IQ"/)
  assert.match(post, /Parte del precio de salida real, no del de tienda, y calcula tu buy-below/)
  assert.ok(seoTitle.length <= 60, `ES seoTitle ${seoTitle.length} > 60`)
  assert.ok(meta.length <= 155, `ES meta ${meta.length} > 155`)
  assert.ok(h1.length <= 70, `ES H1 ${h1.length} > 70`)
  assert.doesNotMatch(post, /sin regalar tu margen/)
  assert.doesNotMatch(post, /register\?src=blog/)
  // EN twin — do not rewrite English titles in this lane.
  assert.match(posts, /title: "How to Price Items on Vinted: Buy-Below from Departure Prices"/)
  assert.match(posts, /seoTitle: "How to Price Items on Vinted — Get Your Buy-Below Automatically"/)
})

test("como-poner-precio post ships BODY-ES-001 and never English /pricing", () => {
  const posts = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/blog-posts-3.ts"),
    "utf8",
  )
  const start = posts.indexOf('slug: "como-poner-precio-en-vinted"')
  const end = posts.indexOf('slug: "vinted-item-not-selling"')
  assert.ok(start >= 0 && end > start)
  const post = posts.slice(start, end)
  assert.match(post, /La demanda es la otra mitad del precio/)
  assert.match(post, /5\.746/)
  assert.match(post, /Fred Perry — 1\.027/)
  assert.match(post, /Stone Island — 892/)
  assert.match(post, /Gucci — 230/)
  assert.match(post, /pricingBodyCtaEs\("body_price_es_20260913"\)/)
  assert.match(post, /dataCiteHrefEs\("body_price_es_20260913"\)/)
  assert.doesNotMatch(post, /pricingBodyCta\(/)
  assert.doesNotMatch(post, /pricingMidCta\(/)
  assert.doesNotMatch(post, /dataCiteHref\(/)
  assert.doesNotMatch(post, /["'`]\/pricing/)
  assert.doesNotMatch(post, /register\?plan=/)
  const buyBelow = post.indexOf("Tu precio máximo de compra")
  const demand = post.indexOf("La demanda es la otra mitad del precio")
  const faq = post.indexOf("faq:")
  assert.ok(buyBelow < demand && demand < faq)
})

test("BODY-BUYBELOW-001 paid CTA uses blog/organic + body_buybelow campaign", () => {
  const href = pricingBodyCtaHref("body_buybelow_20260913")
  assert.equal(
    href,
    "/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_buybelow_20260913",
  )
  const cta = pricingBodyCta("body_buybelow_20260913")
  assert.equal(cta.label, "Get the numbers")
  assert.equal(cta.body, "Buy-below + demand before cash sticks.")
  assert.equal(cta.href, href)
  assert.doesNotMatch(href, /register/)
  assert.doesNotMatch(href, /plan=/)
  assert.doesNotMatch(href, /start free/i)
})

test("BODY-BUYBELOW-001 soft cite is /data with body_buybelow campaign", () => {
  assert.equal(
    dataCiteHref("body_buybelow_20260913"),
    "/data?utm_source=blog&utm_medium=organic&utm_campaign=body_buybelow_20260913",
  )
})

test("BODY-SELLSBEST-001 paid CTA uses blog/organic + body_sellsbest campaign", () => {
  const href = pricingBodyCtaHref("body_sellsbest_20260913")
  assert.equal(
    href,
    "/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_sellsbest_20260913",
  )
  const cta = pricingBodyCta("body_sellsbest_20260913")
  assert.equal(cta.label, "Get the numbers")
  assert.equal(cta.body, "Buy-below + demand before cash sticks.")
  assert.equal(cta.href, href)
  assert.doesNotMatch(href, /register/)
  assert.doesNotMatch(href, /plan=/)
  assert.doesNotMatch(href, /start free/i)
})

test("BODY-SELLSBEST-001 soft cite is /data with body_sellsbest campaign", () => {
  assert.equal(
    dataCiteHref("body_sellsbest_20260913"),
    "/data?utm_source=blog&utm_medium=organic&utm_campaign=body_sellsbest_20260913",
  )
})

test("what-sells-best-on-vinted ships BODY-SELLSBEST-001 after ranking and before FAQ", () => {
  const posts = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/blog-posts.ts"),
    "utf8",
  )
  const start = posts.indexOf('slug: "what-sells-best-on-vinted"')
  const end = posts.indexOf('slug: "how-to-price-items-on-vinted"')
  assert.ok(start >= 0 && end > start)
  const post = posts.slice(start, end)
  assert.match(post, /Buy-below still decides the flip/)
  assert.match(post, /Knowing what sells best is half the job\. The other half is not overpaying for movers/)
  assert.match(post, /Week to 13 September 2026 \(EU5\): Fred Perry 1,027 watched departures @ €19/)
  assert.match(post, /Stone Island 892 @ €66/)
  assert.match(post, /Patagonia 843 @ €36/)
  assert.match(post, /Gucci 230 @ €197/)
  assert.match(post, /Volume ≠ margin — pair demand with buy-below before you tie up cash/)
  assert.match(post, /pricingBodyCta\("body_sellsbest_20260913"\)/)
  assert.match(post, /dataCiteHref\("body_sellsbest_20260913"\)/)
  assert.match(post, /ilinkHref\("flip"\)/)
  assert.match(post, /ilinkHref\("data"\)/)
  assert.doesNotMatch(post, /register\?plan=/)
  assert.doesNotMatch(post, /Start free/i)
  const ranking = post.indexOf("How to know before you buy")
  const buyBelow = post.indexOf("Buy-below still decides the flip")
  const faq = post.indexOf("faq:")
  assert.ok(ranking < buyBelow && buyBelow < faq)
})

test("BODY-VIEWS-002 paid CTA uses blog/organic + body_views_deepen campaign", () => {
  const href = pricingBodyCtaHref("body_views_deepen_002_20260913")
  assert.equal(
    href,
    "/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_views_deepen_002_20260913",
  )
  const cta = pricingBodyCta("body_views_deepen_002_20260913")
  assert.equal(cta.label, "Get the numbers")
  assert.equal(cta.body, "Buy-below + demand before cash sticks.")
  assert.equal(cta.href, href)
  assert.doesNotMatch(href, /register/)
  assert.doesNotMatch(href, /plan=/)
  assert.doesNotMatch(href, /start free/i)
})

test("BODY-VIEWS-002 soft cite is /data with body_views_deepen campaign", () => {
  assert.equal(
    dataCiteHref("body_views_deepen_002_20260913"),
    "/data?utm_source=blog&utm_medium=organic&utm_campaign=body_views_deepen_002_20260913",
  )
})

test("how-to-get-more-views footer stays on body_views when BODY-VIEWS-002 CTA is also present", () => {
  assert.equal(
    footerSeePlansHrefForPost([
      { cta: pricingMidCta("body_views_20260913") },
      { cta: pricingBodyCta("body_views_deepen_002_20260913") },
    ]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=body_views_20260913&utm_content=footer_see_plans",
  )
  assert.equal(
    legacySignupKillHrefForPost([
      { cta: pricingMidCta("body_views_20260913") },
      { cta: pricingBodyCta("body_views_deepen_002_20260913") },
    ]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=body_views_20260913&utm_content=legacy_signup_kill",
  )
})

test("how-to-get-more-views-on-vinted ships BODY-VIEWS-002 after demand and before listing tips", () => {
  const posts = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/blog-posts-2.ts"),
    "utf8",
  )
  const start = posts.indexOf('slug: "how-to-get-more-views-on-vinted"')
  const end = posts.indexOf('slug: "seasonal-reselling-calendar"')
  assert.ok(start >= 0 && end > start)
  const post = posts.slice(start, end)
  assert.match(post, /title: "How to Get More Views on Vinted — 4 Causes and Fixes"/)
  assert.match(post, /seoTitle: "How to Get More Views on Vinted — 4 Causes and Fixes"/)
  assert.match(
    post,
    /No views on Vinted usually means search wording, photos, price, or a stale listing/,
  )
  assert.match(post, /Demand is the other half of the views/)
  assert.match(
    post,
    /More views are useful only when the item has a chance of leaving the shelf/,
  )
  assert.match(post, /we watched 5,746 departures across 28 brands/)
  assert.match(post, /Fred Perry: 1,027 departures/)
  assert.match(post, /Stone Island: 892/)
  assert.match(post, /Gucci: 230 departures at an average €197/)
  assert.match(post, /1\. Demand: is this brand\/model moving enough this week/)
  assert.match(post, /2\. Buy-below: what is the most you can pay after fees/)
  assert.match(post, /pricingMidCta\("body_views_20260913"\)/)
  assert.match(post, /pricingBodyCta\("body_views_deepen_002_20260913"\)/)
  assert.match(post, /dataCiteHref\("body_views_deepen_002_20260913"\)/)
  assert.match(post, /\[Vinted market data\]\(/)
  assert.doesNotMatch(post, /register\?plan=/)
  assert.doesNotMatch(post, /register\?src=blog/)
  assert.doesNotMatch(post, /Start free/i)
  const demandFirst = post.indexOf("First: is there demand at all?")
  const demandHalf = post.indexOf("Demand is the other half of the views")
  const listingTips = post.indexOf("Match the words buyers type")
  assert.ok(demandFirst < demandHalf && demandHalf < listingTips)
})

test("buy-below-price-explained ships BODY-BUYBELOW-001 after the formula and before FAQ", () => {
  const posts = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/blog-posts.ts"),
    "utf8",
  )
  const start = posts.indexOf('slug: "buy-below-price-explained"')
  const end = posts.indexOf("export const ALL_POSTS")
  assert.ok(start >= 0 && end > start)
  const post = posts.slice(start, end)
  assert.match(post, /Demand is the other half of buy-below/)
  assert.match(post, /A buy-below number without demand still burns cash/)
  assert.match(post, /Pair \(1\) max pay after fees with \(2\) whether that brand is leaving the shelf this week/)
  assert.match(post, /Week to 13 September 2026 \(EU5\): we watched 5,746 departures across 28 brands/)
  assert.match(post, /Fred Perry 1,027 @ €19/)
  assert.match(post, /Stone Island 892 @ €66/)
  assert.match(post, /Gucci 230 @ €197/)
  assert.match(post, /pricingBodyCta\("body_buybelow_20260913"\)/)
  assert.match(post, /dataCiteHref\("body_buybelow_20260913"\)/)
  assert.doesNotMatch(post, /register\?plan=/)
  assert.doesNotMatch(post, /Start free/i)
  const formula = post.indexOf("The formula")
  const demand = post.indexOf("Demand is the other half of buy-below")
  const faq = post.indexOf("faq:")
  assert.ok(formula < demand && demand < faq)
})

test("BODY-FLIPS-002 paid CTA uses blog/organic + body_flips_deepen campaign", () => {
  const href = pricingBodyCtaHref("body_flips_deepen_002_20260913")
  assert.equal(
    href,
    "/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_flips_deepen_002_20260913",
  )
  const cta = pricingBodyCta("body_flips_deepen_002_20260913")
  assert.equal(cta.label, "Get the numbers")
  assert.equal(cta.body, "Buy-below + demand before cash sticks.")
  assert.equal(cta.href, href)
  assert.doesNotMatch(href, /register/)
  assert.doesNotMatch(href, /plan=/)
  assert.doesNotMatch(href, /start free/i)
})

test("BODY-FLIPS-002 soft cite is /data with body_flips_deepen campaign", () => {
  assert.equal(
    dataCiteHref("body_flips_deepen_002_20260913"),
    "/data?utm_source=blog&utm_medium=organic&utm_campaign=body_flips_deepen_002_20260913",
  )
})

test("how-to-find-items-to-flip footer stays on body_flips when BODY-FLIPS-002 CTA is also present", () => {
  assert.equal(
    footerSeePlansHrefForPost([
      { cta: pricingMidCta("body_flips_20260913") },
      { cta: pricingBodyCta("body_flips_deepen_002_20260913") },
    ]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=body_flips_20260913&utm_content=footer_see_plans",
  )
  assert.equal(
    legacySignupKillHrefForPost([
      { cta: pricingMidCta("body_flips_20260913") },
      { cta: pricingBodyCta("body_flips_deepen_002_20260913") },
    ]),
    "/pricing?utm_source=organic&utm_medium=blog&utm_campaign=body_flips_20260913&utm_content=legacy_signup_kill",
  )
})

test("how-to-find-items-to-flip-on-vinted ships BODY-FLIPS-002 after demand and before buy-below", () => {
  const posts = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/blog-posts.ts"),
    "utf8",
  )
  const start = posts.indexOf('slug: "how-to-find-items-to-flip-on-vinted"')
  const end = posts.indexOf('slug: "how-much-money-reselling-vinted"')
  assert.ok(start >= 0 && end > start)
  const post = posts.slice(start, end)
  assert.match(post, /title: "How to Find Vinted Flips — Start From Demand, Not Scroll"/)
  assert.match(post, /seoTitle: "How to Find Items to Flip on Vinted — Start From Demand"/)
  assert.match(
    post,
    /Stop random scrolling\. Find underpriced Vinted items from real demand/,
  )
  assert.match(post, /Demand is the other half/)
  assert.match(post, /A buy-below price protects the margin on paper/)
  assert.match(post, /Stone Island Hoodies recorded 566 watched departures at €55/)
  assert.match(post, /Patagonia Jackets 346 at €50/)
  assert.match(post, /New Balance Sneakers 283 at €51/)
  assert.match(post, /1\. Can you buy below your ceiling\?/)
  assert.match(post, /2\. Is there evidence that this brand, model, size, and condition can move\?/)
  assert.match(post, /Use a two-gate decision before you source/)
  assert.match(post, /average sale price × 0\.95 × 0\.70/)
  assert.match(post, /1\. Under buy-below: enough room for fees/)
  assert.match(post, /2\. Demand present: comparable items are moving/)
  assert.match(post, /3\. Exit quality: the size and condition are plausible/)
  assert.match(post, /pricingMidCta\("body_flips_20260913"\)/)
  assert.match(post, /pricingBodyCta\("body_flips_deepen_002_20260913"\)/)
  assert.match(post, /dataCiteHref\("body_flips_deepen_002_20260913"\)/)
  assert.match(post, /\[Weekly market data\]\(/)
  assert.doesNotMatch(post, /register\?plan=/)
  assert.doesNotMatch(post, /register\?src=blog/)
  assert.doesNotMatch(post, /Start free/i)
  const demandFirst = post.indexOf("Start from demand, not from what's cheap")
  const demandHalf = post.indexOf("Demand is the other half")
  const buyBelow = post.indexOf("Use the buy-below filter")
  assert.ok(demandFirst < demandHalf && demandHalf < buyBelow)
})
