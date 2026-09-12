import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ALL_CHAPTERS, getChapter } from "@/data/manual"
import { getMarketNumbers, fmtCount } from "@/lib/market-numbers"
import { SmartCTA } from "@/components/smart-cta"

// One page per manual chapter. Static prose — the chapters teach method, which
// does not change week to week — plus a live data strip pulled from the public
// market snapshot so the page is never stale on the one thing that does change.
export const revalidate = 900

const BASE = "https://resaleiq.dev"

export function generateStaticParams() {
  return ALL_CHAPTERS.map((c) => ({ chapter: c.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ chapter: string }> }
): Promise<Metadata> {
  const { chapter } = await params
  const c = getChapter(chapter)
  if (!c) return { title: "Not found — Resale IQ" }
  const title = `${c.title} — The Vinted Reselling Manual`
  return {
    title,
    description: c.description,
    alternates: { canonical: `/manual/${c.slug}` },
    openGraph: { title, description: c.description, type: "article" },
  }
}

export default async function ChapterPage(
  { params }: { params: Promise<{ chapter: string }> }
) {
  const { chapter } = await params
  const c = getChapter(chapter)
  if (!c) notFound()

  const idx = ALL_CHAPTERS.findIndex((x) => x.slug === c.slug)
  const prev = idx > 0 ? ALL_CHAPTERS[idx - 1] : null
  const next = idx < ALL_CHAPTERS.length - 1 ? ALL_CHAPTERS[idx + 1] : null

  const market = await getMarketNumbers()
  const totalWeekly = market.sold7dTotal

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: c.title,
      description: c.description,
      articleSection: c.part,
      isPartOf: {
        "@type": "Book",
        name: "The Vinted Reselling Manual",
        url: `${BASE}/manual`,
      },
      author: { "@type": "Organization", name: "Resale IQ", url: BASE },
      publisher: { "@type": "Organization", name: "Resale IQ", url: BASE },
      mainEntityOfPage: `${BASE}/manual/${c.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Reselling manual", item: `${BASE}/manual` },
        { "@type": "ListItem", position: 2, name: c.part },
        { "@type": "ListItem", position: 3, name: c.title, item: `${BASE}/manual/${c.slug}` },
      ],
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 20 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href="/manual" style={{ color: "#34C759", textDecoration: "none" }}>Reselling manual</Link>
        </div>

        <div style={{ fontSize: 12, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
          Chapter {c.number} · {c.part} · {c.minutes} min read
        </div>
        <h1 style={{ fontSize: 33, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", lineHeight: 1.18, marginBottom: 16 }}>
          {c.title}
        </h1>
        <p style={{ fontSize: 17, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 30 }}>{c.intro}</p>

        {c.sections.map((s) => (
          <section key={s.h2} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: "#eef1f7", marginBottom: 12 }}>{s.h2}</h2>
            {s.body.map((p, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.78, marginBottom: 14 }}>{p}</p>
            ))}
            {s.list && (
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, margin: "4px 0 14px" }}>
                {s.list.map((li) => (
                  <li key={li} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.6, color: "#a9b6d0" }}>
                    <span style={{ color: "#34C759", flexShrink: 0 }}>—</span>
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.callout && (
              <div style={{ background: "var(--color-surface)", borderLeft: "3px solid #34C759", borderRadius: "0 10px 10px 0", padding: "14px 18px", margin: "6px 0 4px" }}>
                <div style={{ fontSize: 11.5, color: "#34C759", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700, marginBottom: 6 }}>
                  {s.callout.label}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "#c3cde0" }}>{s.callout.text}</div>
              </div>
            )}
          </section>
        ))}

        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: "20px 22px", marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700, marginBottom: 12 }}>
            Key points
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {c.takeaways.map((t) => (
              <li key={t} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.6, color: "#c3cde0" }}>
                <span style={{ color: "#34C759", flexShrink: 0, fontWeight: 700 }}>✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <section style={{ marginBottom: 30 }}>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: "#eef1f7", marginBottom: 14 }}>Questions</h2>
          {c.faq.map((f) => (
            <div key={f.q} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{f.q}</div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#a9b6d0" }}>{f.a}</p>
            </div>
          ))}
        </section>

        {/* CTA — the manual's 24 chapter pages carried zero route to /pricing
            (measured live 2026-09-09: curl found no href="/pricing" on any of
            them, despite a stale crawler snapshot marking a few as having one).
            Same proven pattern as /blog and /flip: primary CTA to the free
            tool stays unchanged, this adds a lower-emphasis second door with
            a distinct ?src=manual so arrivals are attributable. */}
        <div style={{ padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Put this chapter to work.</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Resale IQ turns a Vinted listing into one answer: BUY, WATCH, or SKIP — with buy-below price and best sizes.
          </p>
          <SmartCTA anonLabel="Try Resale IQ →" style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }} />
          <div style={{ marginTop: 14 }}>
            <Link href="/pricing?src=manual" style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "underline" }}>
              See plans — from €19/mo
            </Link>
          </div>
        </div>

        {totalWeekly != null && market.brandCount > 0 && (
          <div style={{ padding: "18px 22px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, marginBottom: 26 }}>
            <div style={{ fontSize: 12, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
              Live, while you read this
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.7, color: "#c3cde0" }}>
              The {market.brandCount} brands Resale IQ tracks had about{" "}
              <strong style={{ color: "#eef1f7" }}>{fmtCount(totalWeekly)} items leave the shelf</strong> in the last
              seven days across Vinted ES, FR, DE, IT and PT. Every figure in this manual&apos;s data pages comes
              from that same feed —{" "}
              <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>see the full market data</Link>.
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", borderTop: "1px solid var(--color-border-ui)", paddingTop: 20 }}>
          {prev ? (
            <Link href={`/manual/${prev.slug}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none", maxWidth: 300 }}>
              ← {prev.number}. {prev.title}
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/manual/${next.slug}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none", maxWidth: 300, textAlign: "right" }}>
              {next.number}. {next.title} →
            </Link>
          )}
        </div>

        <div style={{ marginTop: 22 }}>
          <Link href="/manual" style={{ color: "#34C759", fontSize: 14, textDecoration: "none" }}>
            ← All {ALL_CHAPTERS.length} chapters
          </Link>
        </div>
      </div>
    </div>
  )
}
