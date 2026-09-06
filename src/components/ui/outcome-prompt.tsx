"use client"
import { useEffect, useState } from "react"
import { getPendingOutcomes, reportOutcome, type PendingOutcome } from "@/lib/api"
import { useLocale } from "@/components/i18n/locale-provider"
import { appCopy } from "@/lib/app-copy"
import { verdictWord, formatCount } from "@/lib/verdict-words"

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
 *
 * LOCALISED 2026-09-06. Every string here was an English literal, including
 * the two the founder screenshotted on an /es session ("Quick one." and "Not
 * now"). This is the one component on the panel that ASKS the customer for
 * something, so it was the worst possible place to be speaking the wrong
 * language — a question a reader cannot parse is not a question.
 *
 * The verdict is rendered through `verdictWord()`, not `item.verdict`. The raw
 * field is the API enum, so a Spanish reader was being reminded that we said
 * "BUY" about their shoes. Same fix, same helper, as the verdict card.
 */
export function OutcomePrompt() {
  const locale = useLocale()
  const t = appCopy[locale].outcome
  const [item, setItem] = useState<PendingOutcome | null>(null)
  const [step, setStep] = useState<"ask" | "bought" | "done">("ask")
  const [buyPrice, setBuyPrice] = useState("")
  const [sellPrice, setSellPrice] = useState("")
  const [busy, setBusy] = useState(false)
  // Rendered text only. Date.now() during render is impure and would produce
  // a different string on every re-render, so it is computed once on load.
  // Days are stored as a NUMBER, not a pre-built sentence: the string has to
  // be rebuilt when the locale changes, and baking it at fetch time would
  // freeze whichever language happened to be active then.
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    getPendingOutcomes(1)
      .then((r) => {
        if (!alive || !r.pending?.length) return
        const p = r.pending[0]
        setItem(p)
        const d = Math.round(
          (Date.now() - new Date(p.created_at.replace(" ", "T") + "Z").getTime()) / 864e5)
        setDays(Number.isFinite(d) && d <= 60 ? d : null)
      })
      .catch(() => { /* not logged in, or offline — stay silent */ })
    return () => { alive = false }
  }, [])

  if (!item || step === "done") return null

  const when = days == null ? t.aWhileBack : t.daysAgo(formatCount(days, locale))
  // An unrecognised verdict (BRAND_AVERAGE, LIMIT_REACHED) has no translation
  // and falls back to the raw value rather than vanishing — the reader still
  // needs to know which call we are asking about.
  const said = verdictWord(item.verdict, locale) ?? item.verdict

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
    <div
      data-testid="riq-outcome-prompt"
      className="mb-4 rounded-[14px] border border-white/[0.08] bg-white/[0.03] px-5 py-4"
    >
      <div className="text-[15px] leading-6 text-[#f5f5f7]">
        {t.lead}{" "}
        <span className="font-medium">{item.query}</span>{" "}
        {t.mid(when)}{" "}
        <span className="font-medium">{said}</span>{t.tail}
      </div>

      {step === "ask" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button" disabled={busy} onClick={() => setStep("bought")}
            className="rounded-[12px] bg-[var(--color-accent)] px-4 py-2 text-[15px] font-semibold text-[var(--color-on-accent)] transition-opacity duration-150 disabled:opacity-50"
          >{t.didBuy}</button>
          <button
            type="button" disabled={busy}
            onClick={() => send({ verdict_log_id: item.id, did_buy: false })}
            className="rounded-[12px] px-4 py-2 text-[15px] text-[#f5f5f7]/70 transition-opacity duration-150 hover:text-[#f5f5f7] disabled:opacity-50"
          >{t.didNotBuy}</button>
          <button
            type="button" onClick={() => setStep("done")}
            className="ml-auto px-2 py-2 text-[13px] text-[#f5f5f7]/45 transition-opacity duration-150 hover:text-[#f5f5f7]/70"
          >{t.notNow}</button>
        </div>
      )}

      {step === "bought" && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-[13px] text-[#f5f5f7]/60">
            {t.paid}
            <input
              inputMode="decimal" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="€" aria-label={t.ariaPaid}
              className="mt-1.5 block w-28 rounded-[12px] border border-white/[0.08] bg-black/20 px-3 py-2 text-[15px] text-[#f5f5f7]"
            />
          </label>
          <label className="text-[13px] text-[#f5f5f7]/60">
            {t.soldFor} <span className="text-[#f5f5f7]/40">{t.blankIfUnsold}</span>
            <input
              inputMode="decimal" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)}
              placeholder="€" aria-label={t.ariaSold}
              className="mt-1.5 block w-28 rounded-[12px] border border-white/[0.08] bg-black/20 px-3 py-2 text-[15px] text-[#f5f5f7]"
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
            className="rounded-[12px] bg-[var(--color-accent)] px-4 py-2 text-[15px] font-semibold text-[var(--color-on-accent)] transition-opacity duration-150 disabled:opacity-50"
          >{busy ? t.saving : t.save}</button>
          <button
            type="button" onClick={() => setStep("done")}
            className="ml-auto px-2 py-2 text-[13px] text-[#f5f5f7]/45 transition-opacity duration-150 hover:text-[#f5f5f7]/70"
          >{t.notNow}</button>
        </div>
      )}
    </div>
  )
}
