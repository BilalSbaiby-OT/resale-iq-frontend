import type { MetadataRoute } from "next"
import seo from "@/data/seo-brands.json"
import { ALL_POSTS as POSTS } from "@/data/blog-posts"
import { INTENTS } from "@/data/search-intents"

const BASE = "https://resaleiq.dev"

// Static-generated sitemap covering public pages + every programmatic SEO brand
// page + every blog article. Regenerates on each build.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/blog", "/tools", "/data", "/register", "/login", "/terms", "/privacy", "/legal", "/support"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.6,
  }))

  const brandPages = (seo.brands as { slug: string }[]).map((b) => ({
    url: `${BASE}/flip/${b.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
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

  // brand x category pages (one per brand's top categories)
  const catSlug = (c: string) =>
    c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const brandCategoryPages = (seo.brands as { slug: string; top_categories: string[] }[])
    .flatMap((b) => (b.top_categories || []).map((c) => ({
      url: `${BASE}/flip/${b.slug}/${catSlug(c)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })))

  return [...staticPages, ...toolPages, ...blogPages, ...brandPages, ...brandCategoryPages]
}
