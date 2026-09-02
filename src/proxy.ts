import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PATH_LOCALES, isPathLocale } from "@/lib/locale-routes"

/**
 * 2026-09-02 OUTAGE — every anonymous visitor got LIMIT_REACHED with
 * used_today:0. Root cause measured live (tcpdump on the Hetzner box, both
 * hops, both before and after this file's change — see PR description for
 * the full capture), NOT assumed:
 *
 *   client -> Traefik entry (resaleiq.dev, terminates TLS directly, no CDN
 *   in front) -> this Next.js container -> next.config.ts `/api/:path*`
 *   rewrite -> BACKEND_URL, which is a PUBLIC sslip.io hostname that
 *   resolves back to this SAME host's public IP -> Traefik AGAIN (the
 *   backend's own router) -> the backend.
 *
 * Two things were checked, not guessed:
 *
 * 1. Does Traefik set x-forwarded-for/x-real-ip on the inbound request to
 *    THIS container? Yes — confirmed by capturing real traffic on the
 *    container's bridge interface: Traefik overwrites whatever a client
 *    sends for these two headers with the real observed peer. A spoofed
 *    `X-Forwarded-For: 9.9.9.9` from outside arrived here as the caller's
 *    real IP. So the value this proxy reads from the incoming request is
 *    trustworthy — a client cannot forge it.
 *
 * 2. Does Next's OWN rewrite already forward that header to the backend?
 *    Yes, already, with zero code here — a custom header set by an
 *    external curl survived the entire round trip untouched. The founder's
 *    original diagnosis ("nothing forwards x-forwarded-for on the
 *    rewrite") does not hold; the header leaves this container fine.
 *
 * It is lost one hop later, and NO change in this file can prevent that:
 * the outbound request to BACKEND_URL leaves this container, round-trips
 * out to the public internet and back in through Traefik as a SECOND,
 * unrelated hop. Linux hairpin NAT rewrites the source of that connection
 * to the Docker bridge gateway (10.0.1.1) before Traefik's process ever
 * sees a packet, so that hop is *also* an untrusted connection from
 * Traefik's point of view, and Traefik overwrites x-forwarded-for/x-real-ip
 * AGAIN — to "10.0.1.1", identically for every visitor on earth, no matter
 * what value was already there. Verified with a direct node fetch from
 * inside this container carrying an explicit `X-Forwarded-For:
 * 203.0.113.222`: the backend received "10.0.1.1" regardless. A proxy.ts
 * (or middleware.ts) that sets x-forwarded-for/x-real-ip on the rewritten
 * request, as originally proposed, would build, deploy, and change nothing
 * live — the exact "code-correct is not live-correct" trap this repo's own
 * docs warn about.
 *
 * What DOES survive that second hop unmodified — same capture, same
 * request — is any header name Traefik does not itself manage. So instead
 * of fighting Traefik's forwarded-header handling, this proxy mints its
 * own: `x-resaleiq-verified-ip`, set here from the ALREADY-TRUSTED
 * x-forwarded-for/x-real-ip this container received on hop 1, and stripped
 * first so a client hitting resaleiq.dev directly cannot set it themselves.
 *
 * NOTE — this is necessary but, on its own, NOT sufficient. The backend
 * (`demand-intel/api/auth.py:_client_ip`) does not read this header yet; it
 * still falls through to x-forwarded-for/x-real-ip, which are the ones
 * Traefik's second hop clobbers. Production will keep returning
 * LIMIT_REACHED for anonymous visitors until the backend also checks
 * `x-resaleiq-verified-ip` first (a demand-intel change, out of scope for
 * this repo/PR) — OR until Traefik's second hop is told to trust the
 * bridge gateway as a proxy (an infra change to the shared Traefik
 * instance, also out of scope here: it fronts every app on the host, not
 * just this one). See the PR description / docs/company/APPROVALS.md for
 * both options; this file only does the half that belongs to this repo.
 */
function withVerifiedClientIp(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers)

  // Hop-1 Traefik overwrites (never appends to) these two on an untrusted
  // connection, so a single value — never a spoofed multi-entry chain — is
  // what a genuine request looks like here. Still split on "," defensively:
  // if that behavior ever changes upstream, the first entry is the one
  // closest to the real client, same convention as the backend's own
  // _client_ip.
  const trusted =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    ""

  // Never trust a client-supplied value for OUR OWN header name — a caller
  // hitting resaleiq.dev directly could otherwise set
  // `x-resaleiq-verified-ip` themselves and pick their own quota bucket.
  headers.delete("x-resaleiq-verified-ip")
  if (trusted) headers.set("x-resaleiq-verified-ip", trusted)

  return NextResponse.next({ request: { headers } })
}

// Paths next.config.ts rewrites straight to the backend. No locale logic
// applies to any of these — they are not pages.
const BACKEND_PROXIED_PREFIXES = ["/api/", "/auth/", "/stripe/", "/admin/"]

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

  // Backend-proxied paths: stamp the verified client IP and stop. None of
  // the locale logic below applies — these are API calls, not page visits,
  // and running it (cookie reads/writes, an Accept-Language scan) on every
  // /api/* request would be pure waste at best.
  if (BACKEND_PROXIED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return withVerifiedClientIp(request)
  }

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
  // Next.js runs the proxy if a request matches ANY entry in this array —
  // this is two independent concerns living in one file because this Next.js
  // version supports exactly one proxy.ts, not "the locale matcher, edited
  // to also cover /api/*". The original locale pattern below is UNCHANGED
  // (still excludes api/auth/stripe/admin/static/files — the function
  // branches on path itself now, so that exclusion is redundant but leaving
  // it alone keeps this diff to "add", not "rewrite one regex by hand").
  matcher: [
    // Skip static assets, API/backend rewrites, and anything with a file
    // extension (images, robots.txt, sitemap.xml, llms.txt, etc). Running the
    // proxy on those would not break them (redirect logic only fires on "/"
    // and locale-prefixed paths) but there is no reason to pay the cost.
    "/((?!_next/static|_next/image|api/|auth/|stripe/|admin/|favicon.ico|.*\\..*).*)",
    // The backend-proxied paths, added for the client-IP stamping above.
    "/api/:path*",
    "/auth/:path*",
    "/stripe/:path*",
    "/admin/:path*",
  ],
}
