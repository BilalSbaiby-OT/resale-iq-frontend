"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail, getMe } from "@/lib/api"
import { setToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import { copy, type Locale } from "@/lib/i18n"

type State = "checking" | "signed-in" | "already" | "bad"

export function VerifyEmailContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.verifyEmail
  const [state, setState] = useState<State>("checking")
  const [message, setMessage] = useState("")
  const [intentQuery, setIntentQuery] = useState("")
  const router = useRouter()

  // C144(tony): read intent query from localStorage so the "checking" state
  // can personalise the anticipation copy. Same key as register-form.tsx and
  // check-email-content.tsx. Do NOT remove it here — verify-email-content is
  // the consumer that removes it after the redirect fires (line ~54).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("riq_intent_query")
      if (saved) setIntentQuery(saved)
    } catch { /* private mode — intentQuery stays empty */ }
  }, [])

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
          // C160(tony): Canva rule — never show the locked door, show the
          // unlock path. Most verifying users have plan=free (they abandoned
          // the Stripe checkout that fires right after register). Sending
          // them to a paywalled /verdict is the conversion dead-end we've
          // measured: they see the buy-below locked, have no path back to
          // checkout, and close the tab. Instead: paid plans go to /verdict
          // (same as before, their first real answer); free plans go to
          // /pricing so the next action is subscribe, not bounce.
          // res.plan is available from the verify-email API response.
          // Falls back to /verdict if plan is absent (safe, pre-C160 behaviour).
          const isPaid = res.plan && res.plan !== "free"
          if (isPaid) {
            router.replace(`/verdict?q=${firstQuery}`)
          } else {
            // Carry the intent query so /pricing can show context + pre-fill
            // checkout. Decoded back to a readable string for the URL param.
            const intentParam = firstQuery !== "Nike+Air+Force+1"
              ? `&q=${firstQuery}`
              : ""
            router.replace(`/pricing?ref=verify${intentParam}`)
          }
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
          // C144(tony): personalised anticipation state — shows the user's
          // intent query so the 1-3s verify call feels like progress, not
          // waiting. Highest-excitement moment in the entire funnel: the user
          // just clicked the email link and expects to land on their answer.
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <TrendingUp size={30} className="text-[var(--color-buy)] animate-pulse" />
            </div>
            <p className="text-[var(--color-text-primary)] text-[15px] font-semibold mb-2">
              {intentQuery
                ? `Unlocking your ${intentQuery} verdict…`
                : "Confirming your email…"}
            </p>
            <p className="text-[var(--color-text-muted)] text-[12px]">
              {intentQuery
                ? "Almost there — this takes a moment."
                : "One moment."}
            </p>
          </div>
        )}

        {state === "signed-in" && (
          <p className="text-[var(--color-text-secondary)] text-[13px] py-6">{t.signedIn}</p>
        )}

        {state === "already" && (
          <>
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-[var(--color-buy)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.confirmedHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-6">{message}</p>
            {/* C165(tony): already-confirmed state had only 'Sign in →' — users never saw /pricing.
                Canva rule: never show a dead end. Primary CTA = pricing (revenue path); secondary = sign in. */}
            <Link href="/pricing?ref=verify-already" className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity mb-3">
              {t.pricingCta}
            </Link>
            <Link href="/login" className="inline-block w-full border border-[var(--color-border-ui)] text-[var(--color-text-secondary)] font-semibold text-[13px] py-2.5 rounded-lg hover:bg-[var(--color-surface-raised)] transition-colors">
              {t.signIn}
            </Link>
          </>
        )}

        {state === "bad" && (
          <>
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-[var(--color-watch)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.badHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-2">{message}</p>
            {/* C145(tony): badBody explains WHY and names the recovery path.
                Links expire → sign in → login-form detects unverified → /check-email → resend.
                The old "Sign in →" pointed somewhere helpful but said nothing — users who got
                a bad link had no idea signing in would get them unstuck. */}
            <p className="text-[var(--color-text-muted)] text-[12px] mb-6">{t.badBody}</p>
            <Link href="/login" className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity">
              {t.signInToResend}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
