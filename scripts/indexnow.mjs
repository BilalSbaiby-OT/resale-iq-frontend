#!/usr/bin/env node
/**
 * Ping IndexNow with every public URL, so Bing / Yandex / Seznam (and, through
 * Bing, ChatGPT Search and Copilot) discover new and changed pages in hours
 * instead of waiting weeks for an organic crawl.
 *
 * WHY THIS EXISTS
 * A brand-new domain with no backlinks is crawled slowly and reluctantly — the
 * single biggest reason 227 live pages were pulling ~21 humans/month. Google
 * retired its sitemap-ping endpoint in 2023, but IndexNow is alive and is the
 * one lever that still forces near-instant discovery on a no-authority site.
 * Google isn't an IndexNow participant, but it reads the same lastmod signals
 * from the sitemap this repo now stamps accurately — so the two work together.
 *
 * USAGE (run after each production deploy, once the new build is live):
 *   node scripts/indexnow.mjs
 *
 * It reads the live sitemap.xml so it always submits exactly what's published —
 * no hand-maintained URL list to drift out of sync.
 */

const HOST = "resaleiq.dev"
const KEY = "22f0573f607c3b8821d74e6ee0b22785"
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const SITEMAP = `https://${HOST}/sitemap.xml`
const ENDPOINT = "https://api.indexnow.org/indexnow"

async function readSitemapUrls() {
  const res = await fetch(SITEMAP, { headers: { "user-agent": "resaleiq-indexnow" } })
  if (!res.ok) throw new Error(`sitemap fetch failed: HTTP ${res.status}`)
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  // Only submit URLs on our own host — IndexNow rejects a batch outright if any
  // URL is off-domain, so one stray entry would silently drop the whole submit.
  return [...new Set(urls.filter((u) => u.startsWith(`https://${HOST}/`)))]
}

async function main() {
  const urlList = await readSitemapUrls()
  if (urlList.length === 0) {
    console.error("✗ no URLs found in sitemap — refusing to submit an empty set")
    process.exit(1)
  }

  // IndexNow accepts up to 10,000 URLs per request; we are far under that, but
  // chunk anyway so this keeps working as the page count grows.
  const CHUNK = 5000
  for (let i = 0; i < urlList.length; i += CHUNK) {
    const urlListChunk = urlList.slice(i, i + CHUNK)
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urlListChunk }),
    })
    // 200 = accepted, 202 = accepted (queued). Anything else is a real failure.
    if (res.status !== 200 && res.status !== 202) {
      const body = await res.text().catch(() => "")
      console.error(`✗ IndexNow rejected the batch: HTTP ${res.status} ${body}`)
      process.exit(1)
    }
    console.log(`✓ submitted ${urlListChunk.length} URLs to IndexNow (HTTP ${res.status})`)
  }
  console.log(`✓ done — ${urlList.length} URLs pinged. Bing/Yandex will recrawl shortly.`)
}

main().catch((e) => {
  console.error(`✗ ${e.message}`)
  process.exit(1)
})
