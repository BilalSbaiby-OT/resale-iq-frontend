"use client"
import { useEffect, useState } from "react"
import { getTrialStatus, getBillingPortal } from "@/lib/api"
import { fmtDate } from "@/lib/ui-translate"
import { useT } from "@/components/i18n/locale-provider"


/**
 * One honest line for a trialing account: days left, the first-charge amount
 * and date, and a plain link to the Stripe portal to manage or cancel.
 * Renders nothing unless Stripe says the subscription is 'trialing' — no
 * fabricated dates, no line for paying or free accounts.
 */
export function TrialLine() {
  const tx = useT()
  const [s, setS] = useState<{ end: Date; price: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)

  useEffect(() => {
    getTrialStatus()
      .then((r) => {
        if (!r.trialing || !r.trial_end) return
        const end = new Date(r.trial_end)
        if (Number.isNaN(end.getTime())) return
        setS({ end, price: (r.price_label ?? "€19/month").split("/")[0] })
      })
      .catch(() => {})
  }, [])

  if (!s) return null
  const daysLeft = Math.max(0, Math.ceil((s.end.getTime() - Date.now()) / 86_400_000))
  const date = fmtDate(tx.locale, s.end, { day: "numeric", month: "short" })
  const manage = async () => {
    setBusy(true); setErr(false)
    try { window.location.href = (await getBillingPortal()).portal_url }
    catch { setErr(true); setBusy(false) }
  }
  return (
    <div
      data-testid="riq-trial-line"
      style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 8px", fontSize: 13, color: "var(--color-graphite-muted)", marginBottom: 16, lineHeight: 1.5 }}
    >
      <span>
        <strong style={{ color: "var(--color-on-graphite)", fontWeight: 600 }}>{daysLeft === 1 ? tx("Free trial — 1 day left") : tx("Free trial — {0} days left", [daysLeft])}
        </strong>
        {" · "}{tx("first charge {0} on {1}", [s.price, date])}
      </span>
      <button
        type="button"
        onClick={manage}
        disabled={busy}
        data-testid="riq-trial-manage"
        style={{ background: "none", border: "none", padding: "6px 0", color: "var(--color-on-graphite)", textDecoration: "underline", cursor: "pointer", fontSize: 13 }}
      >
        {busy ? tx("Opening…") : tx("Manage / cancel")}
      </button>
      {err && <span role="status">{tx("Couldn’t open billing — try Account → Manage subscription.")}</span>}
    </div>
  )
}
