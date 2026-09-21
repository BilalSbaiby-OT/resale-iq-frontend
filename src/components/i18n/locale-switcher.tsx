"use client"
import { useRouter, usePathname } from "next/navigation"
import { Globe } from "lucide-react"
import { ALL_LOCALES, localeSiblingPath } from "@/lib/locale-routes"
import type { Locale } from "@/lib/i18n"
import { appCopy } from "@/lib/app-copy"

/**
 * UX-RULES.md ticket 1: the switcher the site never had. `grep`-able zero
 * hits for "switcher" before this file — every visitor's only lever was
 * Accept-Language on first visit, and NEXT_LOCALE then pinned that choice
 * for a year with no way to change it. This is the fix that reaches
 * everyone already carrying a wrong cookie; detectLocale()/proxy.ts only
 * protect new visitors.
 *
 * Two different mechanisms depending on where it is mounted, because the
 * site has two different ways of being multilingual (see src/proxy.ts):
 *
 * 1. Page families with a REAL translated ROUTE (`localeSiblingPath` in
 *    locale-routes.ts: homepage, methodology, register, support, pricing,
 *    data, tools, best/vs/for, cloned blog). Picking a language there
 *    navigates to the sibling `/<locale>/<root>` URL; the proxy stamps
 *    NEXT_LOCALE itself on that request.
 *
 * 2. The remaining unprefixed post-signup routes (/check-email,
 *    /verify-email, /dashboard — see proxy.ts's W19 note) have no
 *    per-locale URL. They read the language back OUT of the NEXT_LOCALE
 *    cookie via requestLocale(). Picking a language there cannot change
 *    the URL — there is nothing to navigate to — so this component sets
 *    the cookie itself and forces a fresh request so the proxy's
 *    `x-resaleiq-locale` header (and therefore requestLocale()) reflects
 *    the new choice. A client-side route transition (router.refresh())
 *    was tried and dropped: without a full navigation there is no
 *    guarantee the proxy re-runs before the server components re-render,
 *    which would show the picked language in the dropdown while the page
 *    underneath stayed in the old one — worse than not having a switcher.
 *
 * Do not mount this on a page outside those two families (e.g. /login):
 * it has neither translated content nor a cookie-reading server component
 * behind it, so the control would be visible but inert — indistinguishable
 * from broken.
 */

const COOKIE = "NEXT_LOCALE"
const ONE_YEAR = 60 * 60 * 24 * 365

const NATIVE_NAME: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
}

function localizedDestination(pathname: string, locale: Locale): string | null {
  return localeSiblingPath(pathname, locale)
}

export function LocaleSwitcher({ locale, style }: { locale: Locale; style?: React.CSSProperties }) {
  const router = useRouter()
  const pathname = usePathname()

  function onChange(next: Locale) {
    if (next === locale) return
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    const dest = localizedDestination(pathname, next)
    if (dest !== null) {
      router.push(dest)
      return
    }
    // Cookie-driven page (see file header) — same URL, but the server must
    // see the new cookie on a real request for requestLocale() to pick it
    // up, so this is a full navigation rather than a client transition.
    window.location.assign(pathname)
  }

  const languageLabel = appCopy[locale].a11y.language

  return (
    <label
      data-testid="riq-locale-switcher"
      aria-label={languageLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "6px 10px",
        color: "#8b99b8",
        fontSize: 13,
        cursor: "pointer",
        ...style,
      }}
    >
      <Globe size={14} aria-hidden="true" />
      <select
        aria-label={languageLabel}
        value={locale}
        onChange={(e) => onChange(e.target.value as Locale)}
        style={{
          background: "transparent",
          border: "none",
          color: "inherit",
          font: "inherit",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {ALL_LOCALES.map((l) => (
          <option key={l} value={l} style={{ background: "var(--color-surface)", color: "#eef1f7" }}>
            {NATIVE_NAME[l]}
          </option>
        ))}
      </select>
    </label>
  )
}
