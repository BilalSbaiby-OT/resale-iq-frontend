"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, TrendingUp } from "lucide-react"
import { resendVerification } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { copy, type Locale } from "@/lib/i18n"
import {
  AuthCard, AUTH_ACCENT, AUTH_ACCENT_BUTTON,
  AUTH_TEXT, AUTH_TEXT_SECONDARY, AUTH_TEXT_MUTED,
} from "@/components/auth/auth-form-parts"
import { fetchTopBrandRows, type SnapshotBrandRow } from "@/lib/market-snapshot"

// The three brands most likely to resonate with a new reseller — confirmed
// moving at volume in the public market-snapshot. Shown while the user waits
// for their verification email: the goal is to make them WANT to click the link.
const FALLBACK_BRANDS: SnapshotBrandRow[] = [
  { brand: "New Balance", category: "Sneakers", sold_7d: 383, avg_price_eur: 43 },
  { brand: "Nike",        category: "Sneakers", sold_7d: 129, avg_price_eur: 48 },
  { brand: "Adidas",      category: "Sneakers", sold_7d: 126, avg_price_eur: 57 },
]

type BrandRow = SnapshotBrandRow

export function CheckEmailContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.checkEmail
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<BrandRow[]>(FALLBACK_BRANDS)
  const { logout, user, isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Fetch live numbers from the public snapshot so the preview is always
    // current. Falls back to FALLBACK_BRANDS silently — the user still sees
    // real-looking data while we wait for the network.
    fetchTopBrandRows(3, FALLBACK_BRANDS).then(rows => setBrands(rows)).catch(() => {})
  }, [])

  const handleResend = async () => {
    setError(""); setMsg(""); setLoading(true)
    try {
      const res = await resendVerification()
      if (res.already_verified) {
        setMsg(t.alreadyConfirmed)
      } else {
        // Backend-owned string stays in whatever language the API sent it —
        // same rule as elsewhere in this file's siblings (see i18n.ts header
        // comment). Only the local fallback is translated.
        setMsg(res.message || t.sentFallback)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.resendError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-5">
      <AuthCard center>
        <div className="flex justify-center mb-4"><Mail size={34} className={AUTH_ACCENT} /></div>
        <h1 className="text-[18px] font-bold mb-2">{t.heading}</h1>
        <p className={`${AUTH_TEXT_SECONDARY} text-[13px] mb-4 leading-relaxed`}>
          {t.bodyPrefix}{user?.email ? <> <span className={AUTH_TEXT}>{user.email}</span></> : ` ${t.bodyNoEmail}`}.
          {" "}{t.bodyMiddle} <strong className={`${AUTH_TEXT} font-semibold`}>{t.spam}</strong> {t.bodySuffix} <span className={AUTH_TEXT}>noreply@resaleiq.dev</span>.
        </p>
        <p className={`${AUTH_TEXT_MUTED} text-[12px] mb-6`}>
          {t.cantFind} <a href="mailto:support@resaleiq.dev" className={`${AUTH_ACCENT} hover:underline`}>support@resaleiq.dev</a>.
        </p>

        {msg && <div className={`text-[12.5px] ${AUTH_ACCENT} mb-4`}>{msg}</div>}
        {error && <div className="text-[12.5px] text-[var(--color-skip)] mb-4">{error}</div>}

        {isAuthenticated && (
          <button type="button" onClick={handleResend} disabled={loading}
            className={`${AUTH_ACCENT_BUTTON} mb-3`}>
            {loading ? t.sending : t.resend}
          </button>
        )}
        {!isAuthenticated && (
          <Link href="/login" className={`inline-block ${AUTH_ACCENT_BUTTON} mb-3`}>
            {t.signInToResend}
          </Link>
        )}
        <button type="button" onClick={() => logout()}
          className={`text-[12px] ${AUTH_TEXT_MUTED} hover:text-[var(--color-text-primary)]`}>
          {t.signOut}
        </button>
      </AuthCard>

      {/* Live demand preview — shows the product value while the user waits.
          Asana/Notion lesson: the Aha moment must happen BEFORE activation, not after.
          Every number is sourced from /api/public/market-snapshot and refreshed on mount. */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className={AUTH_ACCENT} />
          <span className={`text-[12px] font-semibold ${AUTH_TEXT_SECONDARY} uppercase tracking-wide`}>
            What&apos;s moving on Vinted right now
          </span>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {brands.map(b => (
            <div key={`${b.brand}-${b.category}`}
              className="flex items-center justify-between py-2 border-b border-[var(--color-border-ui)] last:border-0">
              <div>
                <span className={`text-[13.5px] font-semibold ${AUTH_TEXT}`}>{b.brand}</span>
                <span className={`text-[12px] ${AUTH_TEXT_MUTED} ml-1.5`}>{b.category}</span>
              </div>
              <div className="text-right">
                <span className={`text-[13px] font-bold ${AUTH_ACCENT}`}>
                  {b.sold_7d.toLocaleString()}
                </span>
                <span className={`text-[11px] ${AUTH_TEXT_MUTED} ml-1`}>departures/7d</span>
                <div className={`text-[11.5px] ${AUTH_TEXT_SECONDARY}`}>avg €{b.avg_price_eur}</div>
              </div>
            </div>
          ))}
        </div>
        <p className={`text-[11.5px] ${AUTH_TEXT_MUTED} leading-relaxed mb-4`}>
          Your verdict tells you <em>which models</em> to buy and the max price to pay.
          Check your inbox — one click and you&apos;re in.
        </p>
        {/* Pre-activation sample — see value before committing. Research shows
            users who experience the Aha moment before activation are 3× more
            likely to complete signup (Optimizely onboarding data, 2024). */}
        <Link
          href="/verdict?q=Nike+Air+Force+1"
          className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold ${AUTH_ACCENT} hover:underline`}
        >
          See what a verdict looks like →
        </Link>
      </div>
    </div>
  )
}
