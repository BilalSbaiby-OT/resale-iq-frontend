/**
 * Related-links generator — the ONE place that decides which public page links
 * to which, so internal linking is distributed by construction and testable
 * from data (no network).
 *
 * Why this exists: the blog "Keep reading" block used to be a fixed slice, so a
 * handful of posts collected every internal link and ~130 of 169 posts had <3
 * content links pointing at them (crawl 2026-09-30). Crawlers discover pages
 * through links, not the sitemap, so those pages were effectively orphaned.
 *
 * Design:
 *  - Posts are put on a RING ordered by (topic cluster, slug). Every post links
 *    to the next RING_NEXT posts on the ring and the previous one, so each
 *    indexable post has exactly RING_NEXT + 1 inbound blog links regardless of
 *    how many posts share a topic (small clusters just spill into the adjacent
 *    cluster, which is still topically close because the ring is sorted by it).
 *  - The same ring trick covers glossary terms, manual chapters, /tools intents
 *    and /buy brands. Programmatic pages (brand, category, model) additionally
 *    link to the blog posts that are about that brand / category.
 *  - Every link goes to a URL that renders (redirected slugs and non-existent
 *    /buy pages are filtered out here), so the block can never add a 3xx/4xx.
 *
 * Plain data module: `node --test` loads it through src/lib/test-support.
 */
import { ALL_POSTS, type BlogPost } from "../data/blog-posts.ts"
import { BRANDS, CATEGORIES, LINKABLE_BRANDS, catSlug, type BrandSeo } from "./seo-categories.ts"
import { SEO_MODELS, modelPath } from "./seo-models.ts"
import { GLOSSARY_TERMS } from "./glossary-terms.ts"
import { ALL_CHAPTERS } from "../data/manual.ts"
import { INTENTS } from "../data/search-intents.ts"
import { LANDINGS, landingPath, type LandingKind } from "./seo-landings.ts"
import { BUY_DATA, BUY_BATCH1_PAIRS, BUY_BATCH1_SLUGS } from "./buy-data.ts"
import { isRedirectedPath } from "./sitemap-redirects.ts"
import { TRACKED } from "./stats.ts"
import { fillBrands } from "./fill-brands.ts"

export interface RelatedLink {
  href: string
  label: string
}
export interface RelatedGroup {
  heading: string
  links: RelatedLink[]
}

/** Blog ring: each post links to this many following posts (+1 previous). */
export const RING_NEXT = 3
/** Minimum inbound internal links every indexable page must have. */
export const MIN_INBOUND = 3

/**
 * The four posts ChatGPT sends humans to (14d, 2026-09-30). They get a
 * prominent next-step strip under the intro, not just a footer block.
 */
export const TOP_AI_LANDING_SLUGS: readonly string[] = [
  "what-sells-best-on-vinted",
  "what-to-buy-to-resell-on-vinted-right-now",
  "ralph-lauren-eu-vinted-price-guide",
  "best-brands-to-resell-on-vinted",
]

const clean = (s: string, tracked?: string) => fillBrands(s, null).split(TRACKED).join(tracked ?? "").replace(/\s{2,}/g, " ").trim()

// ---------------------------------------------------------------- blog ring

/** Posts that render (200) — a slug next.config.ts redirects is not linkable. */
export const LINKABLE_POSTS: BlogPost[] = ALL_POSTS.filter((p) => !isRedirectedPath(`/blog/${p.slug}`))
/** Posts that are also indexable (the ring's targets). */
export const INDEXABLE_POSTS: BlogPost[] = LINKABLE_POSTS.filter((p) => !p.noindex)

const BRAND_SLUGS_LONGEST_FIRST = [...BRANDS.map((b) => b.slug), "pull-and-bear"].sort((a, b) => b.length - a.length)

/** Brand slug a post is about (longest slug contained in the post slug), if any. */
export function postBrand(slug: string): string | null {
  return BRAND_SLUGS_LONGEST_FIRST.find((b) => slug.includes(b)) ?? null
}

/** Category slug a post is about, from tokens in its slug. */
const CATEGORY_TOKENS: Record<string, string[]> = {
  hoodies: ["hoodie"],
  jackets: ["jacket"],
  shirts: ["shirt"],
  sneakers: ["sneaker", "dunk", "samba", "air-force", "trainer"],
  "t-shirts": ["tee", "t-shirt"],
  bags: ["bag", "handbag"],
  jeans: ["jeans", "denim"],
  caps: ["cap-", "-cap", "hat"],
  tracksuits: ["tracksuit"],
  coats: ["coat", "parka"],
}
export function postCategory(slug: string): string | null {
  for (const [cat, toks] of Object.entries(CATEGORY_TOKENS)) {
    if (toks.some((t) => slug.includes(t))) return cat
  }
  return null
}

function clusterKey(p: BlogPost): string {
  return postBrand(p.slug) ?? `~${postCategory(p.slug) ?? p.category}`
}

const RING: BlogPost[] = [...INDEXABLE_POSTS].sort((a, b) => {
  const ka = clusterKey(a)
  const kb = clusterKey(b)
  return ka === kb ? (a.slug < b.slug ? -1 : 1) : ka < kb ? -1 : 1
})
const RING_INDEX = new Map(RING.map((p, i) => [p.slug, i]))

const HUB_POST_SLUGS = [
  "what-sells-best-on-vinted",
  "best-brands-to-resell-on-vinted",
  "how-to-price-items-on-vinted",
  "buy-below-price-explained",
]

/** Blog posts a given post links to in "Keep reading": next 3 + previous 1 on the ring. */
export function blogRingLinks(slug: string): BlogPost[] {
  const i = RING_INDEX.get(slug)
  if (i === undefined) {
    // noindex / off-ring posts: point at the hub posts (still indexable targets).
    return HUB_POST_SLUGS.map((s) => RING[RING_INDEX.get(s) ?? 0]).filter((p) => p && p.slug !== slug).slice(0, RING_NEXT + 1)
  }
  const n = RING.length
  const out: BlogPost[] = []
  for (let k = 1; k <= RING_NEXT; k++) out.push(RING[(i + k) % n])
  out.push(RING[(i - 1 + n) % n])
  return out
}

/** Posts about a brand (all of them, newest first), capped. */
export function postsForBrand(brandSlug: string, limit = 5, exclude?: string): BlogPost[] {
  return INDEXABLE_POSTS.filter((p) => p.slug !== exclude && postBrand(p.slug) === brandSlug)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit)
}

/** Posts about a category, capped; brand-less first so brand posts keep their brand cluster. */
export function postsForCategory(catSlugValue: string, limit = 4): BlogPost[] {
  return INDEXABLE_POSTS.filter((p) => postCategory(p.slug) === catSlugValue)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit)
}

// ---------------------------------------------------------------- generic ring

/** Next `k` items after `key` on a ring of `items` (wraps; excludes self). */
export function ringNext<T>(items: readonly T[], keyOf: (t: T) => string, key: string, k: number): T[] {
  const i = items.findIndex((t) => keyOf(t) === key)
  if (i < 0 || items.length < 2) return []
  const out: T[] = []
  for (let j = 1; j <= Math.min(k, items.length - 1); j++) out.push(items[(i + j) % items.length])
  return out
}

// ---------------------------------------------------------------- buy helpers

const BUY_BRAND_SLUGS = new Set(BUY_BATCH1_PAIRS.map((p) => p.brand.slug))
export const hasBuyBrand = (slug: string) => BUY_BRAND_SLUGS.has(slug)
export const hasBuyPair = (brand: string, cat: string) => BUY_BATCH1_SLUGS.has(`${brand}/${cat}`)
const BUY_BRANDS = BUY_DATA.brands.filter((b) => BUY_BRAND_SLUGS.has(b.slug))

// ---------------------------------------------------------------- top brands

const TOP_BRANDS: BrandSeo[] = [...LINKABLE_BRANDS].sort((a, b) => b.sold_7d - a.sold_7d)

// ---------------------------------------------------------------- the API

export type RelatedRef =
  | { kind: "blog"; slug: string }
  | { kind: "flip-brand"; slug: string }
  | { kind: "flip-cat"; brand: string; category: string }
  | { kind: "flip-model"; brand: string; slug: string }
  | { kind: "category"; slug: string }
  | { kind: "buy-brand"; slug: string }
  | { kind: "buy-leaf"; brand: string; category: string }
  | { kind: "glossary"; slug: string }
  | { kind: "manual"; slug: string }
  | { kind: "tool"; slug: string }
  | { kind: "landing"; landingKind: LandingKind; slug: string }

const postLink = (p: BlogPost, tracked?: string): RelatedLink => ({ href: `/blog/${p.slug}`, label: clean(p.title, tracked) })
const brandLink = (b: BrandSeo): RelatedLink => ({ href: `/flip/${b.slug}`, label: `Is ${b.brand} worth reselling on Vinted?` })
const brandOf = (slug: string) => BRANDS.find((b) => b.slug === slug)

/** Un-deduped groups → drop empty groups and links already shown earlier in the block. */
function tidy(groups: RelatedGroup[], selfHref: string): RelatedGroup[] {
  const seen = new Set<string>([selfHref])
  const out: RelatedGroup[] = []
  for (const g of groups) {
    const links = g.links.filter((l) => {
      if (seen.has(l.href)) return false
      seen.add(l.href)
      return true
    })
    if (links.length) out.push({ heading: g.heading, links })
  }
  return out
}

const NEXT_STEPS: RelatedLink[] = [
  { href: "/tools", label: "Check any item free — BUY / WATCH / SKIP with a buy-below price" },
  { href: "/data", label: "Live weekly brand volumes on Vinted (open data)" },
]

export function relatedGroups(ref: RelatedRef, tracked?: string): RelatedGroup[] {
  switch (ref.kind) {
    case "blog": {
      const brand = postBrand(ref.slug)
      const cat = postCategory(ref.slug)
      const b = brand ? brandOf(brand) : undefined
      const data: RelatedLink[] = []
      if (b && !isRedirectedPath(`/flip/${b.slug}`)) {
        data.push(brandLink(b))
        if (hasBuyBrand(b.slug)) data.push({ href: `/buy/${b.slug}`, label: `What to pay for ${b.brand}: buy-below prices` })
        if (cat && (b.categories || []).some((c) => catSlug(c.category) === cat)) {
          data.push({ href: `/flip/${b.slug}/${cat}`, label: `Are ${b.brand} ${cat.replace("-", " ")} worth reselling?` })
        }
      }
      if (cat) {
        const c = CATEGORIES.find((x) => x.slug === cat)
        if (c) data.push({ href: `/category/${c.slug}`, label: `Which brands sell best in ${c.category}?` })
      }
      if (!b && !cat) {
        for (const t of TOP_BRANDS.slice(0, 3)) data.push(brandLink(t))
      }
      return tidy(
        [
          { heading: "Check it yourself", links: NEXT_STEPS },
          { heading: "The data behind this", links: data },
          { heading: "Keep reading", links: blogRingLinks(ref.slug).map((p) => postLink(p, tracked)) },
        ],
        `/blog/${ref.slug}`,
      )
    }
    case "flip-brand": {
      const b = brandOf(ref.slug)
      if (!b) return []
      const ring = ringNext(LINKABLE_BRANDS, (x) => x.slug, ref.slug, 6)
      const cat = b.top_categories?.[0] ? catSlug(b.top_categories[0]) : null
      return tidy(
        [
          { heading: `${b.brand} guides`, links: postsForBrand(ref.slug, 5).map((p) => postLink(p, tracked)) },
          {
            heading: "More on this",
            links: [
              ...(cat ? [{ href: `/category/${cat}`, label: `Which brands sell best in ${b.top_categories[0]}?` }] : []),
              { href: "/blog/what-sells-best-on-vinted", label: "What sells best on Vinted right now" },
              ...NEXT_STEPS,
            ],
          },
          { heading: "Similar brands", links: ring.map(brandLink) },
        ],
        `/flip/${ref.slug}`,
      )
    }
    case "flip-cat": {
      const b = brandOf(ref.brand)
      const c = CATEGORIES.find((x) => x.slug === ref.category)
      if (!b || !c) return []
      const peers = ringNext(c.entries.filter((e) => !isRedirectedPath(`/flip/${e.slug}`)), (e) => e.slug, ref.brand, 3)
      return tidy(
        [
          { heading: `${b.brand} guides`, links: postsForBrand(ref.brand, 3).map((p) => postLink(p, tracked)) },
          {
            heading: `${c.category} from other brands`,
            links: peers.map((e) => ({ href: `/flip/${e.slug}/${c.slug}`, label: `Are ${e.brand} ${c.category.toLowerCase()} worth reselling?` })),
          },
          { heading: "More on this", links: NEXT_STEPS },
        ],
        `/flip/${ref.brand}/${ref.category}`,
      )
    }
    case "flip-model": {
      const m = SEO_MODELS.find((x) => x.brandSlug === ref.brand && x.slug === ref.slug)
      const b = brandOf(ref.brand)
      if (!m || !b) return []
      const otherBrandModels = ringNext(SEO_MODELS, (x) => `${x.brandSlug}/${x.slug}`, `${ref.brand}/${ref.slug}`, 3)
      return tidy(
        [
          { heading: `${b.brand} guides`, links: postsForBrand(ref.brand, 3).map((p) => postLink(p, tracked)) },
          { heading: "More models", links: otherBrandModels.map((x) => ({ href: modelPath(x), label: `Should I buy ${x.query} to resell?` })) },
          { heading: "More on this", links: NEXT_STEPS },
        ],
        modelPath(m),
      )
    }
    case "category": {
      const c = CATEGORIES.find((x) => x.slug === ref.slug)
      if (!c) return []
      const peers = ringNext(CATEGORIES, (x) => x.slug, ref.slug, 3)
      return tidy(
        [
          { heading: `${c.category} guides`, links: postsForCategory(ref.slug, 4).map((p) => postLink(p, tracked)) },
          { heading: "Other categories", links: peers.map((x) => ({ href: `/category/${x.slug}`, label: `Do ${x.category.toLowerCase()} sell on Vinted?` })) },
          { heading: "More on this", links: NEXT_STEPS },
        ],
        `/category/${ref.slug}`,
      )
    }
    case "buy-brand": {
      const b = BUY_BRANDS.find((x) => x.slug === ref.slug)
      if (!b) return []
      const ring = ringNext(BUY_BRANDS, (x) => x.slug, ref.slug, 3)
      return tidy(
        [
          { heading: `${b.brand} guides`, links: postsForBrand(ref.slug, 3).map((p) => postLink(p, tracked)) },
          { heading: "Other brands", links: ring.map((x) => ({ href: `/buy/${x.slug}`, label: `What to pay for ${x.brand}` })) },
          { heading: "More on this", links: [{ href: `/flip/${ref.slug}`, label: `Is ${b.brand} worth reselling on Vinted?` }, ...NEXT_STEPS] },
        ],
        `/buy/${ref.slug}`,
      )
    }
    case "buy-leaf": {
      const pairs = BUY_BATCH1_PAIRS
      const key = (p: (typeof pairs)[number]) => `${p.brand.slug}/${p.cat.slug}`
      const ring = ringNext(pairs, key, `${ref.brand}/${ref.category}`, 3)
      const b = BUY_BRANDS.find((x) => x.slug === ref.brand)
      return tidy(
        [
          { heading: `${b?.brand ?? ""} guides`.trim(), links: postsForBrand(ref.brand, 3).map((p) => postLink(p, tracked)) },
          { heading: "More buy-below prices", links: ring.map((p) => ({ href: `/buy/${p.brand.slug}/${p.cat.slug}`, label: `What to pay for ${p.brand.brand} ${p.cat.category}` })) },
          { heading: "More on this", links: NEXT_STEPS },
        ],
        `/buy/${ref.brand}/${ref.category}`,
      )
    }
    case "glossary": {
      const ring = ringNext(GLOSSARY_TERMS, (t) => t.slug, ref.slug, 3)
      return tidy(
        [
          { heading: "More terms", links: ring.map((t) => ({ href: `/glossary/${t.slug}`, label: t.h1 })) },
          { heading: "See it in the data", links: [...NEXT_STEPS, { href: "/blog/what-sells-best-on-vinted", label: "What sells best on Vinted right now" }] },
        ],
        `/glossary/${ref.slug}`,
      )
    }
    case "manual": {
      const ring = ringNext(ALL_CHAPTERS, (c) => c.slug, ref.slug, 3)
      return tidy(
        [
          { heading: "Next chapters", links: ring.map((c) => ({ href: `/manual/${c.slug}`, label: `${c.number}. ${c.title}` })) },
          { heading: "Put it to work", links: NEXT_STEPS },
        ],
        `/manual/${ref.slug}`,
      )
    }
    case "tool": {
      const others = INTENTS.filter((i) => i.slug !== ref.slug)
      return tidy(
        [
          { heading: "More free tools", links: others.map((i) => ({ href: `/tools/${i.slug}`, label: clean(i.title, tracked) })) },
          { heading: "See it in the data", links: [{ href: "/data", label: NEXT_STEPS[1].label }, { href: "/flip", label: "What sells best on Vinted: brands ranked" }] },
        ],
        `/tools/${ref.slug}`,
      )
    }
    case "landing": {
      const self = landingPath(ref.landingKind, ref.slug, "en")
      const otherKinds = LANDINGS.filter((l) => l.kind !== ref.landingKind)
      const pick: typeof LANDINGS = []
      for (const kind of ["best", "vs", "for"] as const) {
        if (kind === ref.landingKind) continue
        const list = otherKinds.filter((l) => l.kind === kind)
        const idx = Math.abs([...ref.slug].reduce((h, ch) => h + ch.charCodeAt(0), 0)) % Math.max(list.length, 1)
        if (list[idx]) pick.push(list[idx])
      }
      return tidy(
        [
          { heading: "Related comparisons", links: pick.map((l) => ({ href: landingPath(l.kind, l.slug, "en"), label: l.slug.replace(/-/g, " ") })) },
          { heading: "See it in the data", links: [...NEXT_STEPS, { href: "/flip", label: "What sells best on Vinted: brands ranked" }] },
        ],
        self,
      )
    }
  }
}

/** Flat href list (for tests / graph building). */
export function relatedHrefs(ref: RelatedRef): string[] {
  return relatedGroups(ref).flatMap((g) => g.links.map((l) => l.href))
}

/**
 * Prominent "next step" links for the posts AI assistants send humans to:
 * free check (/tools), open data (/data) and the most relevant /flip pages.
 * Empty for every other post (they get the normal Related block only).
 */
export function topLandingNextSteps(slug: string): RelatedLink[] {
  if (!TOP_AI_LANDING_SLUGS.includes(slug)) return []
  const out: RelatedLink[] = [
    { href: "/tools", label: "Check any item free — BUY / WATCH / SKIP + buy-below price" },
    { href: "/data", label: "Live weekly Vinted brand volumes (open data)" },
  ]
  const brand = postBrand(slug)
  const b = brand ? brandOf(brand) : undefined
  if (b && !isRedirectedPath(`/flip/${b.slug}`)) {
    out.push({ href: `/flip/${b.slug}`, label: `${b.brand} on Vinted: weekly departures and buy-below` })
    const top = [...(b.categories || [])].sort((x, y) => y.sold_7d - x.sold_7d)[0]
    if (top) out.push({ href: `/flip/${b.slug}/${catSlug(top.category)}`, label: `Are ${b.brand} ${top.category.toLowerCase()} worth reselling?` })
    if (hasBuyBrand(b.slug)) out.push({ href: `/buy/${b.slug}`, label: `What to pay for ${b.brand}` })
  } else {
    out.push({ href: "/flip", label: "Every tracked brand ranked by weekly sales" })
    for (const t of TOP_BRANDS.slice(0, 2)) out.push({ href: `/flip/${t.slug}`, label: `${t.brand}: what sells and what to pay` })
  }
  return out
}
