import Link from "next/link"
import { Mail, MessageCircle } from "lucide-react"
import { listingsTrackedLabel } from "@/lib/stats"
import { support } from "@/lib/support-copy"
import type { Locale } from "@/lib/i18n"
import { canonicalPath, hreflangLanguages } from "@/lib/locale-routes"

export const metadata = {
  title: "Support & FAQ — Resale IQ",
  description: "Get help with Resale IQ — billing, accounts, data, and how the signals work.",
  alternates: { canonical: "/support", languages: hreflangLanguages("/support") },
}

// The company address: sends via Resend SMTP, receives via Porkbun forwarding.
// Was a personal Outlook inbox, which meant every customer got a reply from a
// personal mailbox and the address could not be handed to anyone else later.
const SUPPORT_EMAIL = "support@resaleiq.dev"

// `locale` defaults to "en" so the un-prefixed /support route (this file) is
// unchanged; src/app/[locale]/support/page.tsx imports this same function
// and passes the path locale — same split as MethodologyPage /
// src/app/methodology/page.tsx. Copy lives in support-copy.ts (9 FAQ pairs,
// verified in all 5 PATH_LOCALES — see that file's header for what is and is
// not translated and why).
export async function SupportPage({ locale = "en" }: { locale?: Locale } = {}) {
  const t = support(locale)
  const FAQ = t.faq(await listingsTrackedLabel())
  const home = canonicalPath(locale)
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href={home} style={{ color: "#34C759", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 30, fontWeight: 600, color: "#eef1f7", margin: "24px 0 8px", letterSpacing: "-0.6px" }}>{t.heading}</h1>
        <p style={{ fontSize: 14, color: "#8b99b8", marginBottom: 24, lineHeight: 1.6 }}>
          {t.intro}
        </p>

        {/* Contact */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 34 }}>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "11px 18px", borderRadius: 9, textDecoration: "none" }}>
            <Mail size={16} /> {t.emailSupport}
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Bug%20report`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", color: "#a9b6d0", fontWeight: 600, fontSize: 13.5, padding: "11px 18px", borderRadius: 9, textDecoration: "none" }}>
            <MessageCircle size={16} /> {t.reportBug}
          </a>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#eef1f7", marginBottom: 16 }}>{t.faqHeading}</h2>
        {FAQ.map(([q, a]) => (
          <div key={q} style={{ marginBottom: 20, borderBottom: "1px solid var(--color-border-ui)", paddingBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{q}</h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.65 }}>{a}</p>
          </div>
        ))}

        {/* Terms/Privacy/Legal notice labels stay English on every locale —
            their destinations (/terms, /privacy, /legal) are not translated
            pages, matching the same flagged gap landing-content.tsx's footer
            already calls out. Translating the label without the destination
            would promise a language the click does not deliver. */}
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <Link href="/terms" style={{ color: "#34C759", fontSize: 13 }}>Terms</Link>
          <Link href="/privacy" style={{ color: "#34C759", fontSize: 13 }}>Privacy</Link>
          <Link href="/legal" style={{ color: "#34C759", fontSize: 13 }}>Legal notice</Link>
        </div>
      </div>
    </div>
  )
}

export default async function Support() {
  return <SupportPage />
}
