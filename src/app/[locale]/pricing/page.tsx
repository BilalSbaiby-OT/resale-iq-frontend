import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { PricingSection } from "@/components/landing/pricing-section"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { copy } from "@/lib/i18n"
import { isPathLocale, hreflangLanguages, canonicalPath, localeStaticParams } from "@/lib/locale-routes"

export const generateStaticParams = localeStaticParams

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isPathLocale(locale)) return {}
  return {
    title: `Pricing — Resale IQ`,
    description: copy[locale].heroBody,
    alternates: { canonical: canonicalPath(locale, "/pricing"), languages: hreflangLanguages("/pricing") },
  }
}

export default async function LocalePricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  const t = copy[locale]
  return (
    <div style={{ background: "var(--color-bg, #1d1d1f)", color: "var(--color-text-primary, #f5f5f7)", minHeight: "100vh" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0", maxWidth: 1080, margin: "0 auto" }}>
        <Link href={canonicalPath(locale)} aria-label="Resale IQ home" style={{ fontSize: 15, fontWeight: 500, color: "inherit", textDecoration: "none" }}>Resale IQ</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LocaleSwitcher locale={locale} />
          <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: "inherit", opacity: 0.64, textDecoration: "none" }}>{t.signIn}</Link>
        </div>
      </nav>
      <PricingSection locale={locale} />
    </div>
  )
}
