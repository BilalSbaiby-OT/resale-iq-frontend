"use client"

import { useState } from "react"

/** simpleicons slugs for clothing brands we track. Missing → wordmark. */
const ICON: Record<string, string> = {
  Nike: "nike",
  Adidas: "adidas",
  Puma: "puma",
  Gucci: "gucci",
  "Louis Vuitton": "louisvuitton",
  "The North Face": "thenorthface",
  "H&M": "hm",
  Zara: "zara",
  "Levi's": "levi",
  "New Balance": "newbalance",
  Vans: "vans",
  Supreme: "supreme",
  Carhartt: "carhartt",
  Uniqlo: "uniqlo",
  "Calvin Klein": "calvinklein",
  "Tommy Hilfiger": "tommy",
  "Ralph Lauren": "ralphlauren",
  // Patagonia + Balenciaga: simple-icons has no Balenciaga slug; Patagonia
  // 403s on the CDN. Missing → wordmark (see Mark).
}

function Mark({ name }: { name: string }) {
  const slug = ICON[name]
  const [dead, setDead] = useState(false)
  if (!slug || dead) {
    return <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em" }}>{name}</span>
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.simpleicons.org/${slug}/111111`}
      alt=""
      width={28}
      height={28}
      onError={() => setDead(true)}
    />
  )
}

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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              minWidth: 72,
              color: "var(--color-text-primary)",
              opacity: 0.85,
            }}
          >
            <Mark name={name} />
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{name}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
