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
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/blog", "/tools", "/data", "/manual", "/register", "/login", "/terms", "/privacy", "/legal", "/support", "/api-docs"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.6,
  }))

  const brandPages = BRANDS.map((b) => ({
    url: `${BASE}/flip/${b.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const brandCategoryPages = BRANDS.flatMap((b) =>
    (b.categories || []).map((c) => ({
      url: `${BASE}/flip/${b.slug}/${catSlug(c.category)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  )

  const categoryPages = CATEGORIES.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const manualPages = ALL_CHAPTERS.map((c) => ({
    url: `${BASE}/manual/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const blogPages = POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const toolPages = INTENTS.map((i) => ({
    url: `${BASE}/tools/${i.slug}`,
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
