"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { resendVerification } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { copy, type Locale } from "@/lib/i18n"
import {
  AuthCard, AUTH_ACCENT, AUTH_ACCENT_BUTTON,
  AUTH_TEXT, AUTH_TEXT_SECONDARY, AUTH_TEXT_MUTED,
} from "@/components/auth/auth-form-parts"

export function CheckEmailContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.checkEmail
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { logout, user, isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

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
      <div className="mt-6 pt-5 border-t border-[var(--color-border-ui)] text-center">
        <p className={`text-[12px] ${AUTH_TEXT_SECONDARY} mb-2`}>Ready to start checking prices?</p>
        <Link href="/pricing"
          className={`inline-block text-[13px] font-semibold ${AUTH_ACCENT} hover:underline`}>
          See what Starter unlocks →
        </Link>
      </div>
    </AuthCard>
  )
}
