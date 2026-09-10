import Link from "next/link"

export const metadata = {
  title: "Vinted Resale API — Resale IQ Developer Docs",
  description:
    "REST API for Vinted resale data across ES, FR, DE, IT and PT. Query sell-through rates, average asking prices at departure, buy-below prices and demand signals for 26 brands. Included with the Pro plan.",
  alternates: { canonical: "/api-docs" },
}

// Documented here rather than only in the app, because a developer evaluating
// whether to subscribe needs to see the API BEFORE paying — and because this
// page is an SEO surface for "vinted api" / "vinted resale data api" queries.
const ENDPOINTS: Array<{ method: string; path: string; desc: string; params?: string }> = [
  { method: "GET", path: "/api/model-signals", desc: "Top models ranked by 7-day watched departures: departure volume, average asking price at departure, buy-below price, sell-through, best sizes.", params: "limit (default 100), brand" },
  { method: "GET", path: "/api/deals", desc: "Current opportunities, filterable.", params: "brand, category, momentum, min_str, limit" },
  { method: "GET", path: "/api/kpis", desc: "Headline market figures: listings tracked, top category, active buy signals." },
  { method: "GET", path: "/api/brands/rankings", desc: "Brand leaderboard by demand.", params: "limit" },
  { method: "GET", path: "/api/brands/{slug}", desc: "One brand in detail, by slug." },
  { method: "GET", path: "/api/trends/summary", desc: "Market trend summary across the tracked markets." },
  { method: "GET", path: "/api/recent-sold", desc: "Most recently detected departures — listings that left the shelf, not confirmed sales.", params: "limit" },
  { method: "GET", path: "/api/watchlist", desc: "Your watchlist." },
  { method: "POST", path: "/api/watchlist", desc: "Add a model to your watchlist." },
  { method: "DELETE", path: "/api/watchlist/{id}", desc: "Remove a watchlist item." },
  { method: "GET", path: "/api/portfolio", desc: "Your portfolio items.", params: "status" },
  { method: "GET", path: "/api/portfolio/stats", desc: "P&L summary: invested, realised profit, ROI, days held." },
  { method: "POST", path: "/api/portfolio", desc: "Add a sourced item." },
  { method: "PUT", path: "/api/portfolio/{id}", desc: "Update an item (mark listed or sold)." },
  { method: "DELETE", path: "/api/portfolio/{id}", desc: "Delete an item." },
]

const METHOD_COLOR: Record<string, string> = {
  GET: "#34C759", POST: "#0A84FF", PUT: "#FF9F0A", DELETE: "#FF453A",
}

const H2: React.CSSProperties = { fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "30px 0 10px" }
const P: React.CSSProperties = { fontSize: 13.5, lineHeight: 1.65, color: "#c3cde0" }
const PRE: React.CSSProperties = {
  background: "#0e1118", border: "1px solid var(--color-border)", borderRadius: 9,
  padding: "13px 15px", fontSize: 12.5, color: "#8fe3b0", overflowX: "auto", margin: "10px 0",
}

export default function ApiDocs() {
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#34C759", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>

        <h1 style={{ fontSize: 30, fontWeight: 600, color: "#eef1f7", margin: "24px 0 8px", letterSpacing: "-0.6px" }}>Resale IQ API</h1>
        <p style={{ ...P, marginBottom: 6 }}>
          Query real Vinted resale data across ES, FR, DE, IT and PT — sell-through rates, average
          asking prices at departure, buy-below prices and demand signals for 26 brands.
        </p>
        <p style={{ fontSize: 13, color: "#5b6b8c" }}>
          Included with <Link href="/register" style={{ color: "#34C759" }}>Pro</Link>. Generate your
          key from <Link href="/account" style={{ color: "#34C759" }}>your account page</Link>.
        </p>

        <h2 style={H2}>Authentication</h2>
        <p style={P}>Send your key as an <code style={{ color: "#8fe3b0" }}>X-Api-Key</code> header on every request. Keys are per-account; generating a new one immediately revokes the previous key.</p>
        <pre style={PRE}><code>{`curl https://resaleiq.dev/api/model-signals \\
  -H "X-Api-Key: YOUR_KEY"`}</code></pre>

        <h2 style={H2}>Base URL</h2>
        <pre style={PRE}><code>https://resaleiq.dev</code></pre>

        <h2 style={H2}>Rate limit</h2>
        <p style={P}>60 requests per minute per key. Exceeding it returns <code style={{ color: "#8fe3b0" }}>429</code>; retry after a short pause.</p>

        <h2 style={H2}>Responses &amp; errors</h2>
        <p style={P}>All responses are JSON. Errors carry a <code style={{ color: "#8fe3b0" }}>detail</code> field.</p>
        <div style={{ margin: "10px 0" }}>
          {[
            ["200", "Success"],
            ["401", "Missing or invalid API key"],
            ["402", "Your plan does not include this data"],
            ["403", "Authenticated, but not permitted"],
            ["404", "Not found"],
            ["429", "Rate limit exceeded"],
          ].map(([code, meaning]) => (
            <div key={code} style={{ display: "flex", gap: 14, padding: "5px 0", fontSize: 13 }}>
              <code style={{ color: "#8fe3b0", minWidth: 40 }}>{code}</code>
              <span>{meaning}</span>
            </div>
          ))}
        </div>

        <h2 style={H2}>Endpoints</h2>
        {ENDPOINTS.map(e => (
          <div key={e.method + e.path} style={{ border: "1px solid var(--color-border-ui)", borderRadius: 10, padding: "12px 14px", marginBottom: 9, background: "var(--color-surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ color: METHOD_COLOR[e.method], fontWeight: 700, fontSize: 11.5, minWidth: 52 }}>{e.method}</span>
              <code style={{ fontSize: 13, color: "#eef1f7" }}>{e.path}</code>
            </div>
            <p style={{ fontSize: 12.5, color: "#8b99b8", margin: "7px 0 0", lineHeight: 1.55 }}>{e.desc}</p>
            {e.params && <p style={{ fontSize: 11.5, color: "#5b6b8c", margin: "5px 0 0" }}>Query params: {e.params}</p>}
          </div>
        ))}

        <h2 style={H2}>Example response</h2>
        <pre style={PRE}><code>{`{
  "data": [
    {
      "brand": "Nike",
      "model": "Tech Fleece",
      "sold_7d": 1240,
      "avg_price_eur": 21.4,
      "max_buy_price": 14.2,
      "str_pct": 12.4,
      "top_sizes": ["M", "L", "S"]
    }
  ],
  "count": 1
}`}</code></pre>
        <p style={{ fontSize: 12.5, color: "#5b6b8c" }}>
          <code style={{ color: "#8fe3b0" }}>max_buy_price</code> is the highest price you can pay and still
          clear roughly 30% margin after platform fees. <code style={{ color: "#8fe3b0" }}>str_pct</code> is
          the observed share — watched sales divided by watched sales plus still-listed items, capped at
          100%. It is withheld (<code style={{ color: "#8fe3b0" }}>null</code>) below 30 watched sales in
          the window, or when we have no still-listed sample; null is not 0 and not 100. Weekly turnover
          (<code style={{ color: "#8fe3b0" }}>sold_7d</code> / <code style={{ color: "#8fe3b0" }}>active_listings</code>)
          is a different statistic and is never labelled sell-through.
        </p>

        <h2 style={H2}>Fair use</h2>
        <p style={P}>
          The API is for your own sourcing decisions. Redistributing the data or using it to build a
          competing dataset is not permitted — see the <Link href="/terms" style={{ color: "#34C759" }}>Terms</Link>.
        </p>

        <div style={{ marginTop: 34, padding: "20px 22px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7" }}>Get an API key</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "7px 0 14px" }}>
            The API is included with Pro. Generate your key from your account page.
          </p>
          <Link href="/register" style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "10px 20px", borderRadius: 9, textDecoration: "none" }}>
            Get Pro →
          </Link>
        </div>

        <div style={{ marginTop: 26, fontSize: 13 }}>
          <Link href="/support" style={{ color: "#34C759" }}>Support</Link>
          <span style={{ color: "#2b3550", margin: "0 8px" }}>·</span>
          <Link href="/terms" style={{ color: "#34C759" }}>Terms</Link>
        </div>
      </div>
    </div>
  )
}
