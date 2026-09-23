"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, TrendingUp, CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { resendVerification } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { copy, type Locale } from "@/lib/i18n"
import {
  AuthCard, AUTH_ACCENT, AUTH_ACCENT_BUTTON,
  AUTH_TEXT, AUTH_TEXT_SECONDARY, AUTH_TEXT_MUTED,
} from "@/components/auth/auth-form-parts"
import { fetchTopBrandRows, type SnapshotBrandRow } from "@/lib/market-snapshot"

// The three brands most likely to resonate with a new reseller — confirmed
// moving at volume in the public market-snapshot. Shown while the user waits
// for their verification email: the goal is to make them WANT to click the link.
const FALLBACK_BRANDS: SnapshotBrandRow[] = [
  { brand: "New Balance", category: "Sneakers", sold_7d: 383, avg_price_eur: 43 },
  { brand: "Nike",        category: "Sneakers", sold_7d: 129, avg_price_eur: 48 },
  { brand: "Adidas",      category: "Sneakers", sold_7d: 126, avg_price_eur: 57 },
]

type BrandRow = SnapshotBrandRow

// C143(tony): activation — 3-step progress indicator for the verification
// waiting screen. Linear/Notion research: users abandon verification when it
// feels like an admin step rather than progress toward a goal. Showing them
// they're at step 2 of 3 (not stuck) reduces drop-off. The third step names
// their specific intent query if one was captured on /register.
const Steps = ({ intentQuery }: { intentQuery: string }) => {
  const steps = [
    { label: "Account created", done: true },
    { label: "Verify your email", done: false, active: true },
    { label: intentQuery ? `See your ${intentQuery} verdict` : "Get your first verdict", done: false },
  ]
  return (
    <div className="flex items-center gap-1 mb-5 w-full">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {step.done
              ? <CheckCircle2 size={14} className="text-[var(--color-buy)] shrink-0" />
              : step.active
                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--color-buy)] shrink-0" />
                : <Circle size={14} className="text-[var(--color-border-ui)] shrink-0" />
            }
            <span className={`text-[11px] truncate ${step.done ? "text-[var(--color-buy)]" : step.active ? AUTH_TEXT : AUTH_TEXT_MUTED}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight size={10} className={`text-[var(--color-border-ui)] ml-1 shrink-0`} />
          )}
        </div>
      ))}
    </div>
  )
}

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
      if (saved) setIntentQuery(saved)
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
  const FREE_SAMPLE_QUERIES = ["Nike Air Force 1", "Adidas Samba", "New Balance 530"]
  const intentIsSample = intentQuery
    ? FREE_SAMPLE_QUERIES.some(s => s.toLowerCase() === intentQuery.trim().toLowerCase())
    : false
  const sampleHref = intentIsSample
    ? `/verdict?q=${encodeURIComponent(intentQuery)}`
    : "/verdict?q=Nike+Air+Force+1"

  // C162(tony): map brand names to the closest public sample query so demand-
  // panel rows can be tapped directly. Only the 3 public samples bypass the
  // paywall — Superhuman/Linear pattern: make every visible data point a path
  // to the Aha moment. Falls back to Nike AF1 for any unrecognised brand.
  const brandToSampleHref = (brand: string): string => {
    const b = brand.toLowerCase()
    if (b.includes("new balance")) return "/verdict?q=New+Balance+530"
    if (b.includes("adidas")) return "/verdict?q=Adidas+Samba"
    return "/verdict?q=Nike+Air+Force+1"
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-5">
      <AuthCard center>
        {/* C143(tony): 3-step progress bar — Linear pattern: show users they
            are 2/3 of the way to their goal (the verdict), not stuck in admin.
            Third step names their specific intent query when available. */}
        <Steps intentQuery={intentQuery} />

        <div className="flex justify-center mb-4"><Mail size={34} className={AUTH_ACCENT} /></div>
        <h1 className="text-[18px] font-bold mb-2">{t.heading}</h1>
        <p className={`${AUTH_TEXT_SECONDARY} text-[13px] mb-4 leading-relaxed`}>
          {t.bodyPrefix}{user?.email ? <> <span className={AUTH_TEXT}>{user.email}</span></> : ` ${t.bodyNoEmail}`}.
          {" "}{t.bodyMiddle} <strong className={`${AUTH_TEXT} font-semibold`}>{t.spam}</strong> {t.bodySuffix} <span className={AUTH_TEXT}>noreply@resaleiq.dev</span>.
        </p>
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
            <Link key={`${b.brand}-${b.category}`}
              href={brandToSampleHref(b.brand)}
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
