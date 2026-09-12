import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { INTENTS, getIntent } from "@/data/search-intents"
import { FreeChecker } from "@/components/tools/free-checker"
import { PublicProfitCalculator } from "@/components/tools/public-profit-calculator"
import { fillTracked, listingsTrackedLabel } from "@/lib/stats"
import { requestLocale } from "@/lib/request-locale"
import { copy } from "@/lib/i18n"

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
  // What a visitor OPERATES is translated; the editorial body is not.
  //
  // The intent bodies (h1, lede, bullets, FAQ) live in data/search-intents.ts
  // and are English in every locale — that is the deliberate content split
  // documented in src/lib/locale-routes.ts and src/lib/i18n.ts, not an
  // oversight, and machine-translating SEO landing prose is a separate task.
  // But the checker and the profit calculator embedded here are CONTROLS. A
  // Spanish visitor could not read the field labels, the button or the
  // validation errors on their own free tool until this pass — FreeChecker
  // takes a `locale` prop and this page simply never passed it. Same for the
  // breadcrumb and the "See plans" CTA, which is the paid path.
  //
  // This page is already `ƒ` (dynamic) in the build output because
  // listingsTrackedLabel() fetches the warehouse, so reading the request
  // locale costs no static generation that we had.
  const locale = await requestLocale()
  const t = copy[locale].toolsPage
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
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh", padding: "40px 20px 96px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Breadcrumbs were accent-green, which put two more green links above
            the fold competing with the tool's own CTA. Navigation is not the
            action on this page. */}
        <nav style={{ fontSize: 13, marginBottom: 28, color: "var(--color-text-muted)" }}>
          <Link href="/" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Resale IQ</Link>
          <span> / </span>
          <Link href="/tools" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>{t.breadcrumbTools}</Link>
        </nav>

        <h1 style={{ fontSize: 34, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.15, letterSpacing: "-0.6px", marginBottom: 16 }}>{i.h1}</h1>
        <p style={{ fontSize: 16.5, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 36, maxWidth: 620 }}>{i.lede}</p>

        {/* Profit-calculator intent: a buy-price Calculate, never the checker.
            Other slugs keep the free checker (holy-shit verdict). */}
        {slug === "vinted-profit-calculator"
          ? <PublicProfitCalculator locale={locale} />
          : <FreeChecker locale={locale} />}

        {/* Was three filled, bordered cards stacked under the tool, each with
            the same visual weight as the tool itself. Same three points, but
            whitespace and type weight separate them now. */}
        <section style={{ marginTop: 56 }}>
          {i.bullets.map((b, n) => (
            <div
              key={b.h}
              style={{
                paddingTop: n === 0 ? 0 : 24,
                marginTop: n === 0 ? 0 : 24,
                borderTop: n === 0 ? "none" : "1px solid var(--color-border-ui)",
              }}
            >
              <h2 style={{ fontSize: 16.5, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 7 }}>{b.h}</h2>
              <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{b.p}</p>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.3px", marginBottom: 24 }}>{t.faqHeading}</h2>
          {i.faq.map((f, n) => (
            <div
              key={f.q}
              style={{
                paddingTop: n === 0 ? 0 : 22,
                marginTop: n === 0 ? 0 : 22,
                borderTop: n === 0 ? "none" : "1px solid var(--color-border-ui)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>{f.q}</h3>
              <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{f.a}</p>
            </div>
          ))}
        </section>

        {/* The paid path. Deliberately a text link, not a second filled green
            button: the tool's own CTA above is the one accent on this view.
            The sentence stays English with the rest of the editorial body —
            it is a data claim about coverage and gating, and translating it
            belongs with the intent copy, not with the chrome.

            This link said "See plans" / "Ver planes" / "Voir les offres" in
            every locale and went to /register, which shows a signup form and
            no price. The tools family is the highest commercial-intent surface
            on the site (33 distinct non-bot visitors/30d, from queries like
            "vinted price checker") and the JSON-LD above already declares
            €19/€49 Offers to search and answer engines — so the page promises
            a price to crawlers and to the reader, then withholds it. /pricing
            is live (HTTP 200, Starter €19 / Pro €49, "Create a free account"),
            so registration stays one click away. src=tools keeps this
            separable from the src=blog and src=nav doors. */}
        <section style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--color-border-ui)" }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>{t.upsellTitle}</h2>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 16, maxWidth: 620 }}>
            Buy-below price, exit price and best sizes on every item (sell-through rolling out as departure history matures) — from {tracked} unique Vinted listings across 5 EU markets.
          </p>
          <Link
            href="/pricing?src=tools"
            style={{ color: "var(--color-text-primary)", fontWeight: 600, fontSize: 15, textDecoration: "underline", textUnderlineOffset: 4 }}
          >
            {t.upsellCta} →
          </Link>
        </section>

        <nav style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.moreTools}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/tools/${o.slug}`} style={{ color: "var(--color-text-secondary)", fontSize: 15, textDecoration: "none" }}>{o.h1}</Link>
            ))}
            <Link href="/blog" style={{ color: "var(--color-text-secondary)", fontSize: 15, textDecoration: "none" }}>Reselling guides &amp; data</Link>
          </div>
        </nav>
      </div>
    </div>
  )
}
