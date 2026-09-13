/**
 * Mid-article paid CTA for how-to blog posts.
 *
 * Conversion QC passed the /pricing path. Do not send these
 * blocks to /register — register still mentions Free.
 * Soft /data cite is the secondary link. No free-check door.
 * No invented hit rates.
 */
export function pricingMidCtaHref(campaign: string): string {
  return `/pricing?utm_source=organic&utm_medium=blog&utm_campaign=${campaign}&utm_content=mid_cta`
}

export function pricingMidCta(campaign: string) {
  return {
    headline: "Know what to pay before you buy",
    body: "Buy-below + demand before cash sticks.",
    label: "Get the numbers",
    href: pricingMidCtaHref(campaign),
    secondaryLabel: "Or browse weekly brand volumes on /data",
    secondaryHref: "/data",
  }
}
