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
    // No terms gate here any more: pressing this button IS the acceptance, and
    // the sentence saying so sits directly under it. The withdrawal waiver
    // below is a different thing and still gates — see its comment.
    //
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
        <h1 className="text-[21px] font-bold mb-1">
          {/* H8: generic "Create your account" replaced for paid arrivals.
              paidHeading uses {plan} interpolation — component resolves it at render.
              Fallback to heading if paidHeading absent (safe default, shouldn't happen). */}
          {!isFree && t.paidHeading
            ? t.paidHeading.replace("{plan}", t.planNames[plan])
            : t.heading}
        </h1>
        <p className="text-[var(--color-text-secondary)] text-[13px] mb-5">
          {/* H7: paid visitors already decided — mirror their intent, not the product model.
              paidSubheading is set for all 6 locales; fallback to subheading if missing. */}
          {!isFree && t.paidSubheading ? t.paidSubheading : t.subheading}
        </p>
        <form onSubmit={handleSubmit} onFocus={onFormFocus} className="flex flex-col gap-4">
          {/* NOT a control. The three-way plan radio that used to sit here is
              gone; `plan` still comes from ?plan= exactly as before, so every
              paid CTA on the site keeps working and lands in the same Stripe
              checkout. What changed is that choosing is no longer something a
              visitor has to DO before they can type an email.

              Measured, production `pageviews`, non-bot, over the window in
              which register_form_focused has existed (2026-09-05 17:43Z ->
              2026-09-06 01:53Z): 31 people reached /register, 6 focused any
              field. 25 of 31 (81%) left without touching the form. The radio
              was the first thing on it and the only one that made "create an
              account" start with "decide what to pay". Plan choice loses
              nothing by moving after the account exists — /account already
              ships working Upgrade to Starter / Upgrade to Pro buttons through
              the same createCheckout call (see account/page.tsx).

              A paid arrival still has to SEE the price before a submit sends
              them to Stripe, hence this summary. It reads the live Stripe
              amount, same source as before, so "€49 shown / €79 charged"
              stays impossible. */}
          {!isFree && (
            <div>
              <div className="flex items-center justify-between border border-[var(--color-border-2)] rounded-xl p-3.5">
                <span className="font-semibold text-[14px] text-[var(--color-text-primary)]">{t.planNames[plan]}</span>
                <span className="text-right">
                  <span className="font-bold text-[15px] text-[var(--color-text-primary)]">
                    {prices[plan] != null ? `€${prices[plan]}` : "…"}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] ml-1">{t.perMonth}</span>
                </span>
              </div>
              {/* H10: trust note beside price row — resolves the "will I be charged now?" objection
                  at exactly the moment it forms (Principle #4/#7). Moved UP from below-button. */}
              {t.paidTrustNote && (
                <p className="text-[10.5px] text-[var(--color-text-muted)] text-center mt-1.5">
                  🔒 {t.paidTrustNote}
                </p>
              )}
            </div>
          )}

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
            {loading ? t.submitting : (
              <>
                {/* H9: paid arrivals get a commit-confirming label; free keeps "Create account".
                    {plan} resolved here — same pattern as paidHeading. Fallback to t.submit
                    if paidSubmit absent (safe default, shouldn't occur). */}
                {!isFree && t.paidSubmit
                  ? t.paidSubmit.replace("{plan}", t.planNames[plan])
                  : t.submit}
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
          <p className="text-[10.5px] text-[var(--color-text-muted)] text-center">
            {t.tosInlinePrefix} <Link href="/terms" target="_blank" className="text-[var(--color-buy)] hover:underline">{t.termsLabel}</Link> {t.tosAnd} <Link href="/privacy" target="_blank" className="text-[var(--color-buy)] hover:underline">{t.privacyLabel}</Link>{t.tosSuffix ? ` ${t.tosSuffix}` : ""}
          </p>

          <p className="text-[10.5px] text-[var(--color-text-muted)] text-center">
            {isFree ? t.freeNote : t.paidNote}
          </p>

          {/* The only way off the paid path now that the Free radio is gone.
              Keeps the current pathname so /es/register stays Spanish. Worth
              the extra line: 51 of the 52 checkouts this company has ever
              started expired unpaid and it has never had a paying customer, so
              an account we keep is worth more than a paid intent we lose. */}
          {!isFree && (
            <Link href={`${pathname}?plan=free`} className="text-[10.5px] text-[var(--color-buy)] hover:underline text-center">
              {t.switchToFree}
            </Link>
          )}
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
