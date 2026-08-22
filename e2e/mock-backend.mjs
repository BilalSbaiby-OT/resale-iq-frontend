#!/usr/bin/env node
/**
 * Tiny snapshot server so Playwright can run without demand-intel.
 * Only the public GETs the smoke suite needs.
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

const server = http.createServer((req, res) => {
  const url = req.url || "/"
  res.setHeader("Access-Control-Allow-Origin", "*")
  if (url.startsWith("/api/health")) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ ok: true }))
    return
  }
  if (url.startsWith("/api/public/market-snapshot")) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(SNAPSHOT))
    return
  }
  if (url.startsWith("/auth/me") || url.startsWith("/auth/")) {
    res.writeHead(401, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ detail: "Not authenticated" }))
    return
  }
  if (url.startsWith("/stripe/plans")) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ plans: [] }))
    return
  }
  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ detail: "not mocked" }))
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`mock backend http://127.0.0.1:${PORT}`)
})
