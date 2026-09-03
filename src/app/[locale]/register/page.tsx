import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/app/(auth)/register/register-form"
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
  const t = copy[locale].auth.register
  return {
    title: `${t.heading} — Resale IQ`,
    description: t.subheading,
    alternates: { canonical: canonicalPath(locale, "/register"), languages: hreflangLanguages("/register") },
  }
}

// Highest-value conversion page. Was 100% English: a locale-prefixed visit
// (e.g. /fr/register) hit src/app/[locale]/[...rest]/page.tsx's catch-all,
// which redirects to the unprefixed "/register". Content there DOES render
// translated (register-form.tsx already accepts `locale` and every string
// exists in copy[locale].auth.register) IF the NEXT_LOCALE cookie survives
// the redirect -- but the URL itself drops back to English, and any
// cookie-less fetch (a crawler, a share-preview bot, a plain curl) sees the
// English page. A literal route always wins over the [...rest] catch-all in
// Next's router (same mechanism as [locale]/methodology), so this makes
// /fr/register a real, translated, cookie-independent destination instead
// of relying on a redirect + cookie round-trip.
export default async function LocaleRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#0B0D10" }}>
      {/* Same "logo -> home" convention as (auth)/layout.tsx (UX-RULES.md
          ticket 2), but locale-aware -- linking "/" here would be the exact
          class of bug this route exists to fix (see [locale]/methodology's
          back-link note). RegisterForm renders its own LocaleSwitcher
          already, so this wrapper does not mount a second one. */}
      <Link href={canonicalPath(locale)} aria-label="Resale IQ home" className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[#0B0D10] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </Link>
      <RegisterForm locale={locale} />
    </div>
  )
}
