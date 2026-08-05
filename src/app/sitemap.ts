import type { MetadataRoute } from "next"
import seo from "@/data/seo-brands.json"
import { POSTS } from "@/data/blog-posts"
import { INTENTS } from "@/data/search-intents"

const BASE = "https://resaleiq.dev"

// Static-generated sitemap covering public pages + every programmatic SEO brand
// page + every blog article. Regenerates on each build.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/blog", "/tools", "/register", "/login", "/terms", "/privacy", "/legal", "/support"].map((p) => ({
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

  return [...staticPages, ...toolPages, ...blogPages, ...brandPages]
}
