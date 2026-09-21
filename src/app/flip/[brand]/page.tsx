import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BRANDS, catSlug, type BrandSeo } from "@/lib/seo-categories"
import { Lock, TrendingUp, ArrowRight } from "lucide-react"
import { listingsTrackedLabel } from "@/lib/stats"
import { brandNarrative } from "@/lib/flip-narrative"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import {
  flipBrandTitle,
  flipBrandDescription,
  articleSocialMeta,
} from "@/lib/flip-category-meta"
import { FreshnessNotice } from "@/components/ui/freshness-notice"
import { HubFaq } from "@/components/seo/hub-faq"
import { faqPageJsonLd } from "@/lib/faq-schema"
import { modelsForBrand, modelPath, brandHubFaqs } from "@/lib/seo-models"
import { BRAND_MONEY_HREF } from "@/lib/money-cta"

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
  const live = (await getMarketNumbers()).get(b.brand)
  const title = flipBrandTitle(b.brand)
  const description = flipBrandDescription({
    brand: b.brand,
    sold: live?.sold_7d,
    avg: live?.avg_price_eur,
  })
  return articleSocialMeta(title, description, `/flip/${b.slug}`)
}

export default async function BrandFlipPage(
  { params }: { params: Promise<{ brand: string }> }
) {
  const tracked = await listingsTrackedLabel()
  const { brand: slug } = await params
  const b = getBrand(slug)
  if (!b) notFound()

  const market = await getMarketNumbers()
  const live = market.get(b.brand)
  const sold = live?.sold_7d ?? null
  const avg = live?.avg_price_eur ?? null
  const modelsTracked = live?.models_tracked ?? null
  const cats = live?.categories ?? []

  const others = BRANDS.filter(x => x.slug !== b.slug).slice(0, 12)
  const seoModels = modelsForBrand(b.slug)
  const freeModels = seoModels.filter((m) => m.freeCheck)
  const faqs = brandHubFaqs({
    brand: b.brand,
    brandSlug: b.slug,
    sold,
    avg,
    freeModels,
  })

  const overlay: BrandSeo | null = live && sold != null && avg != null
    ? {
        ...b,
        sold_7d: sold,
        avg_price_eur: avg,
        models_tracked: modelsTracked ?? b.models_tracked,
        top_categories: live.top_categories.length ? live.top_categories : b.top_categories,
        categories: cats
          .filter(c => c.sold_7d != null)
          .map(c => ({
            category: c.category,
            sold_7d: c.sold_7d as number,
            avg_price_eur: c.avg_price_eur ?? undefined,
          })),
      }
    : null

  // Structured data helps this rank as an answer to "is X worth reselling".
  // FAQPage strings match HubFaq — schema-only answers are a rich-result reject.
  const jsonLd = [
    faqPageJsonLd(faqs),
  // Breadcrumbs need a hub that resolves; /flip only started returning 200 on
  // 2026-08-29, so this could not have been correct before that.
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
      { "@type": "ListItem", position: 2, name: "Brands", item: "https://resaleiq.dev/flip" },
      { "@type": "ListItem", position: 3, name: b.brand, item: `https://resaleiq.dev/flip/${b.slug}` },
    ],
  }]

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/" style={{ color: "#34C759", textDecoration: "none", fontSize: 13 }}>
        ← Resale IQ
      </Link>

      <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} stale={market.stale} />

      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", margin: "22px 0 10px", lineHeight: 1.2 }}>
        Is {b.brand} worth reselling on Vinted in 2026?
      </h1>
      <p style={{ color: "#8b99b8", fontSize: 15, lineHeight: 1.6, marginBottom: 26 }}>
        {sold != null ? (
          <>
            Short answer: {b.brand} moves serious volume — about{" "}
            <strong style={{ color: "#eef1f7" }}>{fmtCount(sold)} watched departures a week</strong>{" "}
            across the five main EU Vinted markets
            {avg != null ? (
              <>
                , at an average price at departure of{" "}
                <strong style={{ color: "#eef1f7" }}>{fmtEur(avg)}</strong>
              </>
            ) : null}
            . But volume alone doesn&apos;t make you money — the margin depends entirely on which model you buy and
            what you pay for it.
          </>
        ) : freeModels.length > 0 ? (
          <>
            Short answer: check{" "}
            {freeModels.map((fm, i) => (
              <span key={fm.slug}>
                {i > 0 ? (i === freeModels.length - 1 ? " or " : ", ") : null}
                <Link href={modelPath(fm)} style={{ color: "#34C759" }}>{fm.query}</Link>
              </span>
            ))}
            {" "}before you buy to resell. That named model is a free sample — BUY / WATCH / SKIP
            and the most to pay after fees. Other {b.brand} models need Starter at €19/month.
          </>
        ) : (
          <>
            Short answer: we track {b.brand} across the five main EU Vinted markets. Live weekly volume
            is not on this snapshot — check a specific model rather than trusting a frozen brand average.
          </>
        )}
      </p>

      {overlay
        ? brandNarrative(overlay).map((para, i) => (
            <p key={i} style={{ color: "#a9b6d0", fontSize: 15, lineHeight: 1.7, marginBottom: 14, maxWidth: 680 }}>
              {para}
            </p>
          ))
        : null}

      {/* Public aggregates */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          ["Left shelf per week", fmtCount(sold)],
          ["Avg price at exit", fmtEur(avg)],
          ["Models tracked", modelsTracked != null ? String(modelsTracked) : "—"],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#5b6b8c", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#eef1f7" }}>{value}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
        Weekly {b.brand} velocity
      </h2>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
        {sold != null ? (
          <>
            About{" "}
            <strong style={{ color: "#eef1f7" }}>{fmtCount(sold)} watched departures</strong>
            {" "}this week across Spain, France, Germany, Italy and Portugal
            {avg != null ? (
              <>
                , at{" "}
                <strong style={{ color: "#eef1f7" }}>{fmtEur(avg)}</strong>
                {" "}average asking price at departure
              </>
            ) : null}
            . That is brand demand — not a sell-through rate and not a buy-below.
          </>
        ) : (
          <>
            Live weekly volume is not on this snapshot — an em-dash means missing, not zero.
          </>
        )}{" "}
        Full ranking on{" "}
        <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>weekly brand volumes</Link>
        . Definitions:{" "}
        <Link href="/glossary/watched-departure" style={{ color: "#34C759", textDecoration: "none" }}>watched departure</Link>
        {" · "}
        <Link href="/glossary/sell-through" style={{ color: "#34C759", textDecoration: "none" }}>sell-through</Link>
        {" · "}
        <Link href="/glossary/buy-below" style={{ color: "#34C759", textDecoration: "none" }}>buy-below</Link>.
      </p>

      <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
        What {b.brand} sells for, by category
      </h2>
      {/* THIS TABLE IS WHY THE PAGE EXISTS. Measured 2026-08-13, these pages
          were 95-98% identical to each other: the template had three variables
          and the rest was prose shared by all 156 brands. Numbers a reader can
          only get here are what makes the page worth indexing — and worth
          reading. Keep per-brand data ABOVE the generic explanation. */}
      <div style={{ border: "1px solid var(--color-border-ui)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "9px 14px", background: "var(--color-surface)", fontSize: 11, color: "#5b6b8c" }}>
          <span>Category</span><span style={{ textAlign: "right" }}>Left shelf/week</span><span style={{ textAlign: "right", minWidth: 62 }}>Avg price</span>
        </div>
        {(cats.length ? cats : []).slice(0, 5).map(c => (
          <div key={c.category} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "10px 14px", borderTop: "1px solid var(--color-border-ui)", fontSize: 14, color: "#a9b6d0" }}>
            <span style={{ color: "#eef1f7" }}>{c.category}</span>
            <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtCount(c.sold_7d)}</span>
            <span style={{ textAlign: "right", minWidth: 62, fontVariantNumeric: "tabular-nums", color: c.avg_price_eur ? "#34d399" : "#5b6b8c" }}>
              {fmtEur(c.avg_price_eur)}
            </span>
          </div>
        ))}
      </div>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 12 }}>
        {cats[0] && cats[0].avg_price_eur != null && cats[0].sold_7d != null ? (
          <>
            {b.brand} {cats[0].category.toLowerCase()} leave the shelf at about{" "}
            <strong style={{ color: "#eef1f7" }}>{fmtEur(cats[0].avg_price_eur)}</strong>, on{" "}
            <strong style={{ color: "#eef1f7" }}>{fmtCount(cats[0].sold_7d)}</strong> watched departures a week.
            Work backwards from that price, not from what the seller is asking.
          </>
        ) : (
          <>Volume alone does not pay you. What you pay does.</>
        )}
      </p>

      {/* Every brand x category page must be linked from here. An unlinked page
          is an unreachable page — the same failure mode as a route with no UI. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {(cats.length
          ? cats
          : (b.categories || []).map(c => ({ category: c.category, sold_7d: null as number | null, avg_price_eur: null as number | null }))
        ).map(c => (
          <Link key={c.category} href={`/flip/${b.slug}/${catSlug(c.category)}`} style={{
            display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline",
            fontSize: 14, color: "#8fa3c4", textDecoration: "none",
            background: "var(--color-surface)", border: "1px solid var(--color-border-ui)",
            borderRadius: 9, padding: "10px 14px",
          }}>
            <span>Are {b.brand} {c.category} worth reselling?</span>
            <span style={{ fontSize: 12.5, color: "#5b6b8c", whiteSpace: "nowrap" }}>
              {fmtCount(c.sold_7d)}/wk
            </span>
          </Link>
        ))}
      </div>

      {seoModels.length > 0 ? (
        <>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
            {b.brand} models to check before you buy
          </h2>
          <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 12 }}>
            Brand demand tells you {b.brand} is moving. The buy decision is the named model.
            Free sample models show BUY / WATCH / SKIP here. Everything else is Starter at €19 a month — not a free check.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {seoModels.map((m) => (
              <Link
                key={m.slug}
                href={modelPath(m)}
                style={{
                  display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline",
                  fontSize: 14, color: "#8fa3c4", textDecoration: "none",
                  background: "var(--color-surface)", border: "1px solid var(--color-border-ui)",
                  borderRadius: 9, padding: "10px 14px",
                }}
              >
                <span>Should I buy {m.query} to resell?</span>
                <span style={{ fontSize: 12.5, color: "#5b6b8c", whiteSpace: "nowrap" }}>
                  {m.freeCheck ? "Free sample" : "Starter €19"}
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      {/* The gate — this is the paid product */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: 22, margin: "26px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Lock size={15} style={{ color: "#FF9F0A" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7" }}>
            The part that makes you money
          </span>
        </div>
        <p style={{ color: "#8b99b8", fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
          Averages don&apos;t tell you what to buy. Resale IQ tracks{" "}
          {b.brand} models{" "}
          {modelsTracked != null ? `(${modelsTracked} with enough sales to show figures)` : "we track"}{" "}
          individually and gives you:
        </p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {[
            "Max buy price per model — the number that targets a healthy margin after fees",
            "Sell-through rate — how fast each model actually moves",
            // "which models are heating up" was a trend claim. Momentum is a
            // percentile rank of each model's recent share of its own watched
            // departures against the rest of the board — see app-copy.ts.
            "Momentum — where each model ranks against the rest of the board on recent sales share",
            "The exact sizes that sell fastest",
          ].map(t => (
            <li key={t} style={{ display: "flex", gap: 8, color: "#a9b6d0", fontSize: 13.5, lineHeight: 1.5 }}>
              <TrendingUp size={14} style={{ color: "#34C759", flexShrink: 0, marginTop: 3 }} />
              {t}
            </li>
          ))}
        </ul>
          {freeModels[0] ? (
            <Link href={modelPath(freeModels[0])} style={{
              display: "inline-flex", alignItems: "center", gap: 7, background: "#34C759",
              color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 18px",
              borderRadius: 9, textDecoration: "none",
            }}>
              Check {freeModels[0].query} — free sample → <ArrowRight size={15} />
            </Link>
          ) : (
            <Link href={BRAND_MONEY_HREF} style={{
              display: "inline-flex", alignItems: "center", gap: 7, background: "#34C759",
              color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 18px",
              borderRadius: 9, textDecoration: "none",
            }}>
              Get the numbers → <ArrowRight size={15} />
            </Link>
          )}
        <Link href="/pricing?src=flip" style={{
          display: "inline-flex", alignItems: "center", gap: 7, marginLeft: 10,
          color: "#8fa3c4", fontWeight: 600, fontSize: 14, textDecoration: "none",
        }}>
          or see plans
        </Link>
        <p style={{ fontSize: 11.5, color: "#5b6b8c", marginTop: 10 }}>
          <Link href="/pricing?src=flip" style={{ color: "#5b6b8c", textDecoration: "underline" }}>From €19/month. Cancel anytime.</Link>
        </p>
      </div>

      <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
        How we get these numbers
      </h2>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
        We continuously track live listings across Vinted ES, FR, DE, IT and PT, and watch which ones leave the shelf —
        {tracked} unique listings — and recompute every signal roughly every 2 hours. The figures on this page are
        live aggregates, not estimates. Last calculated {market.stamp ?? "—"}.{" "}
        <Link href="/methodology" style={{ color: "#34C759", textDecoration: "none" }}>Methodology</Link>
        {" · "}
        <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>Market data</Link>
        {" · "}
        <Link href="/tools" style={{ color: "#34C759", textDecoration: "none" }}>Analyze an item</Link>.
      </p>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
        For how to turn figures like these into a buy decision, the{" "}
        <Link href="/manual" style={{ color: "#34C759", textDecoration: "none" }}>reselling manual</Link>
        {" "}and the{" "}
        <Link href="/glossary" style={{ color: "#34C759", textDecoration: "none" }}>glossary</Link>{" "}
        cover the margin maths, the maximum buy price and why sell-through matters more than volume.
      </p>

      {/* Reciprocal links into the guides. The blog holds 84% of the site's
          impressions (GSC 2026-07-30..08-26) and now links out to these data
          pages; linking back completes the loop instead of dead-ending, and
          gives a reader who has the number but not the method somewhere to go. */}
      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
        How to use these numbers
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 6 }}>
        <Link href="/blog/how-to-price-items-on-vinted" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
          → How to price items on Vinted without underselling
        </Link>
        <Link href="/blog/how-to-find-items-to-flip-on-vinted" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
          → How to find profitable items to flip
        </Link>
        <Link href="/blog/what-is-a-good-sell-through-rate" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
          → What counts as a good sell-through rate
        </Link>
      </div>

      <HubFaq items={faqs} />

      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "28px 0 12px" }}>
        Other brands
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {others.map(o => (
          <Link key={o.slug} href={`/flip/${o.slug}`} style={{
            fontSize: 13, color: "#a9b6d0", textDecoration: "none",
            background: "var(--color-surface)", border: "1px solid var(--color-border-ui)",
            borderRadius: 8, padding: "7px 12px",
          }}>
            {o.brand}
          </Link>
        ))}
      </div>
    </main>
  )
}
