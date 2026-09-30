import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { DataPage } from "@/app/data/page"
import { dataChrome } from "@/data/seo-data-copy"
import { isPathLocale, hreflangLanguages, canonicalPath, localeStaticParams } from "@/lib/locale-routes"
import { OG_IMAGES } from "@/lib/og-image"

import { withFittedMetadata } from "@/lib/meta-fit"
export const dynamic = "force-dynamic"
export const generateStaticParams = localeStaticParams

async function generateMetadataRaw(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  if (!isPathLocale(locale)) return {}
  const t = dataChrome[locale]
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: canonicalPath(locale, "/data"), languages: hreflangLanguages("/data") },
    openGraph: { title: t.title, description: t.description, type: "website", url: canonicalPath(locale, "/data"), images: OG_IMAGES },
    twitter: { card: "summary_large_image", title: t.title, description: t.description, images: OG_IMAGES },
  }
}

export default async function LocaleDataPage(
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  return <DataPage locale={locale} />
}

// Length-fit title/description (<=60/<=160) for every variant this generator returns.
export const generateMetadata = withFittedMetadata(generateMetadataRaw)
