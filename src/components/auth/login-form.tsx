"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { setToken } from "@/lib/utils"
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

export function LoginForm({ locale: localeProp }: { locale?: Locale } = {}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [brandQuery, setBrandQuery] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()
  const t = copy[localeProp ?? useLocale()].auth.login

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
          // Pre-seed the first verdict query so a newly-verified account
          // sees a real buy-below number on arrival instead of a blank input.
          // Nike Air Force 1 is in _PUBLIC_SAMPLE_QUERIES so it works for
          // every plan tier. (Tony C134 2026-09-23)
          // C141: also read riq_intent_query from localStorage — set by the
          // onBeforeNavigate handler above if the user typed an intent query
          // before clicking "Continue with Google". Same pattern as
          // verify-email-content.tsx. Cleared after use.
          let dest = brandQuery.trim()
            ? `/verdict?q=${encodeURIComponent(brandQuery.trim())}`
            : "/verdict?q=Nike+Air+Force+1"
          try {
            const saved = localStorage.getItem("riq_intent_query")
            if (saved) {
              dest = `/verdict?q=${encodeURIComponent(saved)}`
              localStorage.removeItem("riq_intent_query")
            }
          } catch { /* private mode — fall back */ }
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
      let dest = brandQuery.trim()
        ? `/verdict?q=${encodeURIComponent(brandQuery.trim())}`
        : "/verdict?q=Nike+Air+Force+1"
      try {
        const saved = localStorage.getItem("riq_intent_query")
        if (saved && !brandQuery.trim()) {
          dest = `/verdict?q=${encodeURIComponent(saved)}`
          localStorage.removeItem("riq_intent_query")
        }
      } catch { /* private mode — fall back */ }
      router.push(dest)
    }
    catch (err: unknown) { setError(err instanceof Error ? err.message : t.errorInvalid) }
    finally { setLoading(false) }
  }

  return (
    <AuthCard>
      <AuthHeading heading={t.heading} subheading={t.subheading} />

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
