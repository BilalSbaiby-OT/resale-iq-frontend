import Link from "next/link"
import { TrendingUp, Zap, Package, ShieldCheck, ArrowRight, BarChart3 } from "lucide-react"
import { PricingSection } from "@/components/landing/pricing-section"
import { RedirectIfAuthed } from "@/components/landing/redirect-if-authed"
import { LiveMarketProof } from "@/components/landing/live-market-proof"

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
          Resale IQ turns 500,000+ real Vinted listings into one answer: what to buy, at what price, in which sizes — and how fast it'll sell.
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
          { icon: Zap, t: "Instant verdicts", d: "BUY / WATCH / SKIP on any item, backed by real sell-through data." },
          { icon: Package, t: "Order Planner", d: "What to order today for stock arriving in 3 weeks — and its odds of selling in one." },
          { icon: TrendingUp, t: "Live deal finder", d: "Actual listings under your buy price, across all 5 EU markets, right now." },
          { icon: ShieldCheck, t: "Authenticity signals", d: "Paste a link, get a 0-100 confidence score from price, seller and listing signals. Not a guarantee — it never sees the item." },
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
          {[["500,000+", "listings analyzed"], ["5", "EU markets tracked"], ["100", "live product signals"], ["30%", "target margin, after fees"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#eef1f7" }}>{n}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 2 }}>{l}</div>
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
