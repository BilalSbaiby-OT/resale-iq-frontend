import type { Metadata } from "next"
import Link from "next/link"

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
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0D10] flex flex-col items-center justify-center p-6">
      <Link href="/" aria-label="Resale IQ home" className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[#0B0D10] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </Link>
      {children}
    </div>
  )
}
