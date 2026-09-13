/**
 * Mid-article paid CTA for how-to blog posts.
 *
 * Conversion is greenlit to /pricing (Stripe). Do not send these
 * blocks to /register?plan= — register still mentions Free.
 * Soft /data cite is the secondary link. No free-check door.
 * No invented hit rates.
 */
export function pricingMidCtaHref(campaign: string): string {
  return `/pricing?utm_source=organic&utm_medium=blog&utm_campaign=${campaign}&utm_content=mid_cta`
}

export function pricingMidCta(campaign: string) {
  return {
    headline: "Know what to pay before you buy",
    body:
      "Resale IQ returns BUY, WATCH or SKIP plus the buy-below from watched Vinted departures across ES, FR, DE, IT and PT.",
    label: "Get buy-below on any item",
    href: pricingMidCtaHref(campaign),
    secondaryLabel: "Or browse weekly brand volumes on /data",
    secondaryHref: "/data",
  }
}
