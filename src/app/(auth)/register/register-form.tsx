"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { getPlans, isConflict, createCheckout } from "@/lib/api"
import { trackEvent, type FunnelEvent, type RegisterFailReason } from "@/lib/analytics"
import { resolvePriceId } from "@/lib/pricing"
import { copy, WITHDRAWAL_WAIVER_TEXT, type Locale } from "@/lib/i18n"
import { GoogleSignInButton, AuthDivider } from "@/components/auth/google-sign-in-button"
import { ActivationSteps } from "@/components/auth/activation-steps"
import { fetchTopBrandRows, type SnapshotBrandRow } from "@/lib/market-snapshot"

// C(tony)RegisterMarketStrip: 3 live brand rows shown on free /register path
// to answer "why sign up?" before the email field. Plausible/Fathom pattern:
// show the value, not a promise of it. Static fallback so it never errors.
const REGISTER_STRIP_FALLBACK: SnapshotBrandRow[] = [
  { brand: "New Balance", category: "Sneakers", sold_7d: 383, avg_price_eur: 43 },
  { brand: "Stone Island", category: "Jackets",  sold_7d: 198, avg_price_eur: 89 },
  { brand: "Carhartt",     category: "Jackets",  sold_7d: 121, avg_price_eur: 51 },
]

// FOUNDER AUTH RULES (2026-09-29, binding): /register is a PLAIN account form.
// No "what do you want to check" question, no intent typeahead, no demand
// preview. Creating an account is always free (backend api/auth.py _create_user
// hardcodes plan='free' regardless of what this form sends) — a paid tier is
// only ever applied later, by Stripe, after a real purchase. The EU withdrawal
// waiver is therefore gated on the PAYMENT step, never on account creation:
// asking someone to waive a 14-day withdrawal right for a purchase they have
// not made yet is legally incoherent and was the measured root cause of the
// 2026-09-28 register_submit_failed(reason=waiver) incident (16:36 + 16:39) —
// visitors who just wanted an account got blocked by a checkbox about a
// Stripe charge that was never going to happen on this page.
//
// `plan` still exists because paid marketing CTAs (pricing page, blog
// upsells, GuestCheckoutButton fallback) link here with ?plan=operator|power
// to show the price + start Stripe Checkout right after the account is
// created. Any other value (missing, garbage, or a display name like "pro")
// resolves to "free" — deliberately one-directional: showing a cheaper path
// than asked costs a click, silently upgrading an ambiguous link to a paid
// form costs the visitor (see #48/#50 history in git log for the incident
// this avoided before, and 2026-09-28 for the incident it caused when the
// default was flipped to "operator").
const PAID_PLAN_IDS = ["power", "operator"] as const
type PlanId = (typeof PAID_PLAN_IDS)[number] | "free"

function planFromQuery(raw: string | null): PlanId {
  if (!raw) return "free"
  const id = raw.trim().toLowerCase()
  return (PAID_PLAN_IDS as readonly string[]).includes(id) ? (id as PlanId) : "free"
}

function RegisterContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.register
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const plan: PlanId = planFromQuery(searchParams.get("plan"))
  const isPaidPlan = plan === "operator" || plan === "power"

  const [waiver, setWaiver] = useState(false)
  const [error, setError] = useState("")
  // C148(tony): when backend returns 409 Conflict, render a clickable sign-in
  // link instead of dead text — the user has an account and needs a path, not
  // a message. Stores the email they typed so the link pre-fills /login.
  const [conflictEmail, setConflictEmail] = useState("")
  const [loading, setLoading] = useState(false)
  // After account creation, a paid arrival still needs to reach Stripe. If
  // that call fails, stay here with a retry — never dump them on
  // /check-email as the only next step, and never lose the account that
  // already exists.
  const [checkoutRetry, setCheckoutRetry] = useState(false)
  // Real prices from Stripe, keyed by plan id. Falls back to null → "…" until loaded.
  const [prices, setPrices] = useState<Record<string, number>>({})
  const stripePlans = useRef<{ id: string; price_id?: string }[]>([])
  const registeredRef = useRef(false)
  const { register, login } = useAuthStore()
  const router = useRouter()
  // C(tony)RegisterMarketStrip: fetch 3 live brand rows for the demand preview
  // strip on the free /register path. Only loaded when not a paid arrival —
  // paid users already see their plan price and don't need extra persuasion.
  const [stripRows, setStripRows] = useState<SnapshotBrandRow[]>(REGISTER_STRIP_FALLBACK)
  useEffect(() => {
    if (isPaidPlan) return
    fetchTopBrandRows(3, REGISTER_STRIP_FALLBACK).then(setStripRows).catch(() => {})
  }, [isPaidPlan])

  // C152(tony): conflict login path — "welcome back" inline form.
  const [conflictPassword, setConflictPassword] = useState("")
  const [conflictLoading, setConflictLoading] = useState(false)

  const handleConflictLogin = async () => {
    if (!conflictPassword || !conflictEmail) return
    setError("")
    setConflictLoading(true)
    try {
      await login(conflictEmail, conflictPassword)
      if (isPaidPlan) {
        await startPaidCheckout(plan as "operator" | "power")
      } else {
        // FOUNDER RULE 2026-09-29: every login/signup lands on /dashboard.
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed — check your password and try again.")
      setConflictLoading(false)
    }
  }

  useEffect(() => {
    if (!isPaidPlan) return
    getPlans().then(d => {
      stripePlans.current = d.plans
      const m: Record<string, number> = {}
      d.plans.forEach(p => { m[p.id] = p.price_eur })
      setPrices(m)
    }).catch(() => {})
  }, [isPaidPlan])

  const formFocused = useRef(false)
  // C(tony)WaiverPulse: ref + highlight state so the checkbox scrolls into
  // view and pulses red when a paid user tries to check out without ticking
  // it. Only relevant on the paid path — the waiver never blocks account
  // creation (see header comment).
  const waiverRef = useRef<HTMLLabelElement>(null)
  // Register waiver dead-end fix (pageviews: register_submit_failed at
  // /register?reason=waiver). scrollIntoView on the label alone helps
  // mouse/touch users but leaves keyboard and screen-reader users stranded
  // on the submit button — nothing tells them WHERE the blocking control is
  // without sight. A dedicated ref on the checkbox INPUT (not the label) lets
  // the failure move real keyboard focus there, which is both visible (focus
  // ring) and announced (screen reader reads the checkbox's own label text).
  const waiverCheckboxRef = useRef<HTMLInputElement>(null)
  const [waiverHighlight, setWaiverHighlight] = useState(false)

  const track = (event: FunnelEvent, extra?: { reason?: RegisterFailReason }) => {
    try {
      trackEvent(event, undefined, extra)
    } catch {
      // why: analytics must never block registration
    }
  }

  const onFormFocus = () => {
    if (formFocused.current) return
    formFocused.current = true
    track("register_form_focused")
  }

  // Same price_id resolution as pricing-section: placeholder → live Stripe id.
  const startPaidCheckout = async (paidPlan: "operator" | "power") => {
    const placeholder = paidPlan === "power" ? "__POWER__" : "__OPERATOR__"
    const priceId = resolvePriceId(placeholder, stripePlans.current)
    if (!priceId) throw new Error("no_price_id")
    const { checkout_url } = await createCheckout(priceId, { plan: paidPlan })
    if (!checkout_url) throw new Error("no_checkout_url")
    track("checkout_started")
    window.location.assign(checkout_url)
  }

  const retryPaidCheckout = async () => {
    if (!isPaidPlan) return
    setError("")
    setLoading(true)
    try {
      await startPaidCheckout(plan as "operator" | "power")
    } catch {
      setCheckoutRetry(true)
      setError(t.errorCheckoutStart)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    track("register_submit_attempted")
    if (password.length < 8) {
      track("register_submit_failed", { reason: "password_length" })
      setError(t.errorPasswordLength); return
    }
    setError(""); setLoading(true)
    try {
      if (!registeredRef.current) {
        await register(email, password)
        registeredRef.current = true
        // Fires only after the account actually exists — a submit that throws
        // (email already taken, network error) hits the catch below instead.
        track("signup_completed")
      }
      if (!isPaidPlan) {
        // FOUNDER RULE 2026-09-29 (binding, do not override): every login and
        // signup lands on /dashboard. The dashboard has the quick-check input
        // and suggestion chips, so there is no cold start.
        router.push("/dashboard")
        return
      }
      // Paid arrival: the account now exists. The EU withdrawal waiver gates
      // ONLY this Stripe step — never account creation above. Without it we
      // do not proceed to checkout, but the account is not lost either.
      if (!waiver) {
        track("register_submit_failed", { reason: "waiver" })
        setError(t.errorAcceptWaiver)
        setWaiverHighlight(true)
        waiverRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        // Move real keyboard focus to the checkbox itself (not just scroll)
        // so keyboard/screen-reader users land on the blocking control, not
        // stranded on the submit button. See waiverCheckboxRef comment above.
        waiverCheckboxRef.current?.focus()
        setTimeout(() => setWaiverHighlight(false), 2000)
        return
      }
      try {
        await startPaidCheckout(plan as "operator" | "power")
        return
      } catch {
        setCheckoutRetry(true)
        setError(t.errorCheckoutStart)
        return
      }
    } catch (err: unknown) {
      if (isConflict(err)) {
        track("register_submit_failed", { reason: "conflict" })
        // C148(tony): store the typed email so we can render a linked CTA
        // pointing to /login?email=… — converts a dead-end into a navigation.
        setConflictEmail(email)
        setError("")
      } else {
        const reason: RegisterFailReason =
          err instanceof Error && err.message.startsWith("Network error")
            ? "network"
            : "generic"
        track("register_submit_failed", { reason })
        // A backend-returned err.message is backend-owned and stays in
        // whatever language the API sent it in (same rule as the free
        // checker's res.message — see src/lib/i18n.ts header comment). Only
        // the local fallback string is translated.
        setError(err instanceof Error ? err.message : t.errorGeneric)
      }
    }
    finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-end mb-3">
      </div>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-8">
        {/* C(tony)ActivationSteps: step 1 of 3 progress bar — Fathom/Linear pattern. */}
        <ActivationSteps step={1} />

        <h1 className="text-[21px] font-bold mb-1">
          {isPaidPlan ? t.paidHeading.replace("{plan}", t.planNames[plan]) : t.heading}
        </h1>
        <p className="text-[var(--color-text-secondary)] text-[13px] mb-4">
          {isPaidPlan ? t.paidSubheading : t.subheading}
        </p>

        {/* C(tony)RegisterMarketStrip: 3-row live demand preview shown on free
            path before the form. Answers "why sign up?" with real sell velocity
            and price data — Plausible/Fathom pattern: show the value first.
            Not rendered for paid arrivals (they already see their plan price). */}
        {!isPaidPlan && (
          <div className="mb-4 rounded-xl border border-[var(--color-border-ui)] overflow-hidden">
            <div className="px-3 py-2 bg-[var(--color-bg-4)] border-b border-[var(--color-border-ui)]">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Selling on Vinted this week</span>
            </div>
            {stripRows.slice(0, 3).map((row, i) => (
              <div key={`${row.brand}-${row.category}`} className={`flex items-center justify-between px-3 py-2.5 ${i < 2 ? "border-b border-[var(--color-border-ui)]" : ""}`}>
                <div>
                  <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{row.brand}</span>
                  <span className="text-[11px] text-[var(--color-text-muted)] ml-1.5">{row.category}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-[13px] font-bold text-[var(--color-buy)]">{row.sold_7d.toLocaleString()} sold</span>
                  <span className="text-[11px] text-[var(--color-text-muted)] ml-1.5">avg €{row.avg_price_eur}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} onFocus={onFormFocus} className="flex flex-col gap-4">
          {/* Google Sign-In always creates a free account (api/oauth_google.py
              hardcodes plan='free') and, on success, lands the user straight
              on /dashboard — see google-sign-in-button.tsx / login-form.tsx.
              Exception: if this page was reached via a paid CTA (?plan=),
              persist that choice so login-form.tsx's Google callback can
              still route to Stripe checkout afterwards — Google bypasses
              this form's own checkout call entirely. */}
          <GoogleSignInButton
            label="Continue with Google"
            onBeforeNavigate={isPaidPlan ? () => {
              try { localStorage.setItem("riq_register_plan", JSON.stringify({ plan, ts: Date.now() })) } catch { /* private mode */ }
            } : undefined}
          />
          <AuthDivider text="or" />

          {/* A paid arrival still has to SEE the price before a submit sends
              them to Stripe, hence this summary. It reads the live Stripe
              amount, same source as before, so "€49 shown / €79 charged"
              stays impossible. Only rendered for an explicit ?plan= CTA —
              the plain form never shows a price. */}
          {isPaidPlan && (
            <div>
              <div className="flex items-center justify-between border border-[var(--color-border-2)] rounded-xl p-3.5">
                <span className="font-semibold text-[14px] text-[var(--color-text-primary)]">{t.planNames[plan]}</span>
                <span className="text-right">
                  <span className="font-bold text-[15px] text-[var(--color-text-primary)]">
                    {prices[plan] != null ? `€${prices[plan]}` : "…"}
                  </span>
                  <span className="text-[12px] text-[var(--color-text-secondary)] ml-1">{t.perMonth}</span>
                </span>
              </div>
              <div className="text-center mt-1.5">
                {plan === "operator" ? (
                  <a
                    href={`${pathname}?plan=power`}
                    className="text-[11.5px] text-[var(--color-text-muted)] hover:text-[var(--color-buy)]"
                  >
                    Want Pro (€{prices["power"] ?? 49}/mo instead)?
                  </a>
                ) : (
                  <a
                    href={`${pathname}?plan=operator`}
                    className="text-[11.5px] text-[var(--color-text-muted)] hover:text-[var(--color-buy)]"
                  >
                    ← Switch to Starter (€{prices["operator"] ?? 19}/mo)
                  </a>
                )}
              </div>
              {t.paidTrustNote && (
                <p className="text-[12px] text-[var(--color-text-secondary)] text-center mt-1.5">
                  🔒 {t.paidTrustNote}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-[12px] text-[var(--color-text-secondary)] block mb-1.5">{t.emailLabel}</label>
            <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-3 min-h-[44px] text-[16px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]" />
          </div>
          <div>
            <label className="text-[12px] text-[var(--color-text-secondary)] block mb-1.5">{t.passwordLabel}</label>
            <input type="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPlaceholder}
              className="w-full bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-3 min-h-[44px] text-[16px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]" />
          </div>

          {/* EU consumer law: for digital content delivered immediately, the
              14-day withdrawal right only ends if the customer gives EXPRESS,
              separately-ticked consent — and only once there is an actual
              purchase to waive it for. This checkbox therefore only renders
              on the paid (?plan=operator|power) path, right next to the price
              it applies to, and only gates the "Continue to Stripe" action —
              never account creation (see header comment + 2026-09-28
              register_submit_failed(reason=waiver) incident this fixes).

              W19: this text is WITHDRAWAL_WAIVER_TEXT (src/lib/i18n.ts),
              English on every locale until legal-compliance signs off on a
              translated version — see that constant's comment for why. */}
          {isPaidPlan && (
            <>
              {!waiver && (
                <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mb-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-skip)] shrink-0" />
                  Tick the box below to continue to payment
                </p>
              )}
              <label ref={waiverRef} className={`flex items-start gap-2.5 text-[12px] text-[var(--color-text-secondary)] rounded-lg transition-colors duration-300 ${waiverHighlight ? "bg-red-500/10 ring-1 ring-red-500/50 px-2 py-1" : ""}`} data-i18n-pending="waiver-legal-review">
                <input ref={waiverCheckboxRef} type="checkbox" checked={waiver} onChange={e => setWaiver(e.target.checked)} className="mt-0.5 w-[20px] h-[20px] shrink-0 accent-[var(--color-buy)]" />
                <span>{WITHDRAWAL_WAIVER_TEXT}</span>
              </label>
            </>
          )}

          {/* C152(tony): 409 conflict → inline "welcome back" login. */}
          {conflictEmail && (
            <div className="rounded-xl border border-[var(--color-border-2)] p-4 bg-[var(--color-bg-4)]">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-0.5">
                Welcome back — you already have an account.
              </p>
              <p className="text-[12px] text-[var(--color-text-secondary)] mb-3">
                {isPaidPlan ? "Enter your password to continue to checkout." : "Enter your password to sign in."}
              </p>
              <input
                type="password"
                value={conflictPassword}
                onChange={e => setConflictPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleConflictLogin()}
                placeholder="Your password"
                autoFocus
                className="w-full bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-2.5 text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)] mb-2"
              />
              <button
                type="button"
                onClick={handleConflictLogin}
                disabled={conflictLoading || !conflictPassword}
                className="w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {conflictLoading ? "Signing in…" : isPaidPlan ? `Continue to ${plan === "power" ? "Pro" : "Starter"} checkout →` : "Sign in →"}
              </button>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-2 text-center">
                Not you? <a href="/register" className="text-[var(--color-buy)] hover:underline">Use a different email</a>
              </p>
            </div>
          )}
          {error && <div className="text-[12px] text-[var(--color-skip)] text-center">{error}</div>}
          {checkoutRetry && (
            <button type="button" onClick={retryPaidCheckout} disabled={loading}
              className="w-full border border-[var(--color-buy)] text-[var(--color-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:bg-[var(--color-buy)]/10 transition-colors disabled:opacity-50">
              {t.continueToCheckout}
            </button>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? t.submitting : (
              <>
                {isPaidPlan ? t.paidSubmit.replace("{plan}", t.planNames[plan]) : t.submit}
                <Check size={15} />
              </>
            )}
          </button>

          {/* Consent by submission — both documents are still one click away
              and open in a new tab, so nothing is hidden, it just costs no
              click to proceed. Deliberately NOT applied to the withdrawal
              waiver above, which the law requires as a separate affirmative
              act only once there is a purchase. */}
          <p className="text-[12px] text-[var(--color-text-secondary)] text-center">
            {t.tosInlinePrefix} <Link href="/terms" target="_blank" className="text-[var(--color-buy)] hover:underline">{t.termsLabel}</Link> {t.tosAnd} <Link href="/privacy" target="_blank" className="text-[var(--color-buy)] hover:underline">{t.privacyLabel}</Link>{t.tosSuffix ? ` ${t.tosSuffix}` : ""}
          </p>

          <p className="text-[12px] text-[var(--color-text-secondary)] text-center">
            {isPaidPlan ? t.paidNote : t.freeNote}
          </p>
        </form>
        <div className="text-center mt-4 text-[13px] text-[var(--color-text-muted)]">
          {t.alreadyHaveAccount} <Link href="/login" className="text-[var(--color-buy)] hover:underline">{t.signIn}</Link>
        </div>
      </div>
    </div>
  )
}

export function RegisterForm({ locale }: { locale: Locale }) {
  return <Suspense><RegisterContent locale={locale} /></Suspense>
}
