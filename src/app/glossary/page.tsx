import Link from "next/link"
import type { Metadata } from "next"
import { HubFaq } from "@/components/seo/hub-faq"
import { definedTermJsonLd, faqPageJsonLd } from "@/lib/faq-schema"
import {
  GLOSSARY_HUB_DESCRIPTION,
  GLOSSARY_HUB_FAQS,
  GLOSSARY_HUB_TITLE,
  GLOSSARY_TERMS,
} from "@/lib/glossary-terms"
import { SEO_MODELS } from "@/lib/seo-models"
import { articleSocialMeta } from "@/lib/flip-category-meta"
import { ModelChips } from "@/components/seo/model-chips"

const BASE = "https://resaleiq.dev"

export const metadata: Metadata = articleSocialMeta(
  GLOSSARY_HUB_TITLE,
  GLOSSARY_HUB_DESCRIPTION,
  "/glossary",
)

export default function GlossaryHubPage() {
  const jsonLd = [
    faqPageJsonLd(GLOSSARY_HUB_FAQS),
    ...GLOSSARY_TERMS.map((t) =>
      definedTermJsonLd({
        name: t.name,
        description: t.lead,
        url: `${BASE}/glossary/${t.slug}`,
      }),
    ),
  ]

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/" style={{ color: "#34C759", textDecoration: "none", fontSize: 13 }}>
        ← Resale IQ
      </Link>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", margin: "22px 0 10px", lineHeight: 1.2 }}>
        Vinted resale glossary
      </h1>
      <p style={{ color: "#8b99b8", fontSize: 15, lineHeight: 1.65, marginBottom: 26 }}>
        Ten terms behind every BUY / WATCH / SKIP. Definition first, so an answer engine can cite them.
        Method lives in the{" "}
        <Link href="/manual" style={{ color: "#34C759", textDecoration: "none" }}>manual</Link>
        . Numbers live on{" "}
        <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>/data</Link>
        . Checks live on{" "}
        <Link href="/tools" style={{ color: "#34C759", textDecoration: "none" }}>/tools</Link>
        . Starter is €19 on{" "}
        <Link href="/pricing" style={{ color: "#34C759", textDecoration: "none" }}>/pricing</Link>.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
        {GLOSSARY_TERMS.map((t) => (
          <Link
            key={t.slug}
            href={`/glossary/${t.slug}`}
            style={{
              display: "block",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-ui)",
              borderRadius: 12,
              padding: "18px 18px 16px",
              textDecoration: "none",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", margin: "0 0 8px" }}>{t.name}</h2>
            <p style={{ fontSize: 14, color: "#a9b6d0", lineHeight: 1.65, margin: 0 }}>{t.lead}</p>
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "8px 0 10px" }}>
        Check a named model
      </h2>
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 12 }}>
        Brand averages are not a buy-below. These pages name the model. Free sample: Adidas Samba, Nike Air Force 1, New Balance 530. Others are Starter €19.
      </p>
      <ModelChips models={SEO_MODELS} showFreeMark />

      <HubFaq items={GLOSSARY_HUB_FAQS} />
    </main>
  )
}
