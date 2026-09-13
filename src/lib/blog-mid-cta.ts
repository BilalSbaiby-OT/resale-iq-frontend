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

/** Former `/register?src=blog` paid door. Never `/register?plan=`. */
export function pricingInlineRegisterKillHref(campaign: string): string {
  return pricingUtmHref(campaign, "inline_register_kill")
}

export function campaignFromPricingHref(href: string): string | null {
  const m = href.match(/[?&]utm_campaign=([^&]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

function campaignForPost(
  sections: ReadonlyArray<{ cta?: { href: string } }>,
): string {
  for (const s of sections) {
    const campaign = s.cta ? campaignFromPricingHref(s.cta.href) : null
    if (campaign) return campaign
  }
  return "ctr_blog_20260913"
}

/** Footer "See plans" on a blog article — same campaign as the mid-CTA when one exists. */
export function footerSeePlansHrefForPost(
  sections: ReadonlyArray<{ cta?: { href: string } }>,
): string {
  return pricingFooterSeePlansHref(campaignForPost(sections))
}

/** Paid footer button that used to be `/register?src=blog`. */
export function inlineRegisterKillHrefForPost(
  sections: ReadonlyArray<{ cta?: { href: string } }>,
): string {
  return pricingInlineRegisterKillHref(campaignForPost(sections))
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

/** BODY-001 paid CTA — Content brief: blog/organic, campaign only. */
export function pricingBodyCtaHref(campaign: string): string {
  return `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=${campaign}`
}

export function dataCiteHref(campaign: string): string {
  return `/data?utm_source=blog&utm_medium=organic&utm_campaign=${campaign}`
}

export function pricingBodyCta(campaign: string): SectionCtaContent {
  return {
    headline: "Know what to pay before you buy",
    body: "Buy-below + demand before cash sticks.",
    label: "Get the numbers",
    href: pricingBodyCtaHref(campaign),
  }
}
