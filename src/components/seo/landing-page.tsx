import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { HubFaq } from "@/components/seo/hub-faq"
import { MoneyCta } from "@/components/money-cta"
import { faqPageJsonLd } from "@/lib/faq-schema"
import { moneyCtaPricingHref } from "@/lib/money-cta"
import { getMarketNumbers, fmtCount } from "@/lib/market-numbers"
import { listingsTrackedLabel } from "@/lib/stats"
import {
  type LandingKind,
  type LandingCopy,
  landingPath,
  landingHubPath,
  landingsOf,
  getLandingCopy,
  landingPageTitle,
  landingSocialMeta,
  LANDING_KINDS,
  LANDING_HUB_COPY,
} from "@/lib/seo-landings"
import type { Locale } from "@/lib/i18n"
import { canonicalPath, hreflangLanguages, isPathLocale } from "@/lib/locale-routes"

const BASE = "https://resaleiq.dev"

const DATA_LINK: Record<Locale, string> = {
  en: "Public volumes on /data",
  es: "Volúmenes públicos en /data",
  fr: "Volumes publics sur /data",
  de: "Öffentliche Volumen auf /data",
  it: "Volumi pubblici su /data",
  pt: "Volumes públicos em /data",
}

export function fillLandingPlaceholders(
  copy: LandingCopy,
  stats: { tracked: string; brands: string; weekly: string },
): LandingCopy {
  const fill = (s: string) =>
    s.replaceAll("{tracked}", stats.tracked).replaceAll("{brands}", stats.brands).replaceAll("{weekly}", stats.weekly)
  return {
    ...copy,
    intro: fill(copy.intro),
    verdict: fill(copy.verdict),
    ctaSub: fill(copy.ctaSub),
    sections: copy.sections.map((sec) => ({ h: fill(sec.h), p: sec.p.map(fill) })),
    table: {
      ...copy.table,
      caption: fill(copy.table.caption),
      head: copy.table.head.map(fill),
      rows: copy.table.rows.map((row) => row.map(fill)),
    },
    faqs: copy.faqs.map((f) => ({ q: fill(f.q), a: fill(f.a) })),
  }
}

function localePrefix(locale: Locale) {
  return locale === "en" ? "" : `/${locale}`
}

export async function landingStats() {
  const market = await getMarketNumbers()
  const tracked = await listingsTrackedLabel()
  const solds = market.brandNames
    .map((name) => market.get(name)?.sold_7d)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
  const weekly = solds.length ? solds.reduce((s, n) => s + n, 0) : null
  return {
    tracked,
    brands: String(market.brandCount),
    weekly: fmtCount(weekly),
  }
}

export async function landingMetadata(
  kind: LandingKind,
  slug: string,
  locale: Locale,
): Promise<Metadata> {
  const copy = getLandingCopy(kind, slug, locale)
  if (!copy) return { title: "Not found — Resale IQ" }
  const title = landingPageTitle(copy)
  const path = landingPath(kind, slug, locale)
  const social = landingSocialMeta(kind, slug, copy, locale)
  return {
    ...social,
    title,
    description: copy.description,
    alternates: {
      canonical: path,
      languages: hreflangLanguages(`/${kind}/${slug}`),
    },
  }
}

export async function landingHubMetadata(kind: LandingKind, locale: Locale): Promise<Metadata> {
  const t = LANDING_HUB_COPY[kind][locale]
  const path = landingHubPath(kind, locale)
  return {
    title: t.title.endsWith(" — Resale IQ") ? t.title : `${t.title} — Resale IQ`,
    description: t.description,
    alternates: { canonical: path, languages: hreflangLanguages(`/${kind}`) },
    openGraph: { title: t.title, description: t.description, type: "website", url: path },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  }
}

export function LandingBody({
  kind,
  slug,
  locale,
  copy,
}: {
  kind: LandingKind
  slug: string
  locale: Locale
  copy: LandingCopy
}) {
  const prefix = localePrefix(locale)
  const href =
    locale === "en"
      ? moneyCtaPricingHref(`seo_${kind}_${slug}`)
      : `/${locale}${moneyCtaPricingHref(`seo_${kind}_${slug}`)}`
  const jsonLd = [
    faqPageJsonLd(copy.faqs),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: BASE },
        { "@type": "ListItem", position: 2, name: kind, item: `${BASE}${landingHubPath(kind, locale)}` },
        { "@type": "ListItem", position: 3, name: copy.h1, item: `${BASE}${landingPath(kind, slug, locale)}` },
      ],
    },
  ]
  const siblings = landingsOf(kind).filter((l) => l.slug !== slug)

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href={landingHubPath(kind, locale)} style={{ color: "#34C759", textDecoration: "none", fontSize: 13 }}>
        ← {kind}
      </Link>
      <LandingCopyChrome copy={copy} />

      {copy.table.head.length > 0 && (
        <>
      <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>{copy.table.caption}</h2>
      <div style={{ overflowX: "auto", border: "1px solid var(--color-border-ui)", borderRadius: 12, marginBottom: 22 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 520 }}>
          <caption style={{ captionSide: "top", textAlign: "left", padding: "10px 14px", color: "#8b99b8" }}>{copy.table.caption}</caption>
          <thead>
            <tr style={{ background: "var(--color-surface)", color: "#8b99b8", textAlign: "left" }}>
              {copy.table.head.map((h) => (
                <th key={h} style={{ padding: "11px 14px", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {copy.table.rows.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--color-border-ui)" }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "11px 14px", color: j === 0 ? "#eef1f7" : "#a9b6d0" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}

      <MoneyCta href={href} secondaryHref={`${prefix}/data`} secondaryLabel={DATA_LINK[locale]} />
      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, margin: "-12px 0 22px" }}>{copy.ctaSub}</p>

      <p style={{ color: "#8b99b8", fontSize: 14.5, lineHeight: 1.65, marginBottom: 22 }}>
        <Link href={`${prefix}/data`} style={{ color: "#34C759", textDecoration: "none" }}>/data</Link>
        {" · "}
        <Link href={`${prefix}/tools`} style={{ color: "#34C759", textDecoration: "none" }}>/tools</Link>
        {" · "}
        <Link href={`${prefix}/flip`} style={{ color: "#34C759", textDecoration: "none" }}>/flip</Link>
        {" · "}
        <Link href={`${prefix}/methodology`} style={{ color: "#34C759", textDecoration: "none" }}>/methodology</Link>
        {" · "}
        <Link href={`${prefix}/pricing`} style={{ color: "#34C759", textDecoration: "none" }}>/pricing</Link>
      </p>

      {siblings.length > 0 && (
        <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>
            {LANDING_HUB_COPY[kind][locale].more}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {siblings.map((s) => {
              const sc = getLandingCopy(s.kind, s.slug, locale)
              return (
                <Link
                  key={s.slug}
                  href={landingPath(s.kind, s.slug, locale)}
                  style={{
                    fontSize: 14, color: "#8fa3c4", textDecoration: "none",
                    background: "var(--color-surface)", border: "1px solid var(--color-border-ui)",
                    borderRadius: 9, padding: "10px 14px",
                  }}
                >
                  {sc?.h1 ?? s.slug}
                </Link>
              )
            })}
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
        {LANDING_KINDS.filter((k) => k !== kind).map((k) => (
          <Link key={k} href={landingHubPath(k, locale)} style={{ color: "#8fa3c4", fontSize: 13.5, textDecoration: "none" }}>
            → /{k}
          </Link>
        ))}
      </div>

      <HubFaq items={copy.faqs} />
    </main>
  )
}

export function makeLocaleLandingHub(kind: LandingKind) {
  return {
    generateMetadata: async (
      { params }: { params: Promise<{ locale: string }> },
    ): Promise<Metadata> => {
      const { locale } = await params
      if (!isPathLocale(locale)) return {}
      return landingHubMetadata(kind, locale)
    },
    Page: async (
      { params }: { params: Promise<{ locale: string }> },
    ) => {
      const { locale } = await params
      if (!isPathLocale(locale)) notFound()
      return <LandingHub kind={kind} locale={locale} />
    },
  }
}

export function LandingCopyChrome({ copy }: { copy: LandingCopy }) {
  return (
    <>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", margin: "22px 0 10px", lineHeight: 1.2 }}>
        {copy.h1}
      </h1>
      <p data-testid="riq-landing-verdict" style={{ color: "#eef1f7", fontSize: 17, lineHeight: 1.6, marginBottom: 18 }}>
        {copy.verdict}
      </p>
      <p style={{ color: "#a9b6d0", fontSize: 15, lineHeight: 1.7, marginBottom: 22, maxWidth: 680 }}>{copy.intro}</p>
      {copy.sections.map((sec) => (
        <section key={sec.h}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", margin: "28px 0 10px" }}>{sec.h}</h2>
          {sec.p.map((para) => (
            <p key={para.slice(0, 40)} style={{ color: "#a9b6d0", fontSize: 15, lineHeight: 1.7, marginBottom: 14, maxWidth: 680 }}>
              {para}
            </p>
          ))}
        </section>
      ))}
    </>
  )
}

export async function SeoLandingPage({
  kind,
  slug,
  locale,
}: {
  kind: LandingKind
  slug: string
  locale: Locale
}) {
  const raw = getLandingCopy(kind, slug, locale)
  if (!raw) notFound()
  const filled = fillLandingPlaceholders(raw, await landingStats())
  return <LandingBody kind={kind} slug={slug} locale={locale} copy={filled} />
}

export function LandingHub({ kind, locale }: { kind: LandingKind; locale: Locale }) {
  const pages = landingsOf(kind)
  const t = LANDING_HUB_COPY[kind][locale]
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <Link href={canonicalPath(locale, "")} style={{ color: "#34C759", textDecoration: "none", fontSize: 13 }}>
        ← Resale IQ
      </Link>
      <h1 style={{ fontSize: 30, fontWeight: 600, color: "#eef1f7", margin: "22px 0 12px" }}>{t.h1}</h1>
      <p style={{ color: "#a9b6d0", fontSize: 15, lineHeight: 1.7, marginBottom: 22, maxWidth: 680 }}>{t.description}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pages.map((p) => {
          const c = getLandingCopy(p.kind, p.slug, locale)
          return (
            <Link
              key={p.slug}
              href={landingPath(p.kind, p.slug, locale)}
              style={{
                fontSize: 15, color: "#eef1f7", textDecoration: "none",
                background: "var(--color-surface)", border: "1px solid var(--color-border-ui)",
                borderRadius: 9, padding: "14px 16px",
              }}
            >
              {c?.h1 ?? p.slug}
              <div style={{ fontSize: 13, color: "#8b99b8", marginTop: 4 }}>{c?.description}</div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
