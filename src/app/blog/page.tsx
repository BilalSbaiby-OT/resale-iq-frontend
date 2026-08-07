import Link from "next/link"
import { SmartCTA } from "@/components/smart-cta"
import type { Metadata } from "next"
import { ALL_POSTS as POSTS } from "@/data/blog-posts"

export const metadata: Metadata = {
  title: "Resale IQ Blog — Vinted reselling guides & data",
  description:
    "Data-backed guides for Vinted resellers: what sells, how to price, buy-below price, sell-through, and how to source profitably across 5 EU markets.",
  alternates: { canonical: "/blog" },
}

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Resale IQ Blog",
    url: "https://resaleiq.dev/blog",
    description:
      "Data-backed guides for Vinted resellers, from 500,000+ analyzed listings across 5 EU markets.",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `https://resaleiq.dev/blog/${p.slug}`,
    })),
  }

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#eef1f7", margin: "22px 0 8px" }}>The Resale IQ Blog</h1>
        <p style={{ fontSize: 15, color: "#8b99b8", marginBottom: 32, lineHeight: 1.6, maxWidth: 620 }}>
          Data-backed guides for Vinted resellers — what sells, how to price, and how to source profitably.
          Built on 500,000+ analyzed listings across 5 EU markets.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              style={{ display: "block", background: "#12151d", border: "1px solid #1c2333", borderRadius: 12, padding: "18px 20px", textDecoration: "none" }}
            >
              <div style={{ fontSize: 11, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
                {p.category} · {p.readMins} min read
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", margin: "6px 0" }}>{p.title}</div>
              <div style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.55 }}>{p.description}</div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Stop guessing what sells.</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Get a data-backed BUY / WATCH / SKIP on any item — buy-below price, best sizes, sell-through.
          </p>
          <SmartCTA anonLabel="Get started →" style={{ display: "inline-block", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }} />
        </div>
      </div>
    </div>
  )
}
