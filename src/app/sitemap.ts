import type { MetadataRoute } from "next"
import seo from "@/data/seo-brands.json"

const BASE = "https://resaleiq.dev"

// Static-generated sitemap covering the public pages + every programmatic SEO
// brand page. Regenerates on each build (which reruns the seo export).
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/register", "/login", "/terms", "/privacy", "/legal", "/support"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.6,
  }))

  const brandPages = (seo.brands as { slug: string }[]).map((b) => ({
    url: `${BASE}/flip/${b.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...brandPages]
}
