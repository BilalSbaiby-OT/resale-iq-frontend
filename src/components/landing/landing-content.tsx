import Link from "next/link"
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
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"
import { canonicalPath } from "@/lib/locale-routes"
import { HomeBuyList } from "./home-buy-list"
import { SsrBuyListTeaser } from "./ssr-buy-list-teaser"
import { HomepageEmailCta } from "./homepage-email-cta"

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
            {ssrBuyList && ssrBuyList.length > 0 && (
              <SsrBuyListTeaser items={ssrBuyList} locale={locale} showPrice={false} rowSrc="homepage-row" />
            )}


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
            {/* H112 CRO: free-model micro-line below the hero checker.
                Three models — Samba, Air Force 1, NB 530 — are free to check,
                no account needed. That fact only appeared in the "How it works"
                section below the fold. A visitor at the checker had no signal
                they could try without paying, so the "do I need to pay?" objection
                fired with zero counter-signal at the most critical moment.
                Fathom: "7 days free" above the pricing CTA. beehiiv: "Launch $0"
                headline tier. Both name the no-risk entry prominently at the ask.
                This adds one line immediately below the checker so the zero-commitment
                path is visible before the visitor decides whether to type.
                CRO #7 (trust before CTA: name the free path at the moment of ask).
                Revenue 2026-09-23. */}
            <p style={{ fontSize: 12, color: "var(--color-text-dim)", margin: "6px auto 0", textAlign: "center" }}>
              Try free: <strong>Samba</strong>, <strong>Air Force 1</strong> or <strong>NB 530</strong> — no account needed.
            </p>

            {/* HomeBuyList — client-side live refresh with locked rows + paywall CTA.
                SSR rows are already shown above (SsrBuyListTeaser). This layer
                updates with the freshest data after hydration. */}
            <HomeBuyList locale={locale} />

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

        {/* ── LIVE MARKET PROOF — moved above the fold ─────────────────────
            Our strongest credibility signal: real, specific, unfakeable
            production numbers. Rendered immediately after the hero so a cold
            visitor (especially LLM-referred) sees verifiable data before
            the how-it-works explanation. */}
        <LiveMarketPulse locale={locale} market={market} />

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

        {/* ── PRICING TEASER — replaces inline PricingSection ───────────────
            H65 CRO: homepage pricing zone upgrade (Revenue 2026-09-23).
            BEFORE: faint grey "Pricing →" link. A visitor who just saw live
            BUY signals had no direct conversion path; they had to navigate to
            /pricing and click again. Funnel: 52 weekly homepage visitors,
            0 paying. A dim link does not close an already-warm visitor.
            AFTER: GuestCheckoutButton (direct Stripe checkout) as primary + 
            secondary "See plans" link. CRO principles applied:
            - #12 Conversion momentum: value (buy-list proof) → earned CTA.
            - #10 CTA discipline: solution-aware visitor → "Start €19/mo" is
              the right commitment level, not "see how it works".
            - #5 Visual hierarchy: one green filled button, one dim link.
            - #9 Friction audit: removes the extra /pricing click.
            ZIK Analytics leads with "Start Smart. Scale Faster" + immediate
            trial CTA. Fathom leads with "7-day free trial" above the fold.
            Both show the ask at the moment of conviction, not one page later.
            HARD_PAYWALL stays ON — this goes to Stripe directly.
            ?src=homepage_checkout for attribution. */}
        <div
          style={{
            maxWidth: "var(--width-hero)",
            margin: "0 auto",
            padding: "0 var(--space-3) var(--space-6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* H87 CRO: loss-framed homepage CTA — Revenue 2026-09-23.
              BEFORE: "Start €19/mo — buy-below on every brand →" — neutral gain framing.
              H98 CRO: email-capture before checkout — 23/25 Stripe sessions had no
              email typed. This adds an optional email field before the CTA so Stripe
              pre-populates customer_email, removing the highest-friction field on the
              payment page. Same pattern C199 applied to blog posts (confirmed lift).
              CRO #6 (cognitive load: one fewer required field on Stripe) +
              #8 (loss-framing: kept) + #12 (conversion momentum). Revenue 2026-09-23. */}
          <HomepageEmailCta locale={locale} pricingText={t.pricing} />
        </div>

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
