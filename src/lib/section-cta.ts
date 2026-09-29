/** Mid-article paid CTA. One shape for blog + manual — do not redeclare. */
export interface SectionCtaContent {
  headline: string
  body: string
  example?: string
  label: string
  href: string
  secondaryLabel?: string
  secondaryHref?: string
  /** H147: item query for a direct-checkout skip-/pricing CTA (blog only). */
  preflightQuery?: string
  /** H147: locale for the checkout button (blog only). */
  locale?: import("@/lib/i18n").Locale
}
