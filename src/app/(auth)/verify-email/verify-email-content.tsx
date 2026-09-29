"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail, getMe } from "@/lib/api"
import { setToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import { copy, type Locale } from "@/lib/i18n"
import { trackEvent } from "@/lib/analytics"
import { ActivationSteps } from "@/components/auth/activation-steps"

type State = "checking" | "signed-in" | "already" | "bad"

// FOUNDER AUTH RULES (2026-09-29, binding): after Google or email
// login/signup completes, land on /dashboard — not /verdict, not /pricing.
// This file used to route the just-verified user through a maze of
// intent-typeahead / plan / coverage checks to /verdict or /pricing (the
// "what do you want to check" funnel the founder rules explicitly kill).
// register-form.tsx no longer writes riq_intent_query at all, so that
// branch was already dead on the new register form; the rest is removed
// here for the same reason: dashboard-content.tsx is a real activation
// surface now (QuickCheckInput + live chips on first paint), not the old
// 12-line stub these redirects were written to route around.
//
// The ONE exception kept: riq_register_plan (set by register-form.tsx's
// ?plan= paid CTA) means the visitor started a Stripe checkout, clicked the
// verify-email link before finishing it, and still owes payment for the
// plan they picked — /pricing?ref=verify-abandoned resumes that purchase.
// That is not a "what to check" detour, it's completing a payment already
// in flight, same exception login-form.tsx keeps for the Google OAuth path.
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
          // C(tony): track email verification as a funnel event — previously
          // unmeasured black hole between signup_completed and first_analysis.
          try { trackEvent("email_verified") } catch { /* never block redirect */ }
          // C(tony)VerifiedFlash: delay one tick so the confirmed checkmark
          // actually paints before the navigation fires.
          const go = (href: string) => setTimeout(() => router.replace(href), 700)

          // C218: checkout-abandoned path — riq_register_plan written <5min
          // ago means the user picked a paid plan, hit Stripe, bailed, then
          // clicked the verify link. Resume the purchase they started.
          let checkoutAbandoned = false
          try {
            const raw = localStorage.getItem("riq_register_plan")
            localStorage.removeItem("riq_register_plan")
            const parsed = raw ? (JSON.parse(raw) as { plan: string; ts: number }) : null
            checkoutAbandoned = parsed ? Date.now() - parsed.ts < 5 * 60 * 1000 : false
          } catch { /* private mode */ }
          // Stale intent key from the pre-2026-09-29 register form — no
          // longer written, but clear any leftover value from a browser that
          // started a signup before this deploy so it doesn't leak into a
          // future page that still reads it.
          try { localStorage.removeItem("riq_intent_query") } catch { /* private mode */ }

          if (checkoutAbandoned) {
            go(`/pricing?ref=verify-abandoned`)
          } else {
            go(`/dashboard`)
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
        {/* C(tony)ActivationSteps on verify-email: steps 1+2 done, step 3 active. */}
        <ActivationSteps step={3} />
        {state === "checking" && (
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <TrendingUp size={30} className="text-[var(--color-buy)] animate-pulse" />
            </div>
            <p className="text-[var(--color-text-primary)] text-[15px] font-semibold mb-2">
              Confirming your email…
            </p>
            <p className="text-[var(--color-text-muted)] text-[12px]">
              One moment.
            </p>
          </div>
        )}

        {state === "signed-in" && (
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={30} className="text-[var(--color-buy)]" />
            </div>
            <p className="text-[var(--color-text-primary)] text-[15px] font-semibold mb-2">
              {t.signedIn}
            </p>
            <p className="text-[var(--color-text-muted)] text-[12px]">
              Taking you there…
            </p>
          </div>
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
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-2">{message}</p>
            {/* C145(tony): badBody explains WHY and names the recovery path.
                Links expire → sign in → login-form detects unverified → /check-email → resend. */}
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
