import { notFound } from "next/navigation"
import { PATH_LOCALES, isPathLocale } from "@/lib/locale-routes"

// English stays unprefixed at "/" (src/app/page.tsx) — "en" is deliberately
// NOT a valid value here, so "/en" 404s rather than duplicating the root.
export function generateStaticParams() {
  return PATH_LOCALES.map((locale) => ({ locale }))
}

// The single <html> tag lives in the real root layout (src/app/layout.tsx),
// which reads the `x-resaleiq-locale` header src/proxy.ts stamps on every
// request — this segment layout only guards the param and passes children
// through. Anything outside PATH_LOCALES (typos, "/en", a locale we do not
// translate) 404s instead of silently rendering English under a foreign URL
// and hreflang tag, which would be a worse failure than no page at all.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPathLocale(locale)) notFound()
  return children
}
