import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MethodologyPage } from "@/app/methodology/page"
import { methodology } from "@/lib/methodology-copy"
import { isPathLocale, hreflangLanguages, canonicalPath, localeStaticParams } from "@/lib/locale-routes"

// Same live figures as "/methodology" (tracked count, weekly departures) —
// same revalidate window so a locale reader is not looking at a staler
// snapshot than an English one.
export const revalidate = 900

export const generateStaticParams = localeStaticParams

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isPathLocale(locale)) return {}
  const t = methodology(locale)
  return {
    title: t.text0,
    description: t.text1,
    alternates: { canonical: canonicalPath(locale, "/methodology"), languages: hreflangLanguages("/methodology") },
    openGraph: {
      title: t.text0,
      description: t.text1,
      type: "article",
    },
  }
}

// Same page as "/methodology" (src/app/methodology/page.tsx) and the same
// content function -- only the locale changes. See methodology-copy.ts's
// header for what is verified translated (58 keys, all 6 locales) and grep
// that file's default export for "no key yet" for the handful of short
// fragments that have no translation key and render in English on every
// locale until a follow-up pass covers them -- this route does not paper
// over that gap, it inherits it honestly from the shared component.
export default async function LocaleMethodology({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  return <MethodologyPage locale={locale} />
}
