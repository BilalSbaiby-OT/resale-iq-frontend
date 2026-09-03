"use client"
import { createContext, useContext } from "react"
import type { Locale } from "@/lib/i18n"

/**
 * Makes the proxy-stamped locale readable from CLIENT components.
 *
 * Before this, the only way a component could know the locale was
 * `requestLocale()` (server-only, reads the `x-resaleiq-locale` header the
 * proxy sets). Every piece of app chrome -- sidebar, topbar, app-shell -- is a
 * `"use client"` component, so none of them could reach it, which is the
 * mechanical reason the side panel was hardcoded English: there was no
 * supported way for it to be anything else.
 *
 * Deliberately NOT `document.cookie` parsing in a `useEffect`. That would
 * render English on the server, swap to French after hydration, and produce
 * both a visible flash and a React hydration mismatch on every authenticated
 * page. The root layout is a server component that already resolves the
 * locale for `<html lang>`; passing that same value down through context means
 * server and client agree on the first paint, by construction.
 *
 * The value flows from exactly one place (src/app/layout.tsx) so there is no
 * second copy of "how do we decide the locale" to drift -- the failure mode
 * documented in proxy.ts's own acceptLanguageLocale comment, where the same
 * rule living in two implementations meant fixing one fixed nothing.
 */
const LocaleContext = createContext<Locale>("en")

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

/** Locale for the current request. "en" if no provider is mounted above. */
export function useLocale(): Locale {
  return useContext(LocaleContext)
}
