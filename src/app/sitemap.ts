import type { MetadataRoute } from "next"
import { ALL_POSTS as POSTS } from "@/data/blog-posts"
import { INTENTS } from "@/data/search-intents"
import { ALL_CHAPTERS } from "@/data/manual"
import { BRANDS, CATEGORIES, catSlug } from "@/lib/seo-categories"

const BASE = "https://resaleiq.dev"

// Static-generated sitemap covering public pages + every programmatic SEO page
// + every blog article + every manual chapter. Regenerates on each build.
//
// The brand/category route space is derived from @/lib/seo-categories, the same
// module the pages themselves use, so a sitemap entry can never point at a route
// that generateStaticParams did not produce.
//
// lastModified is now set on EVERY entry. Without it, Google has no freshness
// signal and recrawls slowly and blindly — which is the wrong outcome for a site
// whose whole value proposition is that the numbers are current. The
// data-driven pages (flip, category, data, tools) genuinely change whenever the
// hourly snapshot changes, so they carry the snapshot's own updated_at; blog and
// manual carry their content date; static pages carry the build date. Accurate
// lastmod is what earns a fast, targeted recrawl instead of a slow guess.
export const revalidate = 3600

async function snapshotUpdatedAt(): Promise<Date> {
  // The data pages are only as fresh as the snapshot behind them, so that
  // timestamp — not the build time — is their honest lastmod. Fall back to build
  // time if the backend is unreachable; never invent a future date.
  const base = process.env.BACKEND_URL || "http://localhost:8080"
  try {
    const r = await fetch(`${base}/api/public/market-snapshot`, { next: { revalidate: 3600 } })
    if (r.ok) {
      const d = new Date((await r.json())?.updated_at)
      if (!Number.isNaN(d.getTime())) return d
    }
  } catch {
    /* fall through to build time */
  }
  return new Date()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dataFresh = await snapshotUpdatedAt()
  const buildTime = new Date()

  // /register and /login are deliberately NOT here. Both are client-rendered
  // auth utilities that prerender to an empty shell (~52 chars of text, no h1),
  // so listing them tells search engines a blank page is worth indexing. They
  // remain crawlable — they are simply not advertised as content.
  // /flip and /category are the hubs for the 156 + 9 programmatic URLs. Both
  // returned 404 until 2026-08-29, which left 73% of the site orphaned — Search
  // Console measured 0 impressions across all nine category pages over
  // 2026-07-30..08-26. They carry the snapshot's lastmod and a high priority
  // because they are entry points to the data-driven estate, not static copy.
  const dataDrivenHubs = new Set(["", "/data", "/flip", "/category"])
  const staticPages = ["", "/blog", "/tools", "/data", "/flip", "/category", "/manual", "/methodology", "/terms", "/privacy", "/legal", "/support", "/api-docs"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: dataDrivenHubs.has(p) ? dataFresh : buildTime,
    changeFrequency: p === "/flip" || p === "/category" ? ("daily" as const) : ("monthly" as const),
    priority: p === "" ? 1 : p === "/flip" || p === "/category" ? 0.9 : 0.6,
  }))

  const brandPages = BRANDS.map((b) => ({
    url: `${BASE}/flip/${b.slug}`,
    lastModified: dataFresh,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  const brandCategoryPages = BRANDS.flatMap((b) =>
    (b.categories || []).map((c) => ({
      url: `${BASE}/flip/${b.slug}/${catSlug(c.category)}`,
      lastModified: dataFresh,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }))
  )

  const categoryPages = CATEGORIES.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: dataFresh,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  const manualPages = ALL_CHAPTERS.map((c) => ({
    url: `${BASE}/manual/${c.slug}`,
    lastModified: buildTime,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const blogPages = POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const toolPages = INTENTS.map((i) => ({
    url: `${BASE}/tools/${i.slug}`,
    lastModified: dataFresh,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }))

  return [
    ...staticPages,
    ...toolPages,
    ...manualPages,
    ...blogPages,
    ...brandPages,
    ...categoryPages,
    ...brandCategoryPages,
  ]
}
