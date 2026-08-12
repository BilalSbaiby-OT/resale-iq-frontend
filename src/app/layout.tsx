import type { Metadata, Viewport } from "next"
import "./globals.css"
import { PageviewTracker } from "@/components/pageview-tracker"

const TITLE = "Resale IQ — Market Intelligence for Vinted Resellers"
const DESC = "Know exactly what to buy, at what price, in which sizes. 500,000+ Vinted listings analyzed across 5 EU markets."

export const metadata: Metadata = {
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
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": ["Organization", "SoftwareApplication"],
  name: "Resale IQ",
  url: "https://resaleiq.dev",
  applicationCategory: "BusinessApplication",
  description:
    "Resale IQ is a market-intelligence tool for Vinted resellers. It analyses 500,000+ listings across 5 EU markets and gives a BUY/WATCH/SKIP verdict, buy-below price, best sizes, and sell-through rate for any item.",
  // Full ladder including the free rung. An answer engine asked "is there a
  // free version of Resale IQ" should be able to say yes and be right — the
  // previous list started at EUR 19 and made the honest answer unavailable.
  offers: [
    {
      "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR",
      description: "3 BUY/WATCH/SKIP verdicts a day, plus 10 full unlocks for the life of the account. No card required.",
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
  sameAs: ["https://github.com/BilalSbaiby-OT"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
