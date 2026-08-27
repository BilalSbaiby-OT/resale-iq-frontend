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
