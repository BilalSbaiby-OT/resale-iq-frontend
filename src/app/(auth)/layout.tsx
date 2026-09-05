import type { Metadata } from "next"
import Link from "next/link"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { requestLocale } from "@/lib/request-locale"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * UX-RULES.md ticket 2: "/register has no way back to the site" — it linked
 * to /terms, /privacy and /login, never to "/". On every signup page a
 * visitor has ever used, the logo goes home; here it was inert text, so
 * someone who landed unready had no exit but the browser back button. We
 * get 3-4 people a day on /register and, measured, all of them left.
 *
 * Fixed once, here, for every unprefixed auth route (register, check-email,
 * verify-email, login, forgot-password, reset-password all share this
 * layout) instead of per-page — each page previously carried its own
 * near-identical, un-linked "R / Resale IQ" block; this replaces every one
 * of them so there is exactly one place that can drift from the rest of the
 * site's "logo -> /" convention.
 *
 * The language switcher is mounted HERE, once, rather than imported into each
 * auth page. It previously existed on only three of this layout's six routes
 * (register, check-email, verify-email) — /login, /forgot-password and
 * /reset-password had no way to change language at all, which is half of the
 * founder's "you cant cgange kanguage in other taps" report. Lifting it to the
 * layout means a new route under (auth)/ cannot ship without one, which is the
 * failure mode that produced the gap in the first place.
 *
 * Safe to mount on every route here because src/proxy.ts now serves this whole
 * group in the visitor's stored locale and all six pages read the dictionary —
 * the condition locale-switcher.tsx's own header sets for mounting it ("do not
 * mount this on a page without translated content ... the control would be
 * visible but inert — indistinguishable from broken").
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await requestLocale()
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6">
      {/* Flat --color-buy, not the old emerald-400 → teal-500 gradient. That
          gradient put a second and third green on a surface whose only accent
          is the submit button, so the wordmark competed with the one action on
          the page. One accent, one token. */}
      <Link href="/" aria-label="Resale IQ home" className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-[var(--color-buy)] flex items-center justify-center text-[var(--color-on-buy)] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[var(--color-text-primary)]">Resale IQ</span>
      </Link>
      {children}
      <div className="mt-6">
        <LocaleSwitcher locale={locale} />
      </div>
    </div>
  )
}
