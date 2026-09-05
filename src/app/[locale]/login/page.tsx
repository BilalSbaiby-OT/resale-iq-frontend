import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import LoginPage from "@/app/(auth)/login/page"
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
  const t = copy[locale].auth.login
  return {
    title: `${t.heading} — Resale IQ`,
    description: t.subheading,
    alternates: { canonical: canonicalPath(locale, "/login"), languages: hreflangLanguages("/login") },
  }
}

/**
 * Same reason as [locale]/register: /es/login used to hit [...rest] and 307
 * to English /login. Cookie-less curl (and a shared URL) then saw
 * "Welcome back" / "Sign in". A literal route wins over the catch-all.
 */
export default async function LocaleLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#0B0D10" }}>
      <Link href={canonicalPath(locale)} aria-label="Resale IQ home" className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-[var(--color-buy)] flex items-center justify-center text-[var(--color-on-buy)] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[var(--color-text-primary)]">Resale IQ</span>
      </Link>
      <LoginPage locale={locale} />
      <div className="mt-6">
        <LocaleSwitcher locale={locale} />
      </div>
    </div>
  )
}
