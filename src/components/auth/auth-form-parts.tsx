"use client"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import type { SnapshotBrandRow } from "@/lib/market-snapshot"
import { useT } from "@/components/i18n/locale-provider"
import { departureDisplay, departureUnitInline } from "@/lib/departure-display"

/**
 * The three shapes every (auth) form is built from: a heading pair, a labelled
 * text input, and a submit button that swaps its label while in flight.
 *
 * Extracted when `npm run check:dupes` flagged an 8-line identical block
 * between login/page.tsx and forgot-password/page.tsx. The duplication was
 * always there — translating both forms simply made it textually identical and
 * therefore detectable. Two copies of a rule means two places to be wrong, and
 * the class strings here (focus ring, placeholder colour, disabled opacity)
 * are exactly the kind that drift silently between pages until one form looks
 * a generation older than the others.
 *
 * Presentation only, on purpose: no locale lookup and no form state. Each page
 * still owns its own copy object and its own submit handler, so this cannot
 * become the place where an unrelated auth behaviour quietly diverges.
 */

/**
 * ── Token mapping ───────────────────────────────────────────────────────────
 * These strings MAP onto the `@theme` block in src/app/globals.css. They do not
 * define a palette; every value below is a `var(--color-*)` that already exists
 * there. Written as arbitrary values rather than the generated `bg-surface`
 * utilities on purpose: an arbitrary `var()` emits the declaration literally, so
 * a typo'd token name renders an obviously-broken colour instead of silently
 * emitting no CSS at all.
 *
 * Why this exists at all: before this pass the (auth) group used FIVE different
 * greens for one accent — `emerald-400` (#34d399) on buttons, `emerald-300` on
 * their hover, `emerald-500/60` on focus rings, `#34C759` in pricing-section,
 * and a `to-teal-500` gradient on the wordmark — against a `--color-buy` token
 * of #34C759 that nothing in this group referenced. Same class of bug the file
 * header already describes: the accent had no single source, so it drifted.
 *
 * Hover is `opacity`, not a second green. There is no hover token in @theme and
 * inventing a hex here is exactly what this lane exists to prevent.
 */
export const AUTH_CARD =
  "bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-8"
export const AUTH_ACCENT = "text-[var(--color-buy)]"
export const AUTH_ACCENT_BUTTON =
  "w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[13.5px] " +
  "py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
export const AUTH_TEXT = "text-[var(--color-text-primary)]"
export const AUTH_TEXT_SECONDARY = "text-[var(--color-text-secondary)]"
export const AUTH_TEXT_MUTED = "text-[var(--color-text-muted)]"

const FIELD_CLASS =
  // 16px is NOT a style choice: iOS Safari auto-zooms the whole page when a
  // focused input is below 16px, shifting the layout mid-form. min-h-[44px]
  // is the WCAG 2.5.5 tap target (py-2.5 rendered 42px).
  "w-full bg-[var(--color-bg-4)] border border-[var(--color-border-2)] rounded-lg px-3 py-3 min-h-[44px] " +
  "text-[16px] text-[var(--color-text-primary)] outline-none " +
  "focus:border-[var(--color-buy)] placeholder:text-[var(--color-text-muted)]"

/** The card every (auth) route sits in. One shape, one place to change it. */
export function AuthCard({
  children,
  center = false,
}: {
  children: React.ReactNode
  center?: boolean
}) {
  return (
    <div className="w-full max-w-md">
      <div className={`${AUTH_CARD}${center ? " text-center" : ""}`}>{children}</div>
    </div>
  )
}

export function AuthHeading({ heading, subheading }: { heading: string; subheading: string }) {
  return (
    <>
      <h1 className="text-[21px] font-bold mb-1">{heading}</h1>
      <p className={`${AUTH_TEXT_SECONDARY} text-[13px] mb-5`}>{subheading}</p>
    </>
  )
}

export function AuthField({
  label,
  type,
  value,
  onChange,
  placeholder,
  minLength,
  autoComplete,
  invalid,
  describedBy,
}: {
  label: string
  type: "email" | "password"
  value: string
  onChange: (v: string) => void
  placeholder: string
  minLength?: number
  /** Password managers and iOS Keychain cannot autofill without this. Missing
   *  autocomplete forces manual typing on mobile -> typos -> wrong-password
   *  -> abandoned signup. Pass "email" | "current-password" | "new-password". */
  autoComplete?: string
  /** Wires the field to the form-level error for screen readers. */
  invalid?: boolean
  describedBy?: string
}) {
  return (
    <div>
      {/* 12px, secondary (not muted): 11px muted measured 3.02:1 on the card
          background — WCAG AA needs 4.5:1 for text this size. */}
      <label className="text-[12px] text-[var(--color-text-secondary)] block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? describedBy : undefined}
        className={FIELD_CLASS}
        placeholder={placeholder}
      />
    </div>
  )
}

/**
 * AuthDemandPanel — live Vinted demand rows shown alongside auth forms.
 *
 * Plausible/Duolingo pattern: show the product while the user completes admin.
 * Extracted from forgot-password/page.tsx (C167) and reset-password/page.tsx (C183)
 * to eliminate the dupe flagged by check:dupes. One component, one place to update.
 *
 * Rows link to the closest free-sample verdict (Nike AF1 / Adidas Samba /
 * Fred Perry Polo) so a tap delivers a real result even pre-login.
 * Footer copy is parameterised so each context can be specific.
 */
export function AuthDemandPanel({
  rows,
  footer,
}: {
  rows: SnapshotBrandRow[]
  footer?: string
}) {
  const tx = useT()
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border-ui)] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className={AUTH_ACCENT} />
        <span className={`text-[12px] font-semibold ${AUTH_TEXT_SECONDARY} uppercase tracking-wide`}>{tx("What's moving on Vinted right now")}</span>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {rows.map(b => {
          const brand = b.brand.toLowerCase()
          const sampleHref = brand.includes("adidas")
            ? "/verdict?q=Adidas+Samba"
            : brand.includes("fred perry")
              ? "/verdict?q=Fred+Perry+Polo"
              : "/verdict?q=Nike+Air+Force+1"
          return (
            <Link
              key={`${b.brand}-${b.category}`}
              href={sampleHref}
              className="flex items-center justify-between py-2 border-b border-[var(--color-border-ui)] last:border-0 hover:bg-[var(--color-surface-hover,rgba(255,255,255,0.04))] rounded-lg px-1 -mx-1 transition-colors group"
            >
              <div>
                <span className={`text-[13.5px] font-semibold ${AUTH_TEXT} group-hover:text-[var(--color-buy)]`}>{b.brand}</span>
                <span className={`text-[12px] ${AUTH_TEXT_MUTED} ml-1.5`}>{b.category}</span>
              </div>
              <div className="text-right">
                {departureDisplay(b.sold_7d, tx.locale).kind !== "hidden" && (
                  <>
                    <span className={`text-[13px] font-bold ${AUTH_ACCENT}`}>
                      {departureDisplay(b.sold_7d, tx.locale, { compact: true }).text}
                    </span>
                    <span className={`text-[11px] ${AUTH_TEXT_MUTED} ml-1`}>{departureUnitInline("7d", tx.locale)}</span>
                  </>
                )}
                <div className={`text-[11.5px] ${AUTH_TEXT_SECONDARY}`}>{tx("avg €{0}", [b.avg_price_eur])}</div>
              </div>
            </Link>
          )
        })}
      </div>
      <p className={`text-[11.5px] ${AUTH_TEXT_MUTED} leading-relaxed`}>{footer ?? tx("Your verdict unlocks the moment you’re back in. Tap a row to preview the data.")}</p>
    </div>
  )
}

export function AuthSubmit({
  loading,
  submitting,
  submit,
}: {
  loading: boolean
  submitting: string
  submit: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`${AUTH_ACCENT_BUTTON} mt-1`}
    >
      {loading ? submitting : submit}
    </button>
  )
}
