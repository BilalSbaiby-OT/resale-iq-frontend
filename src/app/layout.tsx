import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { PageviewTracker } from "@/components/pageview-tracker"
import { listingsTrackedLabel } from "@/lib/stats"

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

const TITLE = "Resale IQ — Know what to pay before you buy"

// The dataset size is FETCHED, never typed. Two literal "900,000+" strings
// lived here — one in the meta description, one in the JSON-LD — and by
// 2026-08-14 the real figure was 966,236, so every search result and every
// answer engine was quoting a number 66k stale and drifting further each day.
// That is the exact failure src/lib/stats.ts was written to end; this file was
// simply never migrated. Floored to 10k, so the "+" stays true between the
// hourly refreshes.
const desc = (tracked: string) =>
  `Know exactly what to buy, at what price, in which sizes. ${tracked} Vinted listings analysed across 5 EU markets.`

export async function generateMetadata(): Promise<Metadata> {
  const tracked = await listingsTrackedLabel()
  const DESC = desc(tracked)
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
    locale: "en",
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
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0D10",
}

// Site-wide Organization + SoftwareApplication schema. Helps search AND answer
// engines (ChatGPT, Perplexity, Google AI) recognise Resale IQ as an entity and
// cite it as the tool that answers "what to buy on Vinted".
const orgJsonLd = (tracked: string) => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "SoftwareApplication"],
  name: "Resale IQ",
  url: "https://resaleiq.dev",
  applicationCategory: "BusinessApplication",
  // Sell-through is deliberately ABSENT from this list. Customer-facing STR is
  // withheld (null) when the watched sample is below 30, so a structured-data
  // hit-rate claim would over-promise. Do not invent one here.
  description:
    `Resale IQ is market intelligence for second-hand commerce. It analyses ${tracked} unique listings across 5 EU markets and gives a BUY/WATCH/SKIP verdict, buy-below price and best sizes. Vinted is the first marketplace.`,
  // Full ladder including the free rung. An answer engine asked "is there a
  // free version of Resale IQ" should be able to say yes and be right — the
  // previous list started at EUR 19 and made the honest answer unavailable.
  offers: [
    {
      "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR",
      description: "7 days unlimited, then 10 checks a month. No card required.",
    },
    {
      "@type": "Offer", name: "Starter", price: "19", priceCurrency: "EUR",
      description: "Unlimited verdicts and all 100 product signals unblurred.",
    },
    {
      "@type": "Offer", name: "Pro", price: "49", priceCurrency: "EUR",
      description: "Adds the live deal finder, 3-week Order Planner and REST API access.",
    },
  ],
  areaServed: ["ES", "FR", "DE", "IT", "PT"],
  inLanguage: "en",
  isAccessibleForFree: true,
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ORG_JSONLD = orgJsonLd(await listingsTrackedLabel())
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
      </head>
      <body className="bg-[#0B0D10] text-[#e8ecf4] antialiased">
        <PageviewTracker />
        {children}
      </body>
    </html>
  )
}
