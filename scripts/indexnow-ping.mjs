/**
 * IndexNow ping — submit changed URLs to Bing/ChatGPT search index after deploy.
 *
 * IndexNow is the instant-indexing protocol used by Bing (which powers ChatGPT
 * search), Yandex, and other supporting engines. Google uses its own pipeline
 * (Search Console / inbound links), but Bing/ChatGPT is ResaleIQ's #1 external
 * referrer. Pinging after every deploy tells Bing to re-crawl pages that changed
 * before the natural crawl cycle discovers them.
 *
 * The key file is public by design — IndexNow requires it to be publicly served
 * at /<key>.txt so the engine can verify we own the host. It is not a secret.
 *
 * Run: node scripts/indexnow-ping.mjs
 * Exits 0 on HTTP 200/202 (accepted), 1 on any other status.
 */

const HOST = "resaleiq.dev"
const KEY = "e230108ca3e5998572e4dd43193c58c6"
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

// Core pages that change most often or are most important to keep indexed.
// The sitemap URL is accepted instead of an explicit list, but an explicit list
// targets only pages that actually changed — less noise for the engine.
const URLS_TO_PING = [
  `https://${HOST}/`,
  `https://${HOST}/blog`,
  `https://${HOST}/flip`,
  `https://${HOST}/buy`,
  `https://${HOST}/pricing`,
  `https://${HOST}/data`,
  `https://${HOST}/tools`,
  `https://${HOST}/category`,
  `https://${HOST}/methodology`,
  `https://${HOST}/manual`,
  `https://${HOST}/sitemap.xml`,
]

async function ping() {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: URLS_TO_PING,
  })

  console.log(`[indexnow] POSTing ${URLS_TO_PING.length} URLs to ${INDEXNOW_ENDPOINT}`)

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  })

  const text = await res.text().catch(() => "")
  console.log(`[indexnow] HTTP ${res.status} ${res.statusText} — ${text.slice(0, 200)}`)

  if (res.status === 200 || res.status === 202) {
    console.log("[indexnow] Accepted ✓")
    process.exit(0)
  } else {
    console.error(`[indexnow] Unexpected status ${res.status} — ping failed`)
    process.exit(1)
  }
}

ping().catch((err) => {
  console.error("[indexnow] Fatal:", err)
  process.exit(1)
})
