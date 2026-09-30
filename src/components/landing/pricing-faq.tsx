/**
 * PricingFaq — structured objection-handling section for /pricing.
 *
 * RESEARCH (fetched live 2026-09-29):
 *  - Fathom (usefathom.com/pricing): explicit FAQ section below plan cards —
 *    "Will you do a live demo?" / "What happens at trial end?" / feature questions.
 *    Pattern: every doubt gets a named answer, placed near the friction that raised it.
 *  - Linear (linear.app/pricing): feature comparison table + "trusted by 40,000 companies"
 *    with named customer logos. Proof placed AT the decision moment.
 *  - Keepa (keepa.com/pricing): product shown working FIRST, then pricing section.
 *
 * THE GAP: /pricing has verdict demos, TrustBlock, ROI card but ZERO explicit Q&A.
 * The 5 universal objections (works for me? worth it? hard to use? what if it fails?
 * can I trust them?) are not answered in one scannable place. Fathom solved this with
 * a short FAQ — visitors scroll the proof, reach plan cards, still hesitate, and the
 * FAQ below is their last stop before they leave or buy.
 *
 * PLACEMENT: below plan cards — visitor has seen the price and is at peak hesitation.
 * FAQ surfaces THERE, not before (that would add friction before the ask lands).
 *
 * CONTENT RULES (OVERNIGHT-MISSION.md §2):
 *  - Never fabricate a customer, testimonial, or review.
 *  - Catalog: 139 models / 21 brands (verified 2026-09-23).
 *  - 5 EU markets: ES, FR, DE, IT, PT (Vinted only — we are Vinted-specific).
 *  - Buy-below formula is canonical: avg × 0.95 × 0.70.
 *  - Withheld models → honest "we don't cover it" is always correct.
 *  - 30-day refund is in Terms (linked from paywall card already).
 *
 * CRO: #4 (objection handling NEXT TO the doubt) + #7 (trust before CTA — technically
 * after first CTA but before the visitor bounces) + #9 (every section must do a job —
 * this removes doubt, which reduces doubt). Revenue 2026-09-29. H167.
 *
 * H188 CRO: post-FAQ earned checkout CTA.
 * Pattern (fetched 2026-09-29): Fathom closes its FAQ with "Start your free trial" button.
 * Plausible closes its FAQ block with a "Start free trial" CTA. Linear closes with a
 * "Get started" link right after the comparison table + FAQ block.
 * The GAP: PricingFaq ended with just a closing border — no conversion path. A visitor
 * who read all 6 FAQ items has resolved every objection the page raised. That is the
 * highest-conviction visitor on the page. They reached the bottom with doubts answered
 * and faced: nothing. The sticky bar is the only CTA after FAQ, and it fires only if
 * the visitor has scrolled far enough and noticed it.
 * FIX: one GuestCheckoutButton immediately after the FAQ borderBottom — same "Start
 * for €19" text, same src="pricing_faq_cta" for analytics. No email input (CRO #6 —
 * this visitor is convinced; extra fields add friction at the moment of decision).
 * Email pre-filled from localStorage if captured earlier (same pattern as every other
 * CTA surface). CRO #10 (CTA discipline: convinced visitor → earned commit CTA)
 * + #12 (momentum: objections answered → ask immediately follows)
 * + #9 (friction: checkout surface at the exact right moment, no scroll-back needed).
 * Surface: /pricing 12/7d. Revenue 2026-09-30. H188.
 */
"use client"
import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { Locale } from "@/lib/i18n"

interface FaqItem {
  q: string
  a: string
  link?: { href: string; label: string }
}

const FAQS: FaqItem[] = [
  {
    // H193 CRO: trial objection first — card-hesitant visitors have this question before all others.
    // The plan cards say "€0 today, charged day 7" but no FAQ item addressed it.
    // CRO #4 (objection handling: "what if it fails?" immediately before the card ask) +
    // #7 (trust: honest answer to the card-hesitation converts better than silence).
    // Placed first because it is the blocking objection for anyone who saw the price cards
    // and scrolled to the FAQ instead of clicking — they need the trial answer before coverage.
    // Revenue 2026-09-30. H193.
    q: "What happens at the end of the 7-day trial?",
    a: "Your card is charged at the plan price on day 7. You will get an email reminder a few days before your first charge so you are never surprised. Cancel any time before then from your account page — no call, no confirmation screen, no retention trap. If you forget and get charged, email support@resaleiq.dev within 30 days for a full refund.",
  },
  {
    q: "Which markets does Resale IQ cover?",
    a: "All five major Vinted EU markets: Spain, France, Germany, Italy and Portugal. Data is ingested daily from live listings across all five — a jacket trending in FR shows up alongside the same jacket in DE.",
  },
  {
    q: "How is the buy-below price calculated?",
    a: "Average recent sale price × 0.95 × 0.70. The 0.70 multiplier targets a ~30% gross margin after Vinted buyer protection and seller fees. We only show the number when we have enough comparable sales to be confident — when the data is thin, we say so instead of guessing.",
  },
  {
    q: "What if my item isn't in the catalog?",
    a: "We currently track 139 brand/model combinations across 21 brands. If your item isn't there, the checker tells you honestly and suggests alternatives. New models are added regularly — you can see the full catalog on the data page.",
    link: { href: "/data", label: "Browse the full catalog →" },
  },
  {
    q: "Can I really cancel anytime?",
    a: "Yes. Cancel from your account page — no call, no confirmation flow, no retention screen. If you cancel within 30 days of your first payment and it wasn't useful, email support@resaleiq.dev for a full refund.",
  },
  {
    q: "How often is the data updated?",
    a: "Daily. Our scrapers run across all five Vinted markets every 24 hours. Sold listings, price movements, and new stock are reflected in the next day's verdicts. The timestamp of the last snapshot is shown on the data page.",
    link: { href: "/data", label: "See data freshness →" },
  },
  {
    q: "Is the buy-below price a guaranteed profit?",
    a: "No — and we will never claim it is. The buy-below is a decision threshold: if you can acquire the item at or below that number, the historical data suggests a profitable resale is likely. Individual results depend on your listing quality, timing, and negotiation. We show the evidence; you make the call.",
  },
]

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "16px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            lineHeight: 1.4,
          }}
        >
          {item.q}
        </span>
        {open ? (
          <ChevronUp size={16} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div style={{ paddingBottom: 16 }}>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--color-text-secondary)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {item.a}
          </p>
          {item.link && (
            <a
              href={item.link.href}
              style={{
                display: "inline-block",
                marginTop: 8,
                fontSize: 13,
                color: "#34C759",
                textDecoration: "none",
              }}
            >
              {item.link.label}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export function PricingFaq({ locale = "en" }: { locale?: Locale }) {
  // H188: pre-fill email from localStorage if captured by an earlier surface.
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])

  return (
    <div
      data-testid="riq-pricing-faq"
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "40px 24px 8px",
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          margin: "0 0 4px",
        }}
      >
        Common questions
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          margin: "0 0 24px",
          lineHeight: 1.5,
        }}
      >
        Honest answers — including the limits.
      </p>
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {FAQS.map((item) => (
          <FaqRow key={item.q} item={item} />
        ))}
      </div>
      {/* H188 CRO: earned checkout CTA after all objections are answered.
          A visitor who reached the end of the FAQ has resolved every doubt the page
          raised. No CTA was here before — they faced a closing border and nothing else.
          Fathom / Plausible / Linear all close their FAQ blocks with a checkout button.
          One button, email pre-filled, src="pricing_faq_cta" for analytics tracing.
          CRO #10 (earned commit CTA) + #12 (momentum: answer → ask) + #9 (no scroll-back). */}
      <div
        data-testid="riq-faq-cta"
        style={{
          marginTop: 28,
          textAlign: "center",
        }}
      >
        <GuestCheckoutButton
          locale={locale}
          src="pricing_faq_cta"
          customerEmail={capturedEmail}
        />
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
          Cancel anytime · 30-day refund policy
        </p>
      </div>
    </div>
  )
}
