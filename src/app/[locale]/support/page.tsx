import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SupportPage } from "@/app/support/page"
import { support } from "@/lib/support-copy"
import { isPathLocale, hreflangLanguages, canonicalPath, localeStaticParams } from "@/lib/locale-routes"

export const generateStaticParams = localeStaticParams

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isPathLocale(locale)) return {}
  const t = support(locale)
  return {
    title: t.pageTitle,
    description: t.metaDescription,
    alternates: { canonical: canonicalPath(locale, "/support"), languages: hreflangLanguages("/support") },
  }
}

// Was 100% English: a locale-prefixed visit (e.g. /fr/support) hit
// src/app/[locale]/[...rest]/page.tsx's catch-all and redirected straight to
// the unprefixed English "/support" -- no cookie mechanism here at all
// (unlike /register), so every visitor landed in English regardless of
// which locale they clicked from. A literal route wins over the [...rest]
// catch-all in Next's router (same mechanism as [locale]/methodology and
// [locale]/register), so this makes /fr/support (and es/de/it/pt) a real,
// translated destination.
export default async function LocaleSupportPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  return <SupportPage locale={locale} />
}
