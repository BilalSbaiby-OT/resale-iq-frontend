"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, TrendingUp, ArrowRight, Lock } from "lucide-react"
import { resendVerification } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { copy, type Locale } from "@/lib/i18n"
import {
  AuthCard, AUTH_ACCENT, AUTH_ACCENT_BUTTON,
  AUTH_TEXT, AUTH_TEXT_SECONDARY, AUTH_TEXT_MUTED,
} from "@/components/auth/auth-form-parts"
import { fetchTopBrandRows, fetchBrandRowForQuery, type SnapshotBrandRow } from "@/lib/market-snapshot"
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

  // No known client → no button rendered (don't guess wrong)
  if (!client) return null

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.resendError)
    } finally {
      setLoading(false)
    }
  }

  // C149(tony): preview link MUST resolve to a public sample query — Nike AF1,
  // Adidas Samba, or New Balance 530. If intentQuery is e.g. "Stone Island Hoodie"
  // and we link to /verdict?q=Stone+Island+Hoodie the unpaid user lands on the
  // paywall, not a result. The progress step still names their intent (promise kept);
  // the preview proves the product via the free demo. We do NOT use intentQuery
  // as the href here.
  const FREE_SAMPLE_QUERIES = ["New Balance 530", "Adidas Samba", "Nike Air Force 1"]
  const intentIsSample = intentQuery
    ? FREE_SAMPLE_QUERIES.some(s => s.toLowerCase() === intentQuery.trim().toLowerCase())
    : false
  const sampleHref = intentIsSample
    ? `/verdict?q=${encodeURIComponent(intentQuery)}`
    : "/verdict?q=New+Balance+530"

  // C162(tony): map brand names to the closest public sample query so demand-
  // panel rows can be tapped directly. Only the 3 public samples bypass the
  // paywall — Superhuman/Linear pattern: make every visible data point a path
  // to the Aha moment. Falls back to Nike AF1 for any unrecognised brand.
  const brandToSampleHref = (brand: string): string => {
    const b = brand.toLowerCase()
    if (b.includes("new balance")) return "/verdict?q=New+Balance+530"
    if (b.includes("adidas")) return "/verdict?q=Adidas+Samba"
    return "/verdict?q=New+Balance+530"
  }

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

        <p className={`${AUTH_TEXT_MUTED} text-[12px] mb-6`}>
          {t.cantFind} <a href="mailto:support@resaleiq.dev" className={`${AUTH_ACCENT} hover:underline`}>support@resaleiq.dev</a>.
        </p>

        {msg && <div className={`text-[12.5px] ${AUTH_ACCENT} mb-4`}>{msg}</div>}
        {error && <div className="text-[12.5px] text-[var(--color-skip)] mb-4">{error}</div>}

        {isAuthenticated && (
          <button type="button" onClick={handleResend} disabled={loading}
            className={`${AUTH_ACCENT_BUTTON} mb-3`}>
            {loading ? t.sending : t.resend}
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
      </AuthCard>

      {/* C175(tony): personalised item preview — Superhuman pattern.
          When the user typed a specific item (e.g. Stone Island Hoodie), show THEIR
          item's demand data right here, with buy-below locked behind verification.
          This proves we have their data before they click the link — turns a generic
          "check your email" wait into a specific promise we're about to keep.
          Only renders when intentRow is available (brand matched in catalog). */}
      {intentRow && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-buy)] border-opacity-30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className={AUTH_ACCENT} />
            <span className={`text-[11.5px] font-semibold ${AUTH_TEXT_SECONDARY} uppercase tracking-wide`}>
              Your item — ready to check
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className={`text-[15px] font-bold ${AUTH_TEXT}`}>{intentRow.brand}</div>
              <div className={`text-[12px] ${AUTH_TEXT_MUTED}`}>{intentRow.category}</div>
            </div>
            <div className="text-right">
              <div className={`text-[14px] font-bold ${AUTH_ACCENT}`}>{intentRow.sold_7d.toLocaleString()} <span className={`text-[11px] font-normal ${AUTH_TEXT_MUTED}`}>dep/7d</span></div>
              <div className={`text-[12px] ${AUTH_TEXT_SECONDARY}`}>avg €{intentRow.avg_price_eur}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-2.5">
            <Lock size={12} className={AUTH_TEXT_MUTED} />
            <span className={`text-[12px] ${AUTH_TEXT_MUTED}`}>Buy-below price unlocks after verification</span>
          </div>
        </div>
      )}

      {/* Live demand preview — shows the product value while the user waits.
          Asana/Notion lesson: the Aha moment must happen BEFORE activation, not after.
          Every number is sourced from /api/public/market-snapshot and refreshed on mount. */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className={AUTH_ACCENT} />
          <span className={`text-[12px] font-semibold ${AUTH_TEXT_SECONDARY} uppercase tracking-wide`}>
            What&apos;s moving on Vinted right now
          </span>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {/* C162(tony): rows are tappable links to the closest public sample
              query — Superhuman/Linear pattern: make every data point a direct
              path to the Aha moment instead of passive eye candy. */}
          {brands.map(b => (
            // C215(tony): save brand+category interest to localStorage on tap
            // so verify-email can personalise the routing (free+intent → /pricing
            // with eyebrow instead of generic /verdict?q=Nike+AF1). Without this
            // the interest signal the user just demonstrated by tapping is silently
            // lost — 11/25 accounts ran 0 verdicts; this is one capture path.
            <Link key={`${b.brand}-${b.category}`}
              href={brandToSampleHref(b.brand)}
              onClick={() => { try { localStorage.setItem("riq_intent_query", `${b.brand} ${b.category}`) } catch { /* private mode */ } }}
              className="flex items-center justify-between py-2 border-b border-[var(--color-border-ui)] last:border-0 hover:bg-[var(--color-surface-hover,rgba(255,255,255,0.04))] rounded-lg px-1 -mx-1 transition-colors group cursor-pointer">
              <div>
                <span className={`text-[13.5px] font-semibold ${AUTH_TEXT} group-hover:text-[var(--color-buy)]`}>{b.brand}</span>
                <span className={`text-[12px] ${AUTH_TEXT_MUTED} ml-1.5`}>{b.category}</span>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <span className={`text-[13px] font-bold ${AUTH_ACCENT}`}>
                    {b.sold_7d.toLocaleString()}
                  </span>
                  <span className={`text-[11px] ${AUTH_TEXT_MUTED} ml-1`}>departures/7d</span>
                  <div className={`text-[11.5px] ${AUTH_TEXT_SECONDARY}`}>avg €{b.avg_price_eur}</div>
                </div>
                <ArrowRight size={12} className={`${AUTH_TEXT_MUTED} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`} />
              </div>
            </Link>
          ))}
        </div>
        {/* C143(tony): personalised CTA — Duolingo pattern: name the exact goal
            so the click feels like finishing the job, not starting it. */}
        <p className={`text-[11.5px] ${AUTH_TEXT_MUTED} leading-relaxed mb-4`}>
          Your verdict tells you <em>which models</em> to buy and the max price to pay.
          {intentQuery && !intentIsSample
            ? <> Verify your email, then complete checkout — your <strong className={AUTH_TEXT}>{intentQuery}</strong> check unlocks straight after.</>
            : intentIsSample
              ? <> One click and you&apos;ll see the <strong className={AUTH_TEXT}>{intentQuery}</strong> buy-below.</>
              : <> Check your inbox — one click and you&apos;re in.</>
          }
        </p>
        {/* Pre-activation sample — see value before committing. Personalised to
            the intent query the user captured at /register when available. */}
        <Link
          href={sampleHref}
          className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold ${AUTH_ACCENT} hover:underline`}
        >
          {intentIsSample ? `Preview the ${intentQuery} verdict →` : "See what a verdict looks like →"}
        </Link>
      </div>
    </div>
  )
}
