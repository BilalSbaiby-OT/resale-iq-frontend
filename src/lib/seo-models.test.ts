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
  modelPath,
  modelPageTitle,
  modelPageDescription,
  modelsPointAtKnownBrands,
  getSeoModel,
  siblingModels,
  modelDemandParagraphs,
  modelFaqs,
  liveAnswerLead,
  fmtBuyBelow,
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

test("first batch is 15–25 named models from existing /flip brands", () => {
  assert.ok(SEO_MODELS.length >= 15 && SEO_MODELS.length <= 25, `got ${SEO_MODELS.length}`)
  assert.equal(modelsPointAtKnownBrands(), true)
  const slugs = new Set(SEO_MODELS.map((m) => modelPath(m)))
  assert.equal(slugs.size, SEO_MODELS.length)
  for (const m of SEO_MODELS) {
    assert.ok(m.query.includes(m.brand) || m.brand === "Jordan")
    assert.ok(m.category.length > 0)
    assert.match(m.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  }
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

test("glossary is definition-first with matching FAQ leads and no signup wall", () => {
  assert.equal(GLOSSARY_TERMS.length, 3)
  assert.ok(getGlossaryTerm("buy-below"))
  assert.ok(getGlossaryTerm("watched-departure"))
  assert.ok(getGlossaryTerm("sell-through"))
  for (const t of GLOSSARY_TERMS) {
    assert.ok(t.lead.length > 40)
    assert.equal(t.faqs[0].a, t.lead)
    for (const f of t.faqs) assert.equal(faqAnswerIsClean(f.a), true, f.q)
  }
  for (const f of GLOSSARY_HUB_FAQS) assert.equal(faqAnswerIsClean(f.a), true, f.q)
  const sell = getGlossaryTerm("sell-through")!
  assert.match(sell.lead, /not weekly turns/)
  assert.match(sell.body.join(" "), /null, not 0/)
})

test("model page template is a system: static params, FAQ, live-or-paywall, internal links", () => {
  const src = read("app/flip/[brand]/model/[slug]/page.tsx")
  assert.match(src, /generateModelStaticParams/)
  assert.match(src, /getTeaserVerdict/)
  assert.match(src, /faqPageJsonLd\(faqs\)/)
  assert.match(src, /<HubFaq items=\{faqs\}/)
  assert.match(src, /riq-model-paywall/)
  assert.match(src, /riq-model-verdict/)
  assert.match(src, /href="\/glossary\/buy-below"/)
  assert.match(src, /href="\/data"/)
  assert.match(src, /href="\/tools"/)
  assert.match(src, /href="\/pricing"/)
  assert.match(src, /MODEL_MONEY_HREF/)
  assert.doesNotMatch(src, /\/register/)
  assert.doesNotMatch(src, /Try a live check — \{b\.brand\}/)
})

test("brand hub lists models and does not promise a free brand-level check", () => {
  const src = read("app/flip/[brand]/page.tsx")
  assert.match(src, /modelsForBrand/)
  assert.match(src, /models to check before you buy/)
  assert.match(src, /not a free check/)
  assert.match(src, /href="\/glossary"/)
  assert.doesNotMatch(src, /Try a live check — \{b\.brand\}/)
  assert.doesNotMatch(src, /\/tools\?q=\$\{encodeURIComponent\(b\.brand\)\}/)
})

test("sitemap, robots and llms advertise the new routes", () => {
  const sitemap = read("app/sitemap.ts")
  assert.match(sitemap, /modelPages/)
  assert.match(sitemap, /glossaryPages/)
  assert.match(sitemap, /"\/glossary"/)
  assert.match(sitemap, /SEO_MODELS/)
  const robots = read("app/robots.ts")
  assert.match(robots, /"\/glossary"/)
  const llms = read("app/llms.txt/route.ts")
  assert.match(llms, /New Balance 530/)
  assert.match(llms, /\$\{BASE\}\/glossary/)
  assert.match(llms, /Named models/)
  assert.match(llms, /except the three/)
})
