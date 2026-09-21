import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ToolsIndex } from "@/app/tools/page"
import { copy } from "@/lib/i18n"
import { isPathLocale, hreflangLanguages, canonicalPath, localeStaticParams } from "@/lib/locale-routes"
import { OG_IMAGES } from "@/lib/og-image"
import { listingsTrackedLabel } from "@/lib/stats"

export const generateStaticParams = localeStaticParams

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  if (!isPathLocale(locale)) return {}
  const t = copy[locale].toolsPage
  const tracked = await listingsTrackedLabel()
  const title = `${t.h1} — Resale IQ`
  const description = t.lede.replaceAll("{tracked}", tracked)
  return {
    title,
    description,
    alternates: { canonical: canonicalPath(locale, "/tools"), languages: hreflangLanguages("/tools") },
    openGraph: { title, description, type: "website", url: canonicalPath(locale, "/tools"), images: OG_IMAGES },
    twitter: { card: "summary_large_image", title, description, images: OG_IMAGES },
  }
}

export default async function LocaleToolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; src?: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  return <ToolsIndex searchParams={searchParams} />
}
