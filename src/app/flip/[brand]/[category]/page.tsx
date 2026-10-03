import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import seo from "@/data/seo-brands.json"
import { listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers, categoryFigure, fmtEur } from "@/lib/market-numbers"
import {
  flipBrandCategoryTitle,
  flipBrandCategoryDescription,
  articleSocialMeta,
} from "@/lib/flip-category-meta"
import { FreshnessNotice } from "@/components/ui/freshness-notice"

import { withFittedMetadata } from "@/lib/meta-fit"
import { RelatedLinks } from "@/components/seo/related-links"
import { hasBuyPair } from "@/lib/related-links"
import { isRedirectedPath } from "@/lib/sitemap-redirects"
import { breadcrumbJsonLd } from "@/lib/breadcrumbs"
// Programmatic SEO: one page per brand x top-category, targeting
// "are <brand> <category> worth reselling on Vinted".
// Numbers come from the public market-snapshot API at render time (ISR), so the
// figures stay current without a redeploy. Exposure policy identical to /data:
// aggregate volumes only — never buy-below prices, scores or model names.
export const revalidate = 900

interface BrandSeo {
  brand: string
  slug: string
  sold_7d: number
  avg_price_eur: number
  top_categories: string[]
  categories: { category: string; sold_7d: number }[]
}
const BRANDS = seo.brands as BrandSeo[]

const catSlug = (c: string) =>
  c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export function generateStaticParams() {
  return BRANDS.flatMap((b) =>
    (b.categories || []).map((c) => ({ brand: b.slug, category: catSlug(c.category) }))
  )
}

function resolve(brandSlug: string, categorySlug: string) {
  const b = BRANDS.find((x) => x.slug === brandSlug)
  if (!b) return null
  const row = (b.categories || []).find((c) => catSlug(c.category) === categorySlug)
  if (!row) return null
  return { b, category: row.category, baselineSold: row.sold_7d }
}

async function generateMetadataRaw(
  { params }: { params: Promise<{ brand: string; category: string }> }
): Promise<Metadata> {
  const { brand, category } = await params
  const r = resolve(brand, category)
  if (!r) return { title: "Not found — Resale IQ" }
  const title = flipBrandCategoryTitle(r.b.brand, r.category)
  const description = flipBrandCategoryDescription({
    brand: r.b.brand,
    category: r.category,
    tracked: await listingsTrackedLabel(),
  })
  return articleSocialMeta(title, description, `/flip/${r.b.slug}/${category}`)
}

export default async function BrandCategoryPage(
  { params }: { params: Promise<{ brand: string; category: string }> }
) {
  const tracked = await listingsTrackedLabel()
  const { brand, category } = await params
  const r = resolve(brand, category)
  if (!r) notFound()
  const { b, category: catName } = r

  // Figures from the warehouse only. No `?? baselineSold`: that fell back to the
  // BUILD-TIME export, so a figure frozen months ago rendered as if it were
  // current with nothing on the page saying so. The warehouse has the last-good
  // snapshot behind it — a real measurement with a real timestamp — and when
  // even that has no row for this brand the honest answer is null, which the
  // prose and the stat cards below already handle.
  const market = await getMarketNumbers()
  const figures = market.get(b.brand)
  const catRow = categoryFigure(figures, catName)
  // The category's own average price at departure, when the snapshot has one.
  // The brand-wide average is a different number (Zara jeans EUR 63 against a
  // Zara average of EUR 36) and must never be labelled as the category's.
  const catAvg = catRow?.avg_price_eur ?? null
  const brandAvg = figures?.avg_price_eur ?? null
  // NO departure count on this page (founder decision 2026-10-02): a small
  // brand x category count reads as "only 6 of these sold" and costs trust. The
  // page leads with the price answer — what the category resells for — and
  // sends the reader to the exact model for the buy-below price.
  const answer = catAvg
    ? `${b.brand} ${catName} resell for about €${Math.round(catAvg)} in asking price at departure across the five main EU Vinted markets. ` +
      `Buy well below that: the buy-below that keeps a 30% margin depends on the exact model, size and condition, so check the specific item before you pay.`
    : brandAvg
      ? `The ${b.brand} brand average at departure is about €${Math.round(brandAvg)} across the five main EU Vinted markets. ` +
        `Buy well below the average for the item in your hands: the buy-below that keeps a 30% margin depends on the exact model, size and condition, so check it before you pay.`
      : `${b.brand} ${catName} is tracked across the five main EU Vinted markets. Check a specific model for its average price at departure and the buy-below price that keeps a 30% margin.`

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: `Are ${b.brand} ${catName} worth reselling on Vinted?`,
          acceptedAnswer: { "@type": "Answer", text: answer } },
        { "@type": "Question", name: `How much do ${b.brand} ${catName} sell for on Vinted?`,
          acceptedAnswer: { "@type": "Answer", text: catAvg || brandAvg
            ? `${catAvg ? `${b.brand} ${catName.toLowerCase()} average` : `${b.brand} items average (brand-wide)`} around €${Math.round((catAvg || brandAvg) as number)} in asking price at the moment listings left the shelf, across Spain, France, Germany, Italy and Portugal. ${catName} pricing varies by model, condition and size.`
            : `Prices vary by model, condition and size. Check listings that recently left the shelf rather than active ones, since active listings show hopeful asking prices, not the price at departure.` } },
      ],
    },
    breadcrumbJsonLd([
      ["Resale IQ", "/"],
      ["Brands", "/flip"],
      // A brand whose /flip/<slug> 308s to /flip is not a breadcrumb step.
      ...(isRedirectedPath(`/flip/${b.slug}`) ? [] : ([[b.brand, `/flip/${b.slug}`]] as const)),
      [catName, `/flip/${b.slug}/${catSlug(catName)}`],
    ]),
  ]

  const siblings = (b.categories || []).map((c) => c.category).filter((c) => c !== catName)

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          {isRedirectedPath(`/flip/${b.slug}`) ? (
            <Link href="/flip" style={{ color: "#34C759", textDecoration: "none" }}>Brands</Link>
          ) : (
            <Link href={`/flip/${b.slug}`} style={{ color: "#34C759", textDecoration: "none" }}>{b.brand}</Link>
          )}
        </div>

        <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} stale={market.stale} />

        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", lineHeight: 1.18, marginBottom: 14 }}>
          Are {b.brand} {catName} worth reselling on Vinted?
        </h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 24 }}>{answer}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 26 }}>
          {[
            catAvg
              ? [fmtEur(catAvg), `avg ${b.brand} ${catName.toLowerCase()} price at departure`]
              : [fmtEur(brandAvg), `${b.brand} brand average price at departure`],
            ["30%", "margin built into every buy-below price"],
          ].map(([v, l]) => (
            <div key={l} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#eef1f7" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <section style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>What decides whether it&apos;s profitable</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            Category demand tells you people are buying. It doesn&apos;t tell you whether <em>this</em> item, in <em>this</em> size,
            at <em>this</em> price, will make you money. Three things decide that: the buy-below price (the most you can pay
            for ~30% margin before fees), the sell-through rate for the specific model, and whether the size is one that actually moves.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            A strong category with the wrong size is still dead stock. That is why per-size demand matters as much as brand demand.
          </p>
        </section>

        <section style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>How to check before you buy</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            Look up the exact model rather than the category. Resale IQ returns a BUY / WATCH / SKIP verdict with the buy-below
            price, typical price at departure, departure momentum and the sizes that move fastest — computed from {tracked} listing records across
            Spain, France, Germany, Italy and Portugal.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            If you are new to this, the{" "}
            <Link href="/manual" style={{ color: "#34C759", textDecoration: "none" }}>reselling manual</Link>{" "}
            walks through the margin maths, the fee structure and the sourcing rules that decide whether a
            category like this is actually worth your money.
          </p>
        </section>

        <div style={{ padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Check a {b.brand} {catName}</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            See a live verdict on {b.brand} {catName} — buy-below is on a plan.
          </p>
          <Link href={`/tools?q=${encodeURIComponent(b.brand + " " + catName)}&src=flip`} style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Try a live check — {b.brand} {catName} →
          </Link>
        </div>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 10, letterSpacing: "0.1px" }}>Keep reading</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href={`/category/${category}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → Which brands sell best in {catName}?
            </Link>
            {siblings.map((c) => (
              <Link key={c} href={`/flip/${b.slug}/${catSlug(c)}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
                → Are {b.brand} {c} worth reselling?
              </Link>
            ))}
            {hasBuyPair(b.slug, catSlug(catName)) && (
              <Link href={`/buy/${b.slug}/${catSlug(catName)}`} style={{ color: "#34C759", fontSize: 14, textDecoration: "none" }}>
                → What to pay for {b.brand} {catName} — buy-below price
              </Link>
            )}
            <Link href="/methodology" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ How these numbers are calculated</Link>
            <Link href="/tools" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ Analyze an item</Link>
            <Link href="/data" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ Full Vinted market data</Link>
          </div>
        </div>
        <RelatedLinks to={{ kind: "flip-cat", brand: b.slug, category: catSlug(catName) }} tracked={tracked} />
      </div>
    </div>
  )
}

// Length-fit title/description (<=60/<=160) for every variant this generator returns.
export const generateMetadata = withFittedMetadata(generateMetadataRaw)
