import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { INTENTS, getIntent } from "@/data/search-intents"
import { FreeChecker } from "@/components/tools/free-checker"
import { fillTracked, listingsTrackedLabel } from "@/lib/stats"

export function generateStaticParams() {
  return INTENTS.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const i = fillTracked(getIntent(slug), await listingsTrackedLabel())
  if (!i) return { title: "Not found — Resale IQ" }
  return {
    title: `${i.title} — Resale IQ`,
    description: i.description,
    alternates: { canonical: `/tools/${i.slug}` },
    openGraph: { title: i.title, description: i.description, type: "website" },
  }
}

export default async function IntentPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const tracked = await listingsTrackedLabel()
  const i = fillTracked(getIntent(slug), tracked)
  if (!i) notFound()
  const others = fillTracked(INTENTS.filter((x) => x.slug !== i.slug), tracked)

  // WebApplication + FAQPage schema: tells search AND answer engines exactly what
  // this tool is and lets them lift a citable answer for the target query.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `Resale IQ — ${i.h1}`,
      url: `https://resaleiq.dev/tools/${i.slug}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: i.description,
      offers: [
        { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "EUR" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: i.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#22c55e", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href="/tools" style={{ color: "#22c55e", textDecoration: "none" }}>Tools</Link>
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#eef1f7", lineHeight: 1.15, marginBottom: 14 }}>{i.h1}</h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 26 }}>{i.lede}</p>

        {/* The free tool — real value, numbers locked */}
        <FreeChecker />

        <section style={{ marginTop: 34, display: "grid", gap: 14 }}>
          {i.bullets.map((b) => (
            <div key={b.h} style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7", marginBottom: 5 }}>{b.h}</div>
              <div style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.6 }}>{b.p}</div>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 34 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#eef1f7", marginBottom: 16 }}>Frequently asked questions</h2>
          {i.faq.map((f) => (
            <div key={f.q} style={{ marginBottom: 18, borderBottom: "1px solid #161b26", paddingBottom: 16 }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{f.q}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </section>

        <div style={{ marginTop: 30, padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Get the full numbers.</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Buy-below price, sell price, best sizes and sell-through on every item — from {tracked} unique Vinted listings across 5 EU markets.
          </p>
          <Link href="/register" style={{ display: "inline-block", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            See plans →
          </Link>
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 12.5, color: "#5b6b8c", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>More tools</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/tools/${o.slug}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ {o.h1}</Link>
            ))}
            <Link href="/blog" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>→ Reselling guides &amp; data</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
