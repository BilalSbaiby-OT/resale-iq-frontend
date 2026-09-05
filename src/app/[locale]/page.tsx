import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { LandingContent } from "@/components/landing/landing-content"
import { listingsTrackedLabel, listingsTrackedExact } from "@/lib/stats"
import { getMarketNumbers } from "@/lib/market-numbers"
import { getHeroVerdict } from "@/lib/hero-verdict"
import { copy } from "@/lib/i18n"
import { isPathLocale, hreflangLanguages, canonicalPath } from "@/lib/locale-routes"

// og:locale wants underscore region tags, not the bare two-letter codes the
// dictionary and the URL both use.
const OG_LOCALE: Record<string, string> = { es: "es_ES", fr: "fr_FR", de: "de_DE", it: "it_IT", pt: "pt_PT" }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isPathLocale(locale)) return {}
  const t = copy[locale]
  return {
    title: t.heroTitle,
    description: t.heroBody,
    alternates: { canonical: canonicalPath(locale), languages: hreflangLanguages() },
    openGraph: {
      title: t.heroTitle,
      description: t.heroBody,
      url: canonicalPath(locale),
      siteName: "Resale IQ",
      type: "website",
      locale: OG_LOCALE[locale],
    },
    twitter: { card: "summary_large_image", title: t.heroTitle, description: t.heroBody },
  }
}

// Same page as "/" (src/app/page.tsx), same LandingContent component, only
// the dictionary changes — see landing-content.tsx for what is and is not
// translated yet. The route only exists for the five locales the dictionary
// actually has full parity for (verified 2026-09-01, commit 44704fc); the
// layout above 404s anything else before this ever renders.
export default async function LocaleLanding({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  const tracked = await listingsTrackedLabel()
  const trackedExact = await listingsTrackedExact()
  const market = await getMarketNumbers()
  const hero = await getHeroVerdict()
  return (
    <LandingContent t={copy[locale]} locale={locale} tracked={tracked} trackedExact={trackedExact} market={market} heroQuery={hero.query} heroResult={hero.result} />
  )
}
