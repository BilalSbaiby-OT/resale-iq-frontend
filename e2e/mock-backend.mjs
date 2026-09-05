#!/usr/bin/env node
/**
 * Snapshot + auth/watchlist mock so Playwright can run without demand-intel.
 * Smoke tests only need public GETs. Customer-workflow tests use in-memory users.
 */
import http from "node:http"

const PORT = Number(process.env.MOCK_BACKEND_PORT || 8099)
const NOW = new Date().toISOString()

const SNAPSHOT = {
  source: "Resale IQ",
  url: "https://resaleiq.dev",
  markets: ["ES", "FR", "DE", "IT", "PT"],
  listings_tracked: 966236,
  updated_at: NOW,
  brand_count: 2,
  brands_tracked: 26,
  publish_floor_sold_7d: 5,
  sold_7d_kind: "sold_observed",
  provenance: { scope: "EU5", sold: "watched transitions", window: "trailing 7d" },
  brands: [
    {
      brand: "Nike",
      sold_7d: 1200,
      avg_price_eur: 42,
      models_tracked: 12,
      top_categories: ["Sneakers"],
      categories: [{ category: "Sneakers", sold_7d: 800, avg_price_eur: 55 }],
    },
    {
      brand: "Adidas",
      sold_7d: 900,
      avg_price_eur: 38,
      models_tracked: 8,
      top_categories: ["Sneakers"],
      categories: [{ category: "Sneakers", sold_7d: 500, avg_price_eur: 40 }],
    },
  ],
}

let nextUserId = 3
let nextWatchId = 1
const users = new Map()
const watchlists = new Map()

// ── /api/verdict — mirrors demand-intel's documented contract, not its code.
//
// Real implementation: api/routes.py (`_gate`, `_provisional_verdict`, the
// `data_sufficient` branch) and the P0 fixes it now carries:
//   - tests/test_anon_quota_cookie.py — a visitor with NO cookie must always
//     get their first check (mint-on-first-contact), never LIMIT_REACHED.
//     Cookie name/limit below are copied from config.py so a drift between
//     the two shows up as a failing assertion, not a silent divergence.
//   - tests/test_verdict_leak.py — anonymous callers get an ALLOWLIST, never
//     `res` minus keys. PAID_FIELDS there is reproduced below as
//     PAID_ONLY_FIELDS so this mock cannot leak what the backend does not.
// This file is QA-owned and cannot import Python, so it is a hand-kept
// mirror. See docs/eng/QA.md "Fidelity of the mock" for what that costs.
export const VERDICT_COOKIE = "riq_vid" // config.ANON_VISITOR_COOKIE_NAME
export const FREE_VERDICT_DAILY_LIMIT = 10 // config.FREE_VERDICT_DAILY_LIMIT
export const PAID_ONLY_FIELDS = [
  "sell_through_rate", "top_sizes", "size_velocity", "opportunity_score",
  "reasons", "months_supply", "data_quality", "str_pct",
]
let nextVisitorId = 1
const anonQuota = new Map() // visitorId -> checks used today

const VERDICT_CATALOG = {
  "nike air force 1": {
    verdict: "BUY",
    product: "Nike Air Force 1",
    category: "Sneakers",
    confidence: "HIGH",
    n: 120,
    sold_7d: 120,
    active_listings: 300,
    buy_below: 39.9,
    sell_avg: 60,
    sell_median: 58,
    sell_through_rate: "62%",
    top_sizes: ["42", "43"],
    size_velocity: [{ size: "42", sold_30d: 40, pct: 0.33 }],
    opportunity_score: 72,
    reasons: ["Momentum HOT", "Thin resale gap vs comparable sales"],
    momentum: "HOT",
    months_supply: 0.6,
    data_quality: 80,
  },
  "provisional momentum item": {
    // Shape of api/routes.py _provisional_verdict(): a call resting on
    // momentum/price alone because str_pct is withheld. This was the FIRST
    // of the three paths that bypassed the paywall gate — it used to return
    // before the gate ran at all. sell_through_rate/top_sizes/months_supply
    // are simply absent here, matching the real function (never computed,
    // not redacted), so a leak would only show up if this mock started
    // inventing them.
    verdict: "WATCH",
    product: "Provisional Momentum Item",
    category: "Sneakers",
    confidence: "MEDIUM",
    n: 45,
    sold_7d: 45,
    active_listings: 90,
    buy_below: 22,
    sell_avg: 34,
    sell_median: 33,
    provisional: true,
    momentum: "RISING",
  },
  "adidas samba": {
    verdict: "WATCH",
    product: "Adidas Samba",
    category: "Sneakers",
    confidence: "MEDIUM",
    n: 20,
    sold_7d: 48,
    active_listings: 22142,
    buy_below: 20.28,
    sell_avg: 30.5,
    sell_median: 30.49,
    momentum: "STABLE",
  },
  nike: {
    verdict: "BRAND_CATEGORIES",
    brand: "Nike",
    categories: ["Sneakers", "Jackets"],
    category_aggregates: [
      { brand: "Nike", category: "Sneakers", sold_7d: 206, avg_price_eur: 112.14 },
      { brand: "Nike", category: "Jackets", sold_7d: 11, avg_price_eur: 37.15 },
    ],
    confidence: "AGGREGATE",
    is_aggregate: true,
    next_step: "Nike sneaker",
    message: "Nike: Sneakers — around €112.14 (206 watched leaving the shelf recently).",
    reason: "model_too_vague",
  },
  "ralph lauren": {
    verdict: "BRAND_CATEGORIES",
    brand: "Ralph Lauren",
    categories: ["Shirts", "Hoodies"],
    category_aggregates: [
      { brand: "Ralph Lauren", category: "Shirts", sold_7d: 9, avg_price_eur: 46.81 },
      { brand: "Ralph Lauren", category: "Hoodies", sold_7d: 6, avg_price_eur: 51.9 },
    ],
    confidence: "AGGREGATE",
    is_aggregate: true,
    next_step: "Ralph Lauren shirt",
    message: "Ralph Lauren: Shirts — around €46.81 (9 watched leaving the shelf recently).",
    reason: "model_too_vague",
  },
  "nike nocta": {
    verdict: "BRAND_CATEGORIES",
    brand: "Nike",
    categories: ["Sneakers", "Jackets"],
    category_aggregates: [
      { brand: "Nike", category: "Sneakers", sold_7d: 206, avg_price_eur: 112.14 },
    ],
    confidence: "AGGREGATE",
    is_aggregate: true,
    next_step: "Nike sneaker",
    message: "Nike: Sneakers — around €112.14 (206 watched leaving the shelf recently).",
    reason: "unknown",
  },
  "thin sample sneaker": {
    verdict: "INSUFFICIENT_DATA",
    product: "Thin Sample Sneaker",
    category: "Sneakers",
    confidence: "LOW",
    n: 3,
    sold_7d: 3,
    confidence_note:
      "Only 3 comparable sold items — not enough to name a buy-below. The model is tracked; the price is not.",
    message:
      "We know 'Thin Sample Sneaker', but 3 watched comps is too few to print a buy-below.",
    reason: "thin_comparables",
    // A real INSUFFICIENT_DATA row CAN carry data_quality for a paid caller
    // (api/routes.py `if not is_free: result["data_quality"] = ...`). It
    // must never reach a free/anon caller — that is the exact leak
    // tests/test_verdict_leak.py exists to catch. Kept here so the anon view
    // has something to prove it drops.
    data_quality: 41,
  },
}

function parseCookies(header) {
  const out = {}
  for (const part of (header || "").split(";")) {
    const i = part.indexOf("=")
    if (i === -1) continue
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

// Fresh allowlisted object, never `full` minus keys — same rule the backend
// comment insists on, for the same reason: a field added to the catalog
// entry later must not leak by omission.
function anonVerdictView(full) {
  return {
    verdict: full.verdict,
    product: full.product,
    category: full.category,
    confidence: full.confidence,
    confidence_note: full.confidence_note ?? null,
    n: full.n,
    sold_7d: full.sold_7d,
    active_listings: full.active_listings ?? null,
    buy_below: full.buy_below ?? null,
    sell_avg: full.sell_avg ?? null,
    sell_median: full.sell_median ?? null,
    provisional: full.provisional ?? null,
    locked: false,
    locked_fields: [
      "sell_through_rate", "top_sizes", "size_velocity",
      "opportunity_score", "reasons", "months_supply",
    ],
  }
}

function insufficientDataView(full, { includeDataQuality }) {
  const out = {
    verdict: "INSUFFICIENT_DATA",
    product: full.product,
    category: full.category,
    confidence: full.confidence,
    confidence_note: full.confidence_note,
    n: full.n,
    sold_7d: full.sold_7d,
    message: full.message,
    reason: full.reason,
  }
  if (includeDataQuality) out.data_quality = full.data_quality
  return out
}

function seed(id, email, password, plan = "operator", { verified = true } = {}) {
  const token = `tok-${id}`
  users.set(token, {
    id, email, password, plan, token,
    email_verified: verified,
    verifyToken: `vtok-${id}`,
    verifyUsed: false,
  })
  watchlists.set(id, [])
  return token
}
seed(1, "alice@example.com", "password12345", "operator")
seed(2, "bob@example.com", "password12345", "operator")

function json(res, status, body) {
  const headers = { "Content-Type": "application/json", ...res.getHeaders() }
  res.writeHead(status, headers)
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on("data", (c) => chunks.push(c))
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || "{}")) }
      catch { resolve({}) }
    })
  })
}

function caller(req) {
  const auth = req.headers.authorization || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  return users.get(token) || null
}

const server = http.createServer(async (req, res) => {
  const raw = req.url || "/"
  const url = raw.split("?")[0]
  const method = req.method || "GET"
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
  if (method === "OPTIONS") { res.writeHead(204); res.end(); return }

  if (url.startsWith("/api/health")) {
    json(res, 200, { ok: true, overall: "pass", passed: 1, failed: 0, total: 1, results: [] })
    return
  }
  if (url.startsWith("/api/public/market-snapshot")) {
    json(res, 200, SNAPSHOT)
    return
  }
  if (url.startsWith("/api/ping")) {
    json(res, 200, { ok: true, db: "connected" })
    return
  }
  if (url.startsWith("/stripe/plans")) {
    json(res, 200, { publishable_key: null, stripe_enabled: false, plans: [] })
    return
  }

  if (url === "/api/verdict" && method === "GET") {
    const q = new URL(raw, "http://mock").searchParams.get("q") || ""
    const key = q.trim().toLowerCase()
    const caller_ = caller(req)

    let setCookie = null
    if (!caller_) {
      const cookies = parseCookies(req.headers.cookie)
      let visitorId = cookies[VERDICT_COOKIE]
      const mint = !visitorId
      if (mint) {
        // P0 #1 regression net: a visitor with NO cookie is minted one and
        // is judged on THIS request under a fresh, empty quota — never
        // rejected for a bucket they were never able to carry.
        visitorId = `v${nextVisitorId++}`
        setCookie = `${VERDICT_COOKIE}=${visitorId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=34560000`
      }
      const used = anonQuota.get(visitorId) || 0
      if (used >= FREE_VERDICT_DAILY_LIMIT) {
        if (setCookie) res.setHeader("Set-Cookie", setCookie)
        json(res, 200, {
          verdict: "LIMIT_REACHED",
          message: `Free tier: ${FREE_VERDICT_DAILY_LIMIT} verdicts/day. Starter or Pro for unlimited.`,
          upgrade_url: "/stripe/plans",
          used_today: used,
          limit: FREE_VERDICT_DAILY_LIMIT,
        })
        return
      }
      anonQuota.set(visitorId, used + 1)
      if (setCookie) res.setHeader("Set-Cookie", setCookie)
    }

    const entry = VERDICT_CATALOG[key]
    if (!entry) {
      json(res, 200, {
        verdict: "UNKNOWN",
        reason: "no_data",
        message: `No data found for '${q}'. Try a brand + model name (e.g. 'Jordan 3' or 'Nike Air Max').`,
      })
      return
    }

    if (entry.verdict === "BRAND_CATEGORIES" || entry.verdict === "BRAND_AVERAGE") {
      json(res, 200, entry)
      return
    }

    if (entry.verdict === "INSUFFICIENT_DATA") {
      const isPaid = !!caller_ && caller_.plan !== "free"
      json(res, 200, insufficientDataView(entry, { includeDataQuality: isPaid }))
      return
    }

    if (!caller_) {
      json(res, 200, anonVerdictView(entry))
      return
    }
    if (caller_.plan === "free") {
      json(res, 200, {
        verdict: entry.verdict,
        product: entry.product,
        category: entry.category,
        confidence: entry.confidence,
        confidence_note: entry.confidence_note ?? null,
        n: entry.n,
        sold_7d: entry.sold_7d,
        locked: true,
        locked_fields: [
          "buy_below", "sell_avg", "sell_median", "sell_through_rate",
          "top_sizes", "size_velocity", "opportunity_score", "reasons",
        ],
        message: "This is the headline call. Unlock the buy-below price, sell price, best sizes and sell-through with a plan.",
        upgrade_url: "/register",
      })
      return
    }
    json(res, 200, entry)
    return
  }

  if (method === "POST" && url === "/auth/register") {
    const body = await readBody(req)
    if (!body.email || !body.password || String(body.password).length < 8) {
      json(res, 400, { detail: "Invalid email or password" })
      return
    }
    const dup = [...users.values()].find((u) => u.email === body.email)
    if (dup) {
      json(res, 409, { detail: "You already have an account — Sign in" })
      return
    }
    const id = nextUserId++
    const token = seed(id, body.email, body.password, "free", { verified: false })
    json(res, 201, { access_token: token, plan: "free", email_sent: true })
    return
  }
  if (method === "POST" && url === "/auth/login") {
    const body = await readBody(req)
    const found = [...users.values()].find((u) => u.email === body.email && u.password === body.password)
    if (!found) { json(res, 401, { detail: "Invalid email or password" }); return }
    json(res, 200, { access_token: found.token, plan: found.plan })
    return
  }
  if (method === "POST" && url === "/auth/verify-email") {
    const body = await readBody(req)
    const found = [...users.values()].find((u) => u.verifyToken === body.token)
    if (!found) { json(res, 400, { detail: "Invalid verification link" }); return }
    if (found.verifyUsed) {
      json(res, 200, { ok: true, already_verified: true, message: "This email is already confirmed" })
      return
    }
    found.verifyUsed = true
    found.email_verified = true
    json(res, 200, { ok: true, access_token: found.token, plan: found.plan, message: "Email verified successfully" })
    return
  }
  if (method === "POST" && url === "/auth/resend-verification") {
    const u = caller(req)
    if (!u) { json(res, 401, { detail: "Not authenticated" }); return }
    if (u.email_verified) {
      json(res, 200, { ok: true, already_verified: true, message: "Your email is already confirmed." })
      return
    }
    json(res, 200, { ok: true, already_verified: false, message: "Sent. Check your inbox — the link is valid for 24 hours." })
    return
  }

  const user = caller(req)

  if (url === "/auth/me") {
    if (!user) { json(res, 401, { detail: "Not authenticated" }); return }
    res.setHeader("Cache-Control", "no-store, private")
    json(res, 200, {
      id: user.id, email: user.email, plan: user.plan,
      email_verified: !!user.email_verified, trial_active: user.plan === "free" && !!user.email_verified, is_owner: false,
    })
    return
  }
  if (url.startsWith("/auth/")) {
    json(res, 401, { detail: "Not authenticated" })
    return
  }

  if (url === "/api/watchlist" && method === "GET") {
    if (!user) { json(res, 401, { detail: "Authentication required" }); return }
    json(res, 200, { items: watchlists.get(user.id) || [], locked: false, locked_fields: [] })
    return
  }
  if (url === "/api/watchlist" && method === "POST") {
    if (!user) { json(res, 401, { detail: "Authentication required" }); return }
    const body = await readBody(req)
    const items = watchlists.get(user.id) || []
    if (items.some((i) => i.brand === body.brand && i.model === body.model)) {
      json(res, 409, { detail: "Already in watchlist" })
      return
    }
    const item = {
      id: nextWatchId++,
      brand: body.brand, model: body.model, category: body.category || "",
      max_buy_price: 40, avg_price_eur: 55, sold_7d: 12, str_pct: null,
    }
    items.push(item)
    watchlists.set(user.id, items)
    json(res, 201, { id: item.id, ok: true })
    return
  }
  const watchDel = url.match(/^\/api\/watchlist\/(\d+)$/)
  if (watchDel && method === "DELETE") {
    if (!user) { json(res, 401, { detail: "Authentication required" }); return }
    const id = Number(watchDel[1])
    const items = watchlists.get(user.id) || []
    const next = items.filter((i) => i.id !== id)
    if (next.length === items.length) { json(res, 404, { detail: "Item not found" }); return }
    watchlists.set(user.id, next)
    json(res, 200, { ok: true })
    return
  }

  if (!user && url.startsWith("/api/")) {
    json(res, 401, { detail: "Authentication required" })
    return
  }

  if (url.startsWith("/api/kpis")) {
    if (!user) { json(res, 401, { detail: "Authentication required" }); return }
    if (!user.email_verified) {
      res.setHeader("X-Verify-Url", "/check-email")
      json(res, 403, { detail: "Confirm your email" })
      return
    }
    json(res, 200, {
      avg_profit_margin: { value: 1200, unit: "", label: "Sold / 7d", sublabel: "watched", delta_30d: null, trend: null },
      items_analyzed: { value: 966236, formatted: "966,236", unit: "" },
      top_category: { value: "Sneakers", sublabel: "by 7-day sales volume" },
      market_opportunity: { value: 3, label: "Buy signals", sublabel: "actionable now" },
    })
    return
  }
  if (url.startsWith("/api/deals")) {
    json(res, 200, { deals: [], count: 0, locked: false, locked_fields: [] })
    return
  }
  if (url.startsWith("/api/brands/rankings")) {
    json(res, 200, { brands: [] })
    return
  }
  if (url.startsWith("/api/trends/summary")) {
    json(res, 200, { trending_models: [] })
    return
  }
  if (url.startsWith("/api/recent-sold")) {
    json(res, 200, { data: [] })
    return
  }

  json(res, 404, { detail: "not mocked" })
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`mock backend http://127.0.0.1:${PORT}`)
})
