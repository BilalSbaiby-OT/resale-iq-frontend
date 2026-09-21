import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SeoLandingPage, landingMetadata } from "@/components/seo/landing-page"
import { generateLocaleLandingStaticParams, getLanding } from "@/lib/seo-landings"
import { isPathLocale } from "@/lib/locale-routes"

export function generateStaticParams() {
  return generateLocaleLandingStaticParams("for")
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isPathLocale(locale) || !getLanding("for", slug)) return {}
  return landingMetadata("for", slug, locale)
}

export default async function LocaleForLanding(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  if (!isPathLocale(locale) || !getLanding("for", slug)) notFound()
  return <SeoLandingPage kind="for" slug={slug} locale={locale} />
}
