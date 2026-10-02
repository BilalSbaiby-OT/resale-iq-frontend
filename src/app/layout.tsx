import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { PageviewTracker } from "@/components/pageview-tracker"
import { GadsTag } from "@/components/gads-tag"
import { ConsentBanner } from "@/components/consent-banner"
import { FrontDoorTheme } from "@/components/layout/front-door-theme"
import { LocaleProvider } from "@/components/i18n/locale-provider"
import { listingRecordsHeadline } from "@/lib/stats"
import { requestLocale } from "@/lib/request-locale"
import { structuredDataCopy } from "@/lib/structured-data-copy"
import type { Locale } from "@/lib/i18n"

// Self-hosted, NOT hot-linked.
//
// globals.css opened with @import url("https://fonts.googleapis.com/...") and
// the site's own Content-Security-Policy (style-src 'self' 'unsafe-inline')
// blocked it on every request, so production had been rendering in system-ui
// the whole time — the console showed the violation on every page load and
// document.fonts listed nothing loaded. Two separate reasons not to just widen
// the CSP: hot-linking Google Fonts sends every EU visitor's IP to Google,
// which German courts have already held breaches the GDPR, and this site
// serves ES/FR/DE/IT/PT. next/font downloads at build time and serves from our
// own origin: no third-party request, no CSP hole, no layout shift.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" })

// EX-HOMEPAGE-AEO — answer-first, brand suffix. Demand OS, not Vinted-sourcing.
// Soft cap 60. H1 on `/` stays t.heroHeadline.
const TITLE = "What to buy this week to resell on Vinted — Resale IQ"

// The dataset size is FETCHED, never typed. The meta description and JSON-LD
// carry the ONE headline ("14M+ listing records", listingRecordsHeadline() in
// stats.ts: COUNT(*) floored to the whole million). The exact distinct-item
// count lives on /data, /methodology and the /pricing market pulse only.
//
// No records figure (warehouse unreachable) means NO figure clause — never the
// distinct count wearing the "listing records" label, which is what this used
// to do and is how one page came to carry two different "sizes".
const desc = (tracked: string) =>
  `${tracked !== "—" ? `${tracked} listing records across 5 EU markets. ` : ""}Vinted resale signals: what leaves the shelf, buy-below price, BUY/WATCH/SKIP verdict per item.`

export async function generateMetadata(): Promise<Metadata> {
  const tracked = await listingRecordsHeadline()
  const DESC = desc(tracked)
  const locale = await requestLocale()
  return {
  metadataBase: new URL("https://resaleiq.dev"),
  title: { default: TITLE, template: "%s" },
  description: DESC,
  applicationName: "Resale IQ",
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "https://resaleiq.dev",
    siteName: "Resale IQ",
    type: "website",
    // Page-level metadata (src/app/[locale]/page.tsx) overrides this per
    // route; this default only matters for routes with no metadata of their
    // own. Reads the same proxy-stamped header as <html lang> so the two
    // never disagree.
    locale,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
  robots: { index: true, follow: true },
  // Google Search Console ownership. Google does NOT support IndexNow, so
  // Search Console (or inbound links) is its only discovery path.
  //
  // Checked in rather than read from a runtime env var, on purpose. This page
  // is statically prerendered, so process.env is evaluated at BUILD time — a
  // value set in Coolify's runtime environment would never reach the emitted
  // HTML, which is the same build-vs-runtime trap that broke BACKEND_URL. The
  // token is public by design (Google requires it to be served in the page),
  // so there is nothing to protect by keeping it out of the repo. The env var
  // still wins if set, so it can be rotated without a code change.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION
      || "6JW8vtenTRCdaP9uzpKI81gASKOZxg2WEK8cmLYNxKM",
  },
  }
}

// Without this, mobile browsers render at ~980px desktop width and force the
// user to pinch-zoom. Our customers are mostly on phones — this is essential.
// theme-color follows the front door: light canvas on public entry routes,
// near-black on the logged-in app. The proxy stamps the header; this must
// stay a function (not a static export) or every route shares one colour.
export async function generateViewport(): Promise<Viewport> {
  const frontDoor = (await headers()).get("x-resaleiq-front-door") === "1"
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: frontDoor ? "#F5F5F7" : "#0B0D10",
    colorScheme: frontDoor ? "light" : "dark",
  }
}

// Site-wide Organization + SoftwareApplication schema. Helps search AND answer
// engines (ChatGPT, Perplexity, Google AI) recognise Resale IQ as an entity and
// cite it as the tool that answers "what to buy on Vinted".
//
// LOCALISED. This block used to be English on every response. The layout has
// resolved the request locale since locale routing shipped, and used it for
// `lang` and `inLanguage` — so /es announced itself as Spanish and then
// described the product in English underneath, to the exact audience (Google,
// ChatGPT, Perplexity) that reads structured data and nothing else. The strings
// now come from src/lib/structured-data-copy.ts, composed from copy this repo
// had already translated, so the schema and the visible page agree.
//
// Tier names stay English in every locale, same rule as the pricing page
// (i18n.ts:273), which is why they are here at `name` and not in the copy file.
const orgJsonLd = (tracked: string, locale: Locale) => {
  const t = structuredDataCopy(locale)
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "SoftwareApplication"],
    name: "Resale IQ",
    url: "https://resaleiq.dev",
    applicationCategory: "BusinessApplication",
    // Sell-through is deliberately ABSENT from this list. Customer-facing STR is
    // withheld (null) when the watched sample is below 30, so a structured-data
    // hit-rate claim would over-promise. Do not invent one here.
    description: t.description(tracked),
    // HARD_PAYWALL (live 402): there is no free item-check product. Public
    // weekly volumes live on /data as a Dataset, not as a SoftwareApplication
    // Offer at price 0. An answer engine asked "is there a free version"
    // should say no for item checks, yes for brand aggregates.
    offers: [
      { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "EUR", description: t.offerStarter },
      { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "EUR", description: t.offerPro },
    ],
    areaServed: ["ES", "FR", "DE", "IT", "PT"],
    inLanguage: locale,
    isAccessibleForFree: false,
  }
}

/**
 * Dedicated Organization entity (EX-ORG-WEBSITE-JSONLD, 2026-09-29).
 *
 * The block above already carries "@type": ["Organization", "SoftwareApplication"]
 * on one node, which is valid JSON-LD but means an entity-lookup crawler that
 * only understands a single "Organization" node (not the array-typed hybrid)
 * has nothing clean to key off. This is a SEPARATE, minimal Organization node —
 * name, url, logo, description only. No linked-profile list: the company has
 * no real official social profiles linked on the live site today, and
 * inventing one is a false entity claim. No rating or review fields either —
 * no fake social proof, ever.
 *
 * logo: there is no dedicated Resale IQ logo file under /public (checked
 * 2026-09-29 — /public holds brand-marks/*.svg for OTHER brands, social/*.png
 * for platform icons, and a product screenshot; none is Resale IQ's own mark).
 * /favicon.ico is the one real, absolute, already-live square icon that
 * exists today (served by Next's file convention from src/app/favicon.ico),
 * so it is the honest choice here — not a stand-in URL that 404s.
 */
const organizationEntityJsonLd = (tracked: string, locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Resale IQ",
  url: "https://resaleiq.dev",
  logo: "https://resaleiq.dev/favicon.ico",
  description: structuredDataCopy(locale).description(tracked),
})

/**
 * WebSite entity (EX-ORG-WEBSITE-JSONLD). Names the site as a distinct thing
 * from the Organization that publishes it — the standard pairing search and
 * answer engines expect. No SearchAction: there is no site-wide search box
 * to point a potentialAction at (the checker is a specific tool, not a
 * generic site search), and a fabricated one would 404 or mismatch on click.
 */
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Resale IQ",
  url: "https://resaleiq.dev",
}

/**
 * There is exactly one <html> tag in the app (Next.js root layout), so it
 * cannot itself live under `app/[locale]/`. Instead `src/proxy.ts` stamps
 * every request with `x-resaleiq-locale` (URL-derived, not header-derived —
 * "/de" always gets "de" even with no Accept-Language at all, which is what
 * makes it crawlable), and this layout reads that header to set `lang` and
 * the JSON-LD `inLanguage`. Before this, `lang="en"` was hardcoded and wrong
 * on every non-English response.
 *
 * The local copy of `requestLocale()` that used to live here was deleted in
 * favour of the shared one in `@/lib/request-locale` — it was byte-identical
 * to it, i.e. exactly the "two copies of a rule means two places to be wrong"
 * defect proxy.ts's own acceptLanguageLocale comment was written about.
 *
 * `LocaleProvider` hands the same resolved value to client components (the
 * sidebar, topbar and app-shell chrome), which have no other way to reach the
 * proxy header. Server and client therefore agree on first paint.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await requestLocale()
  const frontDoor = (await headers()).get("x-resaleiq-front-door") === "1"
  const trackedLabel = await listingRecordsHeadline()
  const ORG_JSONLD = orgJsonLd(trackedLabel, locale)
  const ORGANIZATION_ENTITY_JSONLD = organizationEntityJsonLd(trackedLabel, locale)
  return (
    <html lang={locale} className={`${frontDoor ? "riq-light" : "dark"} ${inter.variable} ${mono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_ENTITY_JSONLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </head>
      <body className="bg-[#0B0D10] text-[#e8ecf4] antialiased">
        <FrontDoorTheme />
        <PageviewTracker />
        <GadsTag />
        <LocaleProvider locale={locale}>{children}<ConsentBanner /></LocaleProvider>
      </body>
    </html>
  )
}
