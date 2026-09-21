import type { MetadataRoute } from "next"
import { ALL_POSTS as POSTS } from "@/data/blog-posts"
import { INTENTS } from "@/data/search-intents"
import { ALL_CHAPTERS } from "@/data/manual"
import { BRANDS, CATEGORIES, catSlug } from "@/lib/seo-categories"
import { SEO_MODELS, modelPath } from "@/lib/seo-models"
import { GLOSSARY_TERMS } from "@/lib/glossary-terms"
import { PATH_LOCALES, hreflangLanguages } from "@/lib/locale-routes"

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
/** /manual hub copy last changed (FAQPage + answer-first title). Do not reuse for /terms. */
const MANUAL_HUB_DATE = new Date("2026-09-13T00:00:00.000Z")
/** /glossary hub + terms. Bump when a definition changes. */
const GLOSSARY_DATE = new Date("2026-09-21T00:00:00.000Z")

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
  // Absolute-URL version of hreflangLanguages() — Next's own docs example for
  // sitemap alternates uses full URLs ('https://nextjs.org/en-US'), not paths.
  const absolute = (suffix: string) => {
    const out: Record<string, string> = {}
    for (const [code, path] of Object.entries(hreflangLanguages(suffix))) out[code] = `${BASE}${path}`
    return out
  }
  const homeAlternates = absolute("")
  // Same construction for /methodology, now that it has real locale routes
  // too (src/app/[locale]/methodology/page.tsx, src/lib/methodology-copy.ts),
  // and for /pricing (src/app/[locale]/pricing/page.tsx). Keyed by path so a
  // sixth translated page is one entry, not a longer ternary chain.
  const methodologyAlternates = absolute("/methodology")
  const pricingAlternates = absolute("/pricing")
  const LOCALIZED: Record<string, Record<string, string>> = {
    "": homeAlternates,
    "/methodology": methodologyAlternates,
    "/pricing": pricingAlternates,
  }
  const staticPages = ["", "/pricing", "/blog", "/tools", "/data", "/flip", "/category", "/manual", "/glossary", "/methodology", "/terms", "/privacy", "/legal", "/support", "/api-docs"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: p === "/manual" ? MANUAL_HUB_DATE : p === "/glossary" ? GLOSSARY_DATE : dataDrivenHubs.has(p) ? dataFresh : STATIC_CONTENT_DATE,
    changeFrequency: p === "/flip" || p === "/category" ? ("daily" as const) : ("monthly" as const),
    // /pricing above the 0.6 static-copy shelf: it is the last page before
    // checkout, and the one an ad or a "resaleiq pricing" search lands on.
    priority: p === "" ? 1 : p === "/flip" || p === "/category" ? 0.9 : p === "/pricing" ? 0.8 : 0.6,
    // "/", "/methodology" and "/pricing" have translated siblings today — see
    // locale-routes.ts for why the other pages are not in this set yet.
    ...(LOCALIZED[p] ? { alternates: { languages: LOCALIZED[p] } } : {}),
  }))

  // The five translated homepages. Reciprocal by construction: every entry
  // here and the "/" entry above point at the exact same homeAlternates map,
  // so Google never sees a one-way hreflang (the failure mode a partial
  // rollout would otherwise reproduce).
  const localePages = PATH_LOCALES.map((locale) => ({
    url: `${BASE}/${locale}`,
    lastModified: dataFresh,
    changeFrequency: "monthly" as const,
    priority: 0.9,
    alternates: { languages: homeAlternates },
  }))

  // The five translated methodology pages, same reciprocal-hreflang
  // construction as localePages above, and the same STATIC_CONTENT_DATE
  // class as the English "/methodology" entry (it is not in dataDrivenHubs
  // either — the page shows live figures inline but its copy only changes
  // when someone edits it).
  const methodologyLocalePages = PATH_LOCALES.map((locale) => ({
    url: `${BASE}/${locale}/methodology`,
    lastModified: STATIC_CONTENT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: { languages: methodologyAlternates },
  }))

  // The five translated pricing pages, same reciprocal construction. Same
  // priority as the English "/pricing" entry — a Spanish visitor's route to
  // checkout is not worth less than an English one.
  const pricingLocalePages = PATH_LOCALES.map((locale) => ({
    url: `${BASE}/${locale}/pricing`,
    lastModified: STATIC_CONTENT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: { languages: pricingAlternates },
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
    // Prefer a chapter's content-refresh date over the static build date, same
    // reason as blogPages below: a chapter whose dated data callout was
    // rewritten genuinely changed, and advertising the old static date told
    // crawlers it hadn't (the EXP-20 stale-lastmod trap).
    lastModified: c.updated ? toDay(new Date(c.updated)) : STATIC_CONTENT_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const glossaryPages = GLOSSARY_TERMS.map((t) => ({
    url: `${BASE}/glossary/${t.slug}`,
    lastModified: GLOSSARY_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const modelPages = SEO_MODELS.map((m) => ({
    url: `${BASE}${modelPath(m)}`,
    lastModified: dataFresh,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }))

  const blogPages = POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    // Prefer the content-refresh date over the publish date: a post whose dated
    // data block was rewritten genuinely changed, and advertising the old
    // publish date told crawlers it hadn't — recrawling it "slowly and blindly"
    // (see header note) exactly when re-crawl cadence is the binding constraint.
    lastModified: toDay(new Date(p.updated ?? p.date)),
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
    ...localePages,
    ...methodologyLocalePages,
    ...pricingLocalePages,
    ...toolPages,
    ...manualPages,
    ...glossaryPages,
    ...blogPages,
    ...brandPages,
    ...categoryPages,
    ...brandCategoryPages,
    ...modelPages,
  ]
}
