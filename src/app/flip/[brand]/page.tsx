import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import seo from "@/data/seo-brands.json"
import { Lock, TrendingUp, ArrowRight } from "lucide-react"

// Programmatic SEO: one statically-generated page per tracked brand, targeting
// "is X worth reselling / flipping on Vinted". Data is baked in at build time
// from scripts/export_seo_data.py — aggregates only, never the paid signals.
// See that script's exposure policy before adding any field here.

interface BrandSeo {
  brand: string
  slug: string
  sold_7d: number
  avg_price_eur: number
  top_categories: string[]
  models_tracked: number
}

const BRANDS = seo.brands as BrandSeo[]

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
        Where {b.brand} actually sells
      </h2>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 12 }}>
        Its strongest categories by volume right now are{" "}
        {b.top_categories.map((c, i) => (
          <span key={c}>
            <strong style={{ color: "#eef1f7" }}>{c}</strong>
            {i < b.top_categories.length - 2 ? ", " : i === b.top_categories.length - 2 ? " and " : ""}
          </span>
        ))}
        . Sourcing outside those categories usually means slower sell-through, which quietly
        kills your return even when the margin looks fine on paper.
      </p>

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
            "Max buy price per model — the number that guarantees your margin after fees",
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
        millions of items — and recompute every signal hourly. The figures on this page are
        live aggregates, not estimates.
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
