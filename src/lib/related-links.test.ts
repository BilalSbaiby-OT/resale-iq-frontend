/**
 * Internal-link distribution guard (crawl 2026-09-30: 92 blog posts had <=1
 * inbound internal link, 148 indexable pages <3 content links, 38 internal
 * links pointed at 404/3xx URLs).
 *
 * Runs on the GENERATOR data (blog-posts, seo-brands, seo-models, buy-data,
 * glossary, manual, intents, landings) — no network. Builds the inbound-link
 * graph exactly as the pages emit it: the RelatedLinks block for every family
 * plus the hub pages' child lists, then asserts:
 *   1. every family in the sitemap renders the Related block (source check),
 *   2. every related href is a URL that really renders (in the route set: no
 *      404, no redirected slug),
 *   3. every indexable page sampled from each family has >= MIN_INBOUND inbound
 *      links from Related blocks alone (hubs excluded — that is the point),
 *   4. inbound links are DISTRIBUTED: no page absorbs more than a small share
 *      (the fixed-slice regression gave 4 posts ~165 links each).
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { register } from "node:module"
import { test } from "node:test"
import assert from "node:assert/strict"

register("./test-support/alias-loader.mjs", import.meta.url)

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (rel: string) => readFileSync(join(root, rel), "utf8")

const rl = await import("./related-links.ts")
const { ALL_POSTS } = await import("../data/blog-posts.ts")
const { BRANDS, CATEGORIES, LINKABLE_BRANDS, catSlug } = await import("./seo-categories.ts")
const { SEO_MODELS, modelPath } = await import("./seo-models.ts")
const { GLOSSARY_TERMS } = await import("./glossary-terms.ts")
const { ALL_CHAPTERS } = await import("../data/manual.ts")
const { INTENTS } = await import("../data/search-intents.ts")
const { LANDINGS, landingPath } = await import("./seo-landings.ts")
const { BUY_BATCH1_PAIRS } = await import("./buy-data.ts")
const { isRedirectedPath } = await import("./sitemap-redirects.ts")

// ---- the route set the sitemap advertises (English, indexable) --------------
const blog = ALL_POSTS.filter((p: { slug: string; noindex?: boolean }) => !p.noindex && !isRedirectedPath(`/blog/${p.slug}`))
const buyBrands = [...new Set(BUY_BATCH1_PAIRS.map((p: { brand: { slug: string } }) => p.brand.slug))] as string[]

type Ref = Parameters<typeof rl.relatedHrefs>[0]
const pages: Array<{ family: string; path: string; ref: Ref }> = [
  ...blog.map((p: { slug: string }) => ({ family: "blog", path: `/blog/${p.slug}`, ref: { kind: "blog", slug: p.slug } as Ref })),
  ...LINKABLE_BRANDS.map((b: { slug: string }) => ({ family: "flip-brand", path: `/flip/${b.slug}`, ref: { kind: "flip-brand", slug: b.slug } as Ref })),
  ...BRANDS.filter((b: { slug: string }) => !isRedirectedPath(`/flip/${b.slug}`)).flatMap((b: { slug: string; categories?: { category: string }[] }) =>
    (b.categories || []).map((c) => ({
      family: "flip-cat",
      path: `/flip/${b.slug}/${catSlug(c.category)}`,
      ref: { kind: "flip-cat", brand: b.slug, category: catSlug(c.category) } as Ref,
    })),
  ),
  ...SEO_MODELS.map((m: { brandSlug: string; slug: string }) => ({ family: "flip-model", path: modelPath(m as never), ref: { kind: "flip-model", brand: m.brandSlug, slug: m.slug } as Ref })),
  ...CATEGORIES.map((c: { slug: string }) => ({ family: "category", path: `/category/${c.slug}`, ref: { kind: "category", slug: c.slug } as Ref })),
  ...buyBrands.map((s) => ({ family: "buy-brand", path: `/buy/${s}`, ref: { kind: "buy-brand", slug: s } as Ref })),
  ...BUY_BATCH1_PAIRS.map((p: { brand: { slug: string }; cat: { slug: string } }) => ({
    family: "buy-leaf",
    path: `/buy/${p.brand.slug}/${p.cat.slug}`,
    ref: { kind: "buy-leaf", brand: p.brand.slug, category: p.cat.slug } as Ref,
  })),
  ...GLOSSARY_TERMS.map((t: { slug: string }) => ({ family: "glossary", path: `/glossary/${t.slug}`, ref: { kind: "glossary", slug: t.slug } as Ref })),
  ...ALL_CHAPTERS.map((c: { slug: string }) => ({ family: "manual", path: `/manual/${c.slug}`, ref: { kind: "manual", slug: c.slug } as Ref })),
  ...INTENTS.map((i: { slug: string }) => ({ family: "tools", path: `/tools/${i.slug}`, ref: { kind: "tool", slug: i.slug } as Ref })),
  ...LANDINGS.map((l: { kind: "best" | "vs" | "for"; slug: string }) => ({
    family: `landing-${l.kind}`,
    path: landingPath(l.kind, l.slug, "en"),
    ref: { kind: "landing", landingKind: l.kind, slug: l.slug } as Ref,
  })),
]
const ROUTES = new Set<string>([
  "/", "/tools", "/data", "/flip", "/category", "/blog", "/manual", "/glossary", "/buy", "/pricing",
  "/methodology", "/best", "/vs", "/for", "/partners", "/support", "/api-docs",
  ...pages.map((p) => p.path),
])

// ---- inbound graph from Related blocks (+ landing sibling lists) ------------
const inbound = new Map<string, Set<string>>()
const add = (from: string, to: string) => {
  if (from === to) return
  if (!inbound.has(to)) inbound.set(to, new Set())
  inbound.get(to)!.add(from)
}
for (const p of pages) for (const h of rl.relatedHrefs(p.ref)) add(p.path, h.split("?")[0])
// landing-page.tsx lists every sibling of the same kind on each landing page.
for (const l of LANDINGS) for (const s of LANDINGS.filter((x: { kind: string; slug: string }) => x.kind === l.kind && x.slug !== l.slug)) add(landingPath(l.kind, l.slug, "en"), landingPath(s.kind, s.slug, "en"))
// Structural child lists the hub pages render (flip hub -> every brand + brand x category leaf,
// brand page -> its category leaves, category page -> every brand in it, glossary/manual/blog hubs
// -> all children, /buy hub -> batch pages, /tools hub -> intents).
for (const b of LINKABLE_BRANDS) {
  add("/flip", `/flip/${b.slug}`)
  for (const c of b.categories || []) {
    add("/flip", `/flip/${b.slug}/${catSlug(c.category)}`)
    add(`/flip/${b.slug}`, `/flip/${b.slug}/${catSlug(c.category)}`)
  }
}
for (const c of CATEGORIES) for (const e of c.entries) if (!isRedirectedPath(`/flip/${e.slug}`)) add(`/category/${c.slug}`, `/flip/${e.slug}/${c.slug}`)
for (const m of SEO_MODELS) add(`/flip/${m.brandSlug}`, modelPath(m as never))
for (const p of blog) add("/blog", `/blog/${p.slug}`)
for (const t of GLOSSARY_TERMS) add("/glossary", `/glossary/${t.slug}`)
for (const c of ALL_CHAPTERS) add("/manual", `/manual/${c.slug}`)
for (const i of INTENTS) add("/tools", `/tools/${i.slug}`)
for (const p of BUY_BATCH1_PAIRS) { add("/buy", `/buy/${p.brand.slug}/${p.cat.slug}`); add(`/buy/${p.brand.slug}`, `/buy/${p.brand.slug}/${p.cat.slug}`) }
for (const s of buyBrands) add("/buy", `/buy/${s}`)
// /tools/[slug] keeps its own "more tools" nav as well (not counted above: Related already covers it).

test("every sitemap URL family renders the Related block (source check)", () => {
  const wired: Array<[string, string, RegExp]> = [
    ["app/blog/[slug]/page.tsx", "blog", /kind:\s*"blog"/],
    ["app/flip/[brand]/page.tsx", "flip-brand", /kind:\s*"flip-brand"/],
    ["app/flip/[brand]/[category]/page.tsx", "flip-cat", /kind:\s*"flip-cat"/],
    ["app/flip/[brand]/model/[slug]/page.tsx", "flip-model", /kind:\s*"flip-model"/],
    ["app/category/[category]/page.tsx", "category", /kind:\s*"category"/],
    ["app/buy/[brand]/page.tsx", "buy-brand", /kind:\s*"buy-brand"/],
    ["app/buy/[brand]/[category]/page.tsx", "buy-leaf", /kind:\s*"buy-leaf"/],
    ["app/glossary/[term]/page.tsx", "glossary", /kind:\s*"glossary"/],
    ["app/manual/[chapter]/page.tsx", "manual", /kind:\s*"manual"/],
    ["app/tools/[slug]/page.tsx", "tool", /kind:\s*"tool"/],
    ["components/seo/landing-page.tsx", "landing", /kind:\s*"landing"/],
  ]
  for (const [file, kind, re] of wired) {
    const src = read(file)
    assert.match(src, /<RelatedLinks\b/, `${file} does not render <RelatedLinks>`)
    assert.match(src, re, `${file} renders RelatedLinks with the wrong kind (want ${kind})`)
  }
  // every family produces a non-empty block for every one of its pages
  for (const p of pages) assert.ok(rl.relatedHrefs(p.ref).length > 0, `${p.path}: empty Related block`)
})

test("no Related link points at a 404 or a redirected URL", () => {
  const bad: string[] = []
  for (const p of pages) for (const h of rl.relatedHrefs(p.ref)) {
    const path = h.split("?")[0]
    if (!ROUTES.has(path) || isRedirectedPath(path)) bad.push(`${p.path} -> ${h}`)
  }
  assert.deepEqual(bad.slice(0, 10), [], `${bad.length} dead/redirecting related links`)
})

test("every indexable page in every family has >= MIN_INBOUND inbound Related links", () => {
  const short: string[] = []
  for (const p of pages) {
    const n = inbound.get(p.path)?.size ?? 0
    if (n < rl.MIN_INBOUND) short.push(`${p.family} ${p.path} (${n})`)
  }
  assert.deepEqual(short.slice(0, 15), [], `${short.length} pages below ${rl.MIN_INBOUND} inbound links`)
})

test("blog->blog inbound links are distributed, not a fixed slice", () => {
  const blogSources = new Map<string, number>()
  for (const p of blog) for (const h of rl.relatedHrefs({ kind: "blog", slug: p.slug })) {
    if (h.startsWith("/blog/")) blogSources.set(h, (blogSources.get(h) ?? 0) + 1)
  }
  const counts = blog.map((p: { slug: string }) => blogSources.get(`/blog/${p.slug}`) ?? 0).sort((a: number, b: number) => b - a)
  const total = counts.reduce((s: number, n: number) => s + n, 0)
  // Old behaviour: top 4 posts took ~165 blog links each, ~130 posts <3. Ring: every post gets exactly RING_NEXT+1.
  assert.ok(counts[0] <= rl.RING_NEXT + 1, `most-linked post has ${counts[0]} inbound blog links (fixed-slice regression?)`)
  assert.ok(counts[counts.length - 1] >= rl.RING_NEXT, `least-linked post has only ${counts[counts.length - 1]} inbound blog links`)
  assert.ok(counts[0] / total < 0.02, "one post absorbs >2% of all blog->blog links")
})

test("noindex / redirected posts are never link targets", () => {
  const noindex = new Set(ALL_POSTS.filter((p: { noindex?: boolean }) => p.noindex).map((p: { slug: string }) => `/blog/${p.slug}`))
  for (const p of pages) for (const h of rl.relatedHrefs(p.ref)) assert.ok(!noindex.has(h), `${p.path} links noindex ${h}`)
})

test("the four AI-landing posts carry prominent /tools + /data + a /flip link", () => {
  for (const slug of rl.TOP_AI_LANDING_SLUGS) {
    const hrefs = rl.topLandingNextSteps(slug).map((l: { href: string }) => l.href)
    assert.ok(hrefs.includes("/tools"), `${slug}: no /tools`)
    assert.ok(hrefs.includes("/data"), `${slug}: no /data`)
    assert.ok(hrefs.some((h: string) => h === "/flip" || h.startsWith("/flip/")), `${slug}: no /flip link`)
    for (const h of hrefs) assert.ok(ROUTES.has(h), `${slug}: next step ${h} is not a live route`)
  }
  assert.match(read("app/blog/[slug]/page.tsx"), /topLandingNextSteps\(p\.slug\)/)
})

test("redirected brands are not linkable and hubs skip them", () => {
  for (const s of ["bershka", "mango"]) {
    assert.ok(!LINKABLE_BRANDS.some((b: { slug: string }) => b.slug === s), `${s} is 308'd but still LINKABLE`)
  }
  assert.match(read("app/flip/page.tsx"), /isRedirectedPath\(`\/flip\/\$\{r\.slug\}`\)/)
  assert.match(read("app/data/page.tsx"), /isRedirectedPath\(`\/flip\/\$\{slug\}`\)/)
})
