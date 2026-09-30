import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SeoLandingPage, landingMetadata } from "@/components/seo/landing-page"
import { generateLocaleLandingStaticParams, getLanding } from "@/lib/seo-landings"
import { isPathLocale } from "@/lib/locale-routes"

import { withFittedMetadata } from "@/lib/meta-fit"
export function generateStaticParams() {
  return generateLocaleLandingStaticParams("vs")
}

async function generateMetadataRaw(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isPathLocale(locale) || !getLanding("vs", slug)) return {}
  return landingMetadata("vs", slug, locale)
}

export default async function LocaleVsLanding(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  if (!isPathLocale(locale) || !getLanding("vs", slug)) notFound()
  return <SeoLandingPage kind="vs" slug={slug} locale={locale} />
}

// Length-fit title/description (<=60/<=160) for every variant this generator returns.
export const generateMetadata = withFittedMetadata(generateMetadataRaw)
