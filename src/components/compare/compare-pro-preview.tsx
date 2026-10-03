"use client"
import { useEffect, useState } from "react"
import { comparePrices, getCompareSample, PaymentRequiredError } from "@/lib/api"
import { compareView, comparePreviewFromBody, type ComparePreview } from "@/lib/compare-stats"
import type { PriceCompareResult } from "@/types"
import { useT } from "@/components/i18n/locale-provider"
import { CompareChips, CompareResultsView } from "./compare-results"

const MARKETS = ["es", "fr", "de", "it", "pt"]

/**
 * Non-Pro /compare: shown inside the paywall, BEFORE the upgrade ask.
 *  1. A real example comparison (GET /api/public/compare/sample), same card and
 *     rows as Pro, labelled "Example: <model>, live data". 404/error -> hidden.
 *  2. The visitor's own query: only which sites have data + suggestion chips
 *     (402 preview). No prices for it. No preview in the 402 -> nothing extra.
 */
export function CompareProPreview() {
  const tx = useT()
  const [sample, setSample] = useState<PriceCompareResult | null>(null)
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<ComparePreview | null>(null)
  const [asked, setAsked] = useState(false)

  // why: the sample is optional; on any failure hiding the block is the degrade.
  useEffect(() => { getCompareSample().then(setSample).catch(() => setSample(null)) }, [])

  const check = async (override?: string) => {
    const q = (override ?? query).trim()
    if (!q || busy) return
    setQuery(q); setBusy(true); setPreview(null); setAsked(true)
    try {
      await comparePrices({ q, markets: MARKETS, limit: 1 }) // a Pro-entitled answer is deliberately dropped here
    } catch (e) {
      if (e instanceof PaymentRequiredError) setPreview(comparePreviewFromBody(e.body))
      // why: any other failure (network, 5xx) just means no preview line; the upgrade ask below is the page's job.
    } finally { setBusy(false) }
  }

  const showSample = sample && compareView(sample).mode === "results"
  const sampleLabel = sample?.label || sample?.model || sample?.query || ""

  return (
    <div data-testid="compare-preview" style={{ width: "100%", maxWidth: 560, marginBottom: 26 }}>
      {showSample && sample && (
        <div data-testid="compare-sample" style={{ marginBottom: 18 }}>
          <div className="text-[13px] font-semibold mb-2" style={{ color: "var(--color-on-graphite)" }}>{tx("Example: {0}, live data", [sampleLabel])}</div>
          <CompareResultsView result={sample} expandable={false} />
        </div>
      )}
      <div className="rounded-xl p-4 border" style={{ background: "var(--color-bg-3)", borderColor: "var(--color-hairline)" }}>
        <div className="text-[13px] font-semibold mb-2" style={{ color: "var(--color-on-graphite)" }}>{tx("Check which Vinted sites have data for your search")}</div>
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && check()}
            placeholder={tx("e.g. Nike Air Force 1, Adidas Samba OG, Stone Island crewneck")}
            aria-label={tx("Check which Vinted sites have data for your search")}
            className="flex-1 min-w-0 bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-3 py-2 text-[13px] outline-none" style={{ color: "var(--color-on-graphite)" }} />
          <button onClick={() => check()} disabled={busy || !query.trim()} className="px-4 py-2 rounded-lg text-[13px] font-bold disabled:opacity-40" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}>{tx("Check")}</button>
        </div>
        {asked && !busy && preview && (
          <div data-testid="compare-preview-result" className="mt-3 text-[13px]" style={{ color: "var(--color-graphite-muted)" }}>
            {preview.sites.length > 0 && (
              <div data-testid="compare-sites-with-data">
                {tx("Data available on:")}{" "}
                {preview.sites.map(s => <span key={s} className="mr-2 font-medium" style={{ color: "var(--color-on-graphite)" }}>{`vinted.${s} ✓`}</span>)}
              </div>
            )}
            <CompareChips suggestions={preview.suggestions} onPick={q => check(q)} testId="compare-preview-chips" />
            <div className="mt-2 text-[12px]">{tx("Typical prices for your own search are on Pro.")}</div>
          </div>
        )}
      </div>
    </div>
  )
}
