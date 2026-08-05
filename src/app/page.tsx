"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TrendingUp, Zap, Package, ShieldCheck, ArrowRight, BarChart3, Lock } from "lucide-react"
import { getToken } from "@/lib/utils"
import { PricingSection } from "@/components/landing/pricing-section"

export default function Landing() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (getToken()) { router.replace("/dashboard"); return }
    setReady(true)
  }, [router])
  if (!ready) return null

  return (
    <div style={{ background: "#0B0D10", color: "#eef1f7", minHeight: "100vh" }}>
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
          <BarChart3 size={13} color="#22c55e" /> 30M+ Vinted listings analyzed across 5 EU markets
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.08 }}>
          Stop guessing what sells.<br /><span style={{ color: "#22c55e" }}>Know before you buy.</span>
        </h1>
        <p style={{ fontSize: 17, color: "#8b99b8", marginTop: 20, lineHeight: 1.55, maxWidth: 600, margin: "20px auto 0" }}>
          Resale IQ turns millions of real Vinted sales into one answer: what to buy, at what price, in which sizes — and how fast it'll sell.
        </p>

        {/* CTA + locked preview — sells the output without giving it away free */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 34 }}>
          <Link href="/register" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14.5, textDecoration: "none", padding: "13px 26px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 7 }}>
            Get started <ArrowRight size={16} />
          </Link>
          <a href="#pricing" style={{ background: "#161b26", border: "1px solid #232c42", color: "#eef1f7", fontWeight: 600, fontSize: 14.5, textDecoration: "none", padding: "13px 24px", borderRadius: 10 }}>See pricing</a>
        </div>

        <div style={{ position: "relative", maxWidth: 440, margin: "40px auto 0" }}>
          <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 14, padding: 18, textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "#5b6b8c", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>What every search looks like</div>
            <div style={{ background: "#1a2030", borderRadius: 9, padding: "13px 15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#22c55e", letterSpacing: "1px" }}>BUY</span>
                <span style={{ fontSize: 13, color: "#8b99b8" }}>Adidas Samba OG</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#c3cde0", marginTop: 7, filter: "blur(4px)", userSelect: "none" }}>
                Buy below €37 · sells ~€55 · 41% sell-through/wk · best sizes 38, 39, 40
              </div>
            </div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["Buy-below price", "Sell-through rate", "Best sizes", "Live listings"].map(x => (
                <div key={x} style={{ background: "#1a2030", borderRadius: 8, padding: "9px 11px", fontSize: 11, color: "#8b99b8", filter: "blur(3px)", userSelect: "none" }}>{x}</div>
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 16, background: "linear-gradient(180deg,transparent 40%,rgba(11,13,16,.55))", borderRadius: 14 }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,.14)", border: "1px solid rgba(34,197,94,.4)", color: "#22c55e", fontSize: 12.5, fontWeight: 700, textDecoration: "none", padding: "8px 16px", borderRadius: 8, backdropFilter: "blur(2px)" }}>
              <Lock size={13} /> Unlock the full data
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 20px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[
          { icon: Zap, t: "Instant verdicts", d: "BUY / WATCH / SKIP on any item, backed by real sell-through data." },
          { icon: Package, t: "Order Planner", d: "What to order today for stock arriving in 3 weeks — and its odds of selling in one." },
          { icon: TrendingUp, t: "Live deal finder", d: "Actual listings under your buy price, across all 5 EU markets, right now." },
          { icon: ShieldCheck, t: "Authenticity check", d: "Paste a link, get a probabilistic authenticity read before you commit." },
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
          {[["30M+", "listings analyzed"], ["5", "EU markets tracked"], ["100", "live product signals"], ["30%", "target margin, after fees"]].map(([n, l]) => (
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
        <div style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 12 }}>
          <Link href="/tools" style={{ color: "#5b6b8c", textDecoration: "none" }}>Free tools</Link>
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
