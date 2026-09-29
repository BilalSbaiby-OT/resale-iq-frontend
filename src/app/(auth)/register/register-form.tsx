"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { queryCoverageKind } from "@/lib/query-coverage"
import { useAuthStore } from "@/lib/auth-store"
import { getPlans, isConflict, createCheckout } from "@/lib/api"
import { trackEvent, type FunnelEvent, type RegisterFailReason } from "@/lib/analytics"
import { resolvePriceId } from "@/lib/pricing"
import { copy, WITHDRAWAL_WAIVER_TEXT, type Locale } from "@/lib/i18n"
import { GoogleSignInButton, AuthDivider } from "@/components/auth/google-sign-in-button"
import { ActivationSteps } from "@/components/auth/activation-steps"
import { IntentTypeahead, findDemandMatch } from "@/components/auth/intent-typeahead"

// Free + paid. Paid prices load LIVE from Stripe so the shown amount always
// matches what's charged (no €49-shown / €79-charged surprises).
//
// The free option is NOT cosmetic — this page was paid-only, so every "Create a
// free account" CTA on the site (pricing section, unlock panel, llms.txt, the
// Offer schema) landed people on a forced Stripe checkout. The free tier was
// advertised everywhere and reachable nowhere.
const PLAN_IDS = ["power", "operator"] as const
type PlanId = (typeof PLAN_IDS)[number]

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
  // C158(tony): seed intentQuery from ?q= URL param — when GuestCheckoutButton
  // falls back to /register?plan=operator&q=Stone+Island+Hoodie (because
  // Stripe guest checkout failed), the intent field pre-fills from the URL so
  // the visitor doesn't have to retype what they were checking.
  // Derived once from searchParams (same pattern as `plan` above — derived,
  // not state-driven, because the URL doesn't change after mount).
  const queryFromUrl = searchParams.get("q") ?? ""
  const [intentQuery, setIntentQuery] = useState(queryFromUrl)

  // C(tony)RegisterIntentRecall: when the user typed their item during a
  // previous /register visit (or on /login), navigated away (back button,
  // pricing link, Google OAuth redirect), and returned to /register with no
  // ?q= in the URL, the demand-preview card and goal-framing step-1 label
  // were blank. Without the card they lost the pre-submit reassurance they
  // already saw. Pattern: Superhuman/Canva never blank a field the user
  // already filled — they restore it from the last session.
  // Only reads on mount; only runs when URL provided no ?q= seed (queryFromUrl
  // is empty) — avoids clobbering an explicit ?q= deep-link.
  useEffect(() => {
    if (queryFromUrl) return // URL wins — nothing to restore
    try {
      const saved = localStorage.getItem("riq_intent_query")
      if (saved && saved.trim()) setIntentQuery(saved.trim())
    } catch { /* private mode — intentQuery stays empty */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  // C(tony)CheckoutInterstitial: instead of immediately navigating to Stripe,
  // show a 1-screen "You're about to unlock X" panel with the demand numbers
  // the user already saw. Bridges the account-creation → payment context gap
  // that drives 95%+ checkout abandonment. Stripe/Linear pattern: confirm the
  // action before the hard navigation. Stored URL fires on CTA click.
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | null>(null)
  // Real prices from Stripe, keyed by plan id. Falls back to null → "…" until loaded.
  const [prices, setPrices] = useState<Record<string, number>>({})
  const stripePlans = useRef<{ id: string; price_id?: string }[]>([])
  const registeredRef = useRef(false)
  const { register, login } = useAuthStore()
  const router = useRouter()

  // C(tony)RegisterDemandPreview: once the user has typed ≥3 chars and it
  // matches a brand we track, show live weekly demand right under the
  // field — pre-submit reassurance that "yes, this is a real, watched
  // market" before they hand over card details. Recomputed on every
  // keystroke (cheap in-memory lookup, no network call — findDemandMatch
  // reads the same suggestions array the typeahead dropdown already
  // fetched from market-snapshot).
  const demandMatch = intentQuery.trim().length >= 3 ? findDemandMatch(intentQuery) : null

  // C152(tony): conflict login path — "welcome back" inline form.
  // When 409 fires, instead of a dead-end "Sign in →" link that loses
  // the plan context, transform the form: user enters their password here
  // and we login() + startPaidCheckout() in one shot.
  // Linear/Notion/Canva pattern: merge signup+login, no redirect needed.
  const [conflictPassword, setConflictPassword] = useState("")
  const [conflictLoading, setConflictLoading] = useState(false)

  const handleConflictLogin = async () => {
    if (!conflictPassword || !conflictEmail) return
    setError("")
    setConflictLoading(true)
    try {
      await login(conflictEmail, conflictPassword)
      // Carry the intent query forward (may have been typed before the conflict)
      if (intentQuery.trim()) {
        try { localStorage.setItem("riq_intent_query", intentQuery.trim()) } catch { /* private mode */ }
      }
      await startPaidCheckout(plan)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed — check your password and try again.")
      setConflictLoading(false)
    }
  }

  useEffect(() => {
    getPlans().then(d => {
      stripePlans.current = d.plans
      const m: Record<string, number> = {}
      d.plans.forEach(p => { m[p.id] = p.price_eur })
      setPrices(m)
    }).catch(() => {})
  }, [])

  const formFocused = useRef(false)
  // C(tony)WaiverPulse: ref + highlight state so the checkbox scrolls into
  // view and pulses red when a user submits without ticking it. Without this,
  // 100% of register_submit_failed are reason=waiver — users error and can't
  // see what they missed because the checkbox is below the fold on mobile.
  const waiverRef = useRef<HTMLLabelElement>(null)
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
    // C(tony)CheckoutInterstitial: pause before the hard navigation — show the
    // demand preview and plan summary so the payment context is crystal clear.
    // window.location.assign fires only when user clicks "Continue to payment →".
    setPendingCheckoutUrl(checkout_url)
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
      setError(t.errorAcceptWaiver)
      // Scroll the checkbox into view and pulse it red so the user can see
      // what they need to tick — 100% of failures are this reason.
      setWaiverHighlight(true)
      waiverRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      setTimeout(() => setWaiverHighlight(false), 2000)
      return
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
        // C218(tony): mirror C172 for email+password signups — save the plan
        // so verify-email-content can detect checkout abandonment.
        // Flow: register → startPaidCheckout → user abandons Stripe → clicks
        // verify link → arrives as plan=free. Without this, verify-email can't
        // distinguish "always free" from "abandoned checkout" and sends both to
        // the Nike AF1 free demo. With this, abandoned users go back to pricing
        // instead of a demo that implies the product is free.
        // Same 5-min TTL as C172 (riq_register_plan in Google flow).
        try { localStorage.setItem("riq_register_plan", JSON.stringify({ plan, ts: Date.now() })) } catch { /* private mode */ }
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
        {/* C(tony)ActivationSteps: step 1 of 3 progress bar — Fathom/Linear pattern.
            Users who see they're at step 1 of 3 are less likely to drop off than users
            who see an opaque "Create account" form with no sense of where they are.
            Third step label personalises to their typed intent query. */}
        <ActivationSteps step={1} intentQuery={intentQuery} />

        {/* C(tony)CheckoutInterstitial: full-screen summary before Stripe navigation.
            Fires once account is created + checkout_url is ready. User sees their
            item, the demand numbers, the plan price, and a clear "Continue to payment"
            CTA. This is NOT a delay — it replaces the cold, context-free Stripe jump
            that caused 95%+ checkout abandonment. Pattern: Stripe own checkout shows
            "You're buying X" before card entry; Linear shows plan + features before
            redirect. The account already exists at this point; back-nav here is safe
            (they can return to pricing and retry checkout via /pricing?ref=verify-abandoned). */}
        {pendingCheckoutUrl ? (
          <div className="py-2">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-buy)]/15 flex items-center justify-center">
                <Check size={20} className="text-[var(--color-buy)]" />
              </div>
            </div>
            <h2 className="text-[18px] font-bold text-center mb-1">Account created ✓</h2>
            <p className="text-[13px] text-[var(--color-text-secondary)] text-center mb-5">
              One step away from your first verdict.
            </p>

            {/* What they're about to unlock */}
            <div className="rounded-xl border border-[var(--color-buy)]/30 bg-[var(--color-buy)]/5 px-4 py-3 mb-4">
              <p className="text-[12px] text-[var(--color-text-muted)] mb-1 uppercase tracking-wide font-semibold">You&apos;re unlocking</p>
              {intentQuery.trim() && (findDemandMatch(intentQuery) || queryCoverageKind(intentQuery) !== "untracked") ? (
                <>
                  <p className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">
                    {intentQuery.trim()} verdict
                  </p>
                  {findDemandMatch(intentQuery) && (
                    <p className="text-[12px] text-[var(--color-text-secondary)]">
                      {findDemandMatch(intentQuery)!.sold_7d} watched departures this week
                      {findDemandMatch(intentQuery)!.avg_price_eur ? ` · avg €${findDemandMatch(intentQuery)!.avg_price_eur}` : ""}
                      {" — "}<span className="font-semibold text-[var(--color-buy)]">buy-below price unlocking now</span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
                  Full demand intelligence — check any brand
                </p>
              )}
            </div>

            {/* Plan summary */}
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-4)] px-3 py-2.5 mb-5">
              <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{t.planNames[plan]}</span>
              <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
                {prices[plan] != null ? `€${prices[plan]}/mo` : "…"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => { window.location.assign(pendingCheckoutUrl) }}
              className="w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[14px] py-3.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Continue to payment →
            </button>
            <p className="text-[11.5px] text-[var(--color-text-muted)] text-center mt-3">
              🔒 Secure checkout via Stripe
            </p>
          </div>
        ) : (
        <>
        {/* C168(tony): Canva/Duolingo/Notion pattern — goal-first framing.
            Research: Canva asks "What will you design?" before account creation.
            Duolingo makes you start a lesson before signing up. Notion shows you
            a template FIRST. All three lead with the user's goal, not the admin task.
            Old heading "Activate your Starter access" is admin framing that creates
            resistance. New: user commits to a specific goal → sees confirmation of
            product value → THEN credentials. Intent drives completion.
            The submit button dynamically reflects the query so clicking feels
            purposeful ("Check Stone Island Hoodie →") not generic ("Create account"). */}
        <h1 className="text-[21px] font-bold mb-1">Create account</h1>
        <p className="text-[var(--color-text-secondary)] text-[13px] mb-4">
          Email continues to payment. Google goes straight to your first check.
        </p>

        <form onSubmit={handleSubmit} onFocus={onFormFocus} className="flex flex-col gap-4">
          {/* Google Sign-In — hidden until backend confirms credentials exist.
              C151(tony): onBeforeNavigate carries the intent query typed before
              the Google redirect, matching the login-form pattern (C141). Without
              this, a user who typed "Stone Island Hoodie" and clicked Google
              lost their query — the redirect blanks localStorage's pending write. */}
          <GoogleSignInButton
            label="Continue with Google"
            onBeforeNavigate={() => {
              if (intentQuery.trim()) {
                try { localStorage.setItem("riq_intent_query", intentQuery.trim()) } catch { /* private mode */ }
              }
              // C172(tony): save the intended plan so the Google OAuth callback
              // can route to checkout instead of the free demo. Google register
              // bypasses Stripe entirely — without this the user arrives as
              // plan=free with no path to payment. Timestamped: entries older
              // than 5 minutes are treated as stale (returning users, not
              // fresh signups) and ignored on the callback side.
              try { localStorage.setItem("riq_register_plan", JSON.stringify({ plan, ts: Date.now() })) } catch { /* private mode */ }
            }}
          />
          <AuthDivider text="or" />
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
            {/* Plan toggle: let visitors switch between Starter and Pro without
                leaving the page. Uses URL ?plan= param so the page title,
                heading and price all update reactively. The link updates the
                same URL the existing planFromQuery() already reads. */}
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
            {/* H10: trust note beside price row — resolves the "will I be charged now?" objection
                at exactly the moment it forms (Principle #4/#7). Moved UP from below-button. */}
            {t.paidTrustNote && (
              <p className="text-[12px] text-[var(--color-text-secondary)] text-center mt-1.5">
                🔒 {t.paidTrustNote}
              </p>
            )}
          </div>

          {/* C(tony)RegisterDemandPreview: intent field + inline demand card.
              Different from the price/waiver blocks above (those are about the
              transaction) — this is about the market itself: proof the brand
              the user is about to track has real, observed weekly turnover,
              shown BEFORE they commit card details. */}
          <div>
            <label className="text-[12px] text-[var(--color-text-secondary)] block mb-1.5">
              What do you want to check first?
            </label>
            <IntentTypeahead
              value={intentQuery}
              onChange={setIntentQuery}
              placeholder="e.g. Stone Island Hoodie, Fred Perry Polo…"
              aria-label="What do you want to check first?"
            />
            {demandMatch && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-4)] px-3 py-2">
                <Check size={13} className="text-[var(--color-buy)] shrink-0" />
                <p className="text-[12px] text-[var(--color-text-secondary)] leading-snug">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {demandMatch.sold_7d} watched departures this week
                  </span>
                  {demandMatch.avg_price_eur ? (
                    <> · avg €{demandMatch.avg_price_eur}</>
                  ) : null}
                  {" — "}real demand, not a guess.
                </p>
              </div>
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
          {/* C(tony)WaiverProactive: proactive affordance before submit attempt */}
          {!waiver && (
            <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mb-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-skip)] shrink-0" />
              Tick the box below to activate your account
            </p>
          )}
          <label ref={waiverRef} className={`flex items-start gap-2.5 text-[12px] text-[var(--color-text-secondary)] rounded-lg transition-colors duration-300 ${waiverHighlight ? "bg-red-500/10 ring-1 ring-red-500/50 px-2 py-1" : ""}`} data-i18n-pending="waiver-legal-review">
            <input type="checkbox" checked={waiver} onChange={e => setWaiver(e.target.checked)} className="mt-0.5 w-[20px] h-[20px] shrink-0 accent-[var(--color-buy)]" />
            <span>{WITHDRAWAL_WAIVER_TEXT}</span>
          </label>
          {/* C152(tony): 409 conflict → inline "welcome back" login.
              Linear/Notion/Canva pattern: merge signup+login in one form,
              no redirect, plan context preserved throughout.
              C148 was: dead link to /login?email=… (lost the plan selection). */}
          {conflictEmail && (
            <div className="rounded-xl border border-[var(--color-border-2)] p-4 bg-[var(--color-bg-4)]">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-0.5">
                Welcome back — you already have an account.
              </p>
              <p className="text-[12px] text-[var(--color-text-secondary)] mb-3">
                Enter your password to continue to checkout.
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
                {conflictLoading ? "Signing in…" : `Continue to ${plan === "power" ? "Pro" : "Starter"} checkout →`}
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
          {/* C168(tony): dynamic submit label — when the user has typed a tracked
              query, the button says "Check Stone Island Hoodie →" so clicking
              feels purposeful (completing their stated goal) not administrative.
              Duolingo/Canva pattern: every action names the user's specific intent.
              C217(tony): untracked query — do NOT name the item in the button.
              Canva never shows a template path for a design they can't deliver.
              "Check Gucci Handbag →" + Stripe checkout + INSUFFICIENT_DATA is the
              worst possible first impression. Untracked intent → generic copy so
              we don't promise a verdict we can't fulfil. The amber coverage badge
              already tells them the item isn't tracked; the CTA should match. */}
          <button type="submit" disabled={loading}
            className="w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? t.submitting : (
              <>
                {(() => {
                  const q = intentQuery.trim()
                  if (!q) return <>{t.paidSubmit.replace("{plan}", t.planNames[plan])}<Check size={15} /></>
                  const kind = queryCoverageKind(q)
                  if (kind === "catalog" || kind === "free_sample") return <>{`Check ${q} →`}</>
                  // Untracked: don't promise we have it — use generic submit
                  return <>{t.paidSubmit.replace("{plan}", t.planNames[plan])}<Check size={15} /></>
                })()}
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
        </>
        )}
      </div>
    </div>
  )
}

export function RegisterForm({ locale }: { locale: Locale }) {
  return <Suspense><RegisterContent locale={locale} /></Suspense>
}
