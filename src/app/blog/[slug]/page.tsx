import Link from "next/link"
import { SmartCTA } from "@/components/smart-cta"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ALL_POSTS as POSTS, getPost, type BlogSectionCta } from "@/data/blog-posts"
import { fillTracked, listingsTrackedLabel } from "@/lib/stats"
import { renderRichText, stripRichText } from "@/lib/content/rich-text"

/**
 * Translation pairs, keyed by slug, both directions.
 *
 * Deliberately a hand-kept map rather than a `lang` field on BlogPost: there is
 * exactly one translated post today (the Spanish pricing test — see
 * ~/Desktop/resale-iq-seo/briefs/2026-08-31-spanish-test-page.md), and inventing
 * a schema for a single row before the test reports would be building for a
 * future that may not arrive. If Spanish earns impressions, replace this with a
 * real i18n model AND move the language off the <article> tag onto <html lang>.
 */
const TRANSLATIONS: Record<string, Record<string, string>> = {
  "how-to-price-items-on-vinted": {
    en: "https://resaleiq.dev/blog/how-to-price-items-on-vinted",
    "es-ES": "https://resaleiq.dev/blog/como-poner-precio-en-vinted",
    "x-default": "https://resaleiq.dev/blog/how-to-price-items-on-vinted",
  },
  "como-poner-precio-en-vinted": {
    en: "https://resaleiq.dev/blog/how-to-price-items-on-vinted",
    "es-ES": "https://resaleiq.dev/blog/como-poner-precio-en-vinted",
    "x-default": "https://resaleiq.dev/blog/how-to-price-items-on-vinted",
  },
}

/** Posts not written in the site's default language. */
const POST_LANG: Record<string, string> = {
  "como-poner-precio-en-vinted": "es",
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const p = fillTracked(getPost(slug), await listingsTrackedLabel())
  if (!p) return { title: "Not found — Resale IQ" }
  // seoTitle is the exact document title (CTR experiments). Otherwise keep
  // the historical "H1 — Resale IQ" suffix so other posts stay unchanged.
  const seoTitle = p.seoTitle ?? `${p.title} — Resale IQ`
  const ogTitle = p.seoTitle ?? p.title
  return {
    title: seoTitle,
    description: p.description,
    alternates: {
      canonical: `/blog/${p.slug}`,
      // hreflang must be RECIPROCAL or Google ignores it, so the pairing is
      // declared once here and emitted on BOTH pages — each naming itself and
      // its counterpart. A one-way annotation is silently discarded.
      ...(TRANSLATIONS[p.slug] ? { languages: TRANSLATIONS[p.slug] } : {}),
    },
    openGraph: { title: ogTitle, description: p.description, type: "article" },
    twitter: { card: "summary_large_image", title: ogTitle, description: p.description },
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const tracked = await listingsTrackedLabel()
  const p = fillTracked(getPost(slug), tracked)
  if (!p) notFound()

  const others = fillTracked(POSTS.filter((x) => x.slug !== p.slug).slice(0, 4), tracked)

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
      // stripRichText, not f.a: body copy may carry [label](/path) link syntax,
      // and a schema value is data, not markup — it must read as clean prose.
      mainEntity: p.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: stripRichText(f.a) },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://resaleiq.dev/blog" },
        { "@type": "ListItem", position: 3, name: p.title, item: `https://resaleiq.dev/blog/${p.slug}` },
      ],
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* The root layout hardcodes <html lang="en">, and varying that per page
          needs a route group. For a single test page, lang on <article> is the
          honest, proportionate signal. Promote it to <html lang> if Spanish
          works and a real /es/ tree gets built. */}
      <article lang={POST_LANG[p.slug] ?? undefined} style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href="/blog" style={{ color: "#34C759", textDecoration: "none" }}>Blog</Link>
        </div>

        <div style={{ fontSize: 11, color: "#34C759", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
          {p.category} · {p.readMins} min read
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", margin: "10px 0 16px", lineHeight: 1.2 }}>{p.title}</h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 28 }}>{renderRichText(p.intro)}</p>

        {p.sections.map((s) => (
          <section key={s.h} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i} style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>{renderRichText(para)}</p>
            ))}

            {/* Comparison tables scroll inside their own container: the article
                column is 720px and a phone is not, so without this the page
                body itself would scroll sideways. */}
            {s.table && (
              <figure style={{ margin: "6px 0 14px", overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420, fontSize: 13.5 }}>
                  {s.table.caption && (
                    <caption style={{ captionSide: "bottom", textAlign: "left", fontSize: 12.5, color: "#5b6b8c", paddingTop: 8, lineHeight: 1.55 }}>
                      {renderRichText(s.table.caption)}
                    </caption>
                  )}
                  <thead>
                    <tr>
                      {s.table.head.map((th) => (
                        <th key={th} scope="col" style={{ textAlign: "left", padding: "9px 12px", color: "#eef1f7", fontWeight: 700, borderBottom: "1px solid #263042", background: "var(--color-surface)" }}>
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            style={{
                              padding: "9px 12px",
                              borderBottom: "1px solid var(--color-border-ui)",
                              color: ci === 0 ? "#c3cde0" : "#a9b6d0",
                              fontWeight: ci === 0 ? 600 : 400,
                              verticalAlign: "top",
                              lineHeight: 1.6,
                            }}
                          >
                            {renderRichText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </figure>
            )}
            {s.cta && <SectionCta cta={s.cta} />}
          </section>
        ))}

        {/* FAQ — visible + mirrored in FAQPage schema for answer engines */}
        <section style={{ marginTop: 34 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", marginBottom: 16 }}>Frequently asked questions</h2>
          {p.faq.map((f) => (
            <div key={f.q} style={{ marginBottom: 18, borderBottom: "1px solid var(--color-border-ui)", paddingBottom: 16 }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{f.q}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65 }}>{renderRichText(f.a)}</p>
            </div>
          ))}
        </section>

        {/* CTA — plus, below it, a link to /pricing.

            OBSERVATION (production `pageviews`, is_bot=0, re-measured against
            the read-only prod DB on 2026-09-08): 101 distinct visitors arrived
            from an external referrer in 30d. 69 distinct non-bot visitors read
            a /blog page (236 views) — the largest public audience on this site
            after `/`. ZERO of those 101 external-referrer visitors have ever
            loaded /pricing, in 30d or lifetime; only 3 distinct visitors have
            loaded it at all, ever (38 views).

            INTERPRETATION: that zero is a property of the link graph, not a
            measurement of reader interest. A live fetch of /blog and /blog/*
            on 2026-09-08 found href="/pricing" zero times and no price string
            at all: the article template's only conversion exit is /register.
            (`/` is different — it embeds PricingSection inline, so homepage
            visitors do see the price. Blog readers never have.)

            The primary CTA below is deliberately BYTE-UNCHANGED (same label,
            same /register target, same emphasis): experiments x-f753ead9cc
            (signup completion) and x-50338c7326 (activation) both run on that
            path and have to stay interpretable. This adds a second,
            lower-emphasis door for the reader who wants to know what it costs,
            and takes nothing away from the first one.

            ?src=blog is not decoration: /api/track persists the query string
            (pageview-tracker sends `pathname + search`), so arrivals here are
            attributable to this link rather than guessed at. */}
        <div style={{ marginTop: 34, padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Know before you buy.</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Resale IQ turns {tracked} Vinted listings into one answer: BUY, WATCH, or SKIP — with buy-below price and best sizes.
          </p>
          {/* Primary door: the no-wall free checker. The blog is our largest
              external audience (ChatGPT lands readers on /blog/what-sells-best),
              yet the article template linked ONLY to /register (a signup wall)
              and /pricing — never to the free tool that produces the aha. A
              reader who just read "what sells best" wants to check ONE item, not
              open an account first; check->signup already converts at ~44%, so
              putting the low-friction action first should widen the top of the
              funnel without touching the register experiments below. Distinct
              target (/tools/vinted-price-checker) and its own attribution
              (?src=blog-check) so this door is measured separately from the
              byte-unchanged /register SmartCTA. */}
          <Link href="/tools/vinted-price-checker?src=blog-check" style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Check this item →
          </Link>
          <div style={{ fontSize: 12.5, color: "#5b6b8c", margin: "10px 0 14px" }}>Type a brand and model. Buy-below is on a plan. &nbsp;·&nbsp; or</div>
          <SmartCTA anonLabel="Try Resale IQ →" anonHref="/register?src=blog" style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }} />
          <div style={{ marginTop: 14 }}>
            <Link href="/pricing?src=blog" style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "underline" }}>
              See plans — from €19/mo
            </Link>
          </div>
        </div>

        {/* Internal links help SEO + crawl depth */}
        <div style={{ marginTop: 34 }}>
          <div style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 10, letterSpacing: "0.1px" }}>Keep reading</div>
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

/** Mid-article conversion block. Visual match for the article-footer CTA. */
function SectionCta({ cta }: { cta: BlogSectionCta }) {
  return (
    <div style={{ margin: "18px 0 4px", padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>{cta.headline}</div>
      <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 0", lineHeight: 1.6 }}>{cta.body}</p>
      {cta.example && (
        <p style={{ fontSize: 13, color: "#a9b6d0", margin: "10px 0 0", lineHeight: 1.6 }}>{cta.example}</p>
      )}
      <Link
        href={cta.href}
        style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none", marginTop: 16 }}
      >
        {cta.label} →
      </Link>
      {cta.secondaryHref && cta.secondaryLabel && (
        <div style={{ marginTop: 12 }}>
          <Link href={cta.secondaryHref} style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "underline" }}>
            {cta.secondaryLabel}
          </Link>
        </div>
      )}
    </div>
  )
}
