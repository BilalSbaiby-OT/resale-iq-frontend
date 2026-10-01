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
import { canonicalPath, hreflangLanguages } from "@/lib/locale-routes"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { HubFaq } from "@/components/seo/hub-faq"
import { MoneyCta } from "@/components/money-cta"
import { definedTermJsonLd, faqPageJsonLd } from "@/lib/faq-schema"
import {
  toolsHub,
} from "@/lib/tools-hub-aeo"
import { MONEY_CTA_LABEL, TOOLS_FAQ_CTA_HREF, TOOLS_INDEX_SECONDARY_HREF, TOOLS_MONEY_HREF } from "@/lib/money-cta"
import { WebmcpDeclarativeForm } from "@/components/tools/webmcp-declarative-form"
import { CHECK_VINTED_ITEM_FORM_HTML } from "@/lib/webmcp-tools"
import { resolveQuery } from "@/lib/tool-params"
import { itemQueryMeta } from "@/lib/tools-query-meta"
import { formatTeaserCite, getTeaserVerdict } from "@/lib/teaser-verdict"
import { getPublicBuyList } from "@/lib/ssr-buy-list"
import { BlogProofStrip } from "@/components/blog-proof-strip"
import { RoiExampleCard } from "@/components/landing/roi-example-card"

import { withFittedMetadata } from "@/lib/meta-fit"
import { breadcrumbJsonLd } from "@/lib/breadcrumbs"
// Shared so <title>, og:title and twitter:title cannot drift. Root layout
// pins homepage openGraph/twitter strings; Next.js does not copy a child
// `title` into those tags, so /tools used to share as the generic homepage.
const TITLE = "Max price to pay before you buy to resell — Resale IQ"

async function generateMetadataRaw(
  { searchParams }: { searchParams: Promise<{ q?: string; query?: string }> }
): Promise<Metadata> {
  const tracked = await listingsTrackedLabel()
  const q = resolveQuery(await searchParams)
  // When an LLM or crawler lands on /tools?q=<item>, return item-matched meta
  // so the citation reads "New Balance 530 price check" not a generic description.
  // Canonical stays /tools — we don't want query params indexed as separate pages.
  const itemMeta = itemQueryMeta(q, tracked, "/tools")
  const teaser = await getTeaserVerdict(q)
  const cite = formatTeaserCite(q ?? "", teaser)
  if (itemMeta && cite && teaser?.verdict && teaser.buy_below != null) {
    const description =
      `Should you buy ${q?.trim()} to resell? ${teaser.verdict}. Most to pay after fees: €${Number(teaser.buy_below).toFixed(2)}. Other models Starter €19/mo.`
    return {
      ...itemMeta,
      description,
      openGraph: { ...itemMeta.openGraph, description },
      twitter: { ...itemMeta.twitter, description },
    }
  }
  if (itemMeta) return itemMeta
  const description =
    `Should you buy this clothing model to resell? Check demand, BUY / WATCH / SKIP, and the most to pay after fees. ${tracked} watched listings. Starter €19/mo.`
  return {
    title: TITLE,
    description,
    alternates: { canonical: "/tools", languages: hreflangLanguages("/tools") },
    openGraph: { title: TITLE, description, type: "website", url: "/tools", images: OG_IMAGES },
    twitter: { card: "summary_large_image", title: TITLE, description, images: OG_IMAGES },
  }
}

export async function ToolsIndex({ searchParams }: { searchParams: Promise<{ q?: string; query?: string; src?: string }> }) {
  const locale = await requestLocale()
  const t = copy[locale].toolsPage
  const hub = toolsHub(locale)
  const INTENTS = fillTracked(RAW_INTENTS, await listingsTrackedLabel())
  const sp = await searchParams
  const initialQuery = resolveQuery(sp)
  const src = sp.src
  const [teaser, proofRows] = await Promise.all([
    getTeaserVerdict(initialQuery),
    getPublicBuyList(5),
  ])
  const cite = formatTeaserCite(initialQuery ?? "", teaser)
  const jsonLd = [breadcrumbJsonLd([["Resale IQ", "/"], ["Tools", "/tools"]]), faqPageJsonLd(hub.faqs), definedTermJsonLd(hub.definedTerm)]
  return (
    <div className="riq-public-page" style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh", padding: "32px 20px 96px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <main id="main">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {/* Muted, not accent-green: the filled Check CTA is the one control
              on this view and a green back-link competed with it. */}
          <Link href={canonicalPath(locale)} style={{ color: "var(--color-text-secondary)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", minHeight: 44}}>← Resale IQ</Link>
          <LocaleSwitcher locale={locale} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 600, color: "var(--color-text-primary)", margin: "24px 0 12px", letterSpacing: "-0.6px", lineHeight: 1.15 }}>{t.h1}</h1>
        {cite ? (
          <p data-testid="riq-teaser-cite" style={{ fontSize: 16, color: "var(--color-text-primary)", lineHeight: 1.7, marginBottom: 16, maxWidth: 620 }}>
            {cite}
          </p>
        ) : null}
        <p data-testid="riq-tools-cite" style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 20, maxWidth: 620 }}>
          {hub.body}
        </p>

        <WelcomeBanner />
        <PricingEyebrow locale={locale} />
        {/* C164(tony): live proof strip — same pattern as /blog/[slug] and /tools/[slug].
            /tools gets 10 humans/week and sends them to a blank checker input with
            no evidence the data is real. A visitor from ChatGPT sees real buy-list rows
            above the fold before they type a single character. Fails soft: null = no strip. */}
        <BlogProofStrip
          items={proofRows}
          ctaHref={TOOLS_MONEY_HREF}
          ctaLabel="Check any model now →"
          hasInlineChecker
        />
        <WebmcpDeclarativeForm html={CHECK_VINTED_ITEM_FORM_HTML} />
        {/* H144 CRO: pass proofRows into FreeChecker so HardPaywallCard can show
            the "In your unlocked buy list" locked-row teasers (C228 pattern).
            /tools gets 10 humans/7d and every paywall hit was showing an abstract
            pitch ("unlock the market data") with no concrete proof of contents.
            proofRows is already fetched SSR for BlogProofStrip above — zero extra
            requests. HardPaywallCard.lockedRows shows 3 rows with blurred prices,
            making the ask concrete: "this specific item is priced, waiting."
            CRO #4 (objection: what's actually in there?) + #7 (specific proof)
            + #8 (concrete names, not "unlock buy list" abstraction). Revenue 2026-09-29. H144. */}
        <FreeChecker locale={locale} initialQuery={initialQuery} src={src} buyListPreview={proofRows} />

        {/* H172 CRO: ROI worked example on /tools — conviction after first verdict, before upsell.
            /tools gets 10 humans/7d. Every visitor who searches sees a verdict or a paywall —
            but no concrete "what does a flip actually look like?" moment.
            /pricing (H136) and blog (H137) both have RoiExampleCard; /tools was the gap.
            proofRows is already fetched SSR for BlogProofStrip above — zero extra requests.
            RoiExampleCard renders nothing when no suitable free, unlocked row is available.
            CRO #4 (objection: is €19/mo worth it?) + #8 (specificity: real item, real margin,
            not "save money") + #12 (verdict → evidence → ROI → MoneyCta momentum).
            /tools: 10/7d. Revenue 2026-09-29. H172. */}
        {proofRows && proofRows.length > 0 && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <RoiExampleCard items={proofRows} />
          </div>
        )}

        <MoneyCta href={TOOLS_MONEY_HREF} />

        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", margin: "28px 0 8px", letterSpacing: "-0.4px" }}>
          {hub.termName}
        </h2>
        <p style={{ fontSize: 15.5, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 12, maxWidth: 620 }}>
          {hub.term}
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
          {t.volumesBefore}
          <Link href={canonicalPath(locale, "/data")} style={{ color: "var(--color-text-primary)", fontWeight: 600, textDecoration: "none" }}>{t.volumesData}</Link>
          {t.volumesMid}
          <Link href="/flip" style={{ color: "var(--color-text-primary)", fontWeight: 600, textDecoration: "none" }}>{t.volumesFlips}</Link>
          {t.volumesEnd}
        </p>

        <HubFaq items={hub.faqs} />

        <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          <Link href={TOOLS_FAQ_CTA_HREF} style={{ color: "var(--color-buy)", fontWeight: 600, textDecoration: "none" }}>
            {MONEY_CTA_LABEL}
          </Link>
        </p>

        {/* Secondary paid path. Primary door is the google_search_test CTA
            above the fold. src=tools_index stays measurable as a footer. */}
        <p style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid var(--color-border-ui)", fontSize: 14.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          {t.oneItem}{" "}
          <Link href={TOOLS_INDEX_SECONDARY_HREF} style={{ color: "var(--color-text-secondary)", fontWeight: 600, textDecoration: "underline" }}>
            {t.seePlansFooter}
          </Link>
        </p>
        </main>
      </div>
    </div>
  )
}

export default ToolsIndex

// Length-fit title/description (<=60/<=160) for every variant this generator returns.
export const generateMetadata = withFittedMetadata(generateMetadataRaw)
