import { headers } from "next/headers"
import type { Locale } from "@/lib/i18n"

/**
 * Server-side read of the locale `src/proxy.ts` stamped on this request via
 * the `x-resaleiq-locale` header — same header `src/app/layout.tsx` already
 * reads to set `<html lang>`. Extracted here (W19) so every server component
 * that needs a locale (the `/register`, `/check-email`, `/verify-email` and
 * `/dashboard` wrappers, none of which live under `[locale]` — see the W19
 * note in `src/proxy.ts` for why) shares one implementation instead of
 * five copies of the same two lines drifting apart.
 */
export async function requestLocale(): Promise<Locale> {
  const raw = (await headers()).get("x-resaleiq-locale")
  return (raw as Locale) || "en"
}
