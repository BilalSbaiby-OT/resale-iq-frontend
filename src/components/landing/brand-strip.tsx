/** Text wordmarks only. Remote brand-logo CDNs 403 here; we never fetch them. */
export function BrandStrip({ names }: { names: string[] }) {
  const shown = names.filter(Boolean).slice(0, 14)
  if (shown.length === 0) return null
  return (
    <section
      aria-label="Second-hand clothing brands we track"
      style={{ maxWidth: "var(--width-marketing)", margin: "0 auto", padding: "0 var(--space-3) var(--space-10)" }}
    >
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-muted)", margin: "0 0 var(--space-4)", textAlign: "center" }}>
        Second-hand clothes. These are the brands we watch.
      </p>
      <ul
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "12px 20px",
          listStyle: "none",
          margin: 0,
          padding: 0,
          alignItems: "center",
        }}
      >
        {shown.map((name) => (
          <li
            key={name}
            title={name}
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              opacity: 0.85,
            }}
          >
            {name}
          </li>
        ))}
      </ul>
    </section>
  )
}
