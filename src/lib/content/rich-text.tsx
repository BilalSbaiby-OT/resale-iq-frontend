import Link from "next/link"
import type { ReactNode } from "react"

// Blog body copy is stored as plain strings in src/data/blog-posts*.ts, which
// meant no paragraph could contain a link. The measurable consequence: Search
// Console for 2026-07-30..08-26 put 84% of the site's impressions on /blog/*,
// and those pages linked to nothing but /blog and /register — none of that
// standing reached the 156 /flip URLs (4% of impressions) or the nine
// /category ones (zero).
//
// This parses a deliberately tiny subset of Markdown link syntax —
// `[label](/path)` — and nothing else. No bold, no images, no raw HTML: body
// copy is authored data, and the narrower the surface the fewer ways it can
// break a page or smuggle markup into the DOM.

// Internal paths only. An author cannot emit an outbound link, a javascript:
// URL, or a protocol-relative //evil.com from post data, because anything that
// is not a single leading slash simply fails to match.
const LINK = /\[([^\]\n]+)\]\((\/[A-Za-z0-9\-._~/?#[\]@!$&'()*+,;=%]*)\)/g

/**
 * Render one authored string, turning `[label](/path)` into a next/link.
 *
 * A string with no link syntax comes back as itself, so every existing post
 * renders byte-identically to before.
 */
export function renderRichText(text: string): ReactNode {
  if (!text.includes("[")) return text

  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null

  // exec with /g is stateful; the regex is module-scope, so reset before use.
  LINK.lastIndex = 0
  while ((m = LINK.exec(text)) !== null) {
    const [full, label, href] = m
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      <Link
        key={`${href}-${m.index}`}
        href={href}
        style={{ color: "#22c55e", textDecoration: "none", borderBottom: "1px solid #1c3327" }}
      >
        {label}
      </Link>,
    )
    last = m.index + full.length
  }

  if (last === 0) return text
  if (last < text.length) out.push(text.slice(last))
  return out
}

/**
 * The same string with link syntax flattened to its label.
 *
 * Required wherever authored copy is emitted as data rather than as DOM —
 * JSON-LD `acceptedAnswer.text` above all. A schema value containing a literal
 * `[label](/path)` is malformed to every consumer that reads it, and those
 * consumers (Google rich results, ChatGPT, Perplexity) are exactly the audience
 * the FAQ blocks exist for.
 */
export function stripRichText(text: string): string {
  LINK.lastIndex = 0
  return text.replace(LINK, "$1")
}

/** Paragraph wrapper so callers do not repeat the style block. */
export function RichParagraph({
  text,
  style,
}: {
  text: string
  style?: React.CSSProperties
}) {
  return <p style={style}>{renderRichText(text)}</p>
}
