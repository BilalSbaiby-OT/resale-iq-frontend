"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Check, TrendingUp } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { getPlans, isConflict, createCheckout } from "@/lib/api"
import { trackEvent, type FunnelEvent, type RegisterFailReason } from "@/lib/analytics"
import { resolvePriceId } from "@/lib/pricing"
import { copy, WITHDRAWAL_WAIVER_TEXT, type Locale } from "@/lib/i18n"
import { GoogleSignInButton, AuthDivider } from "@/components/auth/google-sign-in-button"
import { fetchTopBrandRows, type SnapshotBrandRow } from "@/lib/market-snapshot"

// Free + paid. Paid prices load LIVE from Stripe so the shown amount always
// matches what's charged (no €49-shown / €79-charged surprises).
//
// The free option is NOT cosmetic — this page was paid-only, so every "Create a
// free account" CTA on the site (pricing section, unlock panel, llms.txt, the
// Offer schema) landed people on a forced Stripe checkout. The free tier was
// advertised everywhere and reachable nowhere.
const PLAN_IDS = ["power", "operator"] as const
type PlanId = (typeof PLAN_IDS)[number]

// Top-moving brand/category pairs shown to prove product value at the point of
// checkout. These are the items a new subscriber will actually be able to check.
// Sourced live from /api/public/market-snapshot; static fallback is last verified
// values (2026-09-22) so the preview never renders empty.
type DemandRow = SnapshotBrandRow
const DEMAND_FALLBACK: DemandRow[] = [
  { brand: "Stone Island", category: "Hoodies",     sold_7d: 102, avg_price_eur: 58 },
  { brand: "Fred Perry",   category: "Polo Shirts", sold_7d: 27,  avg_price_eur: 13 },
  { brand: "Patagonia",    category: "Fleece",       sold_7d: 22,  avg_price_eur: 46 },
]

/** ONLY the real plan ids select a plan. Everything else — missing, unknown,
 *  or a display name — resolves to operator (Starter). */
function planFromQuery(raw: string | null): PlanId {
  if (!raw) return "operator"
  const id = raw.trim().toLowerCase()
  return (PLAN_IDS as readonly string[]).includes(id) ? (id as PlanId) : "operator"
}

function RegisterContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.register
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  const pathname = usePathname()
  // Derived, not state. It was useState + a useEffect that re-set it whenever
  // searchParams changed, because the radio group also wrote to it. With the
  // radios gone the URL is the only writer, so the effect was a cascading
  // re-render for nothing (and the react-hooks/set-state-in-effect error this
  // file used to carry).
  const plan: PlanId = planFromQuery(searchParams.get("plan"))
  // The last remaining tick, and the reason it survived a pass whose whole
  // point was removing ticks: EU law requires express, standalone consent to
  // waive the 14-day withdrawal right for immediately-delivered digital goods.
  // Legality is a constraint, not a conversion input. Paid path only.
  const [intentQuery, setIntentQuery] = useState("")
  const [waiver, setWaiver] = useState(false)
  const [error, setError] = useState("")
  // C148(tony): when backend returns 409 Conflict, render a clickable sign-in
  // link instead of dead text — the user has an account and needs a path, not
  // a message. Stores the email they typed so the link pre-fills /login.
  const [conflictEmail, setConflictEmail] = useState("")
  const [loading, setLoading] = useState(false)
  // After a paid register succeeds but Stripe Checkout does not, stay here with
  // a retry — never dump them on /check-email as the only next step.
  const [checkoutRetry, setCheckoutRetry] = useState(false)
  // Real prices from Stripe, keyed by plan id. Falls back to null → "…" until loaded.
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [demandRows, setDemandRows] = useState<DemandRow[]>(DEMAND_FALLBACK)
  const stripePlans = useRef<{ id: string; price_id?: string }[]>([])
  const registeredRef = useRef(false)
  const { register } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    getPlans().then(d => {
      stripePlans.current = d.plans
      const m: Record<string, number> = {}
      d.plans.forEach(p => { m[p.id] = p.price_eur })
      setPrices(m)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    // Live demand numbers to show product value at point of checkout.
    // Same pattern as check-email-content.tsx (C132). Falls back silently.
    fetchTopBrandRows(3, DEMAND_FALLBACK).then(rows => setDemandRows(rows)).catch(() => {})
  }, [])

  const formFocused = useRef(false)

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
    if (plan !== "operator" && plan !== "power") return
    setError("")
    setLoading(true)
    try {
      await startPaidCheckout(plan)
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
    // No terms gate here any more: pressing this button IS the acceptance, and
    // the sentence saying so sits directly under it. The withdrawal waiver
    // below is a different thing and still gates — see its comment.
    if (!waiver) {
      track("register_submit_failed", { reason: "waiver" })
      setError(t.errorAcceptWaiver); return
    }
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
        // Persist intent so verify-email can redirect to the right first
        // verdict rather than the generic Nike AF1 sample. Cleared by
        // verify-email-content.tsx after the redirect fires. (Tony C140)
        if (intentQuery.trim()) {
          try { localStorage.setItem("riq_intent_query", intentQuery.trim()) } catch { /* private mode */ }
        }
      }
      // All registrations go to paid checkout now — no free tier
      try {
        await startPaidCheckout(plan)
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
        <h1 className="text-[21px] font-bold mb-1">
          {t.paidHeading.replace("{plan}", t.planNames[plan])}
        </h1>
        <p className="text-[var(--color-text-secondary)] text-[13px] mb-5">
          {t.paidSubheading}
        </p>

        {/* What a subscriber unlocks — live top-moving items so the number
            justifies the price before the visitor hits their card. Same signal
            check-email-content.tsx shows; here it answers "why €19/mo now?" */}
        <div className="mb-5 bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={13} className="text-[var(--color-buy)]" />
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              What&apos;s moving on Vinted right now
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {demandRows.map(r => (
              <div key={`${r.brand}-${r.category}`}
                className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-2)] last:border-0">
                <div>
                  <span className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">{r.brand}</span>
                  <span className="text-[11.5px] text-[var(--color-text-muted)] ml-1.5">{r.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-[12.5px] font-bold text-[var(--color-buy)]">
                    {r.sold_7d.toLocaleString()}
                  </span>
                  <span className="text-[10.5px] text-[var(--color-text-muted)] ml-1">/7d</span>
                  <div className="text-[11px] text-[var(--color-text-secondary)]">avg €{r.avg_price_eur}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} onFocus={onFormFocus} className="flex flex-col gap-4">
          {/* Google Sign-In — hidden until backend confirms credentials exist */}
          <GoogleSignInButton label="Continue with Google" />
          <AuthDivider text="or" />

          {/* Intent capture (Notion pattern): ask what they want to check BEFORE
              they pay. The query is saved to localStorage on register success
              and used to pre-seed the first verdict after email verification —
              replacing the generic Nike AF1 redirect with the exact category
              they care about. Voluntary — blank falls back to the public sample.
              Tony C140 2026-09-23 */}
          <div>
            <label className="text-[12px] text-[var(--color-text-secondary)] block mb-1.5 font-medium">
              What do you want to check today?
            </label>
            <input
              type="text"
              value={intentQuery}
              onChange={e => setIntentQuery(e.target.value)}
              placeholder="e.g. Stone Island Hoodie, Fred Perry Polo…"
              className="w-full bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-2.5 text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]"
              aria-label="What do you want to check today?"
              autoComplete="off"
            />
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
              We&apos;ll run the verdict the moment your email is confirmed.
            </p>
          </div>
          {/* A paid arrival still has to SEE the price before a submit sends
              them to Stripe, hence this summary. It reads the live Stripe
              amount, same source as before, so "€49 shown / €79 charged"
              stays impossible. */}
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
            {/* H10: trust note beside price row — resolves the "will I be charged now?" objection
                at exactly the moment it forms (Principle #4/#7). Moved UP from below-button. */}
            {t.paidTrustNote && (
              <p className="text-[12px] text-[var(--color-text-secondary)] text-center mt-1.5">
                🔒 {t.paidTrustNote}
              </p>
            )}
          </div>

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
              separately-ticked consent. Bundling it into a Terms checkbox does
              not count — it must be its own affirmative action.

              This is now the ONLY checkbox on the page, and that is a feature
              rather than an accident of the diff. Two identical grey
              checkboxes stacked together read as one boilerplate block, which
              is precisely what "express, separate consent" is not. Directive
              2011/83/EU Art. 16(m) is untouched here and was never on the
              table — the control removed above it is the terms tick, for which
              consent by submission is standard and binding.

              W19: this text is WITHDRAWAL_WAIVER_TEXT (src/lib/i18n.ts),
              English on every locale until legal-compliance signs off on a
              translated version — see that constant's comment for why. */}
          <label className="flex items-start gap-2.5 text-[12px] text-[var(--color-text-secondary)]" data-i18n-pending="waiver-legal-review">
            <input type="checkbox" checked={waiver} onChange={e => setWaiver(e.target.checked)} className="mt-0.5 w-[20px] h-[20px] shrink-0 accent-[var(--color-buy)]" />
            <span>{WITHDRAWAL_WAIVER_TEXT}</span>
          </label>
          {/* C148(tony): conflict renders as a navigation link, not dead text.
              The email they typed pre-fills /login?email=… so they don't retype.
              Generic errors stay as plain text below (unchanged path). */}
          {conflictEmail && (
            <div className="text-[12px] text-center">
              <span className="text-[var(--color-text-secondary)]">An account already exists for </span>
              <span className="text-[var(--color-text-primary)] font-medium">{conflictEmail}</span>
              <span className="text-[var(--color-text-secondary)]">. </span>
              <Link
                href={`/login?email=${encodeURIComponent(conflictEmail)}`}
                className="text-[var(--color-buy)] font-semibold hover:underline"
              >
                Sign in →
              </Link>
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
                {t.paidSubmit.replace("{plan}", t.planNames[plan])}
                {" "}<Check size={15} />
              </>
            )}
          </button>

          {/* Consent by submission, replacing the tick that used to sit above
              the button. Standard, binding, and directly adjacent to the act
              it describes — both documents are still one click away and still
              open in a new tab, so nothing is hidden, it just costs no click
              to proceed. Deliberately NOT applied to the withdrawal waiver
              above, which the law requires as a separate affirmative act. */}
          <p className="text-[12px] text-[var(--color-text-secondary)] text-center">
            {t.tosInlinePrefix} <Link href="/terms" target="_blank" className="text-[var(--color-buy)] hover:underline">{t.termsLabel}</Link> {t.tosAnd} <Link href="/privacy" target="_blank" className="text-[var(--color-buy)] hover:underline">{t.privacyLabel}</Link>{t.tosSuffix ? ` ${t.tosSuffix}` : ""}
          </p>

          <p className="text-[12px] text-[var(--color-text-secondary)] text-center">
            {t.paidNote}
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
