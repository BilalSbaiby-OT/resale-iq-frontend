import type { MetadataRoute } from "next"

const BASE = "https://resaleiq.dev"

// Allow crawling of public/marketing pages; keep the logged-in app and admin
// out of the index (they require auth anyway, but this stops crawlers wasting
// budget and prevents stray indexing of gated routes).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/flip/", "/terms", "/privacy", "/legal"],
      disallow: ["/dashboard", "/admin", "/account", "/deals", "/watchlist", "/portfolio", "/order-planner", "/verdict", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  }
}
