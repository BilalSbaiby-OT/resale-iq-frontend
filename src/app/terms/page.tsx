import Link from "next/link"

export const metadata = {
  title: "Terms of Service — Resale IQ",
  description:
    "The terms covering Resale IQ accounts, subscriptions, acceptable use and limitations of the market data.",
  alternates: { canonical: "/terms" },
}

export default function Terms() {
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#34C759", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#eef1f7", margin: "24px 0 8px" }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 28 }}>Last updated: 22 August 2026</p>
        {[
          ["1. What Resale IQ is", "Resale IQ is a market-analytics tool that summarizes publicly available resale-market data to help sellers make sourcing and pricing decisions. All signals, scores, verdicts, and authenticity estimates are informational and probabilistic — they are not guarantees, financial advice, or determinations of authenticity."],
          ["2. Your account", "You are responsible for keeping your login credentials secure and for all activity under your account. You must provide a valid email and be at least 18 years old."],
          ["3. Subscriptions & billing", "Paid plans are billed monthly in advance via Stripe. You may cancel at any time from your account; access continues until the end of the paid period. Prices are shown exclusive of any applicable VAT unless stated otherwise."],
          ["4. Acceptable use", "You may not resell, redistribute, or scrape the data provided through Resale IQ, nor use it to build a competing dataset. Automated bulk access outside the provided API is prohibited."],
          ["5. No warranty", "The service is provided \"as is\". Market data can be incomplete or delayed, and outcomes depend on factors outside our control. We are not liable for purchasing, sourcing, or selling decisions made using the tool."],
          ["6. Changes", "We may update these terms; material changes will be notified by email or in-app. Continued use after changes constitutes acceptance."],
        ].map(([h, b]) => (
          <div key={h} style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{h}</h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.65 }}>{b}</p>
          </div>
        ))}
        <Link href="/privacy" style={{ color: "#34C759", fontSize: 13 }}>Privacy Policy →</Link>
      </div>
    </div>
  )
}
