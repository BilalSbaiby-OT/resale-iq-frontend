import type { MetadataRoute } from "next"

const BASE = "https://resaleiq.dev"

// Public marketing + blog pages are open to all crawlers, including AI/answer
// engines (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) — we WANT
// to be cited by ChatGPT/Perplexity/Google AI, so they're explicitly allowed.
// The logged-in app and admin stay out of every index.
//
// EVERY public section must be listed. "/" already permits them all, but this
// list is the explicit contract: if the wildcard is ever tightened, anything
// missing silently drops out of every index. /manual (17 pages) and /category
// (9) were added later and had been missed.
const PUBLIC_ALLOW = [
  "/", "/tools", "/data", "/blog", "/flip", "/manual", "/category", "/methodology",
  "/api-docs", "/terms", "/privacy", "/legal", "/support",
]
const PRIVATE_DISALLOW = [
  "/dashboard", "/admin", "/account", "/deals", "/watchlist",
  "/portfolio", "/order-planner", "/verdict", "/authenticity",
  "/trends", "/brands", "/calculator", "/api/",
]

// Answer-engine + AI crawlers we explicitly welcome on public content.
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",       // OpenAI / ChatGPT
  "ClaudeBot", "anthropic-ai", "Claude-Web",        // Anthropic / Claude
  "PerplexityBot", "Perplexity-User",               // Perplexity
  "Google-Extended",                                 // Google AI (Gemini, AI Overviews)
  "Applebot-Extended",                               // Apple Intelligence
  "CCBot",                                           // Common Crawl (feeds many models)
  "Bingbot",                                         // Bing / Copilot
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW },
      ...AI_BOTS.map((ua) => ({ userAgent: ua, allow: PUBLIC_ALLOW, disallow: PRIVATE_DISALLOW })),
    ],
    // Both are advertised: sitemap.xml for crawlers, llms.txt for answer
    // engines that prefer a described index over a flat URL list.
    sitemap: [`${BASE}/sitemap.xml`, `${BASE}/llms.txt`],
    host: BASE,
  }
}
