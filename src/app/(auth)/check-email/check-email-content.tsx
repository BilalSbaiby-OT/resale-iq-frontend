"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { resendVerification } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { copy, type Locale } from "@/lib/i18n"

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
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[#0B0D10] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </div>
      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4"><Mail size={34} className="text-emerald-400" /></div>
        <h1 className="text-[18px] font-bold mb-2">{t.heading}</h1>
        <p className="text-[#8b99b8] text-[13px] mb-4 leading-relaxed">
          {t.bodyPrefix}{user?.email ? <> <span className="text-[#eef1f7]">{user.email}</span></> : ` ${t.bodyNoEmail}`}.
          {" "}{t.bodyMiddle} <strong className="text-[#eef1f7] font-semibold">{t.spam}</strong> {t.bodySuffix} <span className="text-[#eef1f7]">noreply@resaleiq.dev</span>.
        </p>
        <p className="text-[#5b6b8c] text-[12px] mb-6">
          {t.cantFind} <a href="mailto:support@resaleiq.dev" className="text-emerald-400 hover:underline">support@resaleiq.dev</a>.
        </p>

        {msg && <div className="text-[12.5px] text-emerald-400 mb-4">{msg}</div>}
        {error && <div className="text-[12.5px] text-red-400 mb-4">{error}</div>}

        {isAuthenticated && (
          <button type="button" onClick={handleResend} disabled={loading}
            className="w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 mb-3">
            {loading ? t.sending : t.resend}
          </button>
        )}
        {!isAuthenticated && (
          <Link href="/login" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors mb-3">
            {t.signInToResend}
          </Link>
        )}
        <button type="button" onClick={() => logout()}
          className="text-[12px] text-[#5b6b8c] hover:text-[#eef1f7]">
          {t.signOut}
        </button>
      </div>
    </div>
  )
}
