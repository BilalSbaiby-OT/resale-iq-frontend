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
import { FIRST_CHECK_HREF } from "@/lib/checkout"
import { IntentTypeahead, findDemandMatch } from "@/components/auth/intent-typeahead"
import { queryCoverageKind } from "@/lib/query-coverage"
import { trackEvent } from "@/lib/analytics"
import { CheckoutInterstitialCard } from "@/components/auth/checkout-interstitial-card"

const INTENT_QUERY_KEY = "riq_intent_query"

function saveIntentQuery(q: string) {
  try {
    window.localStorage.setItem(INTENT_QUERY_KEY, q)
  } catch {
    // why: private/incognito mode can throw on localStorage writes; the intent
    // simply won't persist across the OAuth redirect — non-fatal, no user-facing state to fix.
  }
}

export function LoginFormInner({ locale: localeProp }: { locale?: Locale } = {}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [intentQuery, setIntentQuery] = useState("")
  // C(tony)GoogleCheckoutInterstitial: hold the pending Stripe URL + intent so
  // Google OAuth signups see the same "You're about to unlock X" interstitial
  // as email/password signups. Without this, Google new-signups skip straight
  // to Stripe with zero context — same cold-jump problem that caused 95%+
  // checkout abandonment in the email flow before the interstitial was added.
  // Pattern: register-form.tsx pendingCheckoutUrl + pendingCheckoutIntent.
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | null>(null)
  const [pendingCheckoutIntent, setPendingCheckoutIntent] = useState<string>("")
  const { login } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = copy[localeProp ?? useLocale()].auth.login

  useEffect(() => {
    const preEmail = searchParams.get("email")
    if (preEmail) setEmail(decodeURIComponent(preEmail))
  }, [searchParams])

  // C(tony)LoginIntentRecall: pre-populate the intent typeahead from
  // localStorage on mount. A user who typed their item during /register
  // (or a previous login session) should see it here without re-typing —
  // so the goal-button immediately says "Sign in & check Stone Island Hoodie →"
  // and on submit they route straight to their verdict.
  // Pattern: Superhuman pre-fills context from the last session so returning
  // users land in continuity, not a blank state.
  // Only reads on mount — does NOT clear the key (verify-email owns that cleanup).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(INTENT_QUERY_KEY)
      if (saved && !intentQuery) setIntentQuery(saved)
    } catch { /* private mode — intentQuery stays empty */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          // C(tony)LoginVerdict: route returning Google users to /verdict (first
          // real answer) instead of /dashboard (12-line stub, 0 activation value).
          // Same fix as email login below — Elon's cleanup stripped both routes.
          // C(tony)LoginIntentField: if the user typed a tracked intent query
          // before hitting Google (saved to localStorage pre-redirect), route
          // straight to their query's verdict instead of the generic seed.
          let savedIntent: string | null = null
          try {
            savedIntent = window.localStorage.getItem(INTENT_QUERY_KEY)
          } catch {
            // why: localStorage read can throw in private/incognito mode; savedIntent
            // stays null and we fall back to FIRST_CHECK_HREF below — safe default.
          }

          // C(tony)GoogleCheckout: Google OAuth bypassed the email/password register
          // form, so Stripe checkout was never triggered. If riq_register_plan is
          // fresh (< 5 min), the user chose a plan before clicking Google — they
          // expect to pay. Resolve the price, create a checkout session, and redirect
          // to Stripe now. Falls back to verdict on any error (same UX as before).
          // Pattern: Stripe own documentation — never silently skip payment for a
          // user who initiated a paid signup flow.
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
                (p: { id: string; price_id?: string }) => p.id === parsed.plan
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
                  setPendingCheckoutIntent(savedIntent ?? "")
                  setPendingCheckoutUrl(checkout_url)
                }
              }
            }
          } catch {
            // why: GoogleCheckout is best-effort — any error (network, stale plan
            // data, missing price_id, Stripe unavailable) must never block login.
            // The user created their account successfully; falling back to verdict
            // lets them reach the product. They can upgrade via /pricing later.
          }

          if (!checkoutHandled) {
            router.push(savedIntent ? `/verdict?q=${encodeURIComponent(savedIntent)}` : FIRST_CHECK_HREF)
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
      const u = useAuthStore.getState().user
      if (u && u.email_verified === false) {
        router.push("/check-email")
        return
      }
      // C(tony)LoginVerdict: route to /verdict (first real answer, Nike AF1 seed)
      // instead of /dashboard (12-line stub, 11/25 accounts ran 0 verdicts after
      // Elon's cleanup stripped the intent routing). Value screen first, then nav.
      // C(tony)LoginIntentField: if the user told us what they want to check,
      // route straight to their query's verdict instead of the generic seed.
      const trimmedIntent = intentQuery.trim()
      if (trimmedIntent && queryCoverageKind(trimmedIntent) !== "untracked") {
        saveIntentQuery(trimmedIntent)
        router.push(`/verdict?q=${encodeURIComponent(trimmedIntent)}`)
      } else {
        router.push(FIRST_CHECK_HREF)
      }
    }
    catch (err: unknown) { setError(err instanceof Error ? err.message : t.errorInvalid) }
    finally { setLoading(false) }
  }

  // C(tony)GoogleCheckoutInterstitial: demand match for the pending checkout intent.
  // Same lookup as register-form.tsx — findDemandMatch reads the already-fetched
  // liveSuggestionsCache so there's no extra network call.
  const pendingDemandMatch = pendingCheckoutIntent.trim().length >= 3
    ? findDemandMatch(pendingCheckoutIntent)
    : null

  // C(tony)GoogleCheckoutInterstitial: when pendingCheckoutUrl is set, render
  // the shared CheckoutInterstitialCard — Google OAuth path gets the same
  // "You're about to unlock X" confirmation as the email/password path.
  if (pendingCheckoutUrl) {
    return (
      <AuthCard>
        <CheckoutInterstitialCard
          intent={pendingCheckoutIntent}
          demandMatch={pendingDemandMatch}
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

      <GoogleSignInButton
        label="Continue with Google"
        onBeforeNavigate={() => {
          const trimmedIntent = intentQuery.trim()
          if (trimmedIntent) saveIntentQuery(trimmedIntent)
        }}
      />
      <AuthDivider text="or" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!loading && (
          <div className="flex flex-col gap-1.5">
            <span className={`text-[12px] ${AUTH_TEXT_MUTED}`}>What do you want to check?</span>
            <IntentTypeahead
              value={intentQuery}
              onChange={setIntentQuery}
              onSelect={(v) => saveIntentQuery(v)}
              placeholder="e.g. Stone Island Hoodie, Fred Perry Polo…"
              aria-label="What do you want to check?"
            />
          </div>
        )}
        <AuthField label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" invalid={!!error} describedBy="auth-form-error" />
        <AuthField label={t.passwordLabel} type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" invalid={!!error} describedBy="auth-form-error" />
        {error && <div id="auth-form-error" role="alert" className="text-[13px] text-[var(--color-skip)] text-center">{error}</div>}
        {/* C(tony)LoginGoalButton: when the user types a tracked intent query, the
            submit button names their specific goal — "Sign in & check Stone Island
            Hoodie →" feels purposeful; generic "Sign in" feels like admin.
            Canva/Linear pattern: label the action with the outcome, not the mechanism.
            Only tracked items get the named CTA — untracked stays generic so we
            don't promise a verdict we can't deliver. queryCoverageKind already
            evaluated in handleSubmit; reuse the same check here for the label. */}
        <button
          type="submit"
          disabled={loading}
          className={`${AUTH_ACCENT_BUTTON} mt-1`}
        >
          {loading
            ? t.submitting
            : (() => {
                const trimmed = intentQuery.trim()
                return trimmed && queryCoverageKind(trimmed) !== "untracked"
                  ? `Sign in & check ${trimmed} →`
                  : t.submit
              })()
          }
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
