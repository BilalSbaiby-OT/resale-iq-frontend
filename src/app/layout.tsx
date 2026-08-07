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
  offers: [
    { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "EUR" },
    { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "EUR" },
  ],
  areaServed: ["ES", "FR", "DE", "IT", "PT"],
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
