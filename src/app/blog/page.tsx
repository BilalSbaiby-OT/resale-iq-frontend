import Link from "next/link"
import { SmartCTA } from "@/components/smart-cta"
import type { Metadata } from "next"
import { ALL_POSTS as POSTS } from "@/data/blog-posts"
import { fillTracked, listingsTrackedLabel } from "@/lib/stats"

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Resale IQ Blog — Vinted reselling guides & data",
  description:
    "Data-backed guides for Vinted resellers: what sells, how to price, buy-below price, sell-through, and how to source profitably across 5 EU markets.",
  alternates: { canonical: "/blog" },
  }
}

export default async function BlogIndex() {
  const tracked = await listingsTrackedLabel()
  const posts = fillTracked([...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1)), tracked)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Resale IQ Blog",
    url: "https://resaleiq.dev/blog",
    description:
      `Data-backed guides for Vinted resellers, from ${await listingsTrackedLabel()} analyzed listings across 5 EU markets.`,
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
        <Link href="/" style={{ color: "#34C759", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", margin: "22px 0 8px" }}>The Resale IQ Blog</h1>
        <p style={{ fontSize: 15, color: "#8b99b8", marginBottom: 32, lineHeight: 1.6, maxWidth: 620 }}>
          Data-backed guides for Vinted resellers — what sells, how to price, and how to source profitably.
          Built on {tracked} analyzed listings across 5 EU markets.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", margin: "0 0 14px" }}>
          All guides
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              style={{ display: "block", background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: "18px 20px", textDecoration: "none" }}
            >
              <div style={{ fontSize: 11, color: "#34C759", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
                {p.category} · {p.readMins} min read
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", margin: "6px 0" }}>{p.title}</div>
              <div style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.55 }}>{p.description}</div>
            </Link>
          ))}
        </div>

        {/* The guides are the site's strongest pages by a wide margin — Search
            Console for 2026-07-30..08-26 put 84% of all impressions on /blog/*,
            against 4% for the 156 /flip URLs and zero for the nine /category ones.
            Sending readers (and crawlers) from here into the data pages is the
            cheapest way to share that standing. */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", margin: "40px 0 10px" }}>
          Go straight to the numbers
        </h2>
        <p style={{ fontSize: 14, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 14 }}>
          The guides explain the method. The data pages apply it to live listings:{" "}
          <Link href="/flip" style={{ color: "#34C759", textDecoration: "none" }}>
            every tracked brand ranked by what it sells each week
          </Link>
          ,{" "}
          <Link href="/category" style={{ color: "#34C759", textDecoration: "none" }}>
            every category ranked by which brands move in it
          </Link>
          , and the{" "}
          <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>
            full weekly market data
          </Link>
          , published free.
        </p>

        <div style={{ marginTop: 40, padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Stop guessing what sells.</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Get a data-backed BUY / WATCH / SKIP on any item — buy-below price, best sizes, sell-through.
          </p>
          <SmartCTA anonLabel="Get started →" style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }} />
          {/* Same reasoning as the article template, re-measured 2026-09-08:
              /blog and /blog/* carry no link to /pricing and no price, and not
              one of the 101 external-referrer visitors in the last 30d has ever
              loaded /pricing. Primary CTA byte-unchanged so the running signup
              experiment (x-f753ead9cc) stays readable. */}
          <div style={{ marginTop: 14 }}>
            <Link href="/pricing?src=blog_index" style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "underline" }}>
              See plans and pricing — free tier included
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
