import { headers } from "next/headers"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PricingSection } from "@/components/landing/pricing-section"
import { RedirectIfAuthed } from "@/components/landing/redirect-if-authed"
import { LiveMarketProof } from "@/components/landing/live-market-proof"
import { ExtensionHero, chromeStoreUrl } from "@/components/landing/extension-hero"
import { listingsTrackedLabel, listingsTrackedExact } from "@/lib/stats"
import { getMarketNumbers } from "@/lib/market-numbers"
import { copy, detectLocale } from "@/lib/i18n"
import { FreeChecker } from "@/components/tools/free-checker"
import { TRIAL_LIMITS_SHORT } from "@/lib/trial-copy"

import type { Metadata } from "next"

// The landing had NO metadata export, so "/" was the only page on the site
// without a self-referencing canonical — and www.resaleiq.dev serves a full
// 200 duplicate rather than redirecting, so Google saw two identical
// homepages and had nothing telling it which one to index. Deep pages were
// already fine: metadataBase makes their canonicals absolute to the apex.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

// Server Component ON PURPOSE. This is the site's most-linked page and its
// entire content must exist in the prerendered HTML — see RedirectIfAuthed for
// the full reasoning. Only the two genuinely interactive pieces (the signed-in
// redirect and the pricing section) are Client Components. Do not add
// "use client" here to get a hook; extract a child component instead.
export default async function Landing() {
  const tracked = await listingsTrackedLabel()
  // Exact in the proof band: it moves with every scrape, and a precise
  // figure is the harder claim. Anyone can write a round number.
  const trackedExact = await listingsTrackedExact()
  const market = await getMarketNumbers()
  const chrome = chromeStoreUrl()
  const t = copy[detectLocale((await headers()).get("accept-language"))]
  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-primary)", minHeight: "100vh" }}>
      <RedirectIfAuthed />
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <Link href="/" aria-label="Resale IQ home" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "inherit" }}>
          <div aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#22c55e,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#06090c" }}>R</div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Resale IQ</span>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/login" style={{ fontSize: 13.5, color: "#8b99b8", textDecoration: "none", padding: "8px 14px" }}>{t.signIn}</Link>
          {/* Demoted from a green button. It was pulling the eye away from the
              one action on the page, and put a second green element in the
              top-right corner of a layout whose whole point is that green
              means "click this". */}
          <a href="#pricing" style={{ fontSize: 13.5, fontWeight: 600, color: "#c3cde0", border: "1px solid #232c42", textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>{t.pricing}</a>
        </div>
      </nav>

      <main id="main">
      {/* Hero — ASYMMETRIC ON PURPOSE.
          It was centred: pill badge, centred headline, centred paragraph, two
          centred buttons, proof panel underneath. That stack is the default
          shape of every generated landing page, which is most of why the site
          "looked AI generated" — the words were only half of it.

          Two columns instead: the claim on the left, the evidence beside it
          rather than below it. A sceptical reseller reads "highest price to
          pay" and sees real weekly sold counts in the same glance, with no
          scroll between promise and proof. */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 24px 48px" }}>
        <div className="riq-hero">
          <div>
            <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.04, margin: 0 }}>
              {t.heroTitle}
            </h1>
            <p style={{ fontSize: 17.5, color: "#93a1bd", marginTop: 22, lineHeight: 1.6, maxWidth: 480 }}>
              {t.heroBody}
            </p>
            <p style={{ fontSize: 13.5, color: "#8b99b8", marginTop: 12, maxWidth: 480 }}>
              {t.heroFrom(tracked)}
            </p>

            {/* Checker is the job on every viewport. Chrome cannot run on a
                phone, so it stays a desktop-only secondary link. */}
            <div id="check" style={{ marginTop: 28, maxWidth: 520 }}>
              <FreeChecker />
              <p style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 10, lineHeight: 1.5 }}>
                {TRIAL_LIMITS_SHORT}
              </p>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
              <a href={chrome} className="hidden md:inline-flex items-center gap-2" style={{ fontSize: 13.5, fontWeight: 600, color: "#c3cde0", border: "1px solid #232c42", textDecoration: "none", padding: "10px 16px", borderRadius: 8 }}>
                {t.addToChrome} <ArrowRight size={14} />
              </a>
              <Link href="/register?plan=free" style={{ fontSize: 13.5, color: "#8b99b8", textDecoration: "none" }}>
                {t.orCheck}
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <ExtensionHero />
          </div>
        </div>
      </section>

      {/* Features — 3×2 grid, balanced. */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 20px" }}>
        <div className="riq-grid-features">
          {[
            ...t.features,
          ].map(({ t: title, d }) => (
            <div key={title} style={{ padding: "18px 0" }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7", letterSpacing: "-0.3px" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#8b99b8", marginTop: 8, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 24px 28px" }}>
        <LiveMarketProof />
      </section>

      {/* Trust signals — inline, no borders, no template. */}
      <section style={{ maxWidth: 1080, margin: "12px auto 0", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", padding: "16px 0", color: "#8b99b8", fontSize: 12.5, lineHeight: 1.5 }}>
          <span><strong style={{ color: "#93a1bd", fontWeight: 600 }}>{trackedExact ?? tracked}</strong> unique items tracked{market.stamp ? ` · ${market.stamp}` : ""}</span>
          <span>Scraped every 30 min</span>
          <span>Every formula on <Link href="/methodology" style={{ color: "#93a1bd", textDecoration: "none" }}>/methodology</Link></span>
          <span>No accuracy claims until 30 outcomes scored</span>
        </div>
      </section>

      <PricingSection />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1c2333", padding: "28px 24px", textAlign: "center", color: "#8b99b8", fontSize: 12 }}>
        {/* wrap + row-gap: 8 links in a fixed row overflowed the viewport on phones */}
        <div style={{ display: "flex", gap: 18, rowGap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
          <Link href="/tools" style={{ color: "#8b99b8", textDecoration: "none" }}>Free tools</Link>
          <Link href="/manual" style={{ color: "#8b99b8", textDecoration: "none" }}>Reselling manual</Link>
          <Link href="/methodology" style={{ color: "#8b99b8", textDecoration: "none" }}>Methodology</Link>
          <Link href="/data" style={{ color: "#8b99b8", textDecoration: "none" }}>Market data</Link>
          <Link href="/blog" style={{ color: "#8b99b8", textDecoration: "none" }}>Blog</Link>
          <Link href="/terms" style={{ color: "#8b99b8", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ color: "#8b99b8", textDecoration: "none" }}>Privacy</Link>
          <Link href="/legal" style={{ color: "#8b99b8", textDecoration: "none" }}>Legal notice</Link>
          <Link href="/support" style={{ color: "#8b99b8", textDecoration: "none" }}>Support</Link>
          <Link href="/login" style={{ color: "#8b99b8", textDecoration: "none" }}>Sign in</Link>
        </div>
        <div style={{ marginBottom: 8 }}>{t.footerTag}</div>
        <div style={{ maxWidth: 620, margin: "0 auto", fontSize: 11, color: "#8b99b8", lineHeight: 1.6 }}>
          Resale IQ is an independent tool and is not affiliated with, endorsed by, or connected to Vinted or any brand mentioned on this site. All product names, logos, and brands are the property of their respective owners and are used for identification only. All signals are informational, based on public market data, and are not financial advice or a guarantee of results.
        </div>
      </footer>
    </div>
  )
}
