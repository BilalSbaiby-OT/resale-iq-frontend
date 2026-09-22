import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  BUY_DATA,
  getBuyBrand,
  getBuyPair,
  BUY_BATCH1_SLUGS,
  fmtEurBuy,
  fmtCountBuy,
  signalDisplay,
  catSlug,
} from "@/lib/buy-data"

export const revalidate = 3600

// Batch 1: top-20 pairs only. See BUY_BATCH1_SLUGS in lib/buy-data.ts for rationale.
export function generateStaticParams() {
  return BUY_DATA.brands.flatMap((b) =>
    b.categories
      .filter((c) => BUY_BATCH1_SLUGS.has(`${b.slug}/${c.slug}`))
      .map((c) => ({ brand: b.slug, category: c.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; category: string }>
}): Promise<Metadata> {
  const { brand: brandSlug, category: catSlugParam } = await params
  const pair = getBuyPair(brandSlug, catSlugParam)
  if (!pair) return { title: "Not found — Resale IQ" }

  const { brand, cat } = pair
  const title = `What to Pay for ${brand.brand} ${cat.category} — Buy-Below Price | ResaleIQ`
  const description =
    `${brand.brand} ${cat.category}: ${fmtCountBuy(cat.sold_30d)} departed in 30 days on Vinted. ` +
    `Average exit price ${fmtEurBuy(cat.avg_price_eur)} — buy below ${fmtEurBuy(cat.buy_below)} to hit a 30% gross margin after Vinted fees. ` +
    `Real sold data, not supply counts.`

  return {
    title,
    description,
    alternates: { canonical: `https://resaleiq.dev/buy/${brand.slug}/${cat.slug}` },
    openGraph: { title, description, url: `https://resaleiq.dev/buy/${brand.slug}/${cat.slug}` },
  }
}

export default async function BuyBrandCategoryPage({
  params,
}: {
  params: Promise<{ brand: string; category: string }>
}) {
  const { brand: brandSlug, category: catSlugParam } = await params
  const pair = getBuyPair(brandSlug, catSlugParam)
  if (!pair) notFound()

  const { brand, cat } = pair
  const sig = signalDisplay(cat.signal)

  // Self-contained 134-167 word answer block (GEO / AI citation optimised)
  const directAnswer =
    `${brand.brand} ${cat.category} had ${fmtCountBuy(cat.sold_30d)} confirmed departures on Vinted in the last 30 days ` +
    `across Spain, France, Germany, Italy and Portugal. ` +
    `The average price at departure was ${fmtEurBuy(cat.avg_price_eur)}` +
    (cat.median_price_eur ? ` (median ${fmtEurBuy(cat.median_price_eur)})` : "") +
    `. To hit a 30% gross margin after a 5% Vinted fee, ` +
    `buy below ${fmtEurBuy(cat.buy_below)}. ` +
    (cat.avg_days_to_sell != null
      ? `Items sell in about ${cat.avg_days_to_sell} days on average. `
      : "") +
    (cat.active_listings != null
      ? `There are currently about ${fmtCountBuy(cat.active_listings)} active ${brand.brand} ${cat.category} listings — ` +
        `but active listings are supply, not demand. The ${fmtCountBuy(cat.sold_30d)} departures are what matters. `
      : "") +
    (cat.signal ? `Demand signal: ${cat.signal}.` : "")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What should I pay for ${brand.brand} ${cat.category} to resell on Vinted?`,
          acceptedAnswer: { "@type": "Answer", text: directAnswer },
        },
        {
          "@type": "Question",
          name: `How much do ${brand.brand} ${cat.category} sell for on Vinted?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              `${brand.brand} ${cat.category} sell for an average of ${fmtEurBuy(cat.avg_price_eur)} at departure` +
              (cat.median_price_eur ? `, with a median of ${fmtEurBuy(cat.median_price_eur)}` : "") +
              `. This is the price at which listings leave the shelf — not the hopeful asking price of active listings, which is typically higher. ` +
              (cat.avg_days_to_sell != null ? `On average items sell in ${cat.avg_days_to_sell} days.` : ""),
          },
        },
        {
          "@type": "Question",
          name: `Is ${brand.brand} ${cat.category} worth buying to resell?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              cat.signal === "STRONG BUY" || cat.signal === "BUY"
                ? `Yes — the demand signal for ${brand.brand} ${cat.category} is ${cat.signal} based on sell-through rate, ` +
                  `listing saturation and departure momentum from real Vinted data. ` +
                  `With ${fmtCountBuy(cat.sold_30d)} departures in the last 30 days, the category shows consistent demand. ` +
                  `Use the free model checker to confirm the specific item you are considering before buying.`
                : cat.signal === "AVOID"
                ? `With care. The demand signal is ${cat.signal} — the category sees ${fmtCountBuy(cat.sold_30d)} departures per month but the sell-through rate or saturation level suggests caution. ` +
                  `Check specific models rather than buying on category-level data alone.`
                : `${brand.brand} ${cat.category} has ${fmtCountBuy(cat.sold_30d)} departures in the last 30 days. ` +
                  `Whether it is worth buying depends on the specific model, condition and the price. Use the free checker below.`,
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${brand.brand} ${cat.category} — Vinted resale market data`,
      description: directAnswer,
      url: `https://resaleiq.dev/buy/${brand.slug}/${cat.slug}`,
      dateModified: BUY_DATA.generated_at,
      creator: { "@type": "Organization", name: "ResaleIQ" },
      variableMeasured: [
        { "@type": "PropertyValue", name: "Departures 30 days", value: cat.sold_30d },
        { "@type": "PropertyValue", name: "Average departure price EUR", value: cat.avg_price_eur },
        { "@type": "PropertyValue", name: "Buy below EUR", value: cat.buy_below },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
        { "@type": "ListItem", position: 2, name: "Buy prices", item: "https://resaleiq.dev/buy" },
        { "@type": "ListItem", position: 3, name: brand.brand, item: `https://resaleiq.dev/buy/${brand.slug}` },
        { "@type": "ListItem", position: 4, name: cat.category, item: `https://resaleiq.dev/buy/${brand.slug}/${cat.slug}` },
      ],
    },
  ]

  // Sibling categories for internal linking
  const siblings = brand.categories.filter((c) => c.slug !== cat.slug)

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
          <Link href={`/buy/${brand.slug}`} style={{ color: "#34C759", textDecoration: "none" }}>{brand.brand}</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <span style={{ color: "#a9b6d0" }}>{cat.category}</span>
        </div>

        {/* Signal badge */}
        {cat.signal && cat.signal !== "AVOID" && (
          <div style={{ marginBottom: 14 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
              background: sig.bgColor, color: sig.color,
            }}>
              {sig.label}
            </span>
          </div>
        )}

        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.5px", color: "#eef1f7", lineHeight: 1.2, marginBottom: 14 }}>
          What to pay for {brand.brand} {cat.category} — resale buy-below
        </h1>

        {/* GEO-optimised direct answer — first 60 words */}
        <p style={{ fontSize: 15.5, color: "#a9b6d0", lineHeight: 1.75, marginBottom: 24 }}>
          {directAnswer}
        </p>

        {/* Key stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
          {[
            [fmtCountBuy(cat.sold_30d), "departed / 30 days"],
            [fmtEurBuy(cat.avg_price_eur), "avg exit price"],
            [fmtEurBuy(cat.buy_below), "buy below (30% margin)"],
            ...(cat.avg_days_to_sell != null ? [[`${cat.avg_days_to_sell}d`, "avg days to sell"]] : []),
          ].map(([v, l]) => (
            <div key={l} style={{ background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-ui, #1e2a3f)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: l === "buy below (30% margin)" ? "#34C759" : "#eef1f7" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Supply vs demand explainer */}
        {cat.active_listings != null && (
          <section style={{ marginBottom: 24, padding: "16px 20px", background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-ui, #1e2a3f)", borderRadius: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>
              Supply vs demand — know the difference
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              There are about <strong style={{ color: "#eef1f7" }}>{fmtCountBuy(cat.active_listings)}</strong> active {brand.brand} {cat.category} listings right now.
              That is supply — what sellers <em>want</em> to sell. The number that matters for sourcing is the{" "}
              <strong style={{ color: "#34C759" }}>{fmtCountBuy(cat.sold_30d)}</strong> that actually left the shelf in
              the last 30 days. Demand is departures, not listings.
            </p>
          </section>
        )}

        {/* How buy-below works */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>
            How the buy-below is calculated
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            The buy-below of{" "}
            <strong style={{ color: "#34C759" }}>{fmtEurBuy(cat.buy_below)}</strong>{" "}
            is derived from the average departure price of{" "}
            <strong style={{ color: "#eef1f7" }}>{fmtEurBuy(cat.avg_price_eur)}</strong>.
            We apply a 5% Vinted platform fee and a 30% gross margin target — meaning the buy-below is 66.5% of the average exit price (avg × 0.95 × 0.70).
            This is the same formula used by the ResaleIQ verdict engine on every surface.
            It covers Vinted&apos;s selling fee while leaving a real margin for the reseller.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            The buy-below is a <em>category-level aggregate</em>. Individual items vary by model, size and
            condition. A premium size or a sought-after colourway may justify buying above the category
            buy-below — but only if the model-level check confirms it. Category data is the shortlist;
            model data is the decision.
          </p>
        </section>

        {/* Demand signal explanation */}
        {cat.signal && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>
              Demand signal: {cat.signal}
            </h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
              {cat.signal === "STRONG BUY" && `STRONG BUY means high sell-through rate, healthy departure momentum and low listing saturation relative to sales volume. This category is actively clearing. Buy-below discipline is still essential — overpaying into a hot category kills margin just as fast as buying into a cold one.`}
              {cat.signal === "BUY" && `BUY means the sell-through rate is positive and departure momentum is consistent. The category clears regularly. Whether the margin is worthwhile depends on the buy-below discipline and the specific model.`}
              {cat.signal === "MONITOR" && `MONITOR means the data shows some demand but the signal is mixed — either the sell-through rate is inconsistent, saturation is rising, or departure momentum is slowing. Worth tracking but exercise caution with large buys.`}
              {cat.signal === "AVOID" && `AVOID means the data shows this category is oversupplied relative to demand, or sell-through rate is below threshold. ${fmtCountBuy(cat.sold_30d)} items did depart in 30 days but the ratio of listings to sales is unfavourable. Consider other categories.`}
            </p>
          </section>
        )}

        {/* Free verdict CTA — leads to /tools, NOT /pricing */}
        <div style={{ padding: "22px 24px", background: "var(--color-surface, #131823)", border: "1px solid var(--color-border-2, #1e3a2f)", borderRadius: 12, textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>
            Check a specific {brand.brand} {cat.category} model
          </div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "0 0 16px" }}>
            Category buy-below gets you on the right shelf. Model-level check tells you whether to pull
            the trigger on <em>this</em> exact item. First check is free — no account required.
          </p>
          <Link
            href={`/tools?q=${encodeURIComponent(brand.brand + " " + cat.category)}&src=buy-cat`}
            style={{
              display: "inline-block",
              background: "#34C759",
              color: "#06090c",
              fontWeight: 700,
              fontSize: 14,
              padding: "11px 22px",
              borderRadius: 9,
              textDecoration: "none",
            }}
          >
            Free check: {brand.brand} {cat.category} →
          </Link>
        </div>

        {/* Internal linking — siblings + cross-brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {siblings.slice(0, 4).map((c) => (
            <Link key={c.slug} href={`/buy/${brand.slug}/${c.slug}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → What to pay for {brand.brand} {c.category}
            </Link>
          ))}
          <Link href={`/buy/${brand.slug}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → All {brand.brand} categories
          </Link>
          <Link href={`/flip/${brand.slug}/${catSlug(cat.category)}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → Are {brand.brand} {cat.category} worth reselling? (demand view)
          </Link>
          <Link href={`/buy/category/${catSlug(cat.category)}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → Best brands for {cat.category} resale
          </Link>
          <Link href="/methodology" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → How these numbers are calculated
          </Link>
          <Link href="/tools" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → Check any item free
          </Link>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: "#3f4a63" }}>
          Data updated {BUY_DATA.generated_at}. Source: {BUY_DATA.source}. Threshold: {BUY_DATA.threshold}.
        </div>
      </div>
    </div>
  )
}
