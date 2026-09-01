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
 *
 * W19: the post-signup funnel (`/register` → `/check-email` → `/verify-email`
 * → `/dashboard`) is reached by clicking a CTA off a translated `/<locale>`
 * page, but none of those four routes live under `/<locale>` themselves (see
 * `docs/company/WORKBOARD.md` W19 for why: they're the highest-commitment
 * moment on the site, including an EU legal consent, and re-platforming them
 * under `[locale]` — rewriting every CTA in `landing-content.tsx` across five
 * locales, duplicating auth routes per locale — was rejected as materially
 * more surface than the bug needs. Instead this proxy already stamps a
 * `NEXT_LOCALE` cookie on every `/<locale>` visit (below); `COOKIE_LOCALE_PATHS`
 * reads that cookie back for exactly these four routes and serves them in
 * the visitor's chosen language without changing the URL. Deliberately NOT
 * widened to every unprefixed path — most of the site (`/methodology`,
 * `/terms`, blog, etc.) has no translated content behind it yet, and
 * stamping a foreign `x-resaleiq-locale` there would put a wrong `<html
 * lang>` on an English-only page, which is a worse bug than the one this
 * closes. Trade-off: a visitor who reaches `/register` directly (an email
 * link, a bookmark) with no `/<locale>` visit and no cookie still gets
 * English — same as before this change, not a regression.
 */

// Only "/" has a translated route today (src/app/[locale]/page.tsx). Adding a
// path here ahead of a real translated route would redirect a visitor into a
// 404 or an English page wearing a foreign hreflang tag.
const REDIRECT_ELIGIBLE_PATHS = new Set<string>(["/"])

// See the W19 note above the file header comment: the four routes of the
// post-signup funnel read the NEXT_LOCALE cookie instead of defaulting to
// English, without moving under /<locale>.
const COOKIE_LOCALE_PATHS = new Set<string>(["/register", "/check-email", "/verify-email", "/dashboard"])

const COOKIE = "NEXT_LOCALE"
const LOCALE_HEADER = "x-resaleiq-locale"

function acceptLanguageLocale(header: string | null): (typeof PATH_LOCALES)[number] | null {
  const parts = (header || "")
    .split(",")
    .map((s) => s.trim().split(";")[0].toLowerCase())
  for (const p of parts) {
    // ENGLISH SHORT-CIRCUITS. PATH_LOCALES holds fr/es/de/it/pt and no "en",
    // so without this line the loop scans the visitor's ENTIRE preference list
    // and redirects on the first non-English match anywhere in it. An
    // `en-GB,es-ES` visitor -- English first, Spanish merely present -- was
    // 307'd to /es and had NEXT_LOCALE=es pinned on them for a year.
    //
    // This is the SECOND copy of this defect. `detectLocale()` in lib/i18n.ts
    // had the identical bug and was fixed first; this one kept redirecting
    // anyway, because a fix that lives in one of two implementations is not a
    // fix. Same lesson as scrub.py this morning: the credential scrubber lived
    // in one writer while a second writer had the same hole, and it froze
    // deploys twice. Two copies of a rule means two places to be wrong.
    //
    // Returning null means "no redirect" -- the visitor stays on the English
    // site, which is what an English-first Accept-Language asked for.
    if (p === "en" || p.startsWith("en-")) return null
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

  if (COOKIE_LOCALE_PATHS.has(pathname)) {
    const stored = request.cookies.get(COOKIE)?.value
    if (stored && isPathLocale(stored)) return withLocaleHeader(request, stored)
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
