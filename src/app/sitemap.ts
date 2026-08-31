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
// hourly snapshot changes, so they carry the snapshot's own DAY; blog and manual
// carry their content date; static pages carry a fixed content date.
//
// Granularity is deliberate, and was a defect until 2026-08-31. Data pages used
// the snapshot's full TIMESTAMP, which moves hourly, and static pages used build
// time, which moves on every deploy — and deploys became automatic on 2026-08-29.
// Measured across 25 minutes that day: /flip advertised lastmod 17:56:13Z, then
// 174 URLs advertised 23:55:38Z, then 25 advertised 00:51:24Z. We were telling
// Google that three quarters of the site changed several times a day while the
// rendered numbers barely moved.
//
// That is worse than no lastmod at all. A crawler told a page changed, which
// fetches it and finds it materially identical, learns the signal is noise and
// discounts it — and at the time of the fix 148 of 228 URLs sat in Search
// Console as "Discovered - currently not indexed", i.e. never fetched. Day
// granularity is the honest claim: these numbers do change daily, they do not
// change at 17:56 and again at 23:55.
export const revalidate = 3600

/** Midnight UTC of the given date — strips the time so lastmod cannot churn. */
function toDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

/**
 * The DAY the data behind the data-driven pages last changed.
 *
 * Truncated to midnight UTC on purpose: the snapshot refreshes hourly, but the
 * figures a reader sees move on a daily rhythm at most. Advertising the hourly
 * timestamp made every crawl see a fresh lastmod on 174 URLs and taught Google
 * to ignore ours. Falling back to today's DATE (not `new Date()`) keeps that
 * property even when the backend is unreachable.
 */
async function snapshotUpdatedAt(): Promise<Date> {
  const base = process.env.BACKEND_URL || "http://localhost:8080"
  try {
    const r = await fetch(`${base}/api/public/market-snapshot`, { next: { revalidate: 3600 } })
    if (r.ok) {
      const d = new Date((await r.json())?.updated_at)
      if (!Number.isNaN(d.getTime())) return toDay(d)
    }
  } catch {
    /* fall through to today */
  }
  return toDay(new Date())
}

/**
 * Fixed content date for pages that only change when someone edits them.
 *
 * Build time is wrong for these: /terms does not change because the frontend
 * redeployed. Bump this by hand when the copy actually changes — a constant that
 * requires a human edit is exactly the point.
 */
const STATIC_CONTENT_DATE = new Date("2026-08-29T00:00:00.000Z")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dataFresh = await snapshotUpdatedAt()

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
    lastModified: dataDrivenHubs.has(p) ? dataFresh : STATIC_CONTENT_DATE,
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

  // ManualChapter has no date field, so there is nothing per-chapter to use.
  // STATIC_CONTENT_DATE rather than build time: a chapter does not change
  // because the frontend redeployed, and claiming otherwise is the same false
  // signal this file was fixed to remove.
  const manualPages = ALL_CHAPTERS.map((c) => ({
    url: `${BASE}/manual/${c.slug}`,
    lastModified: STATIC_CONTENT_DATE,
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
