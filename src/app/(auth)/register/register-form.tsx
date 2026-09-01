"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { getPlans, isConflict } from "@/lib/api"
import { copy, WITHDRAWAL_WAIVER_TEXT, type Locale } from "@/lib/i18n"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"

// Free + paid. Paid prices load LIVE from Stripe so the shown amount always
// matches what's charged (no €49-shown / €79-charged surprises).
//
// The free option is NOT cosmetic — this page was paid-only, so every "Create a
// free account" CTA on the site (pricing section, unlock panel, llms.txt, the
// Offer schema) landed people on a forced Stripe checkout. The free tier was
// advertised everywhere and reachable nowhere.
const PLAN_IDS = ["power", "operator", "free"] as const
type PlanId = (typeof PLAN_IDS)[number]

function RegisterContent({ locale }: { locale: Locale }) {
  const t = copy[locale].auth.register
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  // Default to the plan the CTA asked for. "free" must be honoured or the free
  // CTAs silently upsell, which is both a broken funnel and a bait-and-switch.
  const requested = searchParams.get("plan")
  // An UNSPECIFIED plan now defaults to FREE, not to the most expensive tier.
  //
  // It defaulted to "power" (Pro, EUR 49/mo), which made this file contradict
  // its own comment above. Measured consequence, 2026-09-01: the only CTA on
  // every free check result passed no plan, so three real visitors who clicked
  // "Unlock the rest" from a FREE tool landed on a 49 EUR/mo form with Pro
  // pre-selected and Free unselected third of three. All three bounced; zero
  // signups. It also surfaced the EU withdrawal waiver by default, because that
  // only shows for a paid plan.
  //
  // A CTA that means Pro must now say so with ?plan=operator. Silence must
  // never resolve to the most expensive option -- that is the bait-and-switch
  // this file already named and then implemented.
  const [plan, setPlan] = useState<PlanId>(
    requested === "operator" || requested === "power" ? requested : "free")
  const [tos, setTos] = useState(false)
  // Separate from `tos` on purpose — EU law requires express, standalone consent
  // to waive the 14-day withdrawal right for immediately-delivered digital goods.
  const [waiver, setWaiver] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // Real prices from Stripe, keyed by plan id. Falls back to null → "…" until loaded.
  const [prices, setPrices] = useState<Record<string, number>>({})
  const { register } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    getPlans().then(d => {
      const m: Record<string, number> = {}
      d.plans.forEach(p => { m[p.id] = p.price_eur })
      setPrices(m)
    }).catch(() => {})
  }, [])

  const PLAN_META: { id: PlanId; tag?: string }[] = [
    { id: "power", tag: t.mostPopular },
    { id: "operator" },
    { id: "free" },
  ]
  const PLANS = PLAN_META.map(p => ({
    ...p,
    name: t.planNames[p.id],
    desc: t.planDesc[p.id],
    price: prices[p.id],
  }))

  const isFree = plan === "free"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tos) { setError(t.errorAcceptTos); return }
    // The withdrawal waiver only applies to a paid subscription. Demanding it
    // for a free signup would be asking someone to waive a right they are not
    // exercising, which is friction with no legal purpose.
    if (!isFree && !waiver) { setError(t.errorAcceptWaiver); return }
    if (password.length < 8) { setError(t.errorPasswordLength); return }
    setError(""); setLoading(true)
    try {
      await register(email, password)
      router.push("/check-email")
      return
    } catch (err: unknown) {
      if (isConflict(err)) {
        setError(t.errorAlreadyExists)
      } else {
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
        <LocaleSwitcher locale={locale} />
      </div>
      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8">
        <h1 className="text-[21px] font-bold mb-1">{t.heading}</h1>
        <p className="text-[#8b99b8] text-[13px] mb-5">{t.subheading}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            {PLANS.map(p => (
              <label key={p.id} className={`relative flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-all ${plan === p.id ? "border-emerald-500 bg-emerald-500/[0.07]" : "border-[#232c42] hover:bg-[#161b26]"}`}>
                <input type="radio" name="plan" checked={plan === p.id} onChange={() => setPlan(p.id)} className="accent-emerald-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] text-[#eef1f7]">{p.name}</span>
                    {p.tag && <span className="text-[9px] font-bold uppercase tracking-wide bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">{p.tag}</span>}
                  </div>
                  <div className="text-[11.5px] text-[#8b99b8] mt-0.5">{p.desc}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[15px] text-[#eef1f7]">
                    {p.id === "free" ? "€0" : p.price != null ? `€${p.price}` : "…"}
                  </div>
                  <div className="text-[10px] text-[#5b6b8c]">{p.id === "free" ? t.forever : t.perMonth}</div>
                </div>
              </label>
            ))}
          </div>

          <div>
            <label className="text-[11px] text-[#5b6b8c] block mb-1.5">{t.emailLabel}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" />
          </div>
          <div>
            <label className="text-[11px] text-[#5b6b8c] block mb-1.5">{t.passwordLabel}</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPlaceholder}
              className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" />
          </div>

          <label className="flex items-start gap-2.5 text-[12px] text-[#8b99b8]">
            <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} className="mt-0.5 accent-emerald-400" />
            <span>
              {t.tosPrefix} <Link href="/terms" target="_blank" className="text-emerald-400 hover:underline">{t.termsLabel}</Link> {t.tosAnd} <Link href="/privacy" target="_blank" className="text-emerald-400 hover:underline">{t.privacyLabel}</Link>{t.tosSuffix ? ` ${t.tosSuffix}` : ""}
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
            <label className="flex items-start gap-2.5 text-[12px] text-[#8b99b8]" data-i18n-pending="waiver-legal-review">
              <input type="checkbox" checked={waiver} onChange={e => setWaiver(e.target.checked)} className="mt-0.5 accent-emerald-400" />
              <span>{WITHDRAWAL_WAIVER_TEXT}</span>
            </label>
          )}
          {error && <div className="text-[12px] text-red-400 text-center">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-400 text-[#06090c] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? t.submitting : <>{t.submit} <Check size={15} /></>}
          </button>
          <p className="text-[10.5px] text-[#4d5a75] text-center">
            {isFree ? t.freeNote : t.paidNote}
          </p>
        </form>
        <div className="text-center mt-4 text-[13px] text-[#5b6b8c]">
          {t.alreadyHaveAccount} <Link href="/login" className="text-emerald-400 hover:underline">{t.signIn}</Link>
        </div>
      </div>
    </div>
  )
}

export function RegisterForm({ locale }: { locale: Locale }) {
  return <Suspense><RegisterContent locale={locale} /></Suspense>
}
