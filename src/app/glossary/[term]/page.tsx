import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { HubFaq } from "@/components/seo/hub-faq"
import { definedTermJsonLd, faqPageJsonLd } from "@/lib/faq-schema"
import { articleSocialMeta } from "@/lib/flip-category-meta"
import { GLOSSARY_TERMS, getGlossaryTerm, glossaryTermJsonLd } from "@/lib/glossary-terms"
import { SEO_MODELS } from "@/lib/seo-models"
import { ModelChips } from "@/components/seo/model-chips"

const BASE = "https://resaleiq.dev"

export function generateStaticParams() {
  return GLOSSARY_TERMS.map((t) => ({ term: t.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ term: string }> },
): Promise<Metadata> {
  const { term } = await params
  const t = getGlossaryTerm(term)
  if (!t) return { title: "Not found — Resale IQ" }
  return articleSocialMeta(t.title, t.description, `/glossary/${t.slug}`)
}

export default async function GlossaryTermPage(
  { params }: { params: Promise<{ term: string }> },
) {
  const { term } = await params
  const t = getGlossaryTerm(term)
  if (!t) notFound()

  const jsonLd = [
    faqPageJsonLd(t.faqs),
    definedTermJsonLd(glossaryTermJsonLd(t)),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: BASE },
        { "@type": "ListItem", position: 2, name: "Glossary", item: `${BASE}/glossary` },
        { "@type": "ListItem", position: 3, name: t.name, item: `${BASE}/glossary/${t.slug}` },
      ],
    },
  ]

  const models = SEO_MODELS.slice(0, 12)

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/glossary" style={{ color: "#34C759", textDecoration: "none", fontSize: 13 }}>
        ← Glossary
      </Link>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", margin: "22px 0 10px", lineHeight: 1.2 }}>
        {t.h1}
      </h1>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#eef1f7", margin: "0 0 10px", letterSpacing: "-0.4px" }}>
        {t.name}
      </h2>
      <p style={{ color: "#eef1f7", fontSize: 16, lineHeight: 1.7, marginBottom: 18, maxWidth: 680 }}>
        {t.lead}
      </p>
      {t.body.map((p, i) => (
        <p key={i} style={{ color: "#a9b6d0", fontSize: 15, lineHeight: 1.7, marginBottom: 14, maxWidth: 680 }}>
          {p}
        </p>
      ))}

      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, margin: "8px 0 22px" }}>
        <Link href="/pricing" style={{ color: "#34C759", textDecoration: "none" }}>Pricing</Link>
        {" · "}
        <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>Market data</Link>
        {" · "}
        <Link href="/tools" style={{ color: "#34C759", textDecoration: "none" }}>Tools</Link>
        {" · "}
        <Link href="/flip" style={{ color: "#34C759", textDecoration: "none" }}>Brands</Link>
      </p>

      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "22px 0 10px" }}>
        Keep reading
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 22 }}>
        {t.seeAlso.map((s) => (
          <Link key={s.href} href={s.href} style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
            → {s.label}
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "22px 0 10px" }}>
        Use the term on a model
      </h2>
      <ModelChips models={models} />

      <HubFaq items={t.faqs} />
    </main>
  )
}
