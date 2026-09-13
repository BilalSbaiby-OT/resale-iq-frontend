/**
 * Mid-article paid CTA for how-to blog posts.
 *
 * Conversion QC passed the /pricing path. Do not send these
 * blocks to /register — register still mentions Free.
 * Soft /data cite is the secondary link. No free-check door.
 * No invented hit rates.
 */
import type { SectionCtaContent } from "./section-cta"

export function pricingUtmHref(campaign: string, content: string): string {
  return `/pricing?utm_source=organic&utm_medium=blog&utm_campaign=${campaign}&utm_content=${content}`
}

export function pricingMidCtaHref(campaign: string): string {
  return pricingUtmHref(campaign, "mid_cta")
}

export function pricingFooterSeePlansHref(campaign: string): string {
  return pricingUtmHref(campaign, "footer_see_plans")
}

export function campaignFromPricingHref(href: string): string | null {
  const m = href.match(/[?&]utm_campaign=([^&]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

/** Footer "See plans" on a blog article — same campaign as the mid-CTA when one exists. */
export function footerSeePlansHrefForPost(
  sections: ReadonlyArray<{ cta?: { href: string } }>,
): string {
  for (const s of sections) {
    const campaign = s.cta ? campaignFromPricingHref(s.cta.href) : null
    if (!campaign || !s.cta) continue
    // BODY-ES-001: a Spanish paid CTA must keep the footer on /es/pricing.
    // Remapping through pricingFooterSeePlansHref would emit English /pricing.
    if (isEsPricingHref(s.cta.href)) return pricingBodyCtaHrefEs(campaign)
    return pricingFooterSeePlansHref(campaign)
  }
  return pricingFooterSeePlansHref("ctr_blog_20260913")
}

export function footerSeePlansLabelForPost(
  sections: ReadonlyArray<{ cta?: { href: string; label?: string } }>,
): string {
  for (const s of sections) {
    if (s.cta && isEsPricingHref(s.cta.href)) return s.cta.label ?? "Consigue los números"
  }
  return "See plans — from €19/mo"
}

export function pricingMidCta(campaign: string): SectionCtaContent {
  return {
    headline: "Know what to pay before you buy",
    body: "Buy-below + demand before cash sticks.",
    label: "Get the numbers",
    href: pricingMidCtaHref(campaign),
    secondaryLabel: "Or browse weekly brand volumes on /data",
    secondaryHref: "/data",
  }
}

/** BODY-001 paid CTA — source/medium swapped vs mid-CTA so the body block is separable. */
export function pricingBodyCtaHref(campaign: string): string {
  return `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=${campaign}&utm_content=body_cta`
}

export function dataCiteHref(campaign: string): string {
  return `/data?utm_source=organic&utm_medium=blog&utm_campaign=${campaign}&utm_content=data_cite`
}

export function pricingBodyCta(campaign: string): SectionCtaContent {
  return {
    headline: "Know what to pay before you buy",
    body: "Buy-below + demand before cash sticks.",
    label: "Get the numbers",
    href: pricingBodyCtaHref(campaign),
  }
}

/** BODY-ES-001. Paid path is /es/pricing only — never English /pricing. */
export function pricingBodyCtaHrefEs(campaign: string): string {
  return `/es/pricing?utm_source=blog&utm_medium=organic&utm_campaign=${campaign}`
}

export function dataCiteHrefEs(campaign: string): string {
  return `/es/data?utm_source=blog&utm_medium=organic&utm_campaign=${campaign}`
}

export function isEsPricingHref(href: string): boolean {
  return href.startsWith("/es/pricing")
}

export function pricingBodyCtaEs(campaign: string): SectionCtaContent {
  return {
    headline: "Sabe qué pagar antes de comprar",
    body: "Buy-below + demanda antes de inmovilizar cash.",
    label: "Consigue los números",
    href: pricingBodyCtaHrefEs(campaign),
  }
}
