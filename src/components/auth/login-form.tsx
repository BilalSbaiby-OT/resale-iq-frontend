"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { setToken } from "@/lib/utils"
import { getMe, getPlans, createCheckout } from "@/lib/api"
import type { CheckoutPlan } from "@/lib/checkout"
import Link from "next/link"
import { copy, type Locale } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"
import {
  AuthCard, AuthHeading, AuthField,
  AUTH_ACCENT, AUTH_ACCENT_BUTTON, AUTH_TEXT_SECONDARY, AUTH_TEXT_MUTED,
} from "@/components/auth/auth-form-parts"
import { GoogleSignInButton, AuthDivider } from "@/components/auth/google-sign-in-button"
import { googleErrorMessage } from "@/lib/google-oauth"
import { trackEvent } from "@/lib/analytics"
import { CheckoutInterstitialCard } from "@/components/auth/checkout-interstitial-card"
import { consumeSignupPending, fetchFirstCheckQuery, writeFirstCheckSeed, readFirstCheckSeed } from "@/lib/first-check-seed"

// FOUNDER AUTH RULES (2026-09-29, binding): /login is a plain sign-in form —
// no "what do you want to check" question, no intent typeahead. A successful
// Google or email login lands on /dashboard, not /verdict, not /pricing.
//
// This intentionally reverses several prior CRO passes (C(tony)LoginVerdict
// etc.) that routed logged-in users to /verdict on the (correct, at the time)
// observation that the old /dashboard was a 12-line stub with zero activation
// value. That is no longer true — dashboard-content.tsx now ships a
// QuickCheckInput + live suggestion chips on first paint, so /dashboard IS a
// real activation surface, not a dead end. The founder rule is explicit and
// current; follow it.
//
// The ONE exception kept: if the visitor picked a paid plan before hitting
// Google (riq_register_plan, set by register-form.tsx's ?plan= CTA), Google
// OAuth bypasses Stripe entirely, so we still have to route them to checkout
// — that is not a "what do you want to check" detour, it is completing a
// payment they already started.
export function LoginFormInner({ locale: localeProp }: { locale?: Locale } = {}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // C(tony)GoogleCheckoutInterstitial: hold the pending Stripe URL so Google
  // OAuth signups that arrived with a paid plan selected see the same
  // "You're about to unlock X" interstitial as email/password signups before
  // the hard Stripe navigation.
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | null>(null)
  // C(tony)GoogleCheckoutPlanLabel: show plan name + price on the interstitial
  // so Google OAuth signups see the same price confirmation as email/password
  // signups.
  const [pendingPlanLabel, setPendingPlanLabel] = useState<string | null>(null)
  const [pendingPlanPrice, setPendingPlanPrice] = useState<number | null>(null)
  const { login } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = copy[localeProp ?? useLocale()].auth.login

  useEffect(() => {
    const preEmail = searchParams.get("email")
    if (preEmail) setEmail(decodeURIComponent(preEmail))
  }, [searchParams])

  /**
   * Google OAuth callback handler.
   *
   * The backend redirects here as:
   *   /login?google_token=<JWT>   — success
   *   /login?google_error=<code>  — failure
   *
   * We run this in useEffect (client only) so it never runs on the server and
   * does not block the initial render.
   */
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)

    const googleToken = params.get("google_token")
    if (googleToken) {
      // Store the JWT — same key as password login
      setToken(googleToken)
      // Fetch the user record to hydrate the auth store, then redirect
      getMe(googleToken)
        .then(async user => {
          useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
          window.history.replaceState({}, "", "/login")

          // C(tony)GoogleCheckout: Google OAuth bypassed the email/password register
          // form, so Stripe checkout was never triggered. If riq_register_plan is
          // fresh (< 5 min), the user chose a plan before clicking Google — they
          // expect to pay. Resolve the price, create a checkout session, and redirect
          // to Stripe now. Falls back to /dashboard on any error.
          // C(tony)GoogleCheckoutInterstitial: instead of window.location.assign
          // directly to Stripe, set pendingCheckoutUrl so the interstitial card
          // renders first — same "You're about to unlock X" pattern as email flow.
          let checkoutHandled = false
          try {
            const raw = window.localStorage.getItem("riq_register_plan")
            window.localStorage.removeItem("riq_register_plan")
            const parsed = raw ? (JSON.parse(raw) as { plan: string; ts: number }) : null
            if (parsed && Date.now() - parsed.ts < 5 * 60 * 1000) {
              const plansData = await getPlans()
              const matchedPlan = plansData.plans.find(
                (p: { id: string; price_id?: string; name?: string; price_eur?: number }) => p.id === parsed.plan
              )
              const priceId = matchedPlan?.price_id
              if (priceId) {
                const { checkout_url } = await createCheckout(priceId, { plan: parsed.plan as CheckoutPlan })
                if (checkout_url) {
                  checkoutHandled = true
                  // C(tony)GoogleCheckoutInterstitial: show demand-preview interstitial
                  // instead of blind-jumping to Stripe. Same pattern as register-form.tsx
                  // pendingCheckoutUrl. The CTA "Continue to payment →" fires the assign.
                  try { trackEvent("checkout_interstitial_shown") } catch { /* never block */ }
                  // C(tony)GoogleCheckoutPlanLabel: pass plan name + price so the
                  // interstitial shows the same plan row as the email/password path.
                  setPendingPlanLabel(matchedPlan?.name ?? null)
                  setPendingPlanPrice(matchedPlan?.price_eur ?? null)
                  setPendingCheckoutUrl(checkout_url)
                }
              }
            }
          } catch {
            // why: GoogleCheckout is best-effort — any error (network, stale plan
            // data, missing price_id, Stripe unavailable) must never block login.
            // The user created their account successfully; falling back to
            // /dashboard lets them reach the product. They can upgrade via
            // /pricing later.
          }

          // FOUNDER RULE: a successful Google login lands on /dashboard, not
          // /verdict, unless a paid checkout is in flight (handled above).
          // A free signup that started on /register set riq_signup_pending
          // before the OAuth hop. Write the live first-check seed here so
          // the dashboard shows one button. Returning logins have no flag.
          const isNewSignup = consumeSignupPending()
          if (!checkoutHandled) {
            if (isNewSignup) {
              const q = await fetchFirstCheckQuery()
              writeFirstCheckSeed(q)
            } else if (user.email_verified && !readFirstCheckSeed()) {
              // C(tony)LoginReturnSeed (Google): returning verified user with no
              // seed gets a first-check button on the dashboard. Same pattern as
              // the email/password path — fire-and-forget, never blocks login.
              fetchFirstCheckQuery().then(q => writeFirstCheckSeed(q)).catch(() => {})
            }
            router.push("/dashboard")
          }
        })
        .catch(() => {
          // If /auth/me fails, the token is bad — fall back to a clean login
          window.history.replaceState({}, "", "/login")
          setError("Google sign-in failed. Please try again or use email.")
        })
      return
    }

    const googleErr = params.get("google_error")
    if (googleErr) {
      window.history.replaceState({}, "", "/login")
      setError(googleErrorMessage(googleErr) ?? "Google sign-in failed.")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      await login(email, password)
      // FOUNDER RULE: a successful email/password login always lands on
      // /dashboard — email verification is a non-blocking follow-up, never
      // a login-time detour to /check-email (see also AppShell and api.ts,
      // where the same rule was enforced 2026-09-29 after this exact
      // per-login redirect was found to strand real signups).
      //
      // C(tony)LoginReturnSeed: verified users who signed up but never ran a
      // verdict get a blank /dashboard with no guided path. Research:
      //   Linear teardown (candu.ai): "empty state = exit intent".
      //   Superhuman: "the aha moment must be reachable on every login".
      // Fix: if the user has a verified account and no first-check seed is
      // already set, write one from the live buy-list so the dashboard shows
      // "Your first check is ready →". Fire-and-forget so it never blocks login.
      // Only for verified accounts — unverified are routed to /check-email by
      // the dashboard's own AppShell, so the seed never renders.
      const user = useAuthStore.getState().user
      if (user?.email_verified && !readFirstCheckSeed()) {
        fetchFirstCheckQuery().then(q => writeFirstCheckSeed(q)).catch(() => {})
      }
      router.push("/dashboard")
    }
    catch (err: unknown) { setError(err instanceof Error ? err.message : t.errorInvalid) }
    finally { setLoading(false) }
  }

  // C(tony)GoogleCheckoutInterstitial: when pendingCheckoutUrl is set, render
  // the shared CheckoutInterstitialCard — Google OAuth path gets the same
  // "You're about to unlock X" confirmation as the email/password path.
  if (pendingCheckoutUrl) {
    return (
      <AuthCard>
        <CheckoutInterstitialCard
          intent=""
          demandMatch={null}
          planLabel={pendingPlanLabel}
          planPrice={pendingPlanPrice}
          locale={localeProp}
          onContinue={() => {
            try { trackEvent("checkout_interstitial_clicked") } catch { /* never block */ }
            window.location.assign(pendingCheckoutUrl)
          }}
        />
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeading heading={t.heading} subheading={t.subheading} />

      <GoogleSignInButton label="Continue with Google" />
      <AuthDivider text="or" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" invalid={!!error} describedBy="auth-form-error" />
        <AuthField label={t.passwordLabel} type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" invalid={!!error} describedBy="auth-form-error" />
        {error && <div id="auth-form-error" role="alert" className="text-[13px] text-[var(--color-skip)] text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className={`${AUTH_ACCENT_BUTTON} mt-1`}
        >
          {loading ? t.submitting : t.submit}
        </button>
      </form>
      <div className={`text-center mt-5 text-[13px] ${AUTH_TEXT_SECONDARY}`}>
        {t.newHere} <Link href="/register" className={`${AUTH_ACCENT} hover:underline font-semibold`}>{t.getAccess}</Link>
      </div>
      <div className="text-center mt-2">
        <Link href="/forgot-password" className={`text-[11px] ${AUTH_TEXT_MUTED} hover:text-[var(--color-text-primary)]`}>{t.forgotLink}</Link>
      </div>
    </AuthCard>
  )
}

export function LoginForm(props: { locale?: Locale } = {}) {
  return <Suspense><LoginFormInner {...props} /></Suspense>
}
