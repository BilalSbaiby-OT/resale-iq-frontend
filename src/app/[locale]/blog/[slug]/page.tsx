import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import type { Metadata } from "next"
import { HubFaq } from "@/components/seo/hub-faq"
import { MoneyCta } from "@/components/money-cta"
import { faqPageJsonLd } from "@/lib/faq-schema"
import { moneyCtaPricingHref } from "@/lib/money-cta"
import {
  BLOG_CLONE_ES_REDIRECT,
  blogCloneHreflang,
  blogClonePath,
  getBlogCloneCopy,
  generateLocaleBlogCloneParams,
  isBlogCloneSlug,
  landingPageTitle,
} from "@/lib/seo-landings"
import { fillLandingPlaceholders, landingStats, LandingCopyChrome } from "@/components/seo/landing-page"
import { isPathLocale } from "@/lib/locale-routes"
import { articleSocialMeta } from "@/lib/flip-category-meta"

const BASE = "https://resaleiq.dev"

export function generateStaticParams() {
  return generateLocaleBlogCloneParams()
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isPathLocale(locale) || !isBlogCloneSlug(slug)) return {}
  if (locale === "es" && slug in BLOG_CLONE_ES_REDIRECT) return {}
  const copy = getBlogCloneCopy(slug, locale)
  if (!copy) return {}
  const title = landingPageTitle(copy)
  const path = blogClonePath(slug, locale)
  return {
    ...articleSocialMeta(title, copy.description, path),
    title,
    description: copy.description,
    alternates: { canonical: path, languages: blogCloneHreflang(slug) },
  }
}

export default async function LocaleBlogClonePage(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  if (!isPathLocale(locale) || !isBlogCloneSlug(slug)) notFound()
  const esTo = locale === "es" ? BLOG_CLONE_ES_REDIRECT[slug] : undefined
  if (esTo) permanentRedirect(esTo)

  const raw = getBlogCloneCopy(slug, locale)
  if (!raw) notFound()
  const copy = fillLandingPlaceholders(raw, await landingStats())
  const prefix = `/${locale}`
  const href = `${prefix}${moneyCtaPricingHref(`seo_blog_${slug}`)}`
  const jsonLd = [
    faqPageJsonLd(copy.faqs),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: BASE },
        { "@type": "ListItem", position: 2, name: "blog", item: `${BASE}/blog` },
        { "@type": "ListItem", position: 3, name: copy.h1, item: `${BASE}${blogClonePath(slug, locale)}` },
      ],
    },
  ]

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" style={{ color: "#34C759", textDecoration: "none", fontSize: 13 }}>← blog</Link>
      <LandingCopyChrome copy={copy} />
      <MoneyCta href={href} secondaryHref={`${prefix}/data`} secondaryLabel="/data" />
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, margin: "-12px 0 22px" }}>{copy.ctaSub}</p>
      <p style={{ color: "#8b99b8", fontSize: 14.5, marginBottom: 22 }}>
        <Link href={`${prefix}/data`} style={{ color: "#34C759", textDecoration: "none" }}>/data</Link>
        {" · "}
        <Link href={`${prefix}/tools`} style={{ color: "#34C759", textDecoration: "none" }}>/tools</Link>
        {" · "}
        <Link href={`${prefix}/pricing`} style={{ color: "#34C759", textDecoration: "none" }}>/pricing</Link>
        {" · "}
        <Link href={`/blog/${slug}`} style={{ color: "#34C759", textDecoration: "none" }}>EN original</Link>
      </p>
      <HubFaq items={copy.faqs} />
    </main>
  )
}
