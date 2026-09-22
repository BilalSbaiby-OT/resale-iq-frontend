import Link from "next/link"
import type { Metadata } from "next"
import { BUY_DATA, BUY_CATEGORIES, BUY_BATCH1_PAIRS, fmtCountBuy, fmtEurBuy, catSlug } from "@/lib/buy-data"

export const metadata: Metadata = {
  title: "What to Pay for Secondhand Resale — Buy-Below Prices by Brand",
  description:
    "Real sell-through data from 13M+ Vinted listings. Know exactly what to pay when buying inventory to resell — brand by brand, category by category, with 30-day departure counts and buy-below prices.",
  alternates: { canonical: "https://resaleiq.dev/buy" },
  openGraph: {
    title: "Resale Buy-Below Intelligence — ResaleIQ",
    description:
      "Stop guessing what to pay. 231 tracked brand-category pairs, real 30-day sold data, buy-below prices built from actual departure averages.",
    url: "https://resaleiq.dev/buy",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Resale Buy-Below Prices by Brand",
  description:
    "What resellers should pay for secondhand inventory by brand and category, based on 30-day Vinted departures across Spain, France, Germany, Italy and Portugal.",
  url: "https://resaleiq.dev/buy",
  numberOfItems: BUY_DATA.total_pairs,
  itemListElement: BUY_DATA.brands.slice(0, 20).map((b, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `${b.brand} resale buy-below prices`,
    url: `https://resaleiq.dev/buy/${b.slug}`,
  })),
}

export default function BuyHubPage() {
  // Batch 1: top 20 highest-evidence pairs. See lib/buy-data.ts for rationale.
  const batch1 = BUY_BATCH1_PAIRS
  const totalPairs = BUY_DATA.total_pairs

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <span style={{ color: "#a9b6d0" }}>Buy prices</span>
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.6px", color: "#eef1f7", lineHeight: 1.18, marginBottom: 16 }}>
          What to pay when buying inventory to resell
        </h1>

        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 12 }}>
          Every number here comes from real Vinted departures — listings that actually sold — tracked across
          Spain, France, Germany, Italy and Portugal. We track{" "}
          <strong style={{ color: "#eef1f7" }}>{totalPairs.toLocaleString()} brand-category pairs</strong>{" "}
          with at least 3 real sales in the last 30 days. The buy-below prices are derived from average
          departure prices less a 45% gross margin target to cover platform fees, postage and risk.
        </p>
        <p style={{ fontSize: 14.5, color: "#8b99b8", lineHeight: 1.6, marginBottom: 32 }}>
          Active listings are NOT sales. We never use supply as a proxy for demand — only confirmed departures count.
        </p>

        {/* Category quick-nav */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#eef1f7", marginBottom: 12 }}>Browse by category</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {BUY_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/buy/category/${catSlug(cat)}`}
                style={{
                  display: "inline-block",
                  background: "var(--color-surface, #131823)",
                  border: "1px solid var(--color-border-ui, #1e2a3f)",
                  color: "#8fa3c4",
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 20,
                  textDecoration: "none",
                }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Pairs grid — directly links to leaf pages (1 click from /buy hub) */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 16 }}>
          Buy-below by brand &amp; category
        </h2>
        <p style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 16 }}>
          Showing {batch1.length} highest-evidence pairs (≥189 real departures / 30 days). All numbers from confirmed Vinted sales.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginBottom: 40 }}>
          {batch1.map(({ brand: b, cat: c }) => (
            <Link
              key={`${b.slug}/${c.slug}`}
              href={`/buy/${b.slug}/${c.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "var(--color-surface, #131823)",
                  border: "1px solid var(--color-border-ui, #1e2a3f)",
                  borderRadius: 12,
                  padding: "18px 20px",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7", marginBottom: 2 }}>{b.brand}</div>
                <div style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 10 }}>{c.category}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#34C759" }}>
                      {fmtEurBuy(c.buy_below)}
                    </div>
                    <div style={{ fontSize: 11, color: "#5b6b8c" }}>buy below</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7" }}>
                      {fmtCountBuy(c.sold_30d)}
                    </div>
                    <div style={{ fontSize: 11, color: "#5b6b8c" }}>sold / 30d</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "24px 28px", background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-2, #1e3a2f)", borderRadius: 12, textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>
            Check a specific item before you buy
          </div>
          <p style={{ fontSize: 14, color: "#8b99b8", margin: "0 0 16px" }}>
            Category-level data tells you the category moves. Model-level data tells you whether <em>this</em> item, in <em>this</em> size, is worth buying today.
          </p>
          <Link
            href="/tools"
            style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 24px", borderRadius: 9, textDecoration: "none" }}
          >
            Check an item free →
          </Link>
        </div>

        {/* Internal links */}
        <div style={{ fontSize: 13, color: "#5b6b8c" }}>
          <Link href="/flip" style={{ color: "#8fa3c4", marginRight: 16 }}>→ Brand resale demand (/flip)</Link>
          <Link href="/data" style={{ color: "#8fa3c4", marginRight: 16 }}>→ Full Vinted market data</Link>
          <Link href="/methodology" style={{ color: "#8fa3c4" }}>→ How numbers are calculated</Link>
        </div>
      </div>
    </div>
  )
}
