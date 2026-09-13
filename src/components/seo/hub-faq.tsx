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
      {items.map((f) => (
        <div key={f.q} style={{ marginBottom: 18, borderBottom: "1px solid var(--color-border-ui)", paddingBottom: 16 }}>
          <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{f.q}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: "#a9b6d0", margin: 0 }}>{f.a}</p>
        </div>
      ))}
    </section>
  )
}
