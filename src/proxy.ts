import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PATH_LOCALES, isPathLocale } from "@/lib/locale-routes"

/**
 * Makes the URL, not the Accept-Language header, the source of truth for
 * which language a page is served in.
 *
 * Before this file: "/" read Accept-Language on every request and silently
 * swapped in French/Spanish/German/Italian/Portuguese copy with no URL
 * change, no Vary header, and no way for a crawler (which does not send a
 * meaningful Accept-Language) to ever see anything but English. That is
 * fixed at the content layer (src/app/page.tsx now always renders English,
 * src/app/[locale]/page.tsx renders the translated copy) — this file's job
 * is only to get a *human* visitor to the right URL.
 *
 * - First visit, no stored preference, Accept-Language prefers a market we
 *   translate: 307 to "/<locale>". 307 (not 308) because this is a
 *   preference redirect, not a permanent move of "/" — the English root
 *   stays the canonical page a permanent redirect would otherwise cache over.
 * - A NEXT_LOCALE cookie is set on first redirect and whenever a locale path
 *   is visited directly, so a visitor who deliberately navigates back to "/"
 *   is not forced into a loop back to their browser's language.
 * - Visiting "/<locale>" directly always serves that locale, Accept-Language
 *   or not — that is what makes the URL canonical and indexable rather than
 *   the header.
 *
 * Named `proxy` (not `middleware`) because this Next.js version renamed the
 * convention — verified against node_modules/next/dist/docs/01-app/03-api-
 * reference/03-file-conventions/proxy.md rather than assumed.
 */

// Only "/" has a translated route today (src/app/[locale]/page.tsx). Adding a
// path here ahead of a real translated route would redirect a visitor into a
// 404 or an English page wearing a foreign hreflang tag.
const REDIRECT_ELIGIBLE_PATHS = new Set<string>(["/"])

const COOKIE = "NEXT_LOCALE"
const LOCALE_HEADER = "x-resaleiq-locale"

function acceptLanguageLocale(header: string | null): (typeof PATH_LOCALES)[number] | null {
  const parts = (header || "")
    .split(",")
    .map((s) => s.trim().split(";")[0].toLowerCase())
  for (const p of parts) {
    for (const l of PATH_LOCALES) {
      if (p === l || p.startsWith(`${l}-`)) return l
    }
  }
  return null
}

function withLocaleHeader(request: NextRequest, locale: string) {
  const headers = new Headers(request.headers)
  headers.set(LOCALE_HEADER, locale)
  return NextResponse.next({ request: { headers } })
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split("/").filter(Boolean)
  const first = segments[0]

  if (first && isPathLocale(first)) {
    // URL already names the language explicitly. Serve it as-is — do not let
    // Accept-Language override a locale the visitor (or a crawler) typed or
    // clicked. Remember the choice so "/" does not bounce them right back.
    const res = withLocaleHeader(request, first)
    res.cookies.set(COOKIE, first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
    return res
  }

  if (REDIRECT_ELIGIBLE_PATHS.has(pathname) && !request.cookies.get(COOKIE)) {
    const preferred = acceptLanguageLocale(request.headers.get("accept-language"))
    if (preferred) {
      const url = request.nextUrl.clone()
      url.pathname = `/${preferred}`
      const res = NextResponse.redirect(url, 307)
      res.cookies.set(COOKIE, preferred, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
      return res
    }
  }

  return withLocaleHeader(request, "en")
}

export const config = {
  matcher: [
    // Skip static assets, API/backend rewrites, and anything with a file
    // extension (images, robots.txt, sitemap.xml, llms.txt, etc). Running the
    // proxy on those would not break them (redirect logic only fires on "/"
    // and locale-prefixed paths) but there is no reason to pay the cost.
    "/((?!_next/static|_next/image|api/|auth/|stripe/|admin/|favicon.ico|.*\\..*).*)",
  ],
}
