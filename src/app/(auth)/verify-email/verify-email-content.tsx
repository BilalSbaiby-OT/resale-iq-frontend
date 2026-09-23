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
          // why: landing on a cold /verdict with an empty input is the
          // single measured reason 14/14 verified users never ran a check
          // (verdict_date=null all). The ?q= triggers the existing useEffect
          // in VerdictInner that auto-runs the query — Nike Air Force 1 is in
          // _PUBLIC_SAMPLE_QUERIES so it 200s even for unpaid users, giving
          // a real result before they hit the paywall on their own search.
          // C140: if the user captured intent at /register, use that query
          // instead of the generic sample — personalising the first Aha moment.
          let firstQuery = "Nike+Air+Force+1"
          try {
            const saved = localStorage.getItem("riq_intent_query")
            if (saved) {
              firstQuery = encodeURIComponent(saved)
              localStorage.removeItem("riq_intent_query")
            }
          } catch { /* private mode — fall back to sample */ }
          router.replace(`/verdict?q=${firstQuery}`)
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

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-8 text-center">
        {state === "checking" && (
          <p className="text-[var(--color-text-secondary)] text-[13px] py-6">{t.checking}</p>
        )}

        {state === "signed-in" && (
          <p className="text-[var(--color-text-secondary)] text-[13px] py-6">{t.signedIn}</p>
        )}

        {state === "already" && (
          <>
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-[var(--color-buy)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.confirmedHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-6">{message}</p>
            <Link href="/login" className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity">
              {t.signIn}
            </Link>
          </>
        )}

        {state === "bad" && (
          <>
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-[var(--color-watch)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.badHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-6">{message}</p>
            <Link href="/login" className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity">
              {t.signIn}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
