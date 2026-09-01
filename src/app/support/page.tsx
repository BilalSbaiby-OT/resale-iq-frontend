import Link from "next/link"
import { Mail, MessageCircle } from "lucide-react"
import { listingsTrackedLabel } from "@/lib/stats"

export const metadata = {
  title: "Support & FAQ — Resale IQ",
  description: "Get help with Resale IQ — billing, accounts, data, and how the signals work.",
  alternates: { canonical: "/support" },
}

// The company address: sends via Resend SMTP, receives via Porkbun forwarding.
// Was a personal Outlook inbox, which meant every customer got a reply from a
// personal mailbox and the address could not be handed to anyone else later.
const SUPPORT_EMAIL = "support@resaleiq.dev"

// A function, not a const: the dataset size is fetched per request, and a
// module-scope array cannot await. Written as a const with ${tracked} inside a
// plain quoted string it type-checked, built, and rendered the characters
// "${tracked}" to the customer — which is what check:tracked:built now catches.
const faq = (tracked: string): [string, string][] => [
  ["What is Resale IQ?",
   "A market-analytics tool for secondhand resellers. We continuously track live listings across Vinted's five main EU markets, and which ones leave the shelf, and turn them into signals to help you decide what to buy, at what price, and in which sizes."],
  ["Do you guarantee I'll make money?",
   "No. Every signal, score and verdict is informational and probabilistic, based on public market data. Outcomes depend on what you pay, condition, timing and factors outside our control. It's a decision tool, not financial advice or a guarantee."],
  ["What's the difference between Starter and Pro?",
   "Starter (€19/mo) gives you unlimited verdicts, every product signal, Deal Scanner, market trends, brand rankings, and watchlist + portfolio P&L. Pro (€49/mo) adds the live deal finder (on demand) across 5 markets, the 3-week Order Planner, Price Compare (full intelligence on those 5, live asking-price search on 26 markets total), per-size velocity, and REST API access."],
  ["Is there a free plan or trial?",
   "No account: 10 checks/day. Sign up: you keep the 10/day, plus 7 days of full Starter access, then 10 full unlocks a month for the deep numbers. Live Finder, Order Planner and Price Compare are Pro. No card required; you just verify your email. Paid plans remove the monthly unlock cap."],
  ["How do I cancel?",
   "From your account page, open the billing portal — you can cancel, change plan, or update your card there. Cancellation stops the next renewal; you keep access until the current period ends."],
  ["How do I reset my password?",
   "On the login page, click \"Forgot password\", enter your email, and follow the link we send you. If it doesn't arrive within a few minutes, check spam or contact us."],
  ["Can I get my data / delete my account?",
   "Yes. From your account page you can export all your data (GDPR) as JSON, or permanently delete your account and its data."],
  ["Where does the data come from?",
   `Public live Vinted listings across ES, FR, DE, IT and PT, plus which ones leave the shelf — ${tracked} items, collected about every 30 minutes and recomputed roughly every 2 hours. The figures shown are live aggregates, not estimates.`],
  ["Is my payment secure?",
   "Payments are handled entirely by Stripe. We never see or store your card details."],
]

export default async function Support() {
  const FAQ = faq(await listingsTrackedLabel())
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#eef1f7", margin: "24px 0 8px" }}>Support</h1>
        <p style={{ fontSize: 14, color: "#8b99b8", marginBottom: 24, lineHeight: 1.6 }}>
          Most answers are below. If you&apos;re still stuck, email us — we aim to reply within 2 business days.
        </p>

        {/* Contact */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 34 }}>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "11px 18px", borderRadius: 9, textDecoration: "none" }}>
            <Mail size={16} /> Email support
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Bug%20report`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#12151d", border: "1px solid #1c2333", color: "#a9b6d0", fontWeight: 600, fontSize: 13.5, padding: "11px 18px", borderRadius: 9, textDecoration: "none" }}>
            <MessageCircle size={16} /> Report a bug or request a feature
          </a>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", marginBottom: 16 }}>Frequently asked questions</h2>
        {FAQ.map(([q, a]) => (
          <div key={q} style={{ marginBottom: 20, borderBottom: "1px solid #161b26", paddingBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{q}</h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.65 }}>{a}</p>
          </div>
        ))}

        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <Link href="/terms" style={{ color: "#22c55e", fontSize: 13 }}>Terms</Link>
          <Link href="/privacy" style={{ color: "#22c55e", fontSize: 13 }}>Privacy</Link>
          <Link href="/legal" style={{ color: "#22c55e", fontSize: 13 }}>Legal notice</Link>
        </div>
      </div>
    </div>
  )
}
