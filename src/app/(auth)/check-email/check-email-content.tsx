"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, AlertCircle, Sparkles } from "lucide-react"
import { resendVerification } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { copy, type Locale } from "@/lib/i18n"
import {
  AuthCard, AUTH_ACCENT, AUTH_ACCENT_BUTTON,
  AUTH_TEXT, AUTH_TEXT_SECONDARY, AUTH_TEXT_MUTED,
} from "@/components/auth/auth-form-parts"
import { fetchTopBrandRows, fetchBrandRowForQuery, type SnapshotBrandRow } from "@/lib/market-snapshot"
import { queryCoverageKind } from "@/lib/query-coverage"
import { FIRST_CHECK_HREF } from "@/lib/checkout"
import { ActivationSteps } from "@/components/auth/activation-steps"

// The three brands most likely to resonate with a new reseller — confirmed
// moving at volume in the public market-snapshot. Shown while the user waits
// for their verification email: the goal is to make them WANT to click the link.
const FALLBACK_BRANDS: SnapshotBrandRow[] = [
  { brand: "New Balance", category: "Sneakers", sold_7d: 383, avg_price_eur: 43 },
  { brand: "Nike",        category: "Sneakers", sold_7d: 129, avg_price_eur: 48 },
  { brand: "Adidas",      category: "Sneakers", sold_7d: 126, avg_price_eur: 57 },
]

type BrandRow = SnapshotBrandRow

// C163(tony): email-app shortcuts — Superhuman/Notion/Canva pattern.
// Deep-links to the user's inbox so they never have to leave and hunt.
// Gmail search pre-filters for emails from noreply@resaleiq.dev in the last day.
function EmailClientButton({ email }: { email: string }) {
  const domain = email.split("@")[1]?.toLowerCase() ?? ""
  type Client = { label: string; href: string }
  let client: Client | null = null

  if (domain === "gmail.com" || domain === "googlemail.com") {
    client = {
      label: "Open Gmail",
      href: "https://mail.google.com/mail/u/0/#search/from%3Anoreply%40resaleiq.dev+newer_than%3A1d",
    }
  } else if (
    domain === "outlook.com" || domain === "hotmail.com" ||
    domain === "live.com" || domain === "msn.com"
  ) {
    client = {
      label: "Open Outlook",
      href: "https://outlook.live.com/mail/0/",
    }
  } else if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
    client = {
      label: "Open iCloud Mail",
      href: "https://www.icloud.com/mail",
    }
  } else if (domain === "yahoo.com" || domain === "yahoo.co.uk") {
    client = {
      label: "Open Yahoo Mail",
      href: "https://mail.yahoo.com/",
    }
  }

  // C(tony)EmailFallback: unknown provider → mailto: fallback.
  // Opens the OS-default mail app on desktop (Mail.app, Outlook, Thunderbird)
  // and the native app on mobile (iOS Mail, Android Gmail). Better than nothing
  // for Proton, Hey, Fastmail, company domains — the exact providers where
  // the user is LEAST likely to have webmail in a browser tab already open.
  if (!client) {
    return (
      <a
        href="mailto:"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-[var(--color-border-ui)] text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-buy)] hover:text-[var(--color-buy)] transition-colors mb-4"
      >
        Open email app →
      </a>
    )
  }

  return (
    <a
      href={client.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-[var(--color-border-ui)] text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-buy)] hover:text-[var(--color-buy)] transition-colors mb-4"
    >
      {client.label} →
    </a>
  )
}

// C143(tony): Steps replaced by shared ActivationSteps component (step={2}).
// See src/components/auth/activation-steps.tsx.

export function CheckEmailContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.checkEmail
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [brands, setBrands] = useState<BrandRow[]>(FALLBACK_BRANDS)
  // C143(tony): read intent query from localStorage so the waiting screen can
  // personalise the CTA and progress step. Do NOT delete it here — verify-email
  // needs it to redirect to the right verdict after the click. Only verify-email
  // removes it.
  const [intentQuery, setIntentQuery] = useState("")
  // C175(tony): personalised demand row for the user's specific intent query.
  // Fetched from market-snapshot on mount; null until loaded or on no match.
  const [intentRow, setIntentRow] = useState<SnapshotBrandRow | null>(null)
  const { logout, user, isAuthenticated, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Fetch live numbers from the public snapshot so the preview is always
    // current. Falls back to FALLBACK_BRANDS silently — the user still sees
    // real-looking data while we wait for the network.
    fetchTopBrandRows(3, FALLBACK_BRANDS).then(rows => setBrands(rows)).catch(() => {})
  }, [])

  useEffect(() => {
    // C143(tony): read intent query from localStorage on mount.
    // Pattern: same key as register-form.tsx and verify-email-content.tsx.
    // Read-only here — verify-email-content.tsx is the only consumer that
    // deletes it (after the redirect fires).
    try {
      const saved = localStorage.getItem("riq_intent_query")
      if (saved) {
        setIntentQuery(saved)
        // C175(tony): once we have the intent query, fetch the matching row.
        fetchBrandRowForQuery(saved).then(row => setIntentRow(row)).catch(() => {})
      }
    } catch { /* private mode — intentQuery stays empty, generic copy shows */ }
  }, [])

  // C(tony)AlreadyVerifiedRoute: a user can land on /check-email with an
  // already-verified account (e.g. old session, signed in days later after
  // clicking the link elsewhere). Nothing previously redirected them off this
  // waiting screen — silently route straight to their intent verdict (if
  // tracked) or FIRST_CHECK_HREF instead of leaving them stuck here.
  useEffect(() => {
    if (!user) return
    if (user.email_verified !== true) return
    const q = intentQuery.trim()
    if (q && queryCoverageKind(q) !== "untracked") {
      router.replace(`/verdict?q=${encodeURIComponent(q)}`)
    } else {
      router.replace(FIRST_CHECK_HREF)
    }
  }, [user, intentQuery, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleResend = async () => {
    setError(""); setMsg(""); setLoading(true)
    try {
      const res = await resendVerification()
      if (res.already_verified) {
        setMsg(t.alreadyConfirmed)
      } else {
        // Backend-owned string stays in whatever language the API sent it —
        // same rule as elsewhere in this file's siblings (see i18n.ts header
        // comment). Only the local fallback is translated.
        setMsg(res.message || t.sentFallback)
      }
      setCooldown(60)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.resendError)
    } finally {
      setLoading(false)
    }
  }

  // C149(tony): preview link MUST resolve to a public sample query — Nike AF1,
  // Adidas Samba, or Fred Perry Polo. If intentQuery is e.g. "Stone Island Hoodie"
  // and we link to /verdict?q=Stone+Island+Hoodie the unpaid user lands on the
  // paywall, not a result. The progress step still names their intent (promise kept);
  // the preview proves the product via the free demo. We do NOT use intentQuery
  // as the href here.
  // 2026-09-29: New Balance 530 replaced with Fred Perry Polo — NB530 verdicts
  // SKIP live with buy_below=null. Keep in sync with FREE_MODELS.
  const FREE_SAMPLE_QUERIES = ["Fred Perry Polo", "Adidas Samba", "Nike Air Force 1"]
  const intentIsSample = intentQuery
    ? FREE_SAMPLE_QUERIES.some(s => s.toLowerCase() === intentQuery.trim().toLowerCase())
    : false
  // C(tony)CheckEmailPreviewSrc: add src= tracking so funnel analytics can
  // distinguish preview clicks at /check-email from organic /verdict visits.
  // Previously unmeasured — the CARRIED experiment metric needed this tag.
  const sampleHref = intentIsSample
    ? `/verdict?q=${encodeURIComponent(intentQuery)}&src=check_email_preview`
    : "/verdict?q=Nike+Air+Force+1&src=check_email_preview"

  // C(tony): expectation-setting for untracked intents — the user typed a brand
  // we don't track yet (e.g. "Gucci Bag") but CoverageGate on verify-email will
  // still route them to the NB530 demo. Without this panel they land on NB530
  // with zero context and think something went wrong. Set the expectation here.
  const intentIsUntracked = intentQuery.trim().length >= 3 && queryCoverageKind(intentQuery.trim()) === "untracked"

  // C(tony)VerifyPreviewFallback: register no longer writes riq_intent_query
  // (founder auth rules 2026-09-29) so intentRow is always null for new users.
  // Fall back to brands[0] from the live snapshot so the blurred verdict teaser
  // (loss-aversion pattern) shows for 100% of verifiers, not 0%.
  // Superhuman: "interruptive = impactful; tucked-away = ignored."
  const displayRow = intentRow ?? (brands.length > 0 ? brands[0] : null)
  const displayIsIntent = intentRow !== null

  return (
    <div className="w-full max-w-md flex flex-col gap-5">
      <AuthCard center>
        {/* C143(tony): 3-step progress bar — now shared component, step 2 of 3.
            Linear/Fathom pattern: show users they are 2/3 of the way to their goal
            (the verdict), not stuck in admin. Third step names their specific intent
            query when available. */}
        <ActivationSteps step={2} intentQuery={intentQuery} />

        <div className="flex justify-center mb-4"><Mail size={34} className={AUTH_ACCENT} /></div>
        {/* C(tony): goal-framing heading replaces admin-framing "Check your email".
            Research (yukaichou.com): the Win State at this moment must feel like
            a reward, not homework. "One click to your verdict" names what the user
            gets — not the bureaucratic task of email confirmation.
            Personalised when intentQuery is available (e.g. "Stone Island Hoodie"). */}
        <h1 className="text-[18px] font-bold mb-1">
          {intentQuery
            ? `One click — your ${intentQuery} check is ready`
            : "One click and you're in"}
        </h1>
        <p className={`${AUTH_TEXT_SECONDARY} text-[13px] mb-4 leading-relaxed`}>
          We emailed a verify link to{user?.email ? <> <span className={AUTH_TEXT}>{user.email}</span></> : ` ${t.bodyNoEmail}`}.
          {" "}Click it and your verdict loads immediately. Check{" "}
          <strong className={`${AUTH_TEXT} font-semibold`}>spam / junk</strong> if it isn&apos;t there — sent from <span className={AUTH_TEXT}>noreply@resaleiq.dev</span>.
        </p>
        {/* C163(tony): email-app shortcut buttons — Superhuman/Notion pattern.
            The #1 reason users abandon verification: they leave the tab to find
            the email and never come back. One-tap deep-links to the actual inbox
            remove that roundtrip. Detected from user.email domain; shows "Open
            Gmail" for @gmail, "Open Outlook" for hotmail/outlook/live, "Open
            iCloud Mail" for icloud/me/mac, generic for everything else. */}
        <EmailClientButton email={user?.email ?? ""} />

        {/* C(tony)CheckEmailPreviewCTA: the only path to experiencing the product
            while waiting lived at the bottom of the page (~line 392) where nobody
            scrolls during a 30s email wait. Linear's playbook (candu.ai teardown,
            fetched 2026-09-29): "protect the fastest path to the core action" —
            use every idle moment to get the user doing the real thing, not
            reading about it. Placed directly under the email CTA, the first
            place the eye lands after "Open Gmail", as a quiet secondary link so
            it never competes with the primary action. */}
        <Link
          href={sampleHref}
          className="inline-flex items-center gap-1 text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-buy)] mb-4 transition-colors"
        >
          {intentRow ? "See a live verdict while you wait →" : "Preview the product while you wait →"}
        </Link>

        <p className={`${AUTH_TEXT_MUTED} text-[12px] mb-6`}>
          {t.cantFind} <a href="mailto:support@resaleiq.dev" className={`${AUTH_ACCENT} hover:underline`}>support@resaleiq.dev</a>.
        </p>

        {msg && <div className={`text-[12.5px] ${AUTH_ACCENT} mb-4`}>{msg}</div>}
        {error && <div className="text-[12.5px] text-[var(--color-skip)] mb-4">{error}</div>}

        {isAuthenticated && (
          <button type="button" onClick={handleResend} disabled={loading || cooldown > 0}
            className={`${AUTH_ACCENT_BUTTON} mb-3`}>
            {loading ? t.sending : cooldown > 0 ? `Resend in ${cooldown}s` : t.resend}
          </button>
        )}
        {!isAuthenticated && (
          <Link href="/login" className={`inline-block ${AUTH_ACCENT_BUTTON} mb-3`}>
            {t.signInToResend}
          </Link>
        )}
        <button type="button" onClick={() => logout()}
          className={`text-[12px] ${AUTH_TEXT_MUTED} hover:text-[var(--color-text-primary)]`}>
          {t.signOut}
        </button>

        {/* C(tony)CheckEmailEscape: unverified users who log back in get routed
            here with no way off the page (login-form.tsx redirects
            email_verified===false straight to /check-email). 11/25 accounts ran
            0 verdicts — some signed up, left, came back, and got stuck exactly
            here. Anon.com's 2026 teardown of 20 SaaS signups flags this same
            failure: "Email verification is required before accessing the
            dashboard. A 'skip for now' option ... would help." usertourkit's
            welcome-screen research is blunter: "The fastest way to lose trust
            is trapping someone in a wizard they can't exit." Subdued on purpose
            — this must not compete with the primary verify action above it. */}
        {isAuthenticated && user && user.email_verified !== true && (
          <Link
            href="/dashboard"
            className={`mt-2 text-[11.5px] ${AUTH_TEXT_MUTED} hover:text-[var(--color-text-primary)] transition-colors`}
          >
            Skip for now — continue to dashboard →
          </Link>
        )}
      </AuthCard>

      {/* C(tony)WaitingVerdictPreview: blurred verdict teaser for tracked intent
          queries. Mirrors the real verdict card format (brand, category, demand,
          avg price, buy-below) but locks the buy-below number behind a blur —
          the €value shown is a DISPLAY-ONLY approximation (avg_price * 0.7), not
          the real buy-below formula. Goal: make the shape of the payoff visible
          without giving away the actual number, so verification feels like the
          last step to an already-computed answer. */}
      {!intentIsUntracked && displayRow && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-buy)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className={AUTH_ACCENT} />
            <span className={`text-[11.5px] font-semibold ${AUTH_TEXT_SECONDARY} uppercase tracking-wide`}>
              {displayIsIntent ? `Your ${displayRow!.brand} verdict is ready` : 'A live verdict — yours to unlock'}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className={`text-[15px] font-bold ${AUTH_TEXT}`}>{displayRow!.brand}</div>
              <div className={`text-[12px] ${AUTH_TEXT_MUTED}`}>{displayRow!.category}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center justify-between">
              <span className={`text-[12px] ${AUTH_TEXT_MUTED}`}>Watched departures (7d)</span>
              <span className={`text-[13px] font-semibold ${AUTH_TEXT}`}>{displayRow!.sold_7d.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[12px] ${AUTH_TEXT_MUTED}`}>Avg resale price</span>
              <span className={`text-[13px] font-semibold ${AUTH_TEXT}`}>€{displayRow!.avg_price_eur}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[12px] ${AUTH_TEXT_MUTED}`}>Buy below</span>
              <span className="flex items-center gap-1.5">
                <span className="blur-sm select-none text-[13px] font-semibold" aria-hidden="true">
                  €{Math.round(displayRow!.avg_price_eur * 0.7)}
                </span>
                <Lock size={11} className={AUTH_TEXT_MUTED} />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-2.5">
            <Lock size={12} className={AUTH_TEXT_MUTED} />
            <span className={`text-[12px] ${AUTH_TEXT_MUTED}`}>
              {displayIsIntent
                ? 'Verify email to unlock — one click in your inbox → your buy-below price'
                : 'Verify email to see this check — one click in your inbox'}
            </span>
          </div>
        </div>
      )}

      {/* C(tony): expectation-setting panel for untracked intent queries — see
          comment above intentIsUntracked. Replaces the intentRow panel when the
          user's typed brand isn't in our catalog, so they know a demo (NB530)
          is coming and why, instead of being confused by a mismatched result. */}
      {intentIsUntracked && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-[var(--color-watch)] shrink-0" />
            <span className="text-[11.5px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Not in catalog yet
            </span>
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">
            <strong className="text-[var(--color-text-primary)]">{intentQuery}</strong> isn&apos;t tracked yet — but we&apos;ll show you a live Nike Air Force 1 verdict first so you see exactly how it works.
          </p>
          <div className="text-[12px] text-[var(--color-text-muted)]">
            Then search your own item — we add new brands regularly.
          </div>
        </div>
      )}

    </div>
  )
}
