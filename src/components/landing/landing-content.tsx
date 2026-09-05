import Link from "next/link"
import { PricingSection } from "./pricing-section"
import { RedirectIfAuthed } from "./redirect-if-authed"
import { FreeChecker } from "@/components/tools/free-checker"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { SocialLinks } from "@/components/layout/social-links"
import { TRIAL_LIMITS_SHORT_BY_LOCALE } from "@/lib/trial-copy"
import type { copy, Locale } from "@/lib/i18n"
import type { MarketNumbers } from "@/lib/market-numbers"
import { canonicalPath } from "@/lib/locale-routes"

type Dict = (typeof copy)[keyof typeof copy]

/**
 * Apple-style v1 landing: one job, huge type, whitespace, one primary action.
 * Feature grids, extension hero and the two-column "generated SaaS" stack are
 * gone. Pricing stays below the fold so /pricing → /#pricing still resolves.
 * #check is the e2e hook for the free checker (i18n-checker, locale-routing).
 */
export function LandingContent({
  t,
  locale,
  tracked,
  trackedExact,
  market,
}: {
  t: Dict
  locale: Locale
  tracked: string
  trackedExact: string | null
  market: MarketNumbers
}) {
  void tracked
  void trackedExact
  void market
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-primary)", minHeight: "100vh" }}>
      <RedirectIfAuthed />
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 32px", maxWidth: 980, margin: "0 auto" }}>
        <Link href={canonicalPath(locale)} aria-label="Resale IQ home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.3px" }}>Resale IQ</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LocaleSwitcher locale={locale} />
          <Link href="/login" style={{ fontSize: 14, color: "#8b99b8", textDecoration: "none", padding: "8px 4px" }}>{t.signIn}</Link>
        </div>
      </nav>

      <main id="main">
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "96px 24px 80px", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(42px, 8vw, 84px)", fontWeight: 700, letterSpacing: "-2.8px", lineHeight: 1.02, margin: 0 }}>
            {t.heroTitle}
          </h1>
          <p style={{ fontSize: 19, color: "#8b99b8", margin: "22px auto 0", lineHeight: 1.45, maxWidth: 520 }}>
            {t.heroBody}
          </p>
          <div id="check" style={{ marginTop: 48, textAlign: "left" }}>
            <FreeChecker locale={locale} variant="hero" />
          </div>
          <p style={{ fontSize: 13, color: "#5b6b8c", marginTop: 18, lineHeight: 1.5 }}>
            {TRIAL_LIMITS_SHORT_BY_LOCALE[locale]}
          </p>
        </section>

        <PricingSection locale={locale} />
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
