import { brandMarkSrc, brandStripNames } from "@/lib/brand-marks"

/** Logo tiles only. No wordmarks. Brands without a local SVG are omitted. */
export function BrandStrip({ names }: { names: string[] }) {
  const shown = brandStripNames(names)
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
        {shown.map((name) => {
          const src = brandMarkSrc(name)
          if (!src) return null
          return (
            <li key={name} className="riq-brand-item" title={name}>
              <span className="riq-brand-mark">
                <img src={src} alt={name} width={28} height={28} />
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
