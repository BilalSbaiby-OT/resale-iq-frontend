import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { PricingPage } from "@/app/pricing/page"
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
  const t = copy[locale].pricingSection
  // Same string for <title>, og:title and twitter:title. Root layout pins
  // homepage social tags; a child that sets only `title` (or a shorter
  // openGraph title) still shares as the generic homepage on X/Slack.
  const title = `${t.metaTitle} — Resale IQ`
  return {
    title,
    description: t.metaDescription,
    alternates: { canonical: canonicalPath(locale, "/pricing"), languages: hreflangLanguages("/pricing") },
    openGraph: { title, description: t.metaDescription, type: "website", url: canonicalPath(locale, "/pricing") },
    twitter: { card: "summary_large_image", title, description: t.metaDescription },
  }
}

// "/es/pricing" used to 307 to "/es#pricing" via the [...rest] catch-all
// (src/app/[locale]/[...rest]/page.tsx), which was the right call while
// "/pricing" itself was only a redirect. Now that it is a real page, the five
// translated markets get the real page too rather than a locale-flavoured
// anchor — the section reads copy[locale] for every string it renders, so
// there is nothing English left behind to hide.
//
// A literal "[locale]/pricing/page.tsx" beats the "[...rest]" catch-all in
// Next's router, so this route wins on its own; the now-dead special case has
// been removed from that file rather than left to rot.
export default async function LocalePricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  return <PricingPage locale={locale} />
}
