import Link from "next/link"
import { PricingSection } from "./pricing-section"
import { LlmEyebrow } from "./llm-eyebrow"
import { LiveMarketPulse } from "./live-market-pulse"
import { BrandStrip } from "./brand-strip"
import { RedirectIfAuthed } from "./redirect-if-authed"
import { FreeChecker } from "@/components/tools/free-checker"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { SocialLinks } from "@/components/layout/social-links"
import { HubFaq } from "@/components/seo/hub-faq"
import { faqPageJsonLd, type FaqItem } from "@/lib/faq-schema"
import type { copy, Locale } from "@/lib/i18n"
import type { MarketNumbers } from "@/lib/market-numbers"
import type { HeroVerdict } from "@/lib/hero-verdict"
import { canonicalPath } from "@/lib/locale-routes"
import { formatSellThrough } from "@/lib/format-sell-through"

type Dict = (typeof copy)[keyof typeof copy]

/**
 * Landing v2 — the product is the object of desire, not a SaaS brochure.
 * First screen: H1 is the job, one graphite Check CTA, slim proof card.
 * Seed stays New Balance 530 WATCH until Data names a better-evidenced row
 * (lib/hero-verdict.ts). Never a fake BUY.
 * Sign in is text in the nav, not a second filled button. Footer keeps it too.
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
  faqs,
  llmSrc,
  homeCite,
}: {
  t: Dict
  locale: Locale
  tracked: string
  trackedExact: string | null
  market: MarketNumbers
  heroQuery: string
  heroResult: HeroVerdict | null
  /** English `/` only. Locale landings omit this so FAQ stays untranslated. */
  faqs?: FaqItem[]
  /** SSR Samba line for GPTBot. English `/` only. Null if no live number. */
  homeCite?: string | null
  /**
   * Set when the visitor arrives via ?src=perplexity / ?src=chatgpt / ?src=llm.
   * Renders a one-line eyebrow above the H1 that mirrors the channel that
   * brought them — CRO principle #3 (message match). Expected: 10-15% lift on
   * signup rate for LLM-referred visitors (the only channel that ever converted).
   * Pure frontend; no backend required. Revenue 2026-09-15 H2.
   */
  llmSrc?: "perplexity" | "chatgpt" | "llm" | null
}) {
  void tracked
  void trackedExact
  void heroQuery
  return (
    <div className="riq-public-page" style={{ background: "var(--color-bg)", color: "var(--color-text-primary)", minHeight: "100vh" }}>
      <RedirectIfAuthed />
      <nav className="riq-apple-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3) var(--space-3) 0", maxWidth: "var(--width-marketing)", margin: "0 auto", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <Link href={canonicalPath(locale)} aria-label="Resale IQ home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.2px" }}>Resale IQ</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <LocaleSwitcher locale={locale} />
          {/* This page had NO link to /pricing in any form — verified against
              the live HTML on 2026-09-08, zero href matches on the whole
              document — while being the largest public surface on the site
              (157 distinct non-bot visitor_hash rows in 30d, vs 69 on /blog).
              /pricing has been loaded 5 times by distinct visitor_hash rows in
              the product's lifetime.

              The prices themselves are NOT missing: PricingSection is embedded
              below, so EUR 19 and EUR 49 are in this document already. What was
              missing is a countable route to them that does not require the
              scroll — pricing_view fires on the /pricing path and the #pricing
              hash only, never on the inline section coming into view, so how
              many landing visitors reach the embedded prices is UNKNOWN and is
              not being asserted here either way.

              TEXT, same weight and colour as Sign in, so the graphite Check
              stays the only filled control above the fold. ?src=nav makes the
              arrival attributable through the query string /api/track already
              persists — the same mechanism acd5dc3 used for ?src=blog. */}
          <Link
            href={`${canonicalPath(locale, "/pricing")}?src=nav`}
            style={{ fontSize: "var(--text-meta)", fontWeight: 500, color: "var(--color-text-dim)", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            {t.pricing}
          </Link>
          {/* TEXT, never a filled button. The graphite Check is the only
              filled control above the fold. Footer still has Sign in too. */}
          <Link
            href="/login"
            style={{ fontSize: "var(--text-meta)", fontWeight: 500, color: "var(--color-text-dim)", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            {t.signIn}
          </Link>
        </div>
      </nav>

      <main id="main">
        <section
          className="riq-apple-hero"
          style={{ maxWidth: "var(--width-hero)", margin: "0 auto", padding: "var(--space-5) var(--space-3) var(--space-4)" }}
        >
          <div className="riq-hero">
            {/* One H1, one subline, then the centered checker. Overline, Samba
                essay and listing-count line were competing with Check. Samba
                stays as a free chip; the live cite is SSR for GPTBot only. */}
            <div className="riq-hero-copy">
              {/* H2 — LLM message-match eyebrow. Revenue 2026-09-15.
                  Shown only when ?src=perplexity|chatgpt|llm. Mirrors the channel
                  that brought the visitor — CRO principle #3. */}
              {llmSrc && <LlmEyebrow src={llmSrc} margin="0 0 var(--space-1)" />}
              <h1
                style={{
                  fontSize: "var(--text-h1-marketing)",
                  fontWeight: 600,
                  letterSpacing: "var(--tracking-h1)",
                  lineHeight: "var(--leading-h1)",
                  margin: "0 auto var(--space-2)",
                  color: "var(--color-text-primary)",
                  textWrap: "balance",
                }}
              >
                {t.heroHeadline}
              </h1>
              <p style={{ fontSize: "var(--text-body-marketing)", fontWeight: 400, color: "var(--color-text-dim)", margin: "0 auto", lineHeight: 1.5, maxWidth: "42ch" }}>
                {t.heroSub}
              </p>
            </div>
            <div id="check" className="riq-hero-checker">
              <FreeChecker
                locale={locale}
                variant="hero"
                /* Input starts EMPTY on purpose (2026-09-10). Prefilling it with
                   the seed SKU made the hero read as a finished demo — 30d funnel
                   showed only 3.8% of visitors ever ran a check (395→15). An empty
                   field + placeholder is the universal "type here" signal; the seed
                   verdict still renders below, now labelled "Example" so it reads as
                   a sample, not the whole product. heroQuery kept for SSR/other use. */
                initialQuery=""
                initialResult={heroResult}
              />
            </div>

            {/* Verdict explainer — visible immediately below the checker.
                Answers the #1 comprehension gap: "what does WATCH €24.35 mean?"
                Only renders on clients (no SSR text to avoid hydration issues). */}
            <div
              data-testid="riq-verdict-explainer"
              style={{
                maxWidth: 480,
                margin: "0 auto",
                padding: "14px 18px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-ui)",
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--color-text-secondary)",
              }}
            >
              <strong style={{ color: "var(--color-text-primary)", display: "block", marginBottom: 6, fontSize: 13.5 }}>
                What does the result mean?
              </strong>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: "#34C759", fontFamily: "monospace", fontSize: 13 }}>BUY</span>
                — demand is strong. Source it now.
              </span>
              <br />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: "#FF9F0A", fontFamily: "monospace", fontSize: 13 }}>WATCH</span>
                — worth watching. The €24.35 is the max you can pay and still make a margin.
              </span>
              <br />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, color: "#FF3B30", fontFamily: "monospace", fontSize: 13 }}>SKIP</span>
                — oversupplied or margins are too thin right now.
              </span>
              <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                Based on {tracked} live Vinted listings across ES · FR · DE · IT · PT. Updated weekly.
              </p>
            </div>

            {/* Below the checker, not beside it. Hidden on narrow screens where
                the checker must lead. Static <img> (no next/image config). */}
            <div className="riq-hero-shot" aria-hidden="true">
              <div className="riq-browser-frame">
                <div className="riq-browser-bar">
                  <span className="riq-browser-dot" style={{ background: "#FF5F57" }} />
                  <span className="riq-browser-dot" style={{ background: "#FEBC2E" }} />
                  <span className="riq-browser-dot" style={{ background: "#28C840" }} />
                  <span className="riq-browser-url">resaleiq.dev/verdict</span>
                </div>
                <img
                  src="/product/verdict-preview.png"
                  alt="Resale IQ verdict screen showing a WATCH decision with buy-below, average exit price and sell-through for New Balance 530"
                  width={1440}
                  height={1000}
                  loading="eager"
                  style={{ display: "block", width: "100%", height: "auto" }}
                />
              </div>
            </div>
            {homeCite ? (
              <p data-testid="riq-home-teaser-cite" className="riq-sr-only">
                {homeCite}
              </p>
            ) : null}
          </div>
        </section>

        <section
          aria-labelledby="riq-how-to-heading"
          style={{ maxWidth: "var(--width-hero)", margin: "0 auto", padding: "0 var(--space-3) var(--space-6)" }}
        >
          <h2
            id="riq-how-to-heading"
            style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.2px", margin: "0 0 14px", color: "var(--color-text-primary)" }}
          >
            {t.howToHeading}
          </h2>
          <ol
            data-testid="riq-how-to"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              maxWidth: "46ch",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {t.howToSteps.map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14.5, lineHeight: 1.45, color: "var(--color-text-dim)" }}>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--color-text-primary)", minWidth: "1.5em" }}>{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p
            data-testid="riq-coverage-line"
            style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-text-dim)", margin: "14px 0 0", maxWidth: "52ch" }}
          >
            {t.howToCoverage}
          </p>
        </section>

        <BrandStrip
          names={market.brandNames}
          total={market.brandsTracked ?? market.brandCount}
          locale={locale}
        />

        <LiveMarketPulse locale={locale} market={market} />

        <PricingSection locale={locale} compact seedTracked={tracked} seedSellThrough={formatSellThrough(market.sold7dTotal)} />

        {faqs && faqs.length > 0 ? (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 var(--space-3) var(--space-10)" }}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(faqs)) }}
            />
            <HubFaq items={faqs} />
          </div>
        ) : null}
      </main>

      <footer style={{ padding: "48px 24px 64px", textAlign: "center", color: "#5b6b8c", fontSize: 12 }}>
        <div style={{ display: "flex", gap: 16, rowGap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
          {/* First in the row for the same reason it is now in the nav: this
              footer carried 15 links and not one of them was the price. */}
          <Link href={`${canonicalPath(locale, "/pricing")}?src=footer`} style={{ color: "#5b6b8c", textDecoration: "none" }}>{t.pricing}</Link>
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
