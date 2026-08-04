import Link from "next/link"

export const metadata = { title: "Legal Notice — Resale IQ" }

// EU e-commerce law (Directive 2000/31/EC, and in Spain the LSSI-CE) requires a
// site selling to consumers to publish who is behind it and how to reach them.
// FILL IN the placeholders marked [ ] before taking real payments.

const OPERATOR = {
  name: "[YOUR FULL LEGAL NAME]",
  status: "Sole trader (autónomo)",
  address: "[YOUR REGISTERED ADDRESS]",
  country: "Spain",
  taxId: "[YOUR NIF / NIE]",
  email: "emmanuelbilal33@gmail.com",
}

export default function LegalNotice() {
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#eef1f7", margin: "24px 0 8px" }}>Legal Notice</h1>
        <p style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 28 }}>Last updated: July 2026</p>

        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>Service operator</h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.9 }}>
            {OPERATOR.name}<br />
            {OPERATOR.status}<br />
            {OPERATOR.address}<br />
            {OPERATOR.country}<br />
            Tax ID: {OPERATOR.taxId}
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
