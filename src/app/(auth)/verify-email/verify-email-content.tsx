"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail, getMe } from "@/lib/api"
import { setToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { copy, type Locale } from "@/lib/i18n"

type State = "checking" | "signed-in" | "already" | "bad"

export function VerifyEmailContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.verifyEmail
  const [state, setState] = useState<State>("checking")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      setState("bad")
      setMessage(t.missingToken)
      return
    }
    // POST on load (not GET) so mail scanners that prefetch do not burn the token.
    verifyEmail(token)
      .then(async res => {
        if (res.access_token) {
          setToken(res.access_token)
          try {
            const user = await getMe(res.access_token)
            useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
          } catch {
            useAuthStore.setState({ isAuthenticated: true, isLoading: false })
          }
          setState("signed-in")
          router.replace("/verdict")
          return
        }
        // Backend-owned string stays in whatever language the API sent it —
        // same rule as elsewhere in this file's siblings. Only the local
        // fallback is translated.
        setState("already")
        setMessage(res.message || t.alreadyConfirmedFallback)
      })
      .catch(err => {
        setState("bad")
        setMessage(err instanceof Error ? err.message : t.invalidOrExpired)
      })
  }, [router, t])

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-end mb-3">
      </div>

      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8 text-center">
        {state === "checking" && (
          <p className="text-[#8b99b8] text-[13px] py-6">{t.checking}</p>
        )}

        {state === "signed-in" && (
          <p className="text-[#8b99b8] text-[13px] py-6">{t.signedIn}</p>
        )}

        {state === "already" && (
          <>
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-emerald-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.confirmedHeading}</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">{message}</p>
            <Link href="/login" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              {t.signIn}
            </Link>
          </>
        )}

        {state === "bad" && (
          <>
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-amber-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.badHeading}</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">{message}</p>
            <Link href="/login" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              {t.signIn}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
