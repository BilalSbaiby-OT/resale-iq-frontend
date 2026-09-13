/**
 * EX-ILINK — contextual blog → hub links. Mid-CTAs must stay on their
 * own campaigns. Paid destination is /pricing, never /register.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { ilinkHref, ILINK_CAMPAIGN } from "./blog-ilink.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

const POST_FILES = [
  "data/blog-posts.ts",
  "data/blog-posts-2.ts",
  "data/blog-posts-3.ts",
] as const

function postChunks(src: string): { slug: string; body: string }[] {
  const chunks: { slug: string; body: string }[] = []
  const re = /slug:\s*"([^"]+)"/g
  const hits: { slug: string; index: number }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) hits.push({ slug: m[1], index: m.index })
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].index : src.length
    chunks.push({ slug: hits[i].slug, body: src.slice(hits[i].index, end) })
  }
  return chunks
}

test("ilink helper uses blog/ilink + ilink_20260913 + hub content", () => {
  assert.equal(ILINK_CAMPAIGN, "ilink_20260913")
  assert.equal(
    ilinkHref("data"),
    "/data?utm_source=blog&utm_medium=ilink&utm_campaign=ilink_20260913&utm_content=to_data",
  )
  assert.equal(
    ilinkHref("flip"),
    "/flip?utm_source=blog&utm_medium=ilink&utm_campaign=ilink_20260913&utm_content=to_flip",
  )
  assert.equal(
    ilinkHref("pricing"),
    "/pricing?utm_source=blog&utm_medium=ilink&utm_campaign=ilink_20260913&utm_content=to_pricing",
  )
  assert.equal(
    ilinkHref("data", "es"),
    "/es/data?utm_source=blog&utm_medium=ilink&utm_campaign=ilink_20260913&utm_content=to_data",
  )
  assert.equal(
    ilinkHref("flip", "es"),
    "/es/flip?utm_source=blog&utm_medium=ilink&utm_campaign=ilink_20260913&utm_content=to_flip",
  )
  assert.equal(
    ilinkHref("pricing", "es"),
    "/es/pricing?utm_source=blog&utm_medium=ilink&utm_campaign=ilink_20260913&utm_content=to_pricing",
  )
  assert.doesNotMatch(ilinkHref("pricing"), /register/)
  assert.doesNotMatch(ilinkHref("pricing", "es"), /register/)
})

test("EX-ILINK pack: ≥4 anchors on ≥3 posts, max 3 per post, no /register", () => {
  const bodies = POST_FILES.map(read)
  const all = bodies.join("\n")
  assert.doesNotMatch(all, /\/register\?src=blog/)
  assert.doesNotMatch(all, /\/register\?plan=/)

  const postsWithIlink: string[] = []
  let anchors = 0
  for (const src of bodies) {
    for (const { slug, body } of postChunks(src)) {
      const n = (body.match(/ilinkHref\(/g) ?? []).length
      if (n === 0) continue
      assert.ok(n <= 3, `${slug} has ${n} ilink anchors (max 3)`)
      postsWithIlink.push(slug)
      anchors += n
    }
  }

  assert.ok(anchors >= 4, `expected ≥4 ilink anchors, got ${anchors}`)
  assert.ok(postsWithIlink.length >= 3, `expected ≥3 posts, got ${postsWithIlink.join(",")}`)
  for (const required of [
    "how-to-price-items-on-vinted",
    "how-to-find-items-to-flip-on-vinted",
    "how-to-get-more-views-on-vinted",
    "buy-below-price-explained",
    "common-vinted-scams-sellers",
    "vinted-disputes-and-returns-sellers",
  ]) {
    assert.ok(postsWithIlink.includes(required), `missing ilink on ${required}`)
  }
})

test("EX-ILINK-REST: every EN post has 1-2 hub anchors, campaign unchanged", () => {
  const missing: string[] = []
  for (const rel of POST_FILES) {
    const src = read(rel)
    for (const { slug, body } of postChunks(src)) {
      if (slug === "como-poner-precio-en-vinted") continue
      const n = (body.match(/ilinkHref\(/g) ?? []).length
      if (n === 0) missing.push(slug)
      assert.ok(n <= 2, `${slug} has ${n} ilink anchors (REST max 2)`)
      assert.doesNotMatch(body, /ilinkHref\("pricing"\)/)
      assert.doesNotMatch(body, /\/register/)
    }
  }
  assert.deepEqual(missing, [], `EN posts missing ilink_20260913: ${missing.join(",")}`)

  const posts3 = read("data/blog-posts-3.ts")
  const disputesStart = posts3.indexOf('slug: "vinted-disputes-and-returns-sellers"')
  const disputesEnd = posts3.indexOf('slug: "sneaker-reselling-guide-vinted"')
  const disputes = posts3.slice(disputesStart, disputesEnd)
  assert.match(disputes, /ilinkHref\("data"\)/)
  assert.match(disputes, /ilinkHref\("flip"\)/)
  assert.equal((disputes.match(/ilinkHref\(/g) ?? []).length, 2)

  const scamsStart = posts3.indexOf('slug: "common-vinted-scams-sellers"')
  const scamsEnd = posts3.indexOf('slug: "reseller-record-keeping-basics"')
  const scams = posts3.slice(scamsStart, scamsEnd)
  assert.match(scams, /ilinkHref\("data"\)/)
  assert.match(scams, /ilinkHref\("flip"\)/)
  assert.equal((scams.match(/ilinkHref\(/g) ?? []).length, 2)
})

test("EX-ILINK does not touch mid-CTA campaigns or blog-mid-cta.ts", () => {
  const mid = read("lib/blog-mid-cta.ts")
  assert.doesNotMatch(mid, /ilink_20260913/)
  assert.doesNotMatch(mid, /utm_medium=ilink/)

  const posts = read("data/blog-posts.ts")
  assert.match(posts, /pricingMidCta\("ctr_price_20260913"\)/)
  assert.match(posts, /pricingBodyCta\("body_price_20260913"\)/)
  assert.match(posts, /dataCiteHref\("body_price_20260913"\)/)
  assert.match(posts, /pricingMidCta\("body_flips_20260913"\)/)
  assert.match(posts, /pricingBodyCta\("body_flips_deepen_002_20260913"\)/)
  assert.match(posts, /dataCiteHref\("body_flips_deepen_002_20260913"\)/))

  const posts2 = read("data/blog-posts-2.ts")
  assert.match(posts2, /pricingMidCta\("body_views_20260913"\)/)
  assert.match(posts2, /pricingBodyCta\("body_views_deepen_002_20260913"\)/)
  assert.match(posts2, /dataCiteHref\("body_views_deepen_002_20260913"\)/)

  const posts3 = read("data/blog-posts-3.ts")
  assert.match(posts3, /pricingBodyCtaEs\("body_price_es_20260913"\)/)
  assert.match(posts3, /dataCiteHrefEs\("body_price_es_20260913"\)/)
  assert.match(posts, /pricingBodyCta\("body_buybelow_20260913"\)/)
  assert.match(posts, /dataCiteHref\("body_buybelow_20260913"\)/)
  assert.match(posts, /pricingBodyCta\("body_sellsbest_20260913"\)/)
  assert.match(posts, /dataCiteHref\("body_sellsbest_20260913"\)/)
  const buyStart = posts.indexOf('slug: "buy-below-price-explained"')
  const buy = posts.slice(buyStart)
  assert.doesNotMatch(buy, /ilinkHref\("pricing"\)/)
  const esStart = posts3.indexOf('slug: "como-poner-precio-en-vinted"')
  const esEnd = posts3.indexOf('slug: "vinted-item-not-selling"')
  const es = posts3.slice(esStart, esEnd)
  assert.match(es, /ilinkHref\("data", "es"\)/)
  assert.match(es, /ilinkHref\("flip", "es"\)/)
  assert.doesNotMatch(es, /["'`]\/pricing/)
  assert.doesNotMatch(es, /ilinkHref\("pricing"\)/)
})

test("target post titles, metas and H1s are unchanged", () => {
  const posts = read("data/blog-posts.ts")
  const posts2 = read("data/blog-posts-2.ts")
  const posts3 = read("data/blog-posts-3.ts")
  assert.match(posts, /title: "How to Price Items on Vinted: Buy-Below from Departure Prices"/)
  assert.match(posts, /seoTitle: "How to Price Items on Vinted — Get Your Buy-Below Automatically"/)
  assert.match(
    posts,
    /Price off real Vinted departure prices, then work backwards to buy-below/,
  )
  assert.match(posts, /title: "How to Find Vinted Flips — Start From Demand, Not Scroll"/)
  assert.match(posts, /seoTitle: "How to Find Items to Flip on Vinted — Start From Demand"/)
  assert.match(posts, /title: "Buy-Below Price: The One Number That Decides Your Profit"/)
  assert.match(posts2, /title: "How to Get More Views on Vinted — 4 Causes and Fixes"/)
  assert.match(posts2, /seoTitle: "How to Get More Views on Vinted — 4 Causes and Fixes"/)
  assert.match(posts3, /title: "Vinted Disputes and Returns: A Seller's Guide"/)
  assert.match(posts3, /seoTitle: "How to Avoid Vinted Disputes\? Photos First — Resale IQ"/)
  assert.match(
    posts3,
    /Photograph every flaw, state measurements, keep chats on Vinted, use the tracked label\. Most disputes are preventable; evidence decides the rest\./,
  )
  assert.match(posts3, /title: "Common Vinted Scams and How Sellers Avoid Them"/)
  assert.match(posts3, /seoTitle: "Vinted Seller Scams: Stay On-Platform — Resale IQ"/)
  assert.match(
    posts3,
    /Off-platform pay, fake screenshots and item swaps hit Vinted sellers\. Stay on-platform, use the tracked label, photograph the parcel\./,
  )
})
