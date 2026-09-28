"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { setToken, getPlanFromToken } from "@/lib/utils"
import { FIRST_CHECK_HREF } from "@/lib/checkout"
import { getMe } from "@/lib/api"
import Link from "next/link"
import { copy, type Locale } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"
import {
  AuthCard, AuthHeading, AuthField,
  AUTH_ACCENT, AUTH_ACCENT_BUTTON, AUTH_TEXT_SECONDARY, AUTH_TEXT_MUTED,
} from "@/components/auth/auth-form-parts"
import { queryCoverageKind } from "@/lib/query-coverage"
import { GoogleSignInButton, AuthDivider } from "@/components/auth/google-sign-in-button"
import { googleErrorMessage } from "@/lib/google-oauth"

export function LoginFormInner({ locale: localeProp }: { locale?: Locale } = {}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [brandQuery, setBrandQuery] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = copy[localeProp ?? useLocale()].auth.login

  // C148(tony): if we arrived from /register conflict CTA, pre-fill the email
  // so the user doesn't retype what they already entered.
  // C176(tony): if we arrived from the paywall "Sign in" link (hard-paywall-card
  // passes ?q=<query>), pre-seed the intent field so the item context is not
  // dropped and login routes to the exact verdict they were checking, not the
  // generic Nike AF1 sample. Paywall → sign in → wrong verdict = activation dead-end.
  useEffect(() => {
    const preEmail = searchParams.get("email")
    if (preEmail) setEmail(decodeURIComponent(preEmail))
    const preQ = searchParams.get("q")
    if (preQ) setBrandQuery(decodeURIComponent(preQ))
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
        .then(user => {
          useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
          // Clean the token out of the URL (don't expose it in history)
          window.history.replaceState({}, "", "/login")
          // C171(tony): Google login also lacked plan-aware routing — matched
          // the same fix applied to email+password login and reset-password (C166).
          // Paid users land on /dashboard; intent query still overrides.
          let dest: string
          try {
            const saved = localStorage.getItem("riq_intent_query")
            if (saved) {
              dest = `/verdict?q=${encodeURIComponent(saved)}`
              localStorage.removeItem("riq_intent_query")
            } else if (brandQuery.trim()) {
              dest = `/verdict?q=${encodeURIComponent(brandQuery.trim())}`
            } else {
              const plan = getPlanFromToken()
              if (plan === "operator" || plan === "power") {
                // C216(tony): paid + no intent → /verdict (WORKING_MODELS chips,
                // live first answer) instead of /dashboard (12-line stub, 0 activation
                // value). 11/25 accounts ran zero verdicts — they logged in, hit an
                // empty admin screen, and left. Linear/Plausible pattern: route new
                // users to the VALUE screen first; /dashboard is in the nav.
                dest = FIRST_CHECK_HREF
              } else {
                // C172(tony): Google signup skips Stripe — new user arrives as
                // plan=free with no checkout. If riq_register_plan was written
                // by register-form.tsx < 5 min ago, route to /pricing to close
                // checkout instead of dumping them on the free Nike AF1 demo.
                try {
                  const raw = localStorage.getItem("riq_register_plan")
                  localStorage.removeItem("riq_register_plan")
                  const parsed = raw ? (JSON.parse(raw) as { plan: string; ts: number }) : null
                  const fresh = parsed ? Date.now() - parsed.ts < 5 * 60 * 1000 : false
                  dest = (fresh && (parsed?.plan === "operator" || parsed?.plan === "power"))
                    ? `/pricing?ref=google-signup&plan=${parsed.plan}`
                    : FIRST_CHECK_HREF
                } catch { dest = FIRST_CHECK_HREF }
              }
            }
          } catch { /* private mode — fall back */ dest = FIRST_CHECK_HREF }
          router.push(dest)
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
      // C147: read localStorage intent query (set by register C140 or a prior
      // session) so a returning user who logs in with email+password also lands
      // on their own query rather than the generic Air Force 1 sample.
      // Mirrors the Google OAuth callback pattern (C141).
      // C171(tony): C166 added plan-aware routing to reset-password but login
      // still sent every paid subscriber to the public Nike AF1 demo. Paid
      // users get /dashboard (their buy-list); free/unknown get the intent
      // query or FIRST_CHECK_HREF sample. Intent query still overrides both —
      // if they typed a brand before logging in, that check fires on arrival.
      let dest: string
      try {
        const saved = localStorage.getItem("riq_intent_query")
        if (brandQuery.trim()) {
          dest = `/verdict?q=${encodeURIComponent(brandQuery.trim())}`
        } else if (saved) {
          dest = `/verdict?q=${encodeURIComponent(saved)}`
          localStorage.removeItem("riq_intent_query")
        } else {
          // C216(tony): paid + no intent → /verdict (WORKING_MODELS chips,
          // live first answer) instead of /dashboard (12-line stub). Same
          // fix as Google OAuth callback above — both paths had the same bug.
          // plan check removed: both paths now go to FIRST_CHECK_HREF.
          dest = FIRST_CHECK_HREF
        }
      } catch { /* private mode — fall back */ dest = FIRST_CHECK_HREF }
      router.push(dest)
    }
    catch (err: unknown) { setError(err instanceof Error ? err.message : t.errorInvalid) }
    finally { setLoading(false) }
  }

  return (
    <AuthCard>
      <AuthHeading heading={t.heading} subheading={t.subheading} />

      <GoogleSignInButton
        label="Continue with Google"
        onBeforeNavigate={() => {
          if (brandQuery.trim()) {
            try { localStorage.setItem("riq_intent_query", brandQuery.trim()) } catch { /* private mode */ }
          }
        }}
      />
      <AuthDivider text="or" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" invalid={!!error} describedBy="auth-form-error" />
        <AuthField label={t.passwordLabel} type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" invalid={!!error} describedBy="auth-form-error" />
        {error && <div id="auth-form-error" role="alert" className="text-[13px] text-[var(--color-skip)] text-center">{error}</div>}
        {/* C(tony): Canva goal-framing pattern — when the user has typed a tracked
            intent query, the submit button names their specific goal rather than
            the generic "Sign in". Same pattern as register-form.tsx dynamic button.
            "Sign in & check Stone Island Hoodie →" feels purposeful; "Sign in"
            feels like admin. Only tracked items get the named CTA — untracked
            stays generic so we don't promise a verdict we can't deliver. */}
        <button
          type="submit"
          disabled={loading}
          className={`${AUTH_ACCENT_BUTTON} mt-1`}
        >
          {loading ? t.submitting : (() => {
            const q = brandQuery.trim()
            if (q.length >= 3) {
              const kind = queryCoverageKind(q)
              if (kind === "catalog" || kind === "free_sample") {
                return `Sign in & check ${q} →`
              }
            }
            return t.submit
          })()}
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
