import Link from "next/link"
import type { Metadata } from "next"
import { INTENTS as RAW_INTENTS } from "@/data/search-intents"
import { FreeChecker } from "@/components/tools/free-checker"
import { listingsTrackedLabel } from "@/lib/stats"
import { OG_IMAGES } from "@/lib/og-image"
import { fillTracked } from "@/lib/stats"
import { WelcomeBanner } from "@/components/tools/welcome-banner"
import { PricingEyebrow } from "@/components/tools/pricing-eyebrow"
import { requestLocale } from "@/lib/request-locale"
import { copy } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { HubFaq } from "@/components/seo/hub-faq"
import { MoneyCta } from "@/components/money-cta"
import { definedTermJsonLd, faqPageJsonLd } from "@/lib/faq-schema"
import {
  BUY_BELOW_TERM,
  BUY_BELOW_TERM_NAME,
  TOOLS_HUB_BODY,
  TOOLS_HUB_DEFINED_TERM,
  TOOLS_HUB_FAQS,
} from "@/lib/tools-hub-aeo"
import { MONEY_CTA_LABEL, TOOLS_FAQ_CTA_HREF, TOOLS_INDEX_SECONDARY_HREF, TOOLS_MONEY_HREF } from "@/lib/money-cta"
import { WebmcpDeclarativeForm } from "@/components/tools/webmcp-declarative-form"
import { CHECK_VINTED_ITEM_FORM_HTML } from "@/lib/webmcp-tools"
import { itemQueryMeta } from "@/lib/tools-query-meta"

// Shared so <title>, og:title and twitter:title cannot drift. Root layout
// pins homepage openGraph/twitter strings; Next.js does not copy a child
// `title` into those tags, so /tools used to share as the generic homepage.
const TITLE = "Know what sells. Check the model before you buy — Resale IQ"

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ q?: string }> }
): Promise<Metadata> {
  const tracked = await listingsTrackedLabel()
  const { q } = await searchParams
  // When an LLM or crawler lands on /tools?q=<item>, return item-matched meta
  // so the citation reads "New Balance 530 price check" not a generic description.
  // Canonical stays /tools — we don't want query params indexed as separate pages.
  const itemMeta = itemQueryMeta(q, tracked, "/tools")
  if (itemMeta) return itemMeta
  const description =
    `Should you buy this clothing model to resell? Check demand, BUY / WATCH / SKIP, and the most to pay after fees. ${tracked} watched listings. Starter €19/mo.`
  return {
    title: TITLE,
    description,
    alternates: { canonical: "/tools" },
    openGraph: { title: TITLE, description, type: "website", url: "/tools", images: OG_IMAGES },
    twitter: { card: "summary_large_image", title: TITLE, description, images: OG_IMAGES },
  }
}

export default async function ToolsIndex({ searchParams }: { searchParams: Promise<{ q?: string; src?: string }> }) {
  const locale = await requestLocale()
  const t = copy[locale].toolsPage
  const INTENTS = fillTracked(RAW_INTENTS, await listingsTrackedLabel())
  const { q: initialQuery, src } = await searchParams
  const jsonLd = [faqPageJsonLd(TOOLS_HUB_FAQS), definedTermJsonLd(TOOLS_HUB_DEFINED_TERM)]
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh", padding: "32px 20px 96px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <main id="main">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* Muted, not accent-green: the filled Check CTA is the one control
              on this view and a green back-link competed with it. */}
          <Link href={canonicalPath(locale)} style={{ color: "var(--color-text-secondary)", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
          <LocaleSwitcher locale={locale} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 600, color: "var(--color-text-primary)", margin: "24px 0 12px", letterSpacing: "-0.6px", lineHeight: 1.15 }}>{t.h1}</h1>
        <p data-testid="riq-tools-cite" style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 20, maxWidth: 620 }}>
          {TOOLS_HUB_BODY}
        </p>

        <WelcomeBanner />
        <PricingEyebrow />
        <WebmcpDeclarativeForm html={CHECK_VINTED_ITEM_FORM_HTML} />
        <FreeChecker locale={locale} initialQuery={initialQuery} src={src} />

        <MoneyCta href={TOOLS_MONEY_HREF} />

        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", margin: "28px 0 8px", letterSpacing: "-0.4px" }}>
          {BUY_BELOW_TERM_NAME}
        </h2>
        <p style={{ fontSize: 15.5, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 12, maxWidth: 620 }}>
          {BUY_BELOW_TERM}
        </p>

        {/* Search-intent titles/descriptions stay English on every locale —
            real content translation (data/search-intents.ts), out of scope
            here, same as blog/terms per src/app/[locale]/[...rest]/page.tsx.
            The section label around them is translated.

            These were five filled, bordered cards stacked straight under the
            checker, each with the same visual weight as the checker itself, so
            the index read as the main event. Same five links; a hairline and
            whitespace separate them now. */}
        <nav style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4, letterSpacing: "0.2px" }}>{t.moreTools}</h2>
          {INTENTS.map((i) => (
            <Link
              key={i.slug}
              href={`/tools/${i.slug}`}
              style={{ display: "block", padding: "20px 0", borderTop: "1px solid var(--color-border-ui)", textDecoration: "none" }}
            >
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{i.h1}</div>
              <div style={{ fontSize: 14.5, color: "var(--color-text-secondary)", marginTop: 5, lineHeight: 1.6 }}>{i.description}</div>
            </Link>
          ))}
        </nav>

        <p style={{ marginTop: 28, fontSize: 14.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Weekly brand volumes stay public on the{" "}
          <Link href="/data" style={{ color: "var(--color-text-primary)", fontWeight: 600, textDecoration: "none" }}>market data</Link>
          {" "}page. What sells this week is ranked on{" "}
          <Link href="/flip" style={{ color: "var(--color-text-primary)", fontWeight: 600, textDecoration: "none" }}>brand flips</Link>.
        </p>

        <HubFaq items={TOOLS_HUB_FAQS} />

        <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          <Link href={TOOLS_FAQ_CTA_HREF} style={{ color: "var(--color-buy)", fontWeight: 600, textDecoration: "none" }}>
            {MONEY_CTA_LABEL}
          </Link>
        </p>

        {/* Secondary paid path. Primary door is the google_search_test CTA
            above the fold. src=tools_index stays measurable as a footer. */}
        <p style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid var(--color-border-ui)", fontSize: 14.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          The checker answers one item at a time.{" "}
          <Link href={TOOLS_INDEX_SECONDARY_HREF} style={{ color: "var(--color-text-secondary)", fontWeight: 600, textDecoration: "underline" }}>
            See the plans →
          </Link>
        </p>
        </main>
      </div>
    </div>
  )
}
