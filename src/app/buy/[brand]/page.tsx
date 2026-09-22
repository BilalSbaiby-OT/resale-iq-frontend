import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  BUY_DATA,
  getBuyBrand,
  fmtEurBuy,
  fmtCountBuy,
  signalDisplay,
  catSlug,
} from "@/lib/buy-data"

export const revalidate = 3600

export function generateStaticParams() {
  return BUY_DATA.brands.map((b) => ({ brand: b.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>
}): Promise<Metadata> {
  const { brand: brandSlug } = await params
  const brand = getBuyBrand(brandSlug)
  if (!brand) return { title: "Not found — Resale IQ" }

  const topCat = brand.categories[0]
  const title = `${brand.brand} Resale Buy-Below Prices — What to Pay | ResaleIQ`
  const description =
    `${brand.brand} had ${fmtCountBuy(brand.sold_30d)} departures in the last 30 days across Vinted. ` +
    `Buy-below for ${topCat?.category ?? "top items"}: ${topCat?.buy_below ? fmtEurBuy(topCat.buy_below) : "see below"}. ` +
    `Real sold-through data — not supply counts.`

  return {
    title,
    description,
    alternates: { canonical: `https://resaleiq.dev/buy/${brand.slug}` },
    openGraph: { title, description, url: `https://resaleiq.dev/buy/${brand.slug}` },
  }
}

export default async function BuyBrandPage({
  params,
}: {
  params: Promise<{ brand: string }>
}) {
  const { brand: brandSlug } = await params
  const brand = getBuyBrand(brandSlug)
  if (!brand) notFound()

  const topCat = brand.categories[0]
  const sig = signalDisplay(topCat?.signal ?? null)

  const intro = `${brand.brand} had an estimated ${fmtCountBuy(brand.sold_30d)} departures in the last 30 days across Spain, France, Germany, Italy and Portugal. ` +
    `The best-performing category is ${topCat?.category ?? "—"}, ` +
    (topCat?.buy_below
      ? `where the buy-below price is ${fmtEurBuy(topCat.buy_below)} (items selling for more at auction tend to yield lower margins — the buy-below is the most you should pay to hit a ~45% gross margin after Vinted fees and postage).`
      : `with data from multiple snapshots. Buy-below prices are derived from average departure prices.`)

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What should I pay for ${brand.brand} items to resell?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: intro,
          },
        },
        {
          "@type": "Question",
          name: `How many ${brand.brand} items sell on Vinted each month?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${brand.brand} had approximately ${fmtCountBuy(brand.sold_30d)} listings leave the shelf in the last 30 days across the five main EU Vinted markets (Spain, France, Germany, Italy, Portugal). This is confirmed sales, not active listings — supply counts are not demand.`,
          },
        },
        {
          "@type": "Question",
          name: `Is ${brand.brand} worth buying for resale?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: topCat?.signal
              ? `The demand signal for ${brand.brand} ${topCat.category} is ${topCat.signal} based on sell-through rate, listing saturation and departure momentum. ${topCat.avg_days_to_sell != null ? `Items sell in about ${topCat.avg_days_to_sell} days on average.` : ""} Check a specific model for a BUY / WATCH / SKIP verdict on the exact item you are considering.`
              : `${brand.brand} has ${brand.categories.length} tracked categories with confirmed sales data. Use the free checker to get a verdict on a specific model.`,
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
        { "@type": "ListItem", position: 2, name: "Buy prices", item: "https://resaleiq.dev/buy" },
        { "@type": "ListItem", position: 3, name: brand.brand, item: `https://resaleiq.dev/buy/${brand.slug}` },
      ],
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href="/buy" style={{ color: "#34C759", textDecoration: "none" }}>Buy prices</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <span style={{ color: "#a9b6d0" }}>{brand.brand}</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.6px", color: "#eef1f7", lineHeight: 1.18, marginBottom: 14 }}>
          What to pay for {brand.brand} — resale buy-below prices
        </h1>

        <p style={{ fontSize: 15.5, color: "#a9b6d0", lineHeight: 1.75, marginBottom: 28 }}>{intro}</p>

        {/* Hero stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 32 }}>
          {[
            [fmtCountBuy(brand.sold_30d), "departures / 30 days"],
            [fmtEurBuy(brand.avg_price_eur), "avg price at exit"],
            [String(brand.categories.length), "categories tracked"],
          ].map(([v, l]) => (
            <div key={l} style={{ background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-ui, #1e2a3f)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#eef1f7" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Category breakdown table */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 14 }}>
            {brand.brand} buy-below by category
          </h2>
          <p style={{ fontSize: 13.5, color: "#8b99b8", marginBottom: 16, lineHeight: 1.6 }}>
            Buy-below is the maximum you should pay to achieve a ~45% gross margin after Vinted&apos;s
            selling fee and postage. It is derived from the average departure price — not from listed asking
            prices, which are wishes not facts. Use the free checker for a model-level verdict.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {brand.categories.map((cat) => {
              const sig = signalDisplay(cat.signal)
              return (
                <Link key={cat.slug} href={`/buy/${brand.slug}/${cat.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--color-surface, #131823)",
                    border: "1px solid var(--color-border-ui, #1e2a3f)",
                    borderRadius: 10,
                    padding: "14px 18px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    alignItems: "center",
                    gap: 16,
                  }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#eef1f7" }}>{cat.category}</div>
                      <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 2 }}>
                        {fmtCountBuy(cat.sold_30d)} sold / 30d
                        {cat.avg_days_to_sell != null && ` · ${cat.avg_days_to_sell}d to sell`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: "#5b6b8c" }}>avg exit</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#eef1f7" }}>{fmtEurBuy(cat.avg_price_eur)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, color: "#5b6b8c" }}>buy below</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#34C759" }}>{fmtEurBuy(cat.buy_below)}</div>
                    </div>
                    {cat.signal && (
                      <div style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6,
                        background: sig.bgColor, color: sig.color, whiteSpace: "nowrap",
                      }}>
                        {sig.label}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Buying guide section — unique content per brand */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>
            How to use these numbers when sourcing {brand.brand}
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            The buy-below is a starting point. Category demand tells you the category moves. It does not tell
            you whether <em>this</em> size, in <em>this</em> condition, at <em>this</em> exact listing price
            will move. The model-level checker fills that gap: it returns a BUY / WATCH / SKIP verdict with
            the buy-below for the specific model, the typical price at departure, and the sizes that sell fastest.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            A strong buy-below on a {topCat?.category ?? "category"} means little if you pay above it.
            Every cent you overpay above buy-below compresses margin. Set the buy-below as a hard ceiling
            when sourcing — not a guide.
          </p>
        </section>

        {/* Free verdict CTA */}
        <div style={{ padding: "22px 24px", background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-2, #1e3a2f)", borderRadius: 12, textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>
            Check a specific {brand.brand} item
          </div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "0 0 16px" }}>
            Get a model-level verdict with buy-below price, departure momentum and size analysis. First check is free.
          </p>
          <Link
            href={`/tools?q=${encodeURIComponent(brand.brand)}&src=buy`}
            style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}
          >
            Free check: {brand.brand} →
          </Link>
        </div>

        {/* Internal links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Link href={`/flip/${brand.slug}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → Is {brand.brand} worth reselling? (demand by category)
          </Link>
          <Link href="/buy" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → All brands buy-below prices
          </Link>
          <Link href="/methodology" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → How buy-below is calculated
          </Link>
        </div>

        <div style={{ marginTop: 28, fontSize: 12, color: "#3f4a63" }}>
          Data updated {BUY_DATA.generated_at}. Source: {BUY_DATA.source}. Threshold: {BUY_DATA.threshold}.
        </div>
      </div>
    </div>
  )
}
