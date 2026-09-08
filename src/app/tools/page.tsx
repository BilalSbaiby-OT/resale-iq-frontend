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

export async function generateMetadata(): Promise<Metadata> {
  const tracked = await listingsTrackedLabel()
  return {
    title: "Free Vinted Reseller Tools — Resale IQ",
    description:
      `Free tools for Vinted resellers: price checker, sourcing tool, resale analytics and profit calculator, built on ${tracked} unique listings across 5 EU markets.`,
    alternates: { canonical: "/tools" },
  }
}

export default async function ToolsIndex() {
  const locale = await requestLocale()
  const t = copy[locale].toolsPage
  const INTENTS = fillTracked(RAW_INTENTS, await listingsTrackedLabel())
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh", padding: "32px 20px 96px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <main id="main">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* Muted, not accent-green: the checker's "Check it free" is the one
              CTA on this view and a green back-link competed with it. */}
          <Link href={canonicalPath(locale)} style={{ color: "var(--color-text-secondary)", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
          <LocaleSwitcher locale={locale} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--color-text-primary)", margin: "24px 0 12px", letterSpacing: "-0.5px", lineHeight: 1.15 }}>{t.h1}</h1>
        <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 28, maxWidth: 620 }}>
          {t.lede}
        </p>

        <WelcomeBanner />
        <FreeChecker locale={locale} />

        {/* Search-intent titles/descriptions stay English on every locale —
            real content translation (data/search-intents.ts), out of scope
            here, same as blog/terms per src/app/[locale]/[...rest]/page.tsx.
            The section label around them is translated.

            These were five filled, bordered cards stacked straight under the
            checker, each with the same visual weight as the checker itself, so
            the index read as the main event. Same five links; a hairline and
            whitespace separate them now. */}
        <nav style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.moreTools}</h2>
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

        {/* This hub had no route to the paid product at all: neither /pricing
            nor /register appeared anywhere on it, while all five tool pages it
            links to carry a plans link (493337e). One quiet line, kept below
            the free checker so it does not compete with "Check it free". */}
        <p style={{ marginTop: 44, paddingTop: 20, borderTop: "1px solid var(--color-border-ui)", fontSize: 14.5, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          The free tools answer one item at a time.{" "}
          <Link href="/pricing?src=tools_index" style={{ color: "var(--color-buy)", fontWeight: 600, textDecoration: "none" }}>
            See the plans →
          </Link>
        </p>
        </main>
      </div>
    </div>
  )
}
