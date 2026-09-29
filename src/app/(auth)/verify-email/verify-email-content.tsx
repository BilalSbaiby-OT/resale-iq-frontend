"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail, getMe } from "@/lib/api"
import { setToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import { copy, type Locale } from "@/lib/i18n"
import { trackEvent } from "@/lib/analytics"
import { ActivationSteps } from "@/components/auth/activation-steps"
import { fetchTopBrandRows } from "@/lib/market-snapshot"
import type { SnapshotBrandRow } from "@/lib/market-snapshot"

type State = "checking" | "signed-in" | "already" | "bad"

// C(tony)VerifyEmailFirstCheckCTA: hardcoded fallback for the AF1 live-data
// card shown on the signed-in flash — used if the snapshot fetch hasn't
// resolved yet or Nike isn't present in the top rows.
const AF1_FALLBACK: SnapshotBrandRow = { brand: "Nike", category: "Sneakers", sold_7d: 312, avg_price_eur: 89 }

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
  const [af1Row, setAf1Row] = useState<SnapshotBrandRow>(AF1_FALLBACK)
  const router = useRouter()
  // C(tony)C230: store the auto-redirect timer so the first-check CTA can cancel
  // it — without this the user clicks "Run your first check →", navigates to
  // /verdict, and 2500ms later gets kicked back to /dashboard. The timer ref
  // survives re-renders and is cleaned up on unmount.
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cancel redirect on unmount (user navigated away before timer fired)
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  const handleFirstCheckClick = useCallback(() => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current)
      redirectTimerRef.current = null
    }
  }, [])

  // C(tony)VerifyEmailFirstCheckCTA: pre-load top brand rows on mount so the
  // AF1 live-data card has real numbers ready by the time the signed-in
  // state paints — no loading flicker on the highest-motivation screen.
  useEffect(() => {
    fetchTopBrandRows(10, [AF1_FALLBACK])
      .then(rows => {
        const nike = rows.find(r => r.brand.toLowerCase().includes("nike"))
        if (nike) setAf1Row(nike)
      })
      .catch(() => { /* keep AF1_FALLBACK */ })
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
          // C(tony): track email verification as a funnel event — previously
          // unmeasured black hole between signup_completed and first_analysis.
          try { trackEvent("email_verified") } catch { /* never block redirect */ }
          // C(tony)VerifyEmailFirstCheckCTA: extended from 700ms to 2500ms so
          // the live AF1 data card + "Run your first check" CTA below have a
          // real window to be seen and clicked — this is peak motivation
          // (email just verified) and previously it was gone in under a
          // second. The auto-redirect to /dashboard still fires unless the
          // user clicks the CTA first (founder rule preserved).
          // C(tony)C230: store timer ref so CTA click can cancel the redirect —
          // previously clicking the CTA still caused a /dashboard redirect 2500ms
          // later because the timer was not cancelled.
          const go = (href: string) => {
            redirectTimerRef.current = setTimeout(() => router.replace(href), 2500)
          }

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
            <p className="text-[var(--color-text-primary)] text-[15px] font-semibold mb-4">
              {t.signedIn}
            </p>
            {/* C(tony)VerifyEmailFirstCheckCTA: peak-motivation live data card —
                shown unblurred (user is verified, no lock needed) with real
                numbers, plus an optional CTA into the first check. The
                dashboard redirect above still fires at 2500ms regardless of
                whether the user clicks — this is a bonus path, not a detour. */}
            <div className="bg-[var(--color-bg-4)] border border-[var(--color-border-ui)] rounded-xl p-4 mb-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[13.5px] font-bold text-[var(--color-text-primary)]">Nike Air Force 1</div>
                  <div className="text-[11.5px] text-[var(--color-text-muted)]">Sneakers</div>
                </div>
                <TrendingUp size={16} className="text-[var(--color-buy)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Watched departures (7d)</span>
                  <span className="text-[13px] font-semibold text-[var(--color-buy)]">{af1Row.sold_7d.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Avg resale price</span>
                  <span className="text-[13px] font-semibold text-[var(--color-buy)]">€{af1Row.avg_price_eur}</span>
                </div>
              </div>
            </div>
            <Link
              href="/verdict?q=Nike+Air+Force+1&src=verify_email"
              onClick={handleFirstCheckClick}
              className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity mb-3"
            >
              Run your first check →
            </Link>
            <p className="text-[var(--color-text-muted)] text-[12px]">
              Or wait — we&apos;re taking you to your dashboard…
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
