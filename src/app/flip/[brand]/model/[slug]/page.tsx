import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Lock, ArrowRight } from "lucide-react"
import { getMarketNumbers, fmtCount, fmtEur } from "@/lib/market-numbers"
import { getTeaserVerdict } from "@/lib/teaser-verdict"
import { FreshnessNotice } from "@/components/ui/freshness-notice"
import { HubFaq } from "@/components/seo/hub-faq"
import { MoneyCta } from "@/components/money-cta"
import { definedTermJsonLd, faqPageJsonLd } from "@/lib/faq-schema"
import { catSlug } from "@/lib/seo-categories"
import {
  getSeoModel,
  generateModelStaticParams,
  modelPageTitle,
  modelPageDescription,
  modelSocialMeta,
  modelPath,
  siblingModels,
  modelDemandParagraphs,
  modelFaqs,
  liveAnswerLead,
  isUsableVerdict,
  fmtBuyBelow,
  FREE_CHECK_QUERIES,
} from "@/lib/seo-models"
import { MODEL_MONEY_HREF } from "@/lib/money-cta"

export const revalidate = 900

const BASE = "https://resaleiq.dev"

export function generateStaticParams() {
  return generateModelStaticParams()
}

export async function generateMetadata(
  { params }: { params: Promise<{ brand: string; slug: string }> },
): Promise<Metadata> {
  const { brand, slug } = await params
  const m = getSeoModel(brand, slug)
  if (!m) return { title: "Model not found — Resale IQ" }
  const market = await getMarketNumbers()
  const live = m.freeCheck ? await getTeaserVerdict(m.query) : null
  const figures = market.get(m.brand)
  const description = modelPageDescription({
    model: m,
    sold: figures?.sold_7d,
    avg: figures?.avg_price_eur,
    live,
  })
  return modelSocialMeta(m, description)
}

export default async function ModelFlipPage(
  { params }: { params: Promise<{ brand: string; slug: string }> },
) {
  const { brand, slug } = await params
  const m = getSeoModel(brand, slug)
  if (!m) notFound()

  const market = await getMarketNumbers()
  const figures = market.get(m.brand)
  const live = m.freeCheck ? await getTeaserVerdict(m.query) : null
  const siblings = siblingModels(m)
  const paras = modelDemandParagraphs(m, figures, siblings)
  const faqs = modelFaqs({
    model: m,
    live,
    sold: figures?.sold_7d ?? null,
    avg: figures?.avg_price_eur ?? null,
  })
  const cite = liveAnswerLead(m.query, live)
  const usable = isUsableVerdict(live)

  const jsonLd = [
    faqPageJsonLd(faqs),
    definedTermJsonLd({
      name: "Buy-below price",
      description:
        "A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees. Resale IQ models it as average asking price at departure × 0.95 × 0.70.",
      url: `${BASE}${modelPath(m)}`,
    }),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: BASE },
        { "@type": "ListItem", position: 2, name: "Brands", item: `${BASE}/flip` },
        { "@type": "ListItem", position: 3, name: m.brand, item: `${BASE}/flip/${m.brandSlug}` },
        { "@type": "ListItem", position: 4, name: m.query, item: `${BASE}${modelPath(m)}` },
      ],
    },
  ]

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href={`/flip/${m.brandSlug}`} style={{ color: "#34C759", textDecoration: "none", fontSize: 13 }}>
        ← {m.brand} on Vinted
      </Link>

      <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} stale={market.stale} />

      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", margin: "22px 0 10px", lineHeight: 1.2 }}>
        {modelPageTitle(m).replace(" — Resale IQ", "")}
      </h1>

      {cite ? (
        <p data-testid="riq-model-live-cite" style={{ color: "#eef1f7", fontSize: 17, lineHeight: 1.6, marginBottom: 18 }}>
          {cite}
        </p>
      ) : (
        <p style={{ color: "#8b99b8", fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>
          {m.freeCheck
            ? `Know what sells. Decide whether to buy ${m.query}. The free sample returns BUY, WATCH or SKIP and buy-below when the live check is up.`
            : `Know what sells. Decide whether to buy ${m.query}. Item-level BUY, WATCH or SKIP and buy-below start at Starter €19 a month — this is not a free check.`}
        </p>
      )}

      {usable ? (
        <div
          data-testid="riq-model-verdict"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-ui)",
            borderRadius: 12,
            padding: 22,
            marginBottom: 22,
          }}
        >
          <div style={{ fontSize: 11, color: "#5b6b8c", marginBottom: 6 }}>Live sample · ES/FR/DE/IT/PT</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#eef1f7", letterSpacing: "-0.4px" }}>{live.verdict}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#34C759", margin: "8px 0 14px" }}>
            Buy-below {fmtBuyBelow(live.buy_below)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#5b6b8c" }}>Watched departures / 7d</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7" }}>{fmtCount(live.sold_7d)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#5b6b8c" }}>Still listed</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7" }}>{fmtCount(live.active_listings)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#5b6b8c" }}>Avg at departure</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7" }}>{fmtEur(live.sell_avg)}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#8b99b8", marginTop: 12, lineHeight: 1.55 }}>
            Sell-through is withheld on public pages. Raw watched departures and still-listed counts stay.
            Other models need Starter at €19 a month.
          </p>
        </div>
      ) : m.freeCheck ? null : (
        <div
          data-testid="riq-model-paywall"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-ui)",
            borderRadius: 12,
            padding: 22,
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Lock size={15} style={{ color: "#FF9F0A" }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7" }}>
              BUY / WATCH / SKIP for {m.query}
            </span>
          </div>
          <p style={{ color: "#8b99b8", fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
            The free sample is {FREE_CHECK_QUERIES.join(", ")}. {m.query} unlocks with Starter at €19 a month:
            the verdict, the buy-below, and how many watched departures sit behind it. Weekly {m.brand} volumes
            stay public.
          </p>
          <Link
            href={MODEL_MONEY_HREF}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "#34C759",
              color: "#06090c",
              fontWeight: 700,
              fontSize: 14,
              padding: "11px 18px",
              borderRadius: 9,
              textDecoration: "none",
            }}
          >
            Get the numbers → <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {paras.map((p, i) => (
        <p key={i} style={{ color: "#a9b6d0", fontSize: 15, lineHeight: 1.7, marginBottom: 14, maxWidth: 680 }}>
          {p}
        </p>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, margin: "8px 0 28px" }}>
        {[
          ["Brand left shelf / week", fmtCount(figures?.sold_7d)],
          ["Brand avg at exit", fmtEur(figures?.avg_price_eur)],
          ["Category", m.category],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#5b6b8c", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#eef1f7" }}>{value}</div>
          </div>
        ))}
      </div>

      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 22 }}>
        <Link href="/glossary/buy-below-market" style={{ color: "#34C759", textDecoration: "none" }}>Buy-below</Link>
        {" · "}
        <Link href="/glossary/vinted-demand" style={{ color: "#34C759", textDecoration: "none" }}>Watched departure</Link>
        {" · "}
        <Link href="/glossary/vinted-sell-through" style={{ color: "#34C759", textDecoration: "none" }}>Sell-through</Link>
        {" · "}
        <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>Market data</Link>
        {" · "}
        <Link href="/tools" style={{ color: "#34C759", textDecoration: "none" }}>Tools</Link>
        {" · "}
        <Link href="/pricing" style={{ color: "#34C759", textDecoration: "none" }}>Pricing</Link>
      </p>

      {m.freeCheck ? (
        <p style={{ marginBottom: 28 }}>
          <Link
            href={`/tools?q=${encodeURIComponent(m.query)}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "#34C759",
              color: "#06090c",
              fontWeight: 700,
              fontSize: 14,
              padding: "11px 18px",
              borderRadius: 9,
              textDecoration: "none",
            }}
          >
            Run the live check — {m.query} →
          </Link>
        </p>
      ) : (
        <MoneyCta href={MODEL_MONEY_HREF} secondaryHref="/tools" secondaryLabel="See the free sample models" />
      )}

      {siblings.length > 0 && (
        <>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
            Other {m.brand} models
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {siblings.map((s) => (
              <Link
                key={s.slug}
                href={modelPath(s)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                  fontSize: 14,
                  color: "#8fa3c4",
                  textDecoration: "none",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-ui)",
                  borderRadius: 9,
                  padding: "10px 14px",
                }}
              >
                <span>Should I buy {s.query} to resell?</span>
                <span style={{ fontSize: 12.5, color: "#5b6b8c", whiteSpace: "nowrap" }}>
                  {s.freeCheck ? "Free sample" : "Starter €19"}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
        Brand demand
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 6 }}>
        <Link href={`/flip/${m.brandSlug}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
          → Is {m.brand} worth reselling on Vinted?
        </Link>
        <Link href={`/flip/${m.brandSlug}/${catSlug(m.category)}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
          → Are {m.brand} {m.category.toLowerCase()} worth reselling?
        </Link>
        <Link href="/flip" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
          → What sells best on Vinted
        </Link>
      </div>

      <HubFaq items={faqs} />
    </main>
  )
}
