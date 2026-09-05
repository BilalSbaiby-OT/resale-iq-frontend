import Link from "next/link"
import { PricingSection } from "./pricing-section"
import { RedirectIfAuthed } from "./redirect-if-authed"
import { FreeChecker } from "@/components/tools/free-checker"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { SocialLinks } from "@/components/layout/social-links"
import type { copy, Locale } from "@/lib/i18n"
import type { MarketNumbers } from "@/lib/market-numbers"
import type { HeroVerdict } from "@/lib/hero-verdict"
import { canonicalPath } from "@/lib/locale-routes"

type Dict = (typeof copy)[keyof typeof copy]

/**
 * Landing v2 — the product is the object of desire, not a SaaS brochure.
 * First screen: live Adidas Samba WATCH (real /api/verdict) + search.
 * Kicker always names Resale IQ. One short line (heroTitle). Pricing below the fold.
 * Does not delete Deal Scanner / sidebar features (CHARTER UX gate).
 */
export function LandingContent({
  t,
  locale,
  tracked,
  trackedExact,
  market,
  heroQuery,
  heroResult,
}: {
  t: Dict
  locale: Locale
  tracked: string
  trackedExact: string | null
  market: MarketNumbers
  heroQuery: string
  heroResult: HeroVerdict | null
}) {
  void tracked
  void trackedExact
  void market
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-primary)", minHeight: "100vh" }}>
      <RedirectIfAuthed />
      <nav className="riq-apple-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", maxWidth: 720, margin: "0 auto", gap: 12, flexWrap: "wrap" }}>
        <Link href={canonicalPath(locale)} aria-label="Resale IQ home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px" }}>Resale IQ</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LocaleSwitcher locale={locale} />
          <Link href="/login" style={{ fontSize: 14, color: "#8b99b8", textDecoration: "none", padding: "8px 4px" }}>{t.signIn}</Link>
        </div>
      </nav>

      <main id="main">
        <section className="riq-apple-hero" style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px 48px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.4px", color: "#8b99b8", margin: "0 0 8px" }}>
            Resale IQ
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", lineHeight: 1.15, margin: "0 0 8px" }}>
            {heroResult?.product ?? t.heroTitle}
          </h1>
          <p style={{ fontSize: 15, color: "#8b99b8", margin: "0 0 20px", lineHeight: 1.45 }}>
            {t.heroTitle}
          </p>
          <div id="check" style={{ textAlign: "left" }}>
            <FreeChecker
              locale={locale}
              variant="hero"
              initialQuery={heroQuery}
              initialResult={heroResult}
            />
          </div>
        </section>

        <PricingSection locale={locale} compact />
      </main>

      <footer style={{ padding: "48px 24px 64px", textAlign: "center", color: "#5b6b8c", fontSize: 12 }}>
        <div style={{ display: "flex", gap: 16, rowGap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
          <Link href="/tools" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.toolsLink}</Link>
          <Link href="/flip" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.whatToFlip}</Link>
          <Link href="/category" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.categories}</Link>
          <Link href="/flip/nike" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.nikeResale}</Link>
          <Link href="/category/sneakers" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.sneakers}</Link>
          <Link href="/manual" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.resellingManual}</Link>
          <Link href={canonicalPath(locale, "/methodology")} style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.methodologyLink}</Link>
          <Link href="/data" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.marketData}</Link>
          <Link href="/api-docs" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.api}</Link>
          <Link href="/blog" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.blog}</Link>
          <Link href="/terms" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.terms}</Link>
          <Link href="/privacy" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.privacy}</Link>
          <Link href="/legal" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.legalNotice}</Link>
          <Link href={canonicalPath(locale, "/support")} style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.siteFooter.support}</Link>
          <Link href="/login" style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.signIn}</Link>
        </div>
        <div style={{ marginBottom: 14 }}>
          <SocialLinks />
        </div>
        <div style={{ marginBottom: 8 }}>{t.footerTag}</div>
        <div style={{ maxWidth: 620, margin: "0 auto", fontSize: 11, color: "#5b6b8c", lineHeight: 1.6 }}>
          {t.siteFooter.disclaimer}
        </div>
      </footer>
    </div>
  )
}
