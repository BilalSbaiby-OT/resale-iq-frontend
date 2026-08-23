import Link from "next/link"

export const metadata = { title: "Legal Notice — Resale IQ" }

// Identity (legal name, tax ID, postal address) is not published on the site.
// It is provided on request to support@resaleiq.dev.

const OPERATOR = {
  email: "support@resaleiq.dev",
}

export default function LegalNotice() {
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#eef1f7", margin: "24px 0 8px" }}>Legal Notice</h1>
        <p style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 28 }}>Last updated: 23 August 2026</p>

        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>Service operator</h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.9 }}>
            Resale IQ is operated from Spain.<br />
            The operator’s legal name, tax identification number and postal
            address are provided on request — email {OPERATOR.email}.
          </p>
        </div>

        {[
          ["Contact", `For any question, billing issue, or legal request, email ${OPERATOR.email}. We aim to respond within 2 business days.`],
          ["Service provided", "Resale IQ is a subscription market-analytics tool for secondhand resellers. It summarizes publicly available resale-market data. It does not sell goods, hold stock, or act as an intermediary in any transaction between buyers and sellers."],
          ["Payments", "Payments are processed by Stripe Payments Europe, Ltd. We never receive or store your full card details. Applicable VAT is calculated and charged at checkout based on your country of residence."],
          ["Right of withdrawal", "Because Resale IQ is digital content supplied immediately, you are asked at checkout to expressly consent to immediate access and to acknowledge that doing so ends your 14-day right of withdrawal under EU consumer law. Until that consent is given, the standard 14-day withdrawal right applies. You can cancel a subscription at any time from your account; access continues to the end of the period already paid for."],
          ["Complaints & online dispute resolution", `If you are an EU consumer and we cannot resolve a complaint directly, you may use the European Commission's Online Dispute Resolution platform at ec.europa.eu/consumers/odr. Please contact us first at ${OPERATOR.email} — most issues are resolved quickly.`],
          ["Applicable law", "These terms are governed by Spanish law. Nothing here removes the mandatory consumer protections available to you under the law of your own country of residence within the EU."],
          ["Intellectual property", "All content, data compilations, scoring methodology, and branding on this site belong to the operator and may not be reproduced or redistributed without written permission."],
          ["Independence & trademarks", "Resale IQ is an independent service and is not affiliated with, endorsed by, sponsored by, or in any way officially connected to Vinted, or to any of the brands, marketplaces, or manufacturers referenced on the site. 'Vinted' and all product, brand, and company names are trademarks™ or registered® trademarks of their respective holders; they are used here for identification and descriptive purposes only, and their use does not imply endorsement. Resale IQ analyses only publicly available listing data and does not access, copy, or resell any proprietary content."],
          ["No professional advice", "Nothing on Resale IQ constitutes financial, investment, tax, or legal advice. All signals, scores, verdicts, price targets, and authenticity reads are informational and probabilistic estimates derived from public data. You are solely responsible for your own purchasing and resale decisions and for compliance with the terms of any marketplace you use."],
        ].map(([h, b]) => (
          <div key={h} style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{h}</h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.65 }}>{b}</p>
          </div>
        ))}

        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <Link href="/terms" style={{ color: "#22c55e", fontSize: 13 }}>Terms of Service →</Link>
          <Link href="/privacy" style={{ color: "#22c55e", fontSize: 13 }}>Privacy Policy →</Link>
        </div>
      </div>
    </div>
  )
}
