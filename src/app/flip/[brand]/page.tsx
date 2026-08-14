import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BRANDS, catSlug, type BrandSeo } from "@/lib/seo-categories"
import { Lock, TrendingUp, ArrowRight } from "lucide-react"

// Programmatic SEO: one statically-generated page per tracked brand, targeting
// "is X worth reselling / flipping on Vinted". Data is baked in at build time
// from scripts/export_seo_data.py — aggregates only, never the paid signals.
// See that script's exposure policy before adding any field here.

function getBrand(slug: string): BrandSeo | undefined {
  return BRANDS.find(b => b.slug === slug)
}

export function generateStaticParams() {
  return BRANDS.map(b => ({ brand: b.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ brand: string }> }
): Promise<Metadata> {
  const { brand: slug } = await params
  const b = getBrand(slug)
  if (!b) return { title: "Brand not found — Resale IQ" }
  const title = `Is ${b.brand} worth reselling on Vinted? (${b.sold_7d.toLocaleString()} sold/week)`
  const description =
    `${b.brand} sells about ${b.sold_7d.toLocaleString()} items a week across 5 EU Vinted markets ` +
    `at an average of €${b.avg_price_eur}. See which ${b.brand} models are actually profitable to flip.`
  return {
    title,
    description,
    alternates: { canonical: `/flip/${b.slug}` },
    openGraph: { title, description, type: "article" },
  }
}

export default async function BrandFlipPage(
  { params }: { params: Promise<{ brand: string }> }
) {
  const { brand: slug } = await params
  const b = getBrand(slug)
  if (!b) notFound()

  const others = BRANDS.filter(x => x.slug !== b.slug).slice(0, 12)

  // Structured data helps this rank as an answer to "is X worth reselling".
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${b.brand} worth reselling on Vinted?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            `${b.brand} sells roughly ${b.sold_7d.toLocaleString()} items per week across the five ` +
            `main EU Vinted markets, at an average sale price of €${b.avg_price_eur}. Its strongest ` +
            `categories are ${b.top_categories.join(", ")}. Whether it is profitable depends on the ` +
            `specific model and the price you source it at.`,
        },
      },
    ],
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/" style={{ color: "#22c55e", textDecoration: "none", fontSize: 13 }}>
        ← Resale IQ
      </Link>

      <h1 style={{ fontSize: 30, fontWeight: 800, color: "#eef1f7", margin: "22px 0 10px", lineHeight: 1.2 }}>
        Is {b.brand} worth reselling on Vinted in 2026?
      </h1>
      <p style={{ color: "#8b99b8", fontSize: 15, lineHeight: 1.6, marginBottom: 26 }}>
        Short answer: {b.brand} moves serious volume — about{" "}
        <strong style={{ color: "#eef1f7" }}>{b.sold_7d.toLocaleString()} items a week</strong>{" "}
        across the five main EU Vinted markets, at an average sale price of{" "}
        <strong style={{ color: "#eef1f7" }}>€{b.avg_price_eur}</strong>. But volume alone
        doesn&apos;t make you money — the margin depends entirely on which model you buy and
        what you pay for it.
      </p>

      {/* Public aggregates */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          ["Sold per week", b.sold_7d.toLocaleString()],
          ["Avg sale price", `€${b.avg_price_eur}`],
          ["Models tracked", String(b.models_tracked || "—")],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#5b6b8c", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#eef1f7" }}>{value}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
        What {b.brand} sells for, by category
      </h2>
      {/* THIS TABLE IS WHY THE PAGE EXISTS. Measured 2026-08-13, these pages
          were 95-98% identical to each other: the template had three variables
          and the rest was prose shared by all 156 brands. Numbers a reader can
          only get here are what makes the page worth indexing — and worth
          reading. Keep per-brand data ABOVE the generic explanation. */}
      <div style={{ border: "1px solid #1c2333", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "9px 14px", background: "#12151d", fontSize: 11, color: "#5b6b8c" }}>
          <span>Category</span><span style={{ textAlign: "right" }}>Sold/week</span><span style={{ textAlign: "right", minWidth: 62 }}>Avg price</span>
        </div>
        {(b.categories || []).slice(0, 5).map(c => (
          <div key={c.category} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "10px 14px", borderTop: "1px solid #1c2333", fontSize: 14, color: "#a9b6d0" }}>
            <span style={{ color: "#eef1f7" }}>{c.category}</span>
            <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{c.sold_7d.toLocaleString()}</span>
            <span style={{ textAlign: "right", minWidth: 62, fontVariantNumeric: "tabular-nums", color: c.avg_price_eur ? "#34d399" : "#5b6b8c" }}>
              {c.avg_price_eur ? `\u20ac${c.avg_price_eur}` : "—"}
            </span>
          </div>
        ))}
      </div>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 12 }}>
        {b.categories?.[0] && b.categories[0].avg_price_eur ? (
          <>
            {b.brand} {b.categories[0].category.toLowerCase()} sell at about{" "}
            <strong style={{ color: "#eef1f7" }}>&euro;{b.categories[0].avg_price_eur}</strong>, on{" "}
            <strong style={{ color: "#eef1f7" }}>{b.categories[0].sold_7d.toLocaleString()}</strong> sales a week.
            Work backwards from that price, not from what the seller is asking.
          </>
        ) : (
          <>Volume alone does not pay you. What you pay does.</>
        )}
      </p>

      {/* Every brand x category page must be linked from here. An unlinked page
          is an unreachable page — the same failure mode as a route with no UI. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {(b.categories || []).map(c => (
          <Link key={c.category} href={`/flip/${b.slug}/${catSlug(c.category)}`} style={{
            display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline",
            fontSize: 14, color: "#8fa3c4", textDecoration: "none",
            background: "#12151d", border: "1px solid #1c2333",
            borderRadius: 9, padding: "10px 14px",
          }}>
            <span>Are {b.brand} {c.category} worth reselling?</span>
            <span style={{ fontSize: 12.5, color: "#5b6b8c", whiteSpace: "nowrap" }}>
              {c.sold_7d.toLocaleString()}/wk
            </span>
          </Link>
        ))}
      </div>

      {/* The gate — this is the paid product */}
      <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 12, padding: 22, margin: "26px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Lock size={15} style={{ color: "#fbbf24" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7" }}>
            The part that makes you money
          </span>
        </div>
        <p style={{ color: "#8b99b8", fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
          Averages don&apos;t tell you what to buy. Resale IQ tracks{" "}
          {b.models_tracked ? `${b.models_tracked} ${b.brand} model${b.models_tracked === 1 ? "" : "s"}`
            : `every tracked ${b.brand} model`}{" "}
          individually and gives you:
        </p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {[
            "Max buy price per model — the number that targets a healthy margin after fees",
            "Sell-through rate — how fast each model actually moves",
            "Momentum — which models are heating up right now, not last month",
            "The exact sizes that sell fastest",
          ].map(t => (
            <li key={t} style={{ display: "flex", gap: 8, color: "#a9b6d0", fontSize: 13.5, lineHeight: 1.5 }}>
              <TrendingUp size={14} style={{ color: "#22c55e", flexShrink: 0, marginTop: 3 }} />
              {t}
            </li>
          ))}
        </ul>
        <Link href="/register" style={{
          display: "inline-flex", alignItems: "center", gap: 7, background: "#22c55e",
          color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 18px",
          borderRadius: 9, textDecoration: "none",
        }}>
          See {b.brand} buy prices <ArrowRight size={15} />
        </Link>
        <p style={{ fontSize: 11.5, color: "#5b6b8c", marginTop: 10 }}>
          From €19/month. Cancel anytime.
        </p>
      </div>

      <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
        How we get these numbers
      </h2>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
        We continuously track live and sold listings across Vinted ES, FR, DE, IT and PT —
        900,000+ unique listings — and recompute every signal hourly. The figures on this page are
        live aggregates, not estimates.
      </p>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
        For how to turn figures like these into a buy decision, the{" "}
        <Link href="/manual" style={{ color: "#22c55e", textDecoration: "none" }}>reselling manual</Link>{" "}
        covers the margin maths, the maximum buy price and why sell-through matters more than volume.
      </p>

      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "28px 0 12px" }}>
        Other brands
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {others.map(o => (
          <Link key={o.slug} href={`/flip/${o.slug}`} style={{
            fontSize: 13, color: "#a9b6d0", textDecoration: "none",
            background: "#12151d", border: "1px solid #1c2333",
            borderRadius: 8, padding: "7px 12px",
          }}>
            {o.brand}
          </Link>
        ))}
      </div>
    </main>
  )
}
