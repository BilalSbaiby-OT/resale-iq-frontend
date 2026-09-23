"use client"
import { useState, useEffect } from "react"
import { forgotPassword } from "@/lib/api"
import Link from "next/link"
import { Mail, TrendingUp } from "lucide-react"
import { copy } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"
import { AuthHeading, AuthField, AuthSubmit } from "@/components/auth/auth-form-parts"
import { fetchTopBrandRows, type SnapshotBrandRow } from "@/lib/market-snapshot"

// C167(tony): activation panel on the forgot-password sent screen.
// Duolingo/Superhuman pattern: every idle recovery moment reinforces product
// value. The user typed their email to get back in — they want the product
// enough to request a reset. Show them what they're coming back for.
// Same fallback pattern as check-email-content.tsx.
const DEMAND_FALLBACK: SnapshotBrandRow[] = [
  { brand: "Stone Island", category: "Hoodies",     sold_7d: 102, avg_price_eur: 58 },
  { brand: "New Balance",  category: "Sneakers",    sold_7d: 383, avg_price_eur: 43 },
  { brand: "Fred Perry",   category: "Polo Shirts", sold_7d: 27,  avg_price_eur: 13 },
]

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demandRows, setDemandRows] = useState<SnapshotBrandRow[]>(DEMAND_FALLBACK)
  const t = copy[useLocale()].auth.forgotPassword

  // C167(tony): fetch live demand rows on mount so the sent screen shows
  // current numbers. Independent of the form submit — always ready when
  // the success state renders. Falls back silently.
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
              <b className="text-[var(--color-text-primary)]">noreply@resaleiq.dev</b>.
            </p>
            <Link href="/login" className="text-[var(--color-buy)] hover:underline text-[13px]">{t.backToSignIn}</Link>
          </div>
        ) : (
          <>
            <AuthHeading heading={t.heading} subheading={t.subheading} />
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AuthField label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
              <AuthSubmit loading={loading} submitting={t.submitting} submit={t.submit} />
            </form>
            <div className="text-center mt-5"><Link href="/login" className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">{t.backToSignIn}</Link></div>
          </>
        )}
      </div>

      {/* C167(tony): live demand panel on sent screen — Duolingo/Superhuman pattern.
          A user requesting a password reset wants back in enough to go to their inbox.
          Show them what they're returning for, and link each row to a free sample so
          the click delivers a real verdict even before they complete the reset.
          Only renders after form submit (sent=true). Identical to check-email-content.tsx. */}
      {sent && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[var(--color-buy)]" />
            <span className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              What&apos;s moving on Vinted right now
            </span>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {demandRows.map(b => {
              // Map to closest free sample query so the tap delivers a real result,
              // not a paywall. Same logic as check-email-content.tsx (C162).
              const brand = b.brand.toLowerCase()
              const sampleHref = brand.includes("new balance")
                ? "/verdict?q=New+Balance+530"
                : brand.includes("adidas")
                  ? "/verdict?q=Adidas+Samba"
                  : "/verdict?q=Nike+Air+Force+1"
              return (
                <Link
                  key={`${b.brand}-${b.category}`}
                  href={sampleHref}
                  className="flex items-center justify-between py-2 border-b border-[var(--color-border-ui)] last:border-0 hover:bg-[var(--color-surface-hover,rgba(255,255,255,0.04))] rounded-lg px-1 -mx-1 transition-colors group"
                >
                  <div>
                    <span className="text-[13.5px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-buy)]">{b.brand}</span>
                    <span className="text-[12px] text-[var(--color-text-muted)] ml-1.5">{b.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] font-bold text-[var(--color-buy)]">
                      {b.sold_7d.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)] ml-1">departures/7d</span>
                    <div className="text-[11.5px] text-[var(--color-text-secondary)]">avg €{b.avg_price_eur}</div>
                  </div>
                </Link>
              )
            })}
          </div>
          <p className="text-[11.5px] text-[var(--color-text-muted)] leading-relaxed">
            Your verdict unlocks the moment you&apos;re back in. Tap a row to see what the data looks like.
          </p>
        </div>
      )}
    </div>
  )
}
