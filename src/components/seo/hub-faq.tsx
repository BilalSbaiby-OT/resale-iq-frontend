import type { FaqItem } from "@/lib/faq-schema"

/**
 * Visible FAQ block that mirrors FAQPage JSON-LD. Keep `items` identical
 * to the array passed to faqPageJsonLd — schema that is not on the page
 * is a rich-result rejection.
 *
 * Colours come from the theme tokens (never hardcoded hex): the same block
 * renders on the dark app-adjacent hubs and on the light front door, and
 * hardcoded near-white text was invisible on the light homepage.
 * `flush` drops the hub-page top margin when the parent owns section spacing.
 */
export function HubFaq({ items, flush = false }: { items: FaqItem[]; flush?: boolean }) {
  return (
    <section className="riq-faq" data-testid="riq-faq" style={{ marginTop: flush ? 0 : 34 }}>
      <h2
        data-testid="riq-faq-heading"
        className={flush ? "riq-home-h2" : undefined}
        style={flush ? undefined : { fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 16, letterSpacing: "-0.4px" }}
      >
        Frequently asked questions
      </h2>
      {/* Collapsed by default (native <details>/<summary>) — the text is still
          in the HTML (crawlers and screen readers see it, FAQPage JSON-LD
          stays valid), it just doesn't count toward visible-on-load word
          count on a long hub page. No JS needed; keyboard-operable for free. */}
      {items.map((f) => (
        <details key={f.q} style={{ marginBottom: 10, border: "1px solid var(--color-border-2)", borderRadius: 10, padding: "0 14px", background: "var(--color-bg-2)" }}>
          <summary style={{ cursor: "pointer", listStyle: "none", padding: "12px 0", fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textAlign: "left" }}>
            {f.q}
            <span aria-hidden className="riq-faq-plus" style={{ color: "var(--color-text-secondary)", fontSize: 20, lineHeight: 1, flexShrink: 0 }}>+</span>
          </summary>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: "0 0 14px", textAlign: "left" }}>{f.a}</p>
        </details>
      ))}
    </section>
  )
}
