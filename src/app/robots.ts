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
  "/", "/tools", "/data", "/blog", "/flip", "/manual", "/glossary", "/category", "/methodology",
  "/api-docs", "/terms", "/privacy", "/legal", "/support", "/llms.txt",
]
const PRIVATE_DISALLOW = [
  "/dashboard", "/admin", "/account", "/deals", "/watchlist",
  "/portfolio", "/order-planner", "/verdict", "/authenticity",
  "/trends", "/brands", "/calculator", "/market", "/search",
  "/compare", "/billing", "/login", "/register", "/check", "/api/",
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
    // ONLY the real XML sitemap is declared here. llms.txt was previously listed
    // as a second Sitemap, but it is not a sitemap — it's a described index for
    // answer engines. Google fetches every Sitemap: URL and tries to parse it as
    // XML; llms.txt is plain markdown, so that produced a permanent
    // "could not be parsed" error in Search Console and a wasted crawl on every
    // pass. llms.txt is still served at /llms.txt and remains discoverable at its
    // conventional path — it simply must not masquerade as a sitemap.
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
