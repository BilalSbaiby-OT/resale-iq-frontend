import { CookieSettingsLink } from "@/components/consent-banner"
import Link from "next/link"
import { LlmEyebrow } from "./llm-eyebrow"
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
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"
import { canonicalPath } from "@/lib/locale-routes"
import { SsrBuyListTeaser } from "./ssr-buy-list-teaser"
import { HeroFreeChips } from "./hero-free-chips"
import { PricingSection } from "./pricing-section"
import { fillBrands } from "@/lib/fill-brands"

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
  ssrBuyList,
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
   * signup rate for LLM-referred visitors (the only channel that ever converted).\
   * Pure frontend; no backend required. Revenue 2026-09-15 H2.
   */
  llmSrc?: "perplexity" | "chatgpt" | "llm" | null
  /**
   * SSR-fetched buy list for first-render above-the-fold proof.
   * Null when backend is unavailable — falls back to HomeBuyList client-side.
   */
  ssrBuyList?: SsrBuyListItem[] | null
}) {
  void trackedExact
  void heroQuery
  void heroResult
  return (
    <div className="riq-public-page" style={{ background: "var(--color-bg)", color: "var(--color-text-primary)", minHeight: "100vh" }}>
      <RedirectIfAuthed />
      <nav className="riq-apple-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-3) var(--space-3) 0", maxWidth: "var(--width-marketing)", margin: "0 auto", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <Link href={canonicalPath(locale)} aria-label="Resale IQ home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.2px" }}>Resale IQ</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <LocaleSwitcher locale={locale} />
          {/* ?src=nav makes the arrival attributable through the query string
              /api/track already persists — the same mechanism acd5dc3 used for
              ?src=blog. Full pricing and payback calculator live at /pricing.
              The inline PricingSection was removed 2026-09-22 (CRO restructure);
              pricing_view fires correctly on the /pricing path now. */}
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

            {/* ── CONVERSION REDESIGN 2026-09-22 ──────────────────────────────
                Cold visitor journey: see proof → understand → check own item.
                SSR teaser shows real BUY rows (Stone Island €70, Fred Perry €18)
                in initial HTML — no JS wait, crawler-visible, conversion-first.
                HomeBuyList (client-only) below the checker updates live and shows
                locked rows with the paywall CTA.
                CRO: show the answer before asking for money. 94% of visitors
                never typed a query — give them the ranked list first. */}
            {/* H75 CRO: homepage buy-list rows are now clickable deeplinks to /tools.
                Visitor sees Stone Island Hoodies BUY €71 → clicks → /tools auto-runs
                → for non-sample items: paywall fires → GuestCheckoutButton at moment
                of highest intent (they asked for data on a specific item they care about).
                /pricing already uses rowSrc="pricing-row" for the same mechanic (H66).
                Revenue 2026-09-23. */}
            {/* H129 CRO: showLockedFomo on homepage — 2 blurred locked rows after free rows.
                With only 1 free RISING row live the list looks thin; blurred rows prove depth.
                Pattern proven on /pricing (H82). 52 weekly visitors (4x /pricing). Revenue 2026-09-28. */}
            {ssrBuyList && ssrBuyList.length > 0 && (
              <SsrBuyListTeaser items={ssrBuyList} locale={locale} showPrice={false} rowSrc="homepage-row" showLockedFomo trackedLabel={tracked} />
            )}


            <div id="check" className="riq-hero-checker">
              <FreeChecker
                locale={locale}
                variant="hero"
                /* Input starts EMPTY on purpose (2026-09-10). Prefilling it with
                   the seed SKU made the hero read as a finished demo — 30d funnel
                   showed only 3.8% of visitors ever ran a check (395→15). An empty
                   field + placeholder is the universal "type here" signal.
                   initialResult removed 2026-09-28: the WATCH example (Adidas Samba)
                   was filling above-fold space on mobile and communicating "this tool
                   mostly says no" — the SSR buy list with BUY rows is the proof story. */
                initialQuery=""
                initialResult={null}
                // H178: buyListPreview → HardPaywallCard named locked rows on homepage paywall (52/7d). CRO #4+#7+#8.
                buyListPreview={ssrBuyList}
              />
            </div>
            {/* H117 CRO: clickable free-sample chips with analytics tracking.
                Upgraded from static Link chips to HeroFreeChips (client component)
                so hero_cta_click fires per chip — measures which free model drives
                the most trial checks and whether chip clicks convert at higher rate
                than direct search. CRO #7 (trust: show the product is real) +
                CRO #10 (CTA ladder: free chip < paywall < checkout). 2026-09-28. */}
            <HeroFreeChips locale={locale} buyListPreview={ssrBuyList} />

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

        <BrandStrip
          names={market.brandNames}
          total={market.brandsTracked ?? market.brandCount}
          locale={locale}
        />

        <section
          aria-labelledby="riq-how-to-heading"
          className="riq-home-section"
        >
          <h2 id="riq-how-to-heading" className="riq-home-h2">
            {t.howToHeading}
          </h2>
          <ol
            data-testid="riq-how-to"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              maxWidth: "46ch",
              marginInline: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {t.howToSteps.map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14.5, lineHeight: 1.5, color: "var(--color-text-secondary)", textAlign: "left" }}>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--color-text-primary)", minWidth: "1.5em" }}>{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p
            data-testid="riq-coverage-line"
            style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--color-text-secondary)", margin: "20px auto 0", maxWidth: "52ch", textAlign: "center" }}
          >
            {fillBrands(t.howToCoverage, market.brandsTracked)}
          </p>
        </section>

        {/* ── PRICING CARDS — Starter €19 / Pro €49, right on the homepage ──
            Founder feedback 2026-09-29: "why you dont show pricing on
            homepage?" — before this, the only price mentioned above the fold
            was a bare "€19/mo" in prose plus a dim "Pricing →" link (the
            2026-09-22 CRO restructure, H65); the Pro tier and both plan cards
            were never rendered here at all. Reusing PricingSection in its
            existing `compact` mode (already the density /pricing itself does
            not use — this is the SAME component /pricing renders, just
            denser) keeps tier content, live Stripe price ids, the
            monthly/yearly toggle and the checkout branch in the one place
            they have always lived — no second copy of pricing logic.
            headingLevel=2: the homepage's own H1 is above; PricingSection's
            heading becomes an h2 here (this is exactly what the prop exists
            for — see pricing-section.tsx's own comment on it).
            2026-09-30 text-diet pass: RoiExampleCard ("What one good flip
            actually looks like"), LiveMarketPulse ("This is what's actually
            selling right now" data table) and the objection-row dl block
            were removed here — same honest live-data proof this page already
            leads with (the SSR buy list above + howToCoverage's "We track brands
            across 5 EU markets" line, no count), just not re-stated three more times before
            the price. PaybackCalculator inside PricingSection is now gated
            off in compact mode (see pricing-section.tsx) for the same reason.
            seedTracked reuses the SSR-fetched market numbers
            already in scope — zero extra requests, same pattern /pricing
            uses (src/app/pricing/page.tsx). */}
        <PricingSection
          locale={locale}
          compact
          headingLevel={2}
          seedTracked={tracked}
        />
        {/* CRO note: the second CTA count is nav "Sign in"/"Pricing" (chrome,
            not a conversion ask) + hero Check + pricing cards' own Starter/Pro
            CTAs — the standalone "See full comparison → Pricing" text link
            that used to sit here duplicated the nav Pricing link one screen
            up and was cut in the 2026-09-30 text-diet pass. */}

        {faqs && faqs.length > 0 ? (
          <div className="riq-home-section">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(faqs)) }}
            />
            <HubFaq items={faqs} flush />
          </div>
        ) : null}
      </main>

      <footer style={{ padding: "var(--riq-section-gap) 24px 64px", textAlign: "center", color: "var(--color-text-muted)", fontSize: 12 }}>
        <div style={{ display: "flex", gap: 16, rowGap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
          {/* First in the row for the same reason it is now in the nav: this
              footer carried 15 links and not one of them was the price. */}
          <Link href={`${canonicalPath(locale, "/pricing")}?src=footer`} style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.pricing}</Link>
          <Link href="/tools" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.toolsLink}</Link>
          <Link href="/flip" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.whatToFlip}</Link>
          <Link href="/buy" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Buy prices</Link>
          <Link href="/category" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.categories}</Link>
          {/* Founder feedback 2026-09-29: /partners worked (200) but nothing on the
              site linked to it — a human or an AI agent had no way to discover the
              affiliate programme except by guessing the URL. "Partners" stays
              English across locales, same precedent as "Buy prices" two links up —
              this is a footer link label, not core conversion copy. */}
          <Link href="/partners" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Partners</Link>
          <Link href="/flip/nike" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.nikeResale}</Link>
          <Link href="/category/sneakers" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.sneakers}</Link>
          <Link href="/manual" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.resellingManual}</Link>
          <Link href={canonicalPath(locale, "/methodology")} style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.methodologyLink}</Link>
          <Link href="/data" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.marketData}</Link>
          <Link href="/api-docs" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.api}</Link>
          <Link href="/blog" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.blog}</Link>
          <Link href="/terms" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.terms}</Link>
          <Link href="/privacy" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.privacy}</Link>
          <Link href="/legal" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.legalNotice}</Link>
          <CookieSettingsLink style={{ color: "var(--color-text-muted)" }} />
          <Link href={canonicalPath(locale, "/support")} style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.siteFooter.support}</Link>
          <Link href="/login" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{t.signIn}</Link>
        </div>
        <div style={{ marginBottom: 14 }}>
          <SocialLinks />
        </div>
        <div style={{ marginBottom: 8 }}>{t.footerTag}</div>
        <div style={{ maxWidth: 620, margin: "0 auto", fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          {t.siteFooter.disclaimer}
        </div>
      </footer>
    </div>
  )
}
