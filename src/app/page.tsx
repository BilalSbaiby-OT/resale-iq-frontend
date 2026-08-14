import Link from "next/link"
import { ArrowRight, Package, ShieldCheck, TrendingUp, Zap } from "lucide-react"
import { PricingSection } from "@/components/landing/pricing-section"
import { RedirectIfAuthed } from "@/components/landing/redirect-if-authed"
import { LiveMarketProof } from "@/components/landing/live-market-proof"
import { listingsTrackedLabel } from "@/lib/stats"

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
  return (
    <div style={{ background: "#0B0D10", color: "#eef1f7", minHeight: "100vh" }}>
      <RedirectIfAuthed />
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#22c55e,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#06090c" }}>R</div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Resale IQ</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/login" style={{ fontSize: 13.5, color: "#8b99b8", textDecoration: "none", padding: "8px 14px" }}>Sign in</Link>
          {/* Demoted from a green button. It was pulling the eye away from the
              one action on the page, and put a second green element in the
              top-right corner of a layout whose whole point is that green
              means "click this". */}
          <a href="#pricing" style={{ fontSize: 13.5, fontWeight: 600, color: "#c3cde0", border: "1px solid #232c42", textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Pricing</a>
        </div>
      </nav>

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
              Stop guessing<br />what sells.
            </h1>
            {/* One accent, one job. Green was on the headline, both buttons and
                every stat, so it signalled nothing. It now marks the action. */}
            <p style={{ fontSize: 17.5, color: "#93a1bd", marginTop: 22, lineHeight: 1.6, maxWidth: 480 }}>
              The highest price to pay for a Vinted item before you buy it — in euros,
              per model and size.
            </p>
            <p style={{ fontSize: 13.5, color: "#5b6b8c", marginTop: 12, maxWidth: 480 }}>
              From {tracked} live and sold listings across five EU markets.
            </p>

            {/* ONE primary action. "See pricing" was competing at nearly equal
                weight while already sitting in the nav two inches above. */}
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 32, flexWrap: "wrap" }}>
              {/* plan=free is load-bearing, not decoration: check_journeys asserts
                  that any CTA whose text says "free" requests the free plan, so a
                  visitor clicking "free" cannot land on a paid tier preselected. */}
              <Link href="/register?plan=free" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 15, textDecoration: "none", padding: "14px 28px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 8 }}>
                Check an item free <ArrowRight size={16} />
              </Link>
              <span style={{ fontSize: 13, color: "#5b6b8c" }}>10 free checks. No card.</span>
            </div>
          </div>

          <LiveMarketProof />
        </div>
      </section>

      {/* What it does.
          Was four identical bordered boxes with an icon on top — the same
          component repeated, which reads as filler regardless of the words in
          it. Boxes removed: a hairline rule and spacing separate them, the
          label carries the weight, and the green icons are gone so the only
          green left on the page is the thing you click. */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "8px 24px 8px" }}>
        <div style={{ borderTop: "1px solid #1c2333" }} />
        <div className="riq-grid-4-flat">
          {[
            { t: "Buy or skip", d: "BUY, WATCH or SKIP on any item, from its sold prices and current supply." },
            { t: "Order planner", d: "What to order now for stock landing in three weeks, priced off this week's sales." },
            { t: "Deal finder", d: "Listings on sale now, under your buy-below price." },
            { t: "Authenticity check", d: "A 0-100 flag from price and seller signals. It never sees the item, so it is a flag, not a verdict." },
          ].map(({ t, d }) => (
            <div key={t} style={{ paddingTop: 26 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#eef1f7", letterSpacing: "-0.2px" }}>{t}</div>
              <div style={{ fontSize: 13, color: "#7f8da9", marginTop: 8, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof band */}
      <section style={{ maxWidth: 1000, margin: "36px auto 0", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", padding: "26px 0", borderTop: "1px solid #1c2333", borderBottom: "1px solid #1c2333" }}>
          {[[tracked, "unique items tracked, not counted twice"], ["Every 30 min", "scraped, recomputed hourly"], ["Every formula", "published on /methodology"], ["No accuracy claims", "until 100 outcomes are scored"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center", maxWidth: 190 }}>
              {/* Word-length varies now that these are claims rather than bare
                  figures, so the size steps down instead of wrapping mid-phrase
                  across four columns. */}
              <div style={{ fontSize: n.length > 12 ? 17 : 28, fontWeight: 800, color: "#eef1f7", lineHeight: 1.15 }}>{n}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 4, lineHeight: 1.35 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <PricingSection />

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1c2333", padding: "28px 24px", textAlign: "center", color: "#4d5a75", fontSize: 12 }}>
        {/* wrap + row-gap: 8 links in a fixed row overflowed the viewport on phones */}
        <div style={{ display: "flex", gap: 18, rowGap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
          <Link href="/tools" style={{ color: "#5b6b8c", textDecoration: "none" }}>Free tools</Link>
          <Link href="/manual" style={{ color: "#5b6b8c", textDecoration: "none" }}>Reselling manual</Link>
          <Link href="/methodology" style={{ color: "#5b6b8c", textDecoration: "none" }}>Methodology</Link>
          <Link href="/data" style={{ color: "#5b6b8c", textDecoration: "none" }}>Market data</Link>
          <Link href="/blog" style={{ color: "#5b6b8c", textDecoration: "none" }}>Blog</Link>
          <Link href="/terms" style={{ color: "#5b6b8c", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ color: "#5b6b8c", textDecoration: "none" }}>Privacy</Link>
          <Link href="/legal" style={{ color: "#5b6b8c", textDecoration: "none" }}>Legal notice</Link>
          <Link href="/support" style={{ color: "#5b6b8c", textDecoration: "none" }}>Support</Link>
          <Link href="/login" style={{ color: "#5b6b8c", textDecoration: "none" }}>Sign in</Link>
        </div>
        <div style={{ marginBottom: 8 }}>Resale IQ — market intelligence for Vinted resellers.</div>
        <div style={{ maxWidth: 620, margin: "0 auto", fontSize: 11, color: "#3f4a63", lineHeight: 1.6 }}>
          Resale IQ is an independent tool and is not affiliated with, endorsed by, or connected to Vinted or any brand mentioned on this site. All product names, logos, and brands are the property of their respective owners and are used for identification only. All signals are informational, based on public market data, and are not financial advice or a guarantee of results.
        </div>
      </footer>
    </div>
  )
}
