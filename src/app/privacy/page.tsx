import Link from "next/link"
import { CookieSettingsLink } from "@/components/consent-banner"

import { fitMetadata } from "@/lib/meta-fit"
export const metadata = fitMetadata({
  title: "Privacy Policy — Resale IQ",
  description:
    "How Resale IQ handles your data: what we collect, why, who processes it, and your GDPR rights.",
  // Self-referencing canonical. www.resaleiq.dev 308s to the apex, but a
  // canonical is what consolidates any other duplicate path (tracking params,
  // trailing-slash variants) onto one URL. Every other public page already
  // carries one; these four were simply missed.
  alternates: { canonical: "/privacy" },
})

export default function Privacy() {
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#34C759", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", minHeight: 44}}>← Resale IQ</Link>
        <h1 style={{ fontSize: 30, fontWeight: 600, color: "#eef1f7", margin: "24px 0 8px", letterSpacing: "-0.6px" }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 28 }}>Last updated: 2 October 2026</p>
        {[
          ["Chrome extension", "On Vinted item pages we read the public title, brand and asking price already on the page, and send that query to resaleiq.dev to look up a buy-below price. We do not read your Vinted account, cookies or messages. If you sign in at resaleiq.dev, the extension stores your session token on this device only (not in Chrome sync) so checks count against your plan. The token is sent only to resaleiq.dev. The extension contacts no other host. If the panel fails to render on a listing page — never on a successful check — the extension separately sends resaleiq.dev a fixed reason code (one of three preset values, never text taken from the page or the error itself) and the two-letter market, so we find out when Vinted changes its layout instead of the panel silently going blank. That report carries no listing content, no session token and no account identifier: it is sent by the extension's background process rather than the page itself, so it carries none of the page's Vinted context either. Like any request our servers receive, it still arrives with the sending device's IP address."],
          ["What we collect", "Your email address, a securely hashed password (never stored in plain text), your subscription status via Stripe, and product-usage events (searches, watchlist and portfolio entries you create). We do not collect payment card details — those are handled entirely by Stripe."],
          ["How we use it", "To provide the service, authenticate you, process your subscription, send account and product emails, and improve the product. We do not sell your personal data."],
          ["Data you create", "Watchlists, portfolio items, and searches are private to your account. You can export all your data or delete your account at any time from the account page (GDPR rights to access and erasure)."],
          ["Third parties", "We use Stripe (payments), Resend (transactional email), and hosting infrastructure. Each processes data only to deliver its function. We do not sell or transfer personal data to other third parties."],
          ["Advertising measurement", "If you click Accept in the cookie banner, we load Google Ads conversion measurement (Google Ireland Ltd / Google LLC) to see which ads lead to sign-ups. It runs only with your consent, with ad personalisation signals switched off, and sends no email or account data. If you Reject, or make no choice, it never loads. You can change your choice at any time with the Cookie settings link in the footer. The choice is stored on your device (localStorage) and not sent to us."],
          ["How you found us", "When you first visit, your browser stores (localStorage, on your device, for 90 days) the campaign tag on the link you clicked, the website that referred you, the page you landed on and the date. It holds no identifier of you. If you sign up or start a trial, we save that record against your account so we know which channel earned it; if you never do, it never leaves your device. Legal basis: our legitimate interest in knowing which channels work (GDPR Art. 6(1)(f)). Clearing your browser data removes it, and you can ask us to delete the copy on your account."],
          ["Your rights", "Under GDPR you may request access to, correction of, or deletion of your personal data. Account deletion removes your personal data from our active systems."],
          ["Contact", "For any privacy request, use the data controls on your account page or contact support."],
        ].map(([h, b]) => (
          <div key={h} style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{h}</h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.65 }}>{b}</p>
          </div>
        ))}
        <Link href="/terms" style={{ color: "#34C759", fontSize: 13 }}>Terms of Service →</Link>
        <span style={{ margin: "0 10px", color: "#5b6b8c" }}>·</span>
        <CookieSettingsLink style={{ color: "#34C759", fontSize: 13 }} />
      </div>
    </div>
  )
}
