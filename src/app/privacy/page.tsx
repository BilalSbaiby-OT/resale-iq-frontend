import Link from "next/link"

export const metadata = { title: "Privacy Policy — Resale IQ" }

export default function Privacy() {
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#eef1f7", margin: "24px 0 8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 28 }}>Last updated: 22 August 2026</p>
        {[
          ["Chrome extension", "On Vinted item pages we read the public title and asking price already on the page, and send that query to resaleiq.dev. We do not read your Vinted account, cookies or messages. Sign-in is synced from resaleiq.dev in your browser only. The extension contacts only resaleiq.dev."],
          ["What we collect", "Your email address, a securely hashed password (never stored in plain text), your subscription status via Stripe, and product-usage events (searches, watchlist and portfolio entries you create). We do not collect payment card details — those are handled entirely by Stripe."],
          ["How we use it", "To provide the service, authenticate you, process your subscription, send account and product emails, and improve the product. We do not sell your personal data."],
          ["Data you create", "Watchlists, portfolio items, and searches are private to your account. You can export all your data or delete your account at any time from the account page (GDPR rights to access and erasure)."],
          ["Third parties", "We use Stripe (payments), Resend (transactional email), and hosting infrastructure. Each processes data only to deliver its function. We do not sell or transfer personal data to other third parties."],
          ["Your rights", "Under GDPR you may request access to, correction of, or deletion of your personal data. Account deletion removes your personal data from our active systems."],
          ["Contact", "For any privacy request, use the data controls on your account page or contact support."],
        ].map(([h, b]) => (
          <div key={h} style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{h}</h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.65 }}>{b}</p>
          </div>
        ))}
        <Link href="/terms" style={{ color: "#22c55e", fontSize: 13 }}>Terms of Service →</Link>
      </div>
    </div>
  )
}
