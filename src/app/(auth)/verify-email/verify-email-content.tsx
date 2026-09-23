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

type State = "checking" | "signed-in" | "already" | "bad"

export function VerifyEmailContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.verifyEmail
  const [state, setState] = useState<State>("checking")
  const [message, setMessage] = useState("")
  const [intentQuery, setIntentQuery] = useState("")
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
  // is "" and falls back to Stone Island Hoodie hardcoded (still better than AF1).
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
          // why: landing on a cold /verdict with an empty input is the
          // single measured reason 14/14 verified users never ran a check
          // (verdict_date=null all). The ?q= triggers the existing useEffect
          // in VerdictInner that auto-runs the query — Nike Air Force 1 is in
          // _PUBLIC_SAMPLE_QUERIES so it 200s even for unpaid users, giving
          // a real result before they hit the paywall on their own search.
          // C140: if the user captured intent at /register, use that query
          // instead of the generic sample — personalising the first Aha moment.
          // C177(tony): Canva rule — no-intent users get the live #1 hot item
          // instead of Nike AF1 free sample. Personalised first-answer path even
          // without an explicit intent query. topBrandRef is fetched in parallel;
          // if the race means it's still empty, fall back to Stone Island Hoodies.
          let firstQuery = encodeURIComponent(topBrandRef.current || "Stone Island Hoodies")
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
          if (isPaid) {
            router.replace(`/verdict?q=${firstQuery}`)
          } else if (hadIntent) {
            // Free + intent: pricing with message-match eyebrow (peak intent, C174 ready)
            router.replace(`/pricing?ref=verify&q=${firstQuery}`)
          } else {
            // Free + no intent: Aha moment first — show a free sample verdict so
            // they understand the product BEFORE we ask for money. Nike AF1 is in
            // _PUBLIC_SAMPLE_QUERIES so it returns full data with no subscription.
            // From /verdict they naturally search their own item → paywall fires.
            router.replace(`/verdict?q=Nike+Air+Force+1`)
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
          <p className="text-[var(--color-text-secondary)] text-[13px] py-6">{t.signedIn}</p>
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
