import { BrandMark } from "./brand-marks"

/** Equal-height tiles. Local marks only — never a remote icon CDN. */
export function BrandStrip({ names }: { names: string[] }) {
  const shown = names.filter(Boolean).slice(0, 14)
  if (shown.length === 0) return null
  return (
    <section
      aria-label="Second-hand clothing brands we track"
      data-testid="riq-brand-strip"
      style={{ maxWidth: "var(--width-marketing)", margin: "0 auto", padding: "0 var(--space-3) var(--space-10)" }}
    >
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-muted)", margin: "0 0 var(--space-4)", textAlign: "center" }}>
        Second-hand clothes. These are the brands we watch.
      </p>
      <ul className="riq-brand-strip">
        {shown.map((name) => (
          <li key={name} className="riq-brand-item" title={name}>
            <BrandMark name={name} />
            <span className="riq-brand-name">{name}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
