"use client"
import { useState, useEffect } from "react"
import { forgotPassword } from "@/lib/api"
import Link from "next/link"
import { Mail } from "lucide-react"
import { copy } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"
import { AuthHeading, AuthField, AuthSubmit, AuthDemandPanel } from "@/components/auth/auth-form-parts"
import { fetchTopBrandRows, type SnapshotBrandRow } from "@/lib/market-snapshot"
import { useT } from "@/components/i18n/locale-provider"

// C(tony): Plausible/Duolingo pattern — show live product value alongside the
// sent-confirmation. A user who just requested a reset went straight to their
// inbox — highest-intent moment on this page. Same fallback approach as
// reset-password/check-email.
// sold_7d is 0 on purpose: a fallback must never print a frozen departure count
// (these were 102 / 383 / 27 from an earlier week). 0 renders as a dash, not a number.
const DEMAND_FALLBACK: SnapshotBrandRow[] = [
  { brand: "Stone Island", category: "Hoodies",     sold_7d: 0, avg_price_eur: 58 },
  { brand: "New Balance",  category: "Sneakers",    sold_7d: 0, avg_price_eur: 43 },
  { brand: "Fred Perry",   category: "Polo Shirts", sold_7d: 0, avg_price_eur: 13 },
]

export function ForgotPasswordContent() {
  const tx = useT()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demandRows, setDemandRows] = useState<SnapshotBrandRow[]>(DEMAND_FALLBACK)
  const t = copy[useLocale()].auth.forgotPassword

  useEffect(() => {
    fetchTopBrandRows(3, DEMAND_FALLBACK).then(rows => setDemandRows(rows)).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await forgotPassword(email); setSent(true) } catch { setSent(true) }
    finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-5">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-8">
        {sent ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><Mail size={34} className="text-[var(--color-buy)]" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.sentHeading}</h1>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-3">{t.sentBody}</p>
            <p className="text-[var(--color-text-secondary)] text-[13px] mb-6">
              <b className="text-[var(--color-text-primary)]">{t.spamBold}</b>{t.spamRest}
              <b className="text-[var(--color-text-primary)]">{tx("noreply@resaleiq.dev")}</b>.
            </p>
            <Link href="/login" className="text-[var(--color-buy)] hover:underline text-[13px]">{t.backToSignIn}</Link>
          </div>
        ) : (
          <>
            <AuthHeading heading={t.heading} subheading={t.subheading} />
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AuthField label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder={tx("you@example.com")} autoComplete="email" />
              <AuthSubmit loading={loading} submitting={t.submitting} submit={t.submit} />
            </form>
            <div className="text-center mt-5"><Link href="/login" className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">{t.backToSignIn}</Link></div>
          </>
        )}
      </div>

      {sent && (
        <AuthDemandPanel
          rows={demandRows}
          footer={tx("Your verdict unlocks the moment you reset your password — tap a row to preview.")}
        />
      )}
    </div>
  )
}
