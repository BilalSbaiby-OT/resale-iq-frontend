"use client"
import { useState, useEffect } from "react"
import { resetPassword, getMe } from "@/lib/api"
import { setToken, getPlanFromToken } from "@/lib/utils"
import { FIRST_CHECK_HREF } from "@/lib/checkout"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { copy } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"
import { AuthHeading, AuthField, AuthSubmit } from "@/components/auth/auth-form-parts"

export default function ResetPasswordPage() {
  // Read the token from the URL on the client rather than via useSearchParams:
  // this route is prerendered, and useSearchParams would require a Suspense
  // boundary to avoid a build-time bailout. The token is only ever needed
  // client-side, so window.location is both simpler and safe here.
  // undefined = haven't looked yet, null = looked and it's missing. Without the
  // third state every visitor sees a flash of "invalid link" before the effect runs.
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const tr = copy[useLocale()].auth.resetPassword

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    setToken(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError(tr.errorMismatch); return }
    if (password.length < 8) { setError(tr.errorLength); return }
    if (!token) { setError(tr.errorNoToken); return }
    setLoading(true)
    try {
      const res = await resetPassword(token, password)
      if (res.access_token) {
        setToken(res.access_token)
        try {
          const user = await getMe(res.access_token)
          useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
        } catch {
          useAuthStore.setState({ isAuthenticated: true, isLoading: false })
        }
        // C166(tony): route paid users to /dashboard, free/unknown to their
        // intent query or the Nike AF1 sample. A returning user who forgot
        // their password already has a subscription — landing on a public demo
        // makes them wonder whether their account still exists. Dashboard
        // answers "yes, you're in, here's your data" in one step.
        // Intent query overrides for both — if they typed before clicking
        // "forgot password", they get that specific check on arrival.
        let firstHref: string
        try {
          const saved = localStorage.getItem("riq_intent_query")
          if (saved) {
            firstHref = "/verdict?q=" + encodeURIComponent(saved)
            localStorage.removeItem("riq_intent_query")
          } else {
            // Token is now stored; getPlanFromToken() reads it.
            const plan = getPlanFromToken()
            firstHref = (plan === "operator" || plan === "power")
              ? "/dashboard"
              : FIRST_CHECK_HREF
          }
        } catch { /* private mode — fall back to sample */ firstHref = FIRST_CHECK_HREF }
        router.replace(firstHref)
        return
      }
      setDone(true)
    } catch (err) {
      // Surface the backend's own message (expired / already used / too common).
      setError(err instanceof Error ? err.message : tr.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-8">
        {done ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-[var(--color-buy)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{tr.doneHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-6">{tr.doneBody}</p>
            <Link href="/login" className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity">
              {tr.signIn}
            </Link>
          </div>
        ) : token === undefined ? (
          <div className="text-center py-6">
            <p className="text-[var(--color-text-secondary)] text-[13px]">{tr.checking}</p>
          </div>
        ) : token === null ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-[var(--color-watch)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{tr.invalidHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-6">
              {tr.invalidBody}
            </p>
            <Link href="/forgot-password" className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity">
              {tr.requestNew}
            </Link>
          </div>
        ) : (
          <>
            <AuthHeading heading={tr.heading} subheading={tr.subheading} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AuthField label={tr.newLabel} type="password" value={password} onChange={setPassword} placeholder={tr.newPlaceholder} minLength={8} autoComplete="new-password" />
              <AuthField label={tr.confirmLabel} type="password" value={confirm} onChange={setConfirm} placeholder={tr.confirmPlaceholder} minLength={8} autoComplete="new-password" />

              {error && (
                <div className="bg-[var(--color-skip)]/10 border border-[var(--color-skip)]/30 rounded-lg px-3 py-2.5 text-[12.5px] text-[var(--color-skip)]">
                  {error}
                </div>
              )}

              <AuthSubmit loading={loading} submitting={tr.submitting} submit={tr.submit} />
            </form>

            <div className="text-center mt-5">
              <Link href="/login" className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">{tr.backToSignIn}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
