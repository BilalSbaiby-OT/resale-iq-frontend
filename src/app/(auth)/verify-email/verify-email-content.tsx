"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail, getMe } from "@/lib/api"
import { setToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"
import { copy, type Locale } from "@/lib/i18n"
import { fetchTopBrandRows } from "@/lib/market-snapshot"
import { trackEvent } from "@/lib/analytics"
import { queryCoverageKind } from "@/lib/query-coverage"
import { ActivationSteps } from "@/components/auth/activation-steps"

type State = "checking" | "signed-in" | "already" | "bad"

export function VerifyEmailContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.verifyEmail
  const [state, setState] = useState<State>("checking")
  const [message, setMessage] = useState("")
  const [intentQuery, setIntentQuery] = useState("")
  // C(tony)VerifiedFlash: names the query the confirmed "signed-in" state is
  // about to load, so the checkmark screen isn't a blank generic line before
  // the delayed redirect fires. null on destinations with no named item.
  const [redirectLabel, setRedirectLabel] = useState<string | null>(null)
  // C(tony)FlashDest: distinguishes "verdict" (we're loading your result) from
  // "pricing" (one click to unlock — but the answer isn't loaded yet). Without
  // this the flash says "Loading your Stone Island Hoodie verdict…" on the
  // pricing path, which is a false promise — we route to /pricing, not /verdict.
  // "verdict" → "Loading your [item] verdict…"
  // "pricing" → "Unlocking your [item] verdict — almost there…"
  // null      → "Taking you there…"
  const [redirectDest, setRedirectDest] = useState<"verdict" | "pricing" | null>(null)
  // C177(tony): live top brand for no-intent fallback. Canva rule: never show
  // a blank/generic state — inject the #1 hot item instead of the Nike AF1
  // free sample. Fetched in parallel with the verify call so there's no wait.
  const topBrandRef = useRef<string>("")
  const router = useRouter()

  // C144(tony): read intent query from localStorage so the "checking" state
  // can personalise the anticipation copy. Same key as register-form.tsx and
  // check-email-content.tsx. Do NOT remove it here — verify-email-content is
  // the consumer that removes it after the redirect fires (line ~54).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("riq_intent_query")
      if (saved) setIntentQuery(saved)
    } catch { /* private mode — intentQuery stays empty */ }
  }, [])

  // C177(tony): fetch live top brand in parallel with verify call.
  // The ref holds the result; the verify useEffect reads it when deciding
  // the firstQuery fallback. Race is safe — if verify finishes first, topBrandRef
  // is "" and falls back to Nike Air Force 1 (free sample, verified WATCH+buy_below).
  useEffect(() => {
    fetchTopBrandRows(1, []).then(rows => {
      if (rows[0]) {
        topBrandRef.current = `${rows[0].brand} ${rows[0].category}`
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      setState("bad")
      setMessage(t.missingToken)
      return
    }
    // POST on load (not GET) so mail scanners that prefetch do not burn the token.
    verifyEmail(token)
      .then(async res => {
        if (res.access_token) {
          setToken(res.access_token)
          try {
            const user = await getMe(res.access_token)
            useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
          } catch {
            useAuthStore.setState({ isAuthenticated: true, isLoading: false })
          }
          setState("signed-in")
          // C(tony): track email verification as a funnel event — previously
          // unmeasured black hole between signup_completed and first_analysis.
          // Without this we cannot see how many users drop at the verify step.
          try { trackEvent("email_verified") } catch { /* never block redirect */ }
          // C(tony)VerifiedFlash: setState + router.replace() below used to fire in
          // the SAME synchronous tick — React never got a paint between them, so the
          // "signed-in" JSX branch (line ~204) was dead code: real users went straight
          // from "Confirming your email…" to a hard navigation with zero confirmation
          // that anything succeeded. Linear/Superhuman never blind-redirect off a
          // confirmed action without a visible acknowledgment first. The redirect
          // below is now deliberately delayed one frame so the confirmed checkmark
          // + named destination actually renders before the jump. Not a countdown
          // UI (that's VerifyProgress's ActivationSteps, already shipped) — this is
          // fixing a state that never painted.
          // why: landing on a cold /verdict with an empty input is the
          // single measured reason 14/14 verified users never ran a check
          // (verdict_date=null all). The ?q= triggers the existing useEffect
          // in VerdictInner that auto-runs the query — Nike Air Force 1 is in
          // _PUBLIC_SAMPLE_QUERIES so it 200s even for unpaid users, giving
          // a real result before they hit the paywall on their own search.
          // C140: if the user captured intent at /register, use that query
          // instead of the generic sample — personalising the first Aha moment.
          // C(tony)AF1Demo: AF1 is the no-intent fallback — WATCH+buy_below=€31.16 measured live.
          // Stone Island Hoodies is paywalled. topBrand fetch still personalises when available.
          let firstQuery = encodeURIComponent(topBrandRef.current || "Nike Air Force 1")
          // C182(tony): track whether the user explicitly captured an intent at
          // /register so the two free-routing paths below can diverge.
          let hadIntent = false
          try {
            const saved = localStorage.getItem("riq_intent_query")
            if (saved) {
              firstQuery = encodeURIComponent(saved)
              hadIntent = true
              localStorage.removeItem("riq_intent_query")
            }
          } catch { /* private mode — fall back to sample */ }
          // C160(tony): Canva rule — never show the locked door, show the
          // unlock path. Most verifying users have plan=free (they abandoned
          // the Stripe checkout that fires right after register). Sending
          // them to a paywalled /verdict is the conversion dead-end we've
          // measured: they see the buy-below locked, have no path back to
          // checkout, and close the tab.
          // C182(tony): Plausible/Fathom/Beehiiv pattern — product-first sell.
          //   paid    → /verdict?q=<firstQuery> (immediate first answer, same as before)
          //   free + intent → /pricing?ref=verify&q=<firstQuery> (C174 message-match eyebrow;
          //                   peak intent, they typed an item, sell at that moment)
          //   free + no intent → /verdict?q=Nike+Air+Force+1 (full free demo, Aha moment
          //                   BEFORE asking for money; from /verdict they search their own
          //                   item → paywall fires at "this works" moment; 11/25 accounts
          //                   ran 0 verdicts — they signed up then saw a cold /pricing ask
          //                   and left without ever seeing the product)
          // res.plan is available from the verify-email API response.
          // Falls back to /verdict if plan is absent (safe, pre-C160 behaviour).
          const isPaid = res.plan && res.plan !== "free"
          const go = (href: string) => setTimeout(() => router.replace(href), 700)
          if (isPaid) {
            // C(tony)PaidCoverageGate: mirror the free+intent coverage check.
            // Without this, a paid user who typed "Gucci Handbag" at /register
            // routes to /verdict?q=Gucci+Handbag and immediately sees
            // INSUFFICIENT_DATA — the worst possible first impression after
            // completing a payment. The same queryCoverageKind guard used on
            // the free+intent path applies here: if the intent is untracked,
            // route to the AF1 demo (WATCH+buy_below confirmed live) so the
            // product feels working before the user searches their own item.
            // No-intent and tracked-intent paths are unchanged.
            if (hadIntent) {
              const intentDecoded = decodeURIComponent(firstQuery)
              const paidIsCoverable = queryCoverageKind(intentDecoded) !== "untracked"
              if (paidIsCoverable) {
                // Tracked item: route straight to their verdict. Flash accurate.
                setRedirectLabel(intentDecoded)
                setRedirectDest("verdict")
                go(`/verdict?q=${firstQuery}`)
              } else {
                // Untracked item: show a working AF1 verdict first so the product
                // makes sense before they search their own item via the input.
                setRedirectLabel("Nike Air Force 1")
                setRedirectDest("verdict")
                go(`/verdict?q=Nike+Air+Force+1`)
              }
            } else {
              // No intent captured: topBrand or AF1 fallback as before.
              setRedirectLabel(decodeURIComponent(firstQuery))
              setRedirectDest("verdict")
              go(`/verdict?q=${firstQuery}`)
            }
          } else if (hadIntent) {
            // Free + intent: pricing with message-match eyebrow (peak intent, C174 ready).
            // C(tony)CoverageGate: only route to /pricing if the intent is a tracked
            // brand or free sample — queryCoverageKind check here. An untracked item
            // (e.g. "Gucci Bag") cannot produce a verdict after payment, so routing to
            // /pricing with "your Gucci Bag verdict is ready" is a false promise.
            // Untracked intent → fall through to the free NB530 Aha-moment demo so the
            // user sees the product working before we ask for money. Peak-intent is only
            // peak-intent if we can actually deliver.
            const savedForCoverage = decodeURIComponent(firstQuery)
            const isCoverable = queryCoverageKind(savedForCoverage) !== "untracked"
            if (isCoverable) {
              // C(tony)FlashDest fix: routes to /pricing, not /verdict. The old flash
              // said "Loading your Stone Island Hoodie verdict…" — a false promise,
              // because the verdict is behind a paywall the user hasn't passed yet.
              // "Unlocking" is honest: we're opening the door, not handing them the answer.
              setRedirectLabel(decodeURIComponent(firstQuery))
              setRedirectDest("pricing")
              go(`/pricing?ref=verify&q=${firstQuery}`)
            } else {
              // C(tony)AF1Demo: Aha-moment first — AF1 returns WATCH+buy_below=€31.16
              // (measured 2026-09-29). NB530 returns SKIP+null — a red verdict as first
              // impression. Show them what the product actually does, THEN search their item.
              setRedirectLabel("Nike Air Force 1")
              setRedirectDest("verdict")
              go(`/verdict?q=Nike+Air+Force+1`)
            }
          } else {
            // C218(tony): checkout-abandoned path — if riq_register_plan was
            // written < 5min ago (email+password flow, same as C172 for Google),
            // the user abandoned Stripe and then clicked the verify link. Send
            // them back to pricing with ?ref=verify-abandoned so they can retry
            // checkout — not the Nike AF1 free demo which implies the product is free.
            let checkoutAbandoned = false
            try {
              const raw = localStorage.getItem("riq_register_plan")
              localStorage.removeItem("riq_register_plan")
              const parsed = raw ? (JSON.parse(raw) as { plan: string; ts: number }) : null
              checkoutAbandoned = parsed ? Date.now() - parsed.ts < 30 * 60 * 1000 : false
            } catch { /* private mode */ }
            if (checkoutAbandoned) {
              setRedirectLabel(null)
              setRedirectDest(null)
              go(`/pricing?ref=verify-abandoned`)
            } else {
              // C(tony)FlashDest fix: no-intent path. topBrandRef may hold a paywalled
              // brand (e.g. "Stone Island Hoodies") from C177 — using it as redirectLabel
              // here would show "Loading your Stone Island Hoodies verdict…" while actually
              // routing to Nike Air Force 1. Route and label are now consistent.
              setRedirectLabel("Nike Air Force 1")
              setRedirectDest("verdict")
              go(`/verdict?q=Nike+Air+Force+1`)
            }
          }
          return
        }
        // Backend-owned string stays in whatever language the API sent it —
        // same rule as elsewhere in this file's siblings. Only the local
        // fallback is translated.
        setState("already")
        setMessage(res.message || t.alreadyConfirmedFallback)
      })
      .catch(err => {
        setState("bad")
        setMessage(err instanceof Error ? err.message : t.invalidOrExpired)
      })
  }, [router, t])

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-end mb-3">
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-8 text-center">
        {/* C(tony)ActivationSteps on verify-email: steps 1+2 done, step 3 active.
            When the user clicks the email link they land on a nearly-done state —
            showing them ✓ ✓ → "Get your verdict" makes the redirect feel like a
            reward, not an admin hop. Superhuman/Notion/Canva pattern: visualise
            progress at every transition so users know they're close, not lost.
            intentQuery from localStorage personalises the third step label. */}
        <ActivationSteps step={3} intentQuery={intentQuery} />
        {state === "checking" && (
          // C144(tony): personalised anticipation state — shows the user's
          // intent query so the 1-3s verify call feels like progress, not
          // waiting. Highest-excitement moment in the entire funnel: the user
          // just clicked the email link and expects to land on their answer.
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <TrendingUp size={30} className="text-[var(--color-buy)] animate-pulse" />
            </div>
            <p className="text-[var(--color-text-primary)] text-[15px] font-semibold mb-2">
              {intentQuery
                ? `Unlocking your ${intentQuery} verdict…`
                : "Confirming your email…"}
            </p>
            <p className="text-[var(--color-text-muted)] text-[12px]">
              {intentQuery
                ? "Almost there — this takes a moment."
                : "One moment."}
            </p>
          </div>
        )}

        {state === "signed-in" && (
          // C(tony)VerifiedFlash: this branch was previously dead code — setState
          // and router.replace() fired in the same tick so it never painted (see
          // the C(tony)VerifiedFlash comment above where isPaid is set). Now the
          // redirect is delayed 700ms so the user sees this confirmed checkmark
          // and named destination instead of a jarring instant navigation.
          <div className="py-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={30} className="text-[var(--color-buy)]" />
            </div>
            <p className="text-[var(--color-text-primary)] text-[15px] font-semibold mb-2">
              {t.signedIn}
            </p>
            <p className="text-[var(--color-text-muted)] text-[12px]">
              {redirectDest === "verdict" && redirectLabel
                ? `Loading your ${redirectLabel} verdict…`
                : redirectDest === "pricing" && redirectLabel
                  ? `Unlocking your ${redirectLabel} verdict — almost there…`
                  : "Taking you there…"}
            </p>
          </div>
        )}

        {state === "already" && (
          <>
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-[var(--color-buy)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.confirmedHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-6">{message}</p>
            {/* C165(tony): already-confirmed state had only 'Sign in →' — users never saw /pricing.
                Canva rule: never show a dead end. Primary CTA = pricing (revenue path); secondary = sign in. */}
            <Link href="/pricing?ref=verify-already" className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity mb-3">
              {t.pricingCta}
            </Link>
            <Link href="/login" className="inline-block w-full border border-[var(--color-border-ui)] text-[var(--color-text-secondary)] font-semibold text-[13px] py-2.5 rounded-lg hover:bg-[var(--color-surface-raised)] transition-colors">
              {t.signIn}
            </Link>
          </>
        )}

        {state === "bad" && (
          <>
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-[var(--color-watch)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.badHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-2">{message}</p>
            {/* C145(tony): badBody explains WHY and names the recovery path.
                Links expire → sign in → login-form detects unverified → /check-email → resend.
                The old "Sign in →" pointed somewhere helpful but said nothing — users who got
                a bad link had no idea signing in would get them unstuck. */}
            <p className="text-[var(--color-text-muted)] text-[12px] mb-6">{t.badBody}</p>
            <Link href="/login" className="inline-block w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] py-3 rounded-lg hover:opacity-90 transition-opacity">
              {t.signInToResend}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
