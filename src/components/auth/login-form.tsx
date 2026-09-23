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
  AuthCard, AuthHeading, AuthField, AuthSubmit,
  AUTH_ACCENT, AUTH_TEXT, AUTH_TEXT_SECONDARY, AUTH_TEXT_MUTED,
} from "@/components/auth/auth-form-parts"
import { GoogleSignInButton, AuthDivider } from "@/components/auth/google-sign-in-button"
import { googleErrorMessage } from "@/lib/google-oauth"
import { TrendingUp } from "lucide-react"
import { fetchTopBrandRows, type SnapshotBrandRow } from "@/lib/market-snapshot"

// Keepa/Plausible pattern: show live product data BEFORE the form.
// Returning users who haven't run a verdict yet have no mental model of
// "what's worth checking today". Live numbers remove that friction.
// Same fallback approach as register-form.tsx and check-email-content.tsx.
const LOGIN_DEMAND_FALLBACK: SnapshotBrandRow[] = [
  { brand: "Stone Island", category: "Hoodies",    sold_7d: 102, avg_price_eur: 58 },
  { brand: "New Balance",  category: "Sneakers",   sold_7d: 383, avg_price_eur: 43 },
  { brand: "Fred Perry",   category: "Polo Shirts", sold_7d: 27, avg_price_eur: 13 },
]

export function LoginFormInner({ locale: localeProp }: { locale?: Locale } = {}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [brandQuery, setBrandQuery] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // C156(tony): live demand panel — Keepa pattern, data before form.
  const [demandRows, setDemandRows] = useState<SnapshotBrandRow[]>(LOGIN_DEMAND_FALLBACK)
  const { login } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = copy[localeProp ?? useLocale()].auth.login

  // C148(tony): if we arrived from /register conflict CTA, pre-fill the email
  // so the user doesn't retype what they already entered.
  useEffect(() => {
    const preEmail = searchParams.get("email")
    if (preEmail) setEmail(decodeURIComponent(preEmail))
  }, [searchParams])

  // C156(tony): fetch live demand rows for the "what's moving" panel.
  // Same pattern as register-form.tsx. Falls back silently.
  useEffect(() => {
    fetchTopBrandRows(3, LOGIN_DEMAND_FALLBACK).then(rows => setDemandRows(rows)).catch(() => {})
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
              dest = (plan === "operator" || plan === "power") ? "/dashboard" : FIRST_CHECK_HREF
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
          const plan = getPlanFromToken()
          dest = (plan === "operator" || plan === "power") ? "/dashboard" : FIRST_CHECK_HREF
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

      {/* C156(tony): live demand panel — Keepa/Plausible pattern.
          Returning users with zero verdicts (11/25 accounts) have no mental
          model of "what's worth checking". Live numbers answer that before
          they touch the form. Same data source as register-form + check-email.
          Clicking a row pre-fills the intent field so the first click runs
          straight to a verdict — reducing empty-input paralysis. */}
      <div className="mb-4 bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp size={12} className={AUTH_ACCENT} />
          <span className={`text-[11px] font-semibold ${AUTH_TEXT_SECONDARY} uppercase tracking-wide`}>
            What&apos;s moving on Vinted right now
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {demandRows.map(r => (
            <button
              key={`${r.brand}-${r.category}`}
              type="button"
              onClick={() => setBrandQuery(`${r.brand} ${r.category}`)}
              className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-2)] last:border-0 hover:bg-[var(--color-surface-elevated)] rounded px-1 -mx-1 transition-colors text-left w-full"
            >
              <div>
                <span className={`text-[12.5px] font-semibold ${AUTH_TEXT}`}>{r.brand}</span>
                <span className={`text-[11.5px] ${AUTH_TEXT_MUTED} ml-1.5`}>{r.category}</span>
              </div>
              <div className="text-right">
                <span className={`text-[12px] font-bold ${AUTH_ACCENT}`}>
                  {r.sold_7d.toLocaleString()}
                </span>
                <span className={`text-[10.5px] ${AUTH_TEXT_MUTED} ml-1`}>/7d</span>
              </div>
            </button>
          ))}
        </div>
        <p className={`text-[11px] ${AUTH_TEXT_MUTED} mt-2`}>Tap a row to pre-fill your first check.</p>
      </div>

      {/* Google Sign-In — hidden until backend confirms credentials exist.
          onBeforeNavigate: if the user typed an intent query, save it to
          localStorage before the browser leaves for Google. The callback
          handler below reads it back on return. Tony C141. */}
      <GoogleSignInButton
        label="Continue with Google"
        onBeforeNavigate={() => {
          if (brandQuery.trim()) {
            try { localStorage.setItem("riq_intent_query", brandQuery.trim()) } catch { /* private mode */ }
          }
        }}
      />
      <AuthDivider text="or" />

      {/* Intent capture (Notion pattern): ask what they want to check BEFORE
          logging in. The query is stored in state and used to pre-seed the
          verdict page after login, replacing the generic Nike Air Force 1 sample.
          This personalises the first Aha moment — from "here's a generic example"
          to "here's the exact answer you asked for". Voluntary — blank falls back
          to the public sample. Tony C139 2026-09-23 */}
      <div className="mb-1">
        <label className={`text-[12px] ${AUTH_TEXT_SECONDARY} block mb-1.5 font-medium`}>
          What do you want to check today?
        </label>
        <input
          type="text"
          value={brandQuery}
          onChange={e => setBrandQuery(e.target.value)}
          placeholder="e.g. Stone Island Hoodie, Fred Perry Polo…"
          className={`w-full bg-transparent border border-[var(--color-border-ui)] rounded-lg px-3 py-2.5 text-[14px] ${AUTH_TEXT} outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]`}
          aria-label="What do you want to check today?"
          autoComplete="off"
        />
        <p className={`text-[11px] ${AUTH_TEXT_MUTED} mt-1`}>
          We&apos;ll run the verdict the moment you&apos;re in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" invalid={!!error} describedBy="auth-form-error" />
        <AuthField label={t.passwordLabel} type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" invalid={!!error} describedBy="auth-form-error" />
        {error && <div id="auth-form-error" role="alert" className="text-[13px] text-[var(--color-skip)] text-center">{error}</div>}
        <AuthSubmit loading={loading} submitting={t.submitting} submit={t.submit} />
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
