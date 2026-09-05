import type { Metadata } from "next"
import Link from "next/link"
import { PricingSection } from "@/components/landing/pricing-section"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { copy } from "@/lib/i18n"
import { hreflangLanguages } from "@/lib/locale-routes"

export const metadata: Metadata = {
  title: "Pricing — Resale IQ",
  description: "Starter €19 and Pro €49. Free checks with no card. Know what to pay before you buy.",
  alternates: { canonical: "/pricing", languages: hreflangLanguages("/pricing") },
}

/** Real /pricing page. A 307 to /#pricing made the URL unshareable, unindexable,
 *  and unmeasurable (pricing_view). Landing still has #pricing; this is the
 *  typed/ad URL. */
export default function PricingPage() {
  const t = copy.en
  return (
    <div style={{ background: "var(--color-bg, #1d1d1f)", color: "var(--color-text-primary, #f5f5f7)", minHeight: "100vh" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0", maxWidth: 1080, margin: "0 auto" }}>
        <Link href="/" aria-label="Resale IQ home" style={{ fontSize: 15, fontWeight: 500, color: "inherit", textDecoration: "none" }}>Resale IQ</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LocaleSwitcher locale="en" />
          <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: "inherit", opacity: 0.64, textDecoration: "none" }}>{t.signIn}</Link>
        </div>
      </nav>
      <PricingSection locale="en" />
    </div>
  )
}
