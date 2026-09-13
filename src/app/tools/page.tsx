import Link from "next/link"
import type { Metadata } from "next"
import { INTENTS as RAW_INTENTS } from "@/data/search-intents"
import { FreeChecker } from "@/components/tools/free-checker"
import { listingsTrackedLabel } from "@/lib/stats"
import { fillTracked } from "@/lib/stats"
import { WelcomeBanner } from "@/components/tools/welcome-banner"
import { requestLocale } from "@/lib/request-locale"
import { copy } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { HubFaq } from "@/components/seo/hub-faq"
import { faqPageJsonLd } from "@/lib/faq-schema"

// Shared so <title>, og:title and twitter:title cannot drift. Root layout
// pins homepage openGraph/twitter strings; Next.js does not copy a child
// `title` into those tags, so /tools used to share as the generic homepage.
const TITLE = "Vinted Tools: Price Check & Buy-Below — Resale IQ"

const faqs = [
  {
    q: "What Vinted reseller tools are on this page?",
    a:
      "A free price checker plus five tool pages: Vinted price checker, sourcing tool, resale analytics, " +
      "reselling intelligence, and a Vinted profit calculator. Type an item to get BUY, WATCH or SKIP, " +
      "the most you should pay, and how many watched departures sit behind that number. Sell-through and sizes stay on a plan.",
  },
  {
    q: "What is a buy-below price?",
    a:
      "Buy-below is the most you should pay for a Vinted item and still leave room after fees. " +
      "The checker on this page returns that number with a BUY, WATCH or SKIP verdict and the watched-departure sample behind it. " +
      "Item-level sizes and sell-through stay on a plan at https://resaleiq.dev/pricing.",
  },
  {
    q: "Is the Vinted price checker free?",
    a:
      "Weekly brand volumes stay public at https://resaleiq.dev/data. This page starts a check: BUY, WATCH or SKIP, " +
      "the most you should pay, and the watched-departure sample. Sell-through and sizes stay on a plan. " +
      "The checker answers one item at a time.",
  },
  {
    q: "Which Vinted markets do these tools cover?",
    a:
      "Spain, France, Germany, Italy and Portugal (ES/FR/DE/IT/PT). The tools do not cover the UK or other Vinted domains.",
  },
  {
    q: "Where can I see weekly volumes and brand rankings?",
    a:
      "Weekly brand volumes stay public at https://resaleiq.dev/data. Brands ranked by watched departures this week live at https://resaleiq.dev/flip. " +
      "This hub is the free checker and the five tool pages above.",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const tracked = await listingsTrackedLabel()
  const description =
    `Price check, profit calc and sourcing for Vinted resellers. Buy-below is the most you should pay after fees. ${tracked} listings across ES/FR/DE/IT/PT.`
  return {
    title: TITLE,
    description,
    alternates: { canonical: "/tools" },
    openGraph: { title: TITLE, description, type: "website" },
    twitter: { card: "summary_large_image", title: TITLE, description },
  }
}

export default async function ToolsIndex({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const locale = await requestLocale()
  const t = copy[locale].toolsPage
  const INTENTS = fillTracked(RAW_INTENTS, await listingsTrackedLabel())
  const { q: initialQuery } = await searchParams
  const jsonLd = [faqPageJsonLd(faqs)]
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh", padding: "32px 20px 96px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <main id="main">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* Muted, not accent-green: the checker's "Check it free" is the one
              CTA on this view and a green back-link competed with it. */}
          <Link href={canonicalPath(locale)} style={{ color: "var(--color-text-secondary)", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
          <LocaleSwitcher locale={locale} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 600, color: "var(--color-text-primary)", margin: "24px 0 12px", letterSpacing: "-0.6px", lineHeight: 1.15 }}>{t.h1}</h1>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 28, maxWidth: 620 }}>
          {t.lede}
        </p>

        <WelcomeBanner />
        <FreeChecker locale={locale} initialQuery={initialQuery} />

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

        <HubFaq items={faqs} />

        {/* This hub had no route to the paid product at all: neither /pricing
            nor /register appeared anywhere on it, while all five tool pages it
            links to carry a plans link (493337e). One quiet line, kept below
            the free checker so it does not compete with "Check it free". */}
        <p style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid var(--color-border-ui)", fontSize: 14.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          The checker answers one item at a time.{" "}
          <Link href="/pricing?src=tools_index" style={{ color: "var(--color-buy)", fontWeight: 600, textDecoration: "none" }}>
            See the plans →
          </Link>
        </p>
        </main>
      </div>
    </div>
  )
}
