import Link from "next/link"
import { TrendingUp, Zap, Package, ShieldCheck, ArrowRight, BarChart3 } from "lucide-react"
import { PricingSection } from "@/components/landing/pricing-section"
import { RedirectIfAuthed } from "@/components/landing/redirect-if-authed"
import { LiveMarketProof } from "@/components/landing/live-market-proof"

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
export default function Landing() {
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
          <a href="#pricing" style={{ fontSize: 13.5, fontWeight: 600, color: "#06090c", background: "#22c55e", textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>See pricing</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "#8b99b8", border: "1px solid #1c2333", borderRadius: 20, padding: "5px 14px", marginBottom: 22 }}>
          <BarChart3 size={13} color="#22c55e" /> 500,000+ Vinted listings analyzed across 5 EU markets
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.08 }}>
          Stop guessing what sells.<br /><span style={{ color: "#22c55e" }}>Know before you buy.</span>
        </h1>
        <p style={{ fontSize: 17, color: "#8b99b8", marginTop: 20, lineHeight: 1.55, maxWidth: 600, margin: "20px auto 0" }}>
          The most you can pay for an item and still make money. Worked out from 500,000+ real Vinted sales, not guesswork.
        </p>

        {/* CTA + locked preview — sells the output without giving it away free */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 34 }}>
          <Link href="/register" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14.5, textDecoration: "none", padding: "13px 26px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 7 }}>
            Get started <ArrowRight size={16} />
          </Link>
          <a href="#pricing" style={{ background: "#161b26", border: "1px solid #232c42", color: "#eef1f7", fontWeight: 600, fontSize: 14.5, textDecoration: "none", padding: "13px 24px", borderRadius: 10 }}>See pricing</a>
        </div>

        <LiveMarketProof />
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        {[
          { icon: Zap, t: "Buy or skip", d: "One answer per item, from what it actually sold for and how many sold." },
          { icon: Package, t: "Order planner", d: "What to order now for stock landing in three weeks, priced off this week's sales." },
          { icon: TrendingUp, t: "Deal finder", d: "Listings on sale right now below the price you should pay." },
          { icon: ShieldCheck, t: "Authenticity check", d: "Paste a link for a 0-100 score from price and seller signals. It never sees the item, so it is a flag, not a verdict." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 12, padding: 20 }}>
            <Icon size={20} color="#22c55e" strokeWidth={2} />
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 12 }}>{t}</div>
            <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 6, lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </section>

      {/* Social proof band */}
      <section style={{ maxWidth: 1000, margin: "36px auto 0", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", padding: "26px 0", borderTop: "1px solid #1c2333", borderBottom: "1px solid #1c2333" }}>
          {[["500,000+", "real sold listings, not estimates"], ["Hourly", "every price recomputed"], ["Every formula", "published on /methodology"], ["No accuracy claims", "until we have measured one"]].map(([n, l]) => (
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
