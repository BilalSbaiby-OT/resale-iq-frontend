/**
 * Mid-article CTA for how-to blog posts.
 *
 * Do not send these blocks to the signup wall.
 *
 * SECONDARY DOOR IS NOW THE FREE CHECK (2026-09-22). This file used to say
 * "No free-check door", which was correct when nothing was free. It is stale:
 * every anonymous visitor now gets ONE full verdict before the paywall
 * (api/routes.py _claim_first_free_verdict), so a free door is an honest offer,
 * not a promise we cannot keep.
 *
 * Why it changed: /blog/what-sells-best-on-vinted is our single best acquisition
 * page — 82 unique humans in 30 days, 3x the next page — and every CTA on it
 * pointed at /pricing. Measured outcome over those 30 days: of all blog readers,
 * 2 reached /pricing and 0 paid. We were asking a cold reader for €19 before
 * showing them a single number, which is the same mistake that produced 287
 * Stripe sessions and 0 payments. The paid door stays (primary label is
 * unchanged); the cheap try-first door now sits beside it instead of a soft
 * /data cite.
 *
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

/** Former blog signup-wall paid door. Never `?plan=` on that path. */
export function pricingLegacySignupKillHref(campaign: string): string {
  return pricingUtmHref(campaign, "legacy_signup_kill")
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

/** Paid footer button that used to hit the blog signup wall. */
export function legacySignupKillHrefForPost(
  sections: ReadonlyArray<{ cta?: { href: string } }>,
): string {
  for (const s of sections) {
    const campaign = s.cta ? campaignFromPricingHref(s.cta.href) : null
    if (!campaign || !s.cta) continue
    if (isEsPricingHref(s.cta.href)) {
      return `/es/pricing?utm_source=organic&utm_medium=blog&utm_campaign=${campaign}&utm_content=legacy_signup_kill`
    }
    return pricingLegacySignupKillHref(campaign)
  }
  return pricingLegacySignupKillHref("ctr_blog_20260913")
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
    headline: "Know what sells before you buy",
    body: "Demand + whether to buy before cash sticks.",
    label: "Get the numbers",
    href: pricingMidCtaHref(campaign),
    // Try-first door. Was "/data" (a soft brand-volume cite, not the product).
    // One full verdict is genuinely free, so this is a real offer.
    secondaryLabel: "Or check one item free →",
    secondaryHref: `/tools?utm_source=organic&utm_medium=blog&utm_campaign=${campaign}&utm_content=mid_cta_free`,
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
    headline: "Know what sells before you buy",
    body: "Demand + whether to buy before cash sticks.",
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

/**
 * H42 CRO: Lower the CTA commitment step for posts with a preflightQuery.
 *
 * Cold anon readers on a /blog/[slug] post should have a try-first door before
 * seeing a pay-now door. For posts whose footer block already auto-runs a free
 * check (preflightQuery present), routing the secondary SmartCTA anon path to
 * /tools keeps the reader in a lower-commitment funnel step. The explicit
 * pricing door is preserved as the text link below the CTA.
 *
 * Posts without preflightQuery are unchanged — they fall back to the paid path.
 */
export function footerAnonHrefForPost(
  sections: ReadonlyArray<{ cta?: { href: string } }>,
  preflightQuery: string | undefined,
): string {
  if (preflightQuery) {
    return `/tools?q=${encodeURIComponent(preflightQuery)}&src=blog-footer-cta`
  }
  return legacySignupKillHrefForPost(sections)
}

/** Label paired with footerAnonHrefForPost. */
export function footerAnonLabelForPost(preflightQuery: string | undefined): string {
  return preflightQuery ? "Try it free →" : "Get the numbers"
}
