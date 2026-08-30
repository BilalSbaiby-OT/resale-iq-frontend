"use client"
import { useEffect, useState } from "react"
import { getPendingOutcomes, reportOutcome, type PendingOutcome } from "@/lib/api"

/**
 * "You checked this three weeks ago — what actually happened?"
 *
 * Everything else this product knows about its own accuracy is graded against
 * market data we collected ourselves. If the scraper is wrong, the grade is
 * wrong in the same direction. This is the only question whose answer we cannot
 * generate, and it is the loop that makes the tool get better at being right.
 *
 * DESIGN RULES, and why each one is here:
 *  - Asks about ONE verdict at a time. A form with five rows gets closed.
 *  - "I didn't buy it" is one tap and is a REAL answer, stored as one. Most
 *    checks end that way; treating it as a non-reply would bias everything we
 *    learn towards the purchases that happened.
 *  - Dismissing hides it for this session only. It is never marked answered,
 *    because a guess recorded as data is worse than a gap.
 *  - Renders nothing when there is nothing to ask. It can be dropped onto any
 *    page without a conditional at the call site.
 *  - Never blocks anything. A failure here is silent — this is a question, not
 *    a feature the customer is paying for.
 */
export function OutcomePrompt() {
  const [item, setItem] = useState<PendingOutcome | null>(null)
  const [step, setStep] = useState<"ask" | "bought" | "done">("ask")
  const [buyPrice, setBuyPrice] = useState("")
  const [sellPrice, setSellPrice] = useState("")
  const [busy, setBusy] = useState(false)
  // Rendered text only. Date.now() during render is impure and would produce
  // a different string on every re-render, so it is computed once on load.
  const [when, setWhen] = useState("recently")

  useEffect(() => {
    let alive = true
    getPendingOutcomes(1)
      .then((r) => {
        if (!alive || !r.pending?.length) return
        const p = r.pending[0]
        setItem(p)
        const days = Math.round(
          (Date.now() - new Date(p.created_at.replace(" ", "T") + "Z").getTime()) / 864e5)
        setWhen(Number.isFinite(days) && days <= 60 ? `${days} days ago` : "a while back")
      })
      .catch(() => { /* not logged in, or offline — stay silent */ })
    return () => { alive = false }
  }, [])

  if (!item || step === "done") return null

  const send = async (body: Parameters<typeof reportOutcome>[0]) => {
    setBusy(true)
    try {
      await reportOutcome(body)
      setStep("done")
    } catch {
      // A lost answer is a lost data point, not a customer-facing error.
      setStep("done")
    }
  }

  const num = (s: string) => {
    const n = Number(s.replace(",", "."))
    return Number.isFinite(n) && n > 0 ? n : null
  }

  return (
    <div className="mb-4 rounded-xl border border-sky-500/30 bg-sky-500/[0.06] px-4 py-3">
      <div className="text-[12.5px] leading-5 text-[#c3cde0]">
        <span className="font-semibold text-sky-400">Quick one.</span>{" "}
        You checked <span className="font-mono">{item.query}</span> {when} and we said{" "}
        <span className="font-mono">{item.verdict}</span>. What happened?
      </div>

      {step === "ask" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button" disabled={busy} onClick={() => setStep("bought")}
            className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[12.5px] font-semibold text-sky-300 disabled:opacity-50"
          >I bought it</button>
          <button
            type="button" disabled={busy}
            onClick={() => send({ verdict_log_id: item.id, did_buy: false })}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-[12.5px] text-[#9aa8bd] disabled:opacity-50"
          >I didn&apos;t buy it</button>
          <button
            type="button" onClick={() => setStep("done")}
            className="ml-auto px-2 py-1.5 text-[12px] text-[#6b7789] hover:text-[#9aa8bd]"
          >Not now</button>
        </div>
      )}

      {step === "bought" && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-[11.5px] text-[#9aa8bd]">
            Paid
            <input
              inputMode="decimal" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="€" aria-label="What you paid"
              className="mt-1 block w-24 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 font-mono text-[12.5px] text-[#e6edf7]"
            />
          </label>
          <label className="text-[11.5px] text-[#9aa8bd]">
            Sold for <span className="text-[#6b7789]">(blank if unsold)</span>
            <input
              inputMode="decimal" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)}
              placeholder="€" aria-label="What it sold for"
              className="mt-1 block w-24 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 font-mono text-[12.5px] text-[#e6edf7]"
            />
          </label>
          <button
            type="button" disabled={busy}
            onClick={() => send({
              verdict_log_id: item.id,
              did_buy: true,
              buy_price_eur: num(buyPrice),
              // Unsold is a real state, not a missing answer.
              did_sell: num(sellPrice) !== null,
              sell_price_eur: num(sellPrice),
            })}
            className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[12.5px] font-semibold text-sky-300 disabled:opacity-50"
          >{busy ? "Saving…" : "Save"}</button>
          <button
            type="button" onClick={() => setStep("done")}
            className="ml-auto px-2 py-1.5 text-[12px] text-[#6b7789] hover:text-[#9aa8bd]"
          >Not now</button>
        </div>
      )}
    </div>
  )
}
