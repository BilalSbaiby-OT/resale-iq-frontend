import { test } from "node:test"
import assert from "node:assert/strict"
import { LANDINGS, getLandingCopy, landingFaqsClean, landingKey } from "./seo-landings.ts"
import { BLOG_CLONE_SLUGS } from "./locale-routes.ts"
import { getBlogCloneCopy } from "../data/seo-blog-clones-e.ts"
import { ALL_LOCALES } from "./locale-routes.ts"
import { faqAnswerIsClean } from "./faq-schema.ts"

const LOCALES = ALL_LOCALES

test("12 BEST/VS/FOR landings exist with six-locale copy, unique titles, clean FAQs", () => {
  assert.equal(LANDINGS.length, 12)
  assert.equal(LANDINGS.filter((l) => l.kind === "best").length, 3)
  assert.equal(LANDINGS.filter((l) => l.kind === "vs").length, 4)
  assert.equal(LANDINGS.filter((l) => l.kind === "for").length, 5)
  const titles = new Set<string>()
  for (const l of LANDINGS) {
    for (const locale of LOCALES) {
      const c = getLandingCopy(l.kind, l.slug, locale)
      assert.ok(c, `${landingKey(l.kind, l.slug)} ${locale}`)
      assert.ok(c!.h1.length > 20, `${l.slug} ${locale} h1`)
      assert.ok(c!.sections.length >= 2, `${l.slug} ${locale} sections`)
      assert.ok(c!.faqs.length >= 4, `${l.slug} ${locale} faqs`)
      assert.equal(landingFaqsClean(c!), true, `${l.slug} ${locale} faq utm/register`)
      for (const f of c!.faqs) assert.equal(faqAnswerIsClean(f.a), true, f.q)
      if (locale === "en") titles.add(c!.title)
    }
  }
  assert.equal(titles.size, LANDINGS.length)
})

test("blog clones cover 12 GSC winners in six locales", () => {
  assert.equal(BLOG_CLONE_SLUGS.length, 12)
  for (const slug of BLOG_CLONE_SLUGS) {
    for (const locale of LOCALES) {
      const c = getBlogCloneCopy(slug, locale)
      assert.ok(c, `${slug} ${locale}`)
      assert.equal(c!.faqs.every((f) => faqAnswerIsClean(f.a)), true, `${slug} ${locale}`)
      assert.doesNotMatch(c!.intro + c!.verdict, /\/register/)
    }
  }
})

test("free-check honesty: only Samba / AF1 / NB 530 named as free samples", () => {
  const blob = LANDINGS.map((l) =>
    LOCALES.map((locale) => {
      const c = getLandingCopy(l.kind, l.slug, locale)!
      return `${c.intro} ${c.verdict} ${c.faqs.map((f) => f.a).join(" ")}`
    }).join("\n"),
  ).join("\n")
  assert.match(blob, /Samba/)
  assert.match(blob, /Air Force 1/)
  assert.match(blob, /530/)
  assert.doesNotMatch(blob, /unlimited free checker/)
})
