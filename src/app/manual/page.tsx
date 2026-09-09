import Link from "next/link"
import type { Metadata } from "next"
import { ALL_CHAPTERS, PARTS } from "@/data/manual"
import { CATEGORIES } from "@/lib/seo-categories"
import { getMarketNumbers, fmtCount } from "@/lib/market-numbers"

// Manual index. Deliberately a real table of contents rather than a landing
// page — this is the hub every chapter and every programmatic SEO page links
// back to, so it has to be genuinely navigable.
export const revalidate = 900

const BASE = "https://resaleiq.dev"

export const metadata: Metadata = {
  title: "The Vinted Reselling Manual — 16 chapters, free",
  description:
    "The operator's manual for reselling on Vinted: margin maths, buy-below pricing, sourcing, sizes, cashflow and the metrics that matter. Free, no signup.",
  alternates: { canonical: "/manual" },
  openGraph: {
    title: "The Vinted Reselling Manual — 16 chapters, free",
    description:
      "Margin maths, sourcing, pricing, sizes, cashflow and measurement — the full method, written from our own Vinted dataset.",
    type: "article",
  },
}

export default async function ManualIndex() {
  const market = await getMarketNumbers()
  const totalWeekly = market.sold7dTotal
  const brandCount = market.brandCount > 0 ? market.brandCount : null

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      name: "The Vinted Reselling Manual",
      url: `${BASE}/manual`,
      numberOfPages: ALL_CHAPTERS.length,
      author: { "@type": "Organization", name: "Resale IQ", url: BASE },
      publisher: { "@type": "Organization", name: "Resale IQ", url: BASE },
      isAccessibleForFree: true,
      inLanguage: "en",
      about: "Reselling secondhand clothing on Vinted",
      hasPart: ALL_CHAPTERS.map((c) => ({
        "@type": "Chapter",
        position: c.number,
        name: c.title,
        url: `${BASE}/manual/${c.slug}`,
        abstract: c.description,
      })),
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", textDecoration: "none", fontSize: 13 }}>← Resale IQ</Link>

        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#eef1f7", lineHeight: 1.15, margin: "22px 0 14px" }}>
          The Vinted Reselling Manual
        </h1>
        <p style={{ fontSize: 17, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 16 }}>
          Sixteen chapters on how resale actually works: the margin equation, how to derive a maximum buy
          price, why fast stock beats fat margins, where stock comes from, how sizes quietly kill portfolios,
          and how to measure whether any of it is working. Free, no signup, no email.
        </p>
        <p style={{ fontSize: 15, color: "#8b99b8", lineHeight: 1.7, marginBottom: 30 }}>
          It is written from the same dataset that powers the product —{" "}
          {totalWeekly != null ? (
            <>
              <strong style={{ color: "#eef1f7" }}>{fmtCount(totalWeekly)} items we watched leave the shelf in the last seven days</strong>{" "}
              across {brandCount != null ? brandCount : "our"} tracked brands on Vinted ES, FR, DE, IT and PT
            </>
          ) : (
            <>live watched-departure data across tracked brands on Vinted ES, FR, DE, IT and PT</>
          )}
          {" "}— so the claims about how the market behaves are grounded in the dataset, with its limits named.
        </p>

        {PARTS.map((part, pi) => {
          const chapters = ALL_CHAPTERS.filter((c) => c.part === part.name)
          if (chapters.length === 0) return null
          return (
            <section key={part.name} style={{ marginBottom: 34 }}>
              <h2 style={{ fontSize: 12, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 700, margin: "0 0 4px" }}>
                Part {pi + 1} — {part.name}
              </h2>
              <p style={{ fontSize: 14, color: "#5b6b8c", marginBottom: 14 }}>{part.blurb}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {chapters.map((c) => (
                  <Link key={c.slug} href={`/manual/${c.slug}`} style={{
                    display: "block", textDecoration: "none",
                    background: "#12151d", border: "1px solid #1c2333",
                    borderRadius: 11, padding: "15px 18px",
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>
                        {String(c.number).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7" }}>{c.title}</span>
                      <span style={{ fontSize: 12, color: "#5b6b8c", marginLeft: "auto" }}>{c.minutes} min</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.6, marginTop: 6 }}>{c.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        <div style={{ padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, marginBottom: 30 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>
            The manual gives you the method. The data gives you a signal.
          </div>
          <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.65, marginBottom: 16 }}>
            Chapter 2 shows you how to derive a maximum buy price. Doing it by hand for every model across
            five markets is the part that does not scale — that is what Resale IQ computes for you.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href="/tools/vinted-price-checker" style={{ display: "inline-block", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              Free price checker →
            </Link>
            <Link href="/data" style={{ display: "inline-block", background: "transparent", color: "#8fa3c4", border: "1px solid #1c2333", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              Market data
            </Link>
            <Link href="/pricing?src=manual_index" style={{ display: "inline-block", background: "transparent", color: "#8fa3c4", border: "1px solid #1c2333", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              See plans & pricing
            </Link>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 12.5, color: "#5b6b8c", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Category rankings
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} style={{
                fontSize: 13, color: "#a9b6d0", textDecoration: "none",
                background: "#12151d", border: "1px solid #1c2333",
                borderRadius: 8, padding: "7px 12px",
              }}>
                Best brands for {c.category.toLowerCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
