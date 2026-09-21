/**
 * Programmatic model pages + glossary: templates, paywall honesty,
 * sitemap/robots, no invented figures, no free-check promise on paid models.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  SEO_MODELS,
  FREE_CHECK_QUERIES,
  SCALE_HUB_SLUGS,
  WEEK1_HUB_SLUGS,
  modelPath,
  modelPageTitle,
  modelPageDescription,
  modelsPointAtKnownBrands,
  getSeoModel,
  siblingModels,
  modelDemandParagraphs,
  modelFaqs,
  brandHubFaqs,
  liveAnswerLead,
  fmtBuyBelow,
  brandHasCategory,
} from "./seo-models.ts"
import { faqAnswerIsClean } from "./faq-schema.ts"
import {
  GLOSSARY_TERMS,
  GLOSSARY_HUB_FAQS,
  getGlossaryTerm,
} from "./glossary-terms.ts"
import { TEASER_QUERIES } from "./teaser-verdict.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("scale catalogue is 40–80 additional models on known brands, not doorway clones", () => {
  const additional = SEO_MODELS.length - 12
  assert.ok(additional >= 40, `additional=${additional}`)
  assert.ok(additional <= 80, `additional=${additional}`)
  assert.equal(modelsPointAtKnownBrands(), true)
  assert.equal(SCALE_HUB_SLUGS.length, 15)
  assert.equal(WEEK1_HUB_SLUGS.length, 10)
  const paths = SEO_MODELS.map((m) => modelPath(m))
  assert.equal(new Set(paths).size, paths.length)
  const queries = SEO_MODELS.map((m) => m.query)
  assert.equal(new Set(queries).size, queries.length)
  const angles = SEO_MODELS.map((m) => m.angle)
  assert.equal(new Set(angles).size, angles.length)
  const locked = [
    "/flip/adidas/model/samba",
    "/flip/nike/model/air-force-1",
    "/flip/new-balance/model/530",
    "/flip/new-balance/model/550",
    "/flip/levis/model/501",
    "/flip/jordan/model/air-jordan-1",
    "/flip/adidas/model/gazelle",
    "/flip/nike/model/dunk-low",
    "/flip/asics/model/gel-kayano-14",
    "/flip/salomon/model/xt-6",
    "/flip/converse/model/chuck-70",
    "/flip/dr-martens/model/1460",
  ]
  for (const p of locked) assert.ok(paths.includes(p), p)
  for (const m of SEO_MODELS) {
    assert.ok(m.query.includes(m.brand) || m.brand === "Jordan")
    assert.ok(m.category.length > 0)
    assert.match(m.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(m.angle.length > 40, m.slug)
    assert.equal(typeof m.freeCheck, "boolean")
  }
  const brandsSrc = read("data/seo-brands.json")
  for (const hub of SCALE_HUB_SLUGS) {
    assert.match(brandsSrc, new RegExp(`"slug": "${hub}"`))
    assert.ok(SEO_MODELS.some((m) => m.brandSlug === hub), hub)
  }
})

test("scale models skip doorway clones; insufficient-data brands are allowed", () => {
  const doorway = [
    "Samba OG",
    "Spezial",
    "Campus",
    "Air Force 1 Low",
    "Air Force 1 Mid",
    "Dunk",
    "Dunk Low SB",
    "Speedcat OG",
    "501 Original",
    "Jordan 1 Low",
    "Jordan 1 Mid",
    "Gazelle Indoor",
    "Chuck Taylor All Star",
  ]
  const published = new Set(SEO_MODELS.map((m) => m.model))
  for (const clone of doorway) {
    assert.equal(published.has(clone), false, clone)
  }
  assert.equal(getSeoModel("jordan", "air-jordan-1")?.freeCheck, false)
  assert.equal(getSeoModel("asics", "gel-kayano-14")?.freeCheck, false)
  assert.equal(getSeoModel("adidas", "gazelle")?.freeCheck, false)
  assert.equal(getSeoModel("adidas", "handball-spezial")?.freeCheck, false)
  assert.equal(brandHasCategory("adidas", "Sneakers"), true)
  assert.equal(brandHasCategory("asics", "Sneakers"), false)
})

test("free allowlist is Samba, AF1 and NB 530 only", () => {
  assert.deepEqual(FREE_CHECK_QUERIES, ["Adidas Samba", "Nike Air Force 1", "New Balance 530"])
  assert.deepEqual([...TEASER_QUERIES], [...FREE_CHECK_QUERIES])
  assert.equal(getSeoModel("adidas", "samba")?.freeCheck, true)
  assert.equal(getSeoModel("nike", "air-force-1")?.freeCheck, true)
  assert.equal(getSeoModel("new-balance", "530")?.freeCheck, true)
  assert.equal(getSeoModel("adidas", "gazelle")?.freeCheck, false)
  assert.equal(SEO_MODELS.filter((m) => m.freeCheck).length, 3)
})

test("model titles are answer-first, branded, and number-free", () => {
  for (const m of SEO_MODELS) {
    const title = modelPageTitle(m)
    assert.match(title, /^Should I buy .+ to resell\? — Resale IQ$/)
    assert.doesNotMatch(title, /€/)
    assert.ok(title.length <= 72, title)
  }
})

test("descriptions never invent a buy-below and never call a paid model free", () => {
  const gazelle = getSeoModel("adidas", "gazelle")!
  const paid = modelPageDescription({ model: gazelle, sold: 809, avg: 42, live: null })
  assert.match(paid, /809/)
  assert.match(paid, /Starter €19/)
  assert.doesNotMatch(paid, /free sample/)
  assert.doesNotMatch(paid, /Free sample/)
  assert.ok(paid.length <= 160)

  const samba = getSeoModel("adidas", "samba")!
  const live = modelPageDescription({
    model: samba,
    sold: null,
    avg: null,
    live: { verdict: "WATCH", buy_below: 24.35, product: "Adidas Samba" },
  })
  assert.match(live, /WATCH/)
  assert.match(live, /€24\.35/)
  assert.doesNotMatch(live, /Gazelle/)

  const missing = modelPageDescription({ model: samba, sold: null, avg: null, live: null })
  assert.doesNotMatch(missing, /€0/)
  assert.match(missing, /Free sample|free sample/)
})

test("paid model FAQs refuse a free check; schema answers stay clean", () => {
  const gazelle = getSeoModel("adidas", "gazelle")!
  const faqs = modelFaqs({ model: gazelle, live: null, sold: 809, avg: 42 })
  assert.ok(faqs.length >= 4)
  for (const f of faqs) assert.equal(faqAnswerIsClean(f.a), true, f.q)
  const blob = faqs.map((f) => `${f.q} ${f.a}`).join("\n")
  assert.match(blob, /Is the Adidas Gazelle check free\?/)
  assert.match(blob, /check free\? No\./)
  assert.match(blob, /Starter at €19/)
  assert.match(blob, /https:\/\/resaleiq\.dev\/pricing/)
  assert.match(blob, /https:\/\/resaleiq\.dev\/data/)
  assert.match(blob, /https:\/\/resaleiq\.dev\/tools/)
  assert.doesNotMatch(blob, /\/register/)
  assert.doesNotMatch(blob, /utm_/)
})

test("demand paragraphs use brand warehouse figures, never a fake model sold_7d", () => {
  const gazelle = getSeoModel("adidas", "gazelle")!
  const paras = modelDemandParagraphs(
    gazelle,
    { sold_7d: 809, avg_price_eur: 42, models_tracked: 7, top_categories: ["Sneakers"], categories: [] },
    siblingModels(gazelle),
  )
  assert.ok(paras.some((p) => /809/.test(p)))
  assert.ok(paras.every((p) => !/Gazelle has about \d/.test(p)))
  assert.ok(paras.some((p) => /not a free check/i.test(p)))
  assert.ok(paras.some((p) => /Adidas Samba \(free sample\)/.test(p)))
})

test("null buy-below is an em-dash, never €0", () => {
  assert.equal(fmtBuyBelow(null), "—")
  assert.equal(fmtBuyBelow(0), "—")
  assert.equal(fmtBuyBelow(24.3), "€24.30")
  assert.equal(liveAnswerLead("Adidas Samba", null), null)
  assert.equal(liveAnswerLead("Adidas Samba", { verdict: "WATCH" }), null)
})

test("glossary is the locked 10 terms, definition-first, no signup wall", () => {
  assert.equal(GLOSSARY_TERMS.length, 10)
  const slugs = GLOSSARY_TERMS.map((t) => t.slug)
  assert.deepEqual(slugs, [
    "vinted-demand",
    "vinted-sell-through",
    "buy-below-market",
    "dead-stock",
    "vinted-fees",
    "vinted-profit-margin",
    "max-buy-price",
    "average-sale-price",
    "condition-grading",
    "size-demand",
  ])
  for (const t of GLOSSARY_TERMS) {
    assert.ok(t.lead.length > 40, t.slug)
    assert.ok(t.body.every((p) => p.length > 40), t.slug)
    assert.equal(t.faqs[0].a, t.lead)
    for (const f of t.faqs) assert.equal(faqAnswerIsClean(f.a), true, f.q)
  }
  for (const f of GLOSSARY_HUB_FAQS) assert.equal(faqAnswerIsClean(f.a), true, f.q)
  const sell = getGlossaryTerm("vinted-sell-through")!
  assert.match(sell.lead, /not weekly turns/)
  assert.match(sell.body.join(" "), /null, not 0/)
  assert.equal(getGlossaryTerm("buy-below"), undefined)
})

test("model page template is a system: static params, FAQ, live-or-paywall, internal links", () => {
  const src = read("app/flip/[brand]/model/[slug]/page.tsx")
  assert.match(src, /generateModelStaticParams/)
  assert.match(src, /getTeaserVerdict/)
  assert.match(src, /faqPageJsonLd\(faqs\)/)
  assert.match(src, /<HubFaq items=\{faqs\}/)
  assert.match(src, /riq-model-paywall/)
  assert.match(src, /riq-model-verdict/)
  assert.match(src, /href="\/glossary\/buy-below-market"/)
  assert.match(src, /href="\/data"/)
  assert.match(src, /href="\/tools"/)
  assert.match(src, /href="\/pricing"/)
  assert.match(src, /MODEL_MONEY_HREF/)
  assert.doesNotMatch(src, /\/register/)
  assert.doesNotMatch(src, /Try a live check — \{b\.brand\}/)
})

test("brand hub lists models, visible FAQ, velocity teaser, no free brand-level check", () => {
  const src = read("app/flip/[brand]/page.tsx")
  assert.match(src, /modelsForBrand/)
  assert.match(src, /models to check before you buy/)
  assert.match(src, /not a free check/)
  assert.match(src, /href="\/glossary"/)
  assert.match(src, /brandHubFaqs/)
  assert.match(src, /faqPageJsonLd\(faqs\)/)
  assert.match(src, /<HubFaq items=\{faqs\}/)
  assert.match(src, /Weekly \{b\.brand\} velocity/)
  assert.match(src, /href="\/data"/)
  assert.match(src, /href="\/glossary\/vinted-demand"/)
  assert.doesNotMatch(src, /Try a live check — \{b\.brand\}/)
  assert.doesNotMatch(src, /\/tools\?q=\$\{encodeURIComponent\(b\.brand\)\}/)
})

test("paid brand hubs refuse a free check; Adidas hub names Samba only", () => {
  const nike = brandHubFaqs({
    brand: "Nike",
    brandSlug: "nike",
    sold: 203,
    avg: 67,
    freeModels: [getSeoModel("nike", "air-force-1")!],
  })
  const gazelleBrand = brandHubFaqs({
    brand: "Gucci",
    brandSlug: "gucci",
    sold: 237,
    avg: 210,
    freeModels: [],
  })
  for (const f of [...nike, ...gazelleBrand]) assert.equal(faqAnswerIsClean(f.a), true, f.q)
  const nikeBlob = nike.map((f) => `${f.q} ${f.a}`).join("\n")
  assert.match(nikeBlob, /Is the Nike check free\?/)
  assert.match(nikeBlob, /Yes for Nike Air Force 1/)
  assert.doesNotMatch(nikeBlob, /Gazelle/)
  const paidBlob = gazelleBrand.map((f) => `${f.q} ${f.a}`).join("\n")
  assert.match(paidBlob, /check free\? No\./)
  assert.match(paidBlob, /Starter €19/)
  assert.match(paidBlob, /https:\/\/resaleiq\.dev\/data/)
  assert.match(paidBlob, /https:\/\/resaleiq\.dev\/pricing/)
  assert.doesNotMatch(paidBlob, /\/register/)
  assert.doesNotMatch(paidBlob, /utm_/)
  assert.doesNotMatch(paidBlob, /free sample is Gucci/)
})

test("sitemap, robots and llms advertise the new routes", () => {
  const sitemap = read("app/sitemap.ts")
  assert.match(sitemap, /modelPages/)
  assert.match(sitemap, /glossaryPages/)
  assert.match(sitemap, /"\/glossary"/)
  assert.match(sitemap, /SEO_MODELS/)
  assert.match(sitemap, /landingPages/)
  assert.match(sitemap, /landingHubLocalePages/)
  assert.match(sitemap, /dataLocalePages/)
  assert.match(sitemap, /toolsLocalePages/)
  assert.match(sitemap, /blogClonePages/)
  const robots = read("app/robots.ts")
  assert.match(robots, /"\/glossary"/)
  assert.match(robots, /"\/best"/)
  assert.match(robots, /"\/vs"/)
  assert.match(robots, /"\/for"/)
  const llms = read("app/llms.txt/route.ts")
  assert.match(llms, /New Balance 530/)
  assert.match(llms, /\$\{BASE\}\/glossary/)
  assert.match(llms, /\$\{BASE\}\/best/)
  assert.match(llms, /Named models/)
  assert.match(llms, /except the three/)
  const cfg = read("../next.config.ts")
  assert.match(cfg, /\/glossary\/buy-below-market/)
  assert.match(cfg, /\/glossary\/vinted-demand/)
  assert.match(cfg, /air-jordan-1/)
})
