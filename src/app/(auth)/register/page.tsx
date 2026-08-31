"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { getPlans, isConflict } from "@/lib/api"

// Free + paid. Paid prices load LIVE from Stripe so the shown amount always
// matches what's charged (no €49-shown / €79-charged surprises).
//
// The free option is NOT cosmetic — this page was paid-only, so every "Create a
// free account" CTA on the site (pricing section, unlock panel, llms.txt, the
// Offer schema) landed people on a forced Stripe checkout. The free tier was
// advertised everywhere and reachable nowhere.
const PLAN_META = [
  { id: "power", pricePlan: "power", name: "Pro", tag: "Most popular", desc: "Live deals, Order Planner, API, per-size velocity" },
  { id: "operator", pricePlan: "operator", name: "Starter", desc: "Unlimited verdicts, every signal, watchlist & P&L" },
  { id: "free", pricePlan: "free", name: "Free", desc: "7 days of Starter, 5 live finds and 1 order plan, then 10 checks/month. No card." },
]

function RegisterContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const searchParams = useSearchParams()
  // Default to the plan the CTA asked for. "free" must be honoured or the free
  // CTAs silently upsell, which is both a broken funnel and a bait-and-switch.
  const requested = searchParams.get("plan")
  const [plan, setPlan] = useState(
    requested === "operator" || requested === "free" ? requested : "power")
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

  const PLANS = PLAN_META.map(p => ({ ...p, price: prices[p.pricePlan] }))

  const isFree = plan === "free"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tos) { setError("Please accept the Terms of Service"); return }
    // The withdrawal waiver only applies to a paid subscription. Demanding it
    // for a free signup would be asking someone to waive a right they are not
    // exercising, which is friction with no legal purpose.
    if (!isFree && !waiver) { setError("Please confirm you want immediate access to continue"); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    setError(""); setLoading(true)
    try {
      await register(email, password)
      router.push("/check-email")
      return
    } catch (err: unknown) {
      if (isConflict(err)) {
        setError("You already have an account — Sign in")
      } else {
        setError(err instanceof Error ? err.message : "Registration failed")
      }
    }
    finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-7">
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#22c55e,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#06090c", fontSize: 13 }}>R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </div>
      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8">
        <h1 className="text-[21px] font-bold mb-1">Create your account</h1>
        <p className="text-[#8b99b8] text-[13px] mb-5">Start free, or pick a plan to unlock the full toolkit. Cancel anytime.</p>
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
                  <div className="text-[10px] text-[#5b6b8c]">{p.id === "free" ? "forever" : "/month"}</div>
                </div>
              </label>
            ))}
          </div>

          <div>
            <label className="text-[11px] text-[#5b6b8c] block mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" />
          </div>
          <div>
            <label className="text-[11px] text-[#5b6b8c] block mb-1.5">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"
              className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" />
          </div>

          <label className="flex items-start gap-2.5 text-[12px] text-[#8b99b8]">
            <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} className="mt-0.5 accent-emerald-400" />
            <span>I agree to the <Link href="/terms" target="_blank" className="text-emerald-400 hover:underline">Terms</Link> and <Link href="/privacy" target="_blank" className="text-emerald-400 hover:underline">Privacy Policy</Link></span>
          </label>

          {/* EU consumer law: for digital content delivered immediately, the
              14-day withdrawal right only ends if the customer gives EXPRESS,
              separately-ticked consent. Bundling it into the Terms checkbox
              does not count — it must be its own affirmative action. */}
          {!isFree && (
            <label className="flex items-start gap-2.5 text-[12px] text-[#8b99b8]">
              <input type="checkbox" checked={waiver} onChange={e => setWaiver(e.target.checked)} className="mt-0.5 accent-emerald-400" />
              <span>
                I want access immediately and I understand that by starting the
                subscription now I lose my 14-day right of withdrawal.
              </span>
            </label>
          )}
          {error && <div className="text-[12px] text-red-400 text-center">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-400 text-[#06090c] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? "Setting up…" : <>Create account <Check size={15} /></>}
          </button>
          <p className="text-[10.5px] text-[#4d5a75] text-center">
            {isFree ? "No card required. Confirm your email, then you’re in." : "Confirm your email first. Then subscribe from Settings — Stripe checkout, cancel anytime."}
          </p>
        </form>
        <div className="text-center mt-4 text-[13px] text-[#5b6b8c]">
          Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() { return <Suspense><RegisterContent /></Suspense> }
