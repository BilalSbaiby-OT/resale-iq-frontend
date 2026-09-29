import type { FaqItem } from "@/lib/faq-schema"

/**
 * Visible FAQ block that mirrors FAQPage JSON-LD. Keep `items` identical
 * to the array passed to faqPageJsonLd — schema that is not on the page
 * is a rich-result rejection.
 */
export function HubFaq({ items }: { items: FaqItem[] }) {
  return (
    <section style={{ marginTop: 34 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#eef1f7", marginBottom: 16, letterSpacing: "-0.4px" }}>
        Frequently asked questions
      </h2>
      {/* Collapsed by default (native <details>/<summary>) — the text is still
          in the HTML (crawlers and screen readers see it, FAQPage JSON-LD
          stays valid), it just doesn't count toward visible-on-load word
          count on a long hub page. No JS needed; keyboard-operable for free. */}
      {items.map((f) => (
        <details key={f.q} style={{ marginBottom: 10, border: "1px solid var(--color-border-ui)", borderRadius: 10, padding: "0 14px" }}>
          <summary style={{ cursor: "pointer", listStyle: "none", padding: "12px 0", fontSize: 15, fontWeight: 700, color: "#eef1f7", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            {f.q}
            <span aria-hidden style={{ color: "#a9b6d0", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>+</span>
          </summary>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: "#a9b6d0", margin: "0 0 14px" }}>{f.a}</p>
        </details>
      ))}
    </section>
  )
}
