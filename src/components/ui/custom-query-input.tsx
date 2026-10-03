"use client"
/**
 * CustomQueryInput — shared "Check YOUR item" bridge.
 *
 * Extracted 2026-09-29 (check:dupes fix) from HeroFreeChips (H169) and
 * VerdictUpsellCta (H159), which had independently grown byte-identical
 * copies of this mini input + submit button + personalized-paywall-nudge
 * block (4 overlapping blocks of 8+ identical lines, incl. the disabled-state
 * cursor/opacity logic). Each caller had also been patching the check's
 * ALLOW list to silence the failure instead of extracting — that hid the
 * real risk this check exists for: a future fix to the disabled-state logic,
 * the paywall copy, or the fetch/paywall wiring landing in one copy and
 * silently missing the other. This is now the single source of truth for
 * that UI; callers own only their state (customQ/customLoading/paywall
 * query+count) and their own handleCustomSubmit (fetch + 402 branching
 * differs slightly per caller's analytics/fallback needs).
 *
 * Rendered by: HeroFreeChips (HeroInlineVerdictCard) and VerdictUpsellCta.
 */
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { Locale } from "@/lib/i18n"
import { useT } from "@/components/i18n/locale-provider"

export function CustomQueryInput({
  value,
  onChange,
  onSubmit,
  loading,
  buttonPadding = "8px 12px",
  paywallQuery,
  paywallN,
  paywallTestId,
  locale,
  ctaSrc,
  customerEmail,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  /** Preserves each caller's original button padding pixel-for-pixel. */
  buttonPadding?: string
  paywallQuery: string | null
  paywallN: number | null
  /** data-testid on the paywall nudge — callers keep their own selector. */
  paywallTestId: string
  locale: Locale
  /** analytics src= tag forwarded to GuestCheckoutButton. */
  ctaSrc: string
  customerEmail?: string
}) {
  const tx = useT()
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <p style={{ fontSize: 12, color: "#8b99b8", margin: "0 0 7px", lineHeight: 1.5, fontWeight: 500 }}>{tx("Now check YOUR item:")}</p>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", gap: 7, maxWidth: 360 }}
      >
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={tx("e.g. Stone Island Hoodie")}
          autoComplete="off"
          style={{
            flex: 1,
            background: "#0d1117",
            color: "#eef1f7",
            border: "1px solid rgba(52,199,89,.25)",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 13,
            outline: "none",
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={!value.trim() || loading}
          style={{
            background: "rgba(52,199,89,.12)",
            color: "#34C759",
            border: "1px solid rgba(52,199,89,.3)",
            borderRadius: 8,
            padding: buttonPadding,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: (value.trim() && !loading) ? "pointer" : "not-allowed",
            opacity: (value.trim() && !loading) ? 1 : 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "…" : tx("Check →")}
        </button>
      </form>

      {/* Inline personalized paywall — fires when their custom item returns 402 */}
      {paywallQuery && (
        <div
          data-testid={paywallTestId}
          style={{
            marginTop: 10,
            padding: "10px 12px",
            background: "var(--color-surface)",
            border: "1px solid rgba(52,199,89,.3)",
            borderRadius: 9,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: "#eef1f7", margin: "0 0 4px", lineHeight: 1.4 }}>{tx("We have data on {0} — unlock it below", [paywallQuery])}</p>
          {paywallN != null && paywallN > 0 && (
            <p style={{ fontSize: 12, color: "#34C759", margin: "0 0 8px", fontWeight: 600, lineHeight: 1.45 }}>{tx("✓ We have data on this item — the answer is ready.")}</p>
          )}
          <GuestCheckoutButton
            locale={locale}
            src={ctaSrc}
            query={paywallQuery}
            customerEmail={customerEmail || undefined}
          />
        </div>
      )}
    </div>
  )
}
