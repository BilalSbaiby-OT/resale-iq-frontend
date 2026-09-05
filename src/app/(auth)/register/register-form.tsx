"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { getPlans, isConflict, createCheckout } from "@/lib/api"
import { trackEvent, type FunnelEvent, type RegisterFailReason } from "@/lib/analytics"
import { resolvePriceId } from "@/lib/pricing"
import { copy, WITHDRAWAL_WAIVER_TEXT, type Locale } from "@/lib/i18n"

// Free + paid. Paid prices load LIVE from Stripe so the shown amount always
// matches what's charged (no €49-shown / €79-charged surprises).
//
// The free option is NOT cosmetic — this page was paid-only, so every "Create a
// free account" CTA on the site (pricing section, unlock panel, llms.txt, the
// Offer schema) landed people on a forced Stripe checkout. The free tier was
// advertised everywhere and reachable nowhere.
const PLAN_IDS = ["power", "operator", "free"] as const
type PlanId = (typeof PLAN_IDS)[number]

/** ONLY the real plan ids select a plan. Everything else — missing, unknown,
 *  or a display name — resolves to free.
 *
 *  #50 added a display-name alias map (pro -> power, starter -> operator) so a
 *  hand-typed "?plan=pro" would land on the tier a human calls Pro. Removed:
 *  it re-created the incident documented above it. Every CTA in this codebase
 *  emits an id, never a display name — `grep -rn "plan=" src/` returns only
 *  plan=free, plan=operator and plan=power — so the alias resolved no link we
 *  actually ship. What it did resolve was a typed or third-party URL, silently
 *  upgrading it into the EUR 49 tier: exactly the "landed on a EUR 49 form
 *  with Free unselected" path that bounced all three visitors on 2026-09-01.
 *
 *  The rule is one-directional on purpose. Selecting a cheaper plan than asked
 *  costs a visitor one click; selecting a dearer one costs us the visitor. */
function planFromQuery(raw: string | null): PlanId {
  if (!raw) return "free"
  const id = raw.trim().toLowerCase()
  return (PLAN_IDS as readonly string[]).includes(id) ? (id as PlanId) : "free"
}

function RegisterContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.register
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  const requested = searchParams.get("plan")
  const [plan, setPlan] = useState<PlanId>(() => planFromQuery(requested))
  useEffect(() => {
    setPlan(planFromQuery(searchParams.get("plan")))
  }, [searchParams])
  const [tos, setTos] = useState(false)
  // Separate from `tos` on purpose — EU law requires express, standalone consent
  // to waive the 14-day withdrawal right for immediately-delivered digital goods.
  const [waiver, setWaiver] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // After a paid register succeeds but Stripe Checkout does not, stay here with
  // a retry — never dump them on /check-email as the only next step.
  const [checkoutRetry, setCheckoutRetry] = useState(false)
  // Real prices from Stripe, keyed by plan id. Falls back to null → "…" until loaded.
  const [prices, setPrices] = useState<Record<string, number>>({})
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

  // Free first. Measured 2026-09-01: Pro-as-Most-Popular sat above an
  // unselected Free and the three visitors who reached this page bounced.
  // Default plan is already free (see requested/setPlan above); the picker
  // still listed Pro first with the Most Popular tag, so a cold visitor from
  // "Create a free account" saw a paid form. Order now matches the default.
  // Do not preselect paid plans — unspecified stays free.
  //
  // The "Most popular" tag on Pro is gone (same removal as pricing-section.tsx).
  // Not a style call: this company has 0 paying customers and EUR 0.00 MRR, so
  // no tier is the popular one and the badge asserted a fact we do not have.
  // The dictionary keys (auth.register.mostPopular, pricingSection.mostPopular)
  // are left in all six locales for the day the claim is true and measured.
  const PLAN_META: { id: PlanId }[] = [
    { id: "free" },
    { id: "operator" },
    { id: "power" },
  ]
  const PLANS = PLAN_META.map(p => ({
    ...p,
    name: t.planNames[p.id],
    desc: t.planDesc[p.id],
    price: prices[p.id],
  }))

  const isFree = plan === "free"
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
    const { checkout_url } = await createCheckout(priceId)
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
    if (!tos) {
      track("register_submit_failed", { reason: "tos" })
      setError(t.errorAcceptTos); return
    }
    // The withdrawal waiver only applies to a paid subscription. Demanding it
    // for a free signup would be asking someone to waive a right they are not
    // exercising, which is friction with no legal purpose.
    if (!isFree && !waiver) {
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
      }
      if (plan === "operator" || plan === "power") {
        try {
          await startPaidCheckout(plan)
          return
        } catch {
          setCheckoutRetry(true)
          setError(t.errorCheckoutStart)
          return
        }
      }
      router.push("/check-email")
      return
    } catch (err: unknown) {
      if (isConflict(err)) {
        track("register_submit_failed", { reason: "conflict" })
        setError(t.errorAlreadyExists)
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
        <h1 className="text-[21px] font-bold mb-1">{t.heading}</h1>
        <p className="text-[var(--color-text-secondary)] text-[13px] mb-5">{t.subheading}</p>
        <form onSubmit={handleSubmit} onFocus={onFormFocus} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            {PLANS.map(p => (
              <label key={p.id} className={`relative flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-colors ${plan === p.id ? "border-[var(--color-buy)] bg-[var(--color-buy)]/[0.07]" : "border-[var(--color-border-2)] hover:bg-[var(--color-bg-3)]"}`}>
                <input type="radio" name="plan" checked={plan === p.id} onChange={() => setPlan(p.id)} className="accent-[var(--color-buy)]" />
                <div className="flex-1">
                  <span className="font-semibold text-[14px] text-[var(--color-text-primary)]">{p.name}</span>
                  <div className="text-[11.5px] text-[var(--color-text-secondary)] mt-0.5">{p.desc}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[15px] text-[var(--color-text-primary)]">
                    {p.id === "free" ? "€0" : p.price != null ? `€${p.price}` : "…"}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{p.id === "free" ? t.forever : t.perMonth}</div>
                </div>
              </label>
            ))}
          </div>

          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1.5">{t.emailLabel}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-2.5 text-[13.5px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]" />
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1.5">{t.passwordLabel}</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPlaceholder}
              className="w-full bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-2.5 text-[13.5px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]" />
          </div>

          <label className="flex items-start gap-2.5 text-[12px] text-[var(--color-text-secondary)]">
            <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} className="mt-0.5 accent-[var(--color-buy)]" />
            <span>
              {t.tosPrefix} <Link href="/terms" target="_blank" className="text-[var(--color-buy)] hover:underline">{t.termsLabel}</Link> {t.tosAnd} <Link href="/privacy" target="_blank" className="text-[var(--color-buy)] hover:underline">{t.privacyLabel}</Link>{t.tosSuffix ? ` ${t.tosSuffix}` : ""}
            </span>
          </label>

          {/* EU consumer law: for digital content delivered immediately, the
              14-day withdrawal right only ends if the customer gives EXPRESS,
              separately-ticked consent. Bundling it into the Terms checkbox
              does not count — it must be its own affirmative action.

              W19: this text is WITHDRAWAL_WAIVER_TEXT (src/lib/i18n.ts),
              English on every locale until legal-compliance signs off on a
              translated version — see that constant's comment for why. */}
          {!isFree && (
            <label className="flex items-start gap-2.5 text-[12px] text-[var(--color-text-secondary)]" data-i18n-pending="waiver-legal-review">
              <input type="checkbox" checked={waiver} onChange={e => setWaiver(e.target.checked)} className="mt-0.5 accent-[var(--color-buy)]" />
              <span>{WITHDRAWAL_WAIVER_TEXT}</span>
            </label>
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
            {loading ? t.submitting : <>{t.submit} <Check size={15} /></>}
          </button>
          <p className="text-[10.5px] text-[var(--color-text-muted)] text-center">
            {isFree ? t.freeNote : t.paidNote}
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
