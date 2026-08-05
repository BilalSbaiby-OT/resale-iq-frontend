import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { POSTS, getPost } from "@/data/blog-posts"

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const p = getPost(slug)
  if (!p) return { title: "Not found — Resale IQ" }
  return {
    title: `${p.title} — Resale IQ`,
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { title: p.title, description: p.description, type: "article" },
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const p = getPost(slug)
  if (!p) notFound()

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4)

  // Article + FAQPage JSON-LD — this is what lets Google rich results AND answer
  // engines (ChatGPT, Perplexity, Google AI, Claude) lift clean, citable answers.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.date,
      author: { "@type": "Organization", name: "Resale IQ" },
      publisher: { "@type": "Organization", name: "Resale IQ", url: "https://resaleiq.dev" },
      mainEntityOfPage: `https://resaleiq.dev/blog/${p.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#22c55e", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href="/blog" style={{ color: "#22c55e", textDecoration: "none" }}>Blog</Link>
        </div>

        <div style={{ fontSize: 11, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
          {p.category} · {p.readMins} min read
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#eef1f7", margin: "10px 0 16px", lineHeight: 1.2 }}>{p.title}</h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 28 }}>{p.intro}</p>

        {p.sections.map((s) => (
          <section key={s.h} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i} style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>{para}</p>
            ))}
          </section>
        ))}

        {/* FAQ — visible + mirrored in FAQPage schema for answer engines */}
        <section style={{ marginTop: 34 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#eef1f7", marginBottom: 16 }}>Frequently asked questions</h2>
          {p.faq.map((f) => (
            <div key={f.q} style={{ marginBottom: 18, borderBottom: "1px solid #161b26", paddingBottom: 16 }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{f.q}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <div style={{ marginTop: 34, padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Know before you buy.</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Resale IQ turns 30M+ Vinted sales into one answer: BUY, WATCH, or SKIP — with buy-below price and best sizes.
          </p>
          <Link href="/register" style={{ display: "inline-block", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Try Resale IQ →
          </Link>
        </div>

        {/* Internal links help SEO + crawl depth */}
        <div style={{ marginTop: 34 }}>
          <div style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Keep reading</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/blog/${o.slug}`} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
                → {o.title}
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
