import type { Metadata, Viewport } from "next"
import "./globals.css"

const TITLE = "Resale IQ — Market Intelligence for Vinted Resellers"
const DESC = "Know exactly what to buy, at what price, in which sizes. Millions of Vinted listings analyzed across 5 EU markets."

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0D10] text-[#e8ecf4] antialiased">
        {children}
      </body>
    </html>
  )
}
