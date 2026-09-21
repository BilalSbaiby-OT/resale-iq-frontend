/**
 * Reusable AW26 one-off report CTA.
 *
 * EUR49 Stripe payment link — no account, no subscription.
 * Used on the paywall card and limit-reached upgrade to give cold visitors
 * a non-subscription path to revenue. Single source so the link, label and
 * styling can never diverge between surfaces. Revenue 2026-09-21.
 */
import { AW26_REPORT_URL } from "@/lib/hard-paywall"

export function Aw26ReportCta({ borderTop = true }: { borderTop?: boolean }) {
  return (
    <div style={borderTop ? { borderTop: "1px solid #1e2a3f", paddingTop: 12 } : { paddingTop: 0 }}>
      <p style={{ fontSize: 12, color: "#6a7d9a", marginBottom: 8, lineHeight: 1.45 }}>
        Not ready to subscribe? Get the full AW26 demand picture in one go:
      </p>
      <a
        href={AW26_REPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="riq-aw26-report-cta"
        style={{
          display: "inline-block",
          fontSize: 13,
          fontWeight: 600,
          color: "#60a5fa",
          textDecoration: "none",
          border: "1px solid rgba(96,165,250,.3)",
          borderRadius: 8,
          padding: "7px 14px",
        }}
      >
        Autumn/Winter 2026 Vinted Demand Report — €49 one-off →
      </a>
    </div>
  )
}
