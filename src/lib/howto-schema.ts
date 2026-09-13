/**
 * HowTo JSON-LD for genuine process blog posts (EX-HOWTO-SCHEMA).
 *
 * Steps are taken from visible H2s (or the numbered checks already on the
 * page). Do not invent tools, supplies, times, or extra steps. FAQPage stays
 * on the page — this sits beside it.
 *
 * Schema text is plain. No /register. No UTM. Absolute https://resaleiq.dev
 * URLs only on the HowTo itself (the article URL).
 */

const SITE = "https://resaleiq.dev"
const LINK = /\[([^\]\n]+)\]\((\/[A-Za-z0-9\-._~/?#[\]@!$&'()*+,;=%]*)\)/g

export type HowToSource = {
  slug: string
  title: string
  description: string
  sections: { h: string; p: string[] }[]
}

export type HowToStepJsonLd = {
  "@type": "HowToStep"
  position: number
  name: string
  text: string
}

export type HowToJsonLd = {
  "@context": "https://schema.org"
  "@type": "HowTo"
  name: string
  description: string
  inLanguage: string
  url: string
  step: HowToStepJsonLd[]
}

/**
 * Only posts whose body is already a procedure. Adding a slug here without
 * matching on-page steps is the failure mode this allowlist exists to stop.
 */
export const PROCESS_HOWTO: Record<
  string,
  { inLanguage: string; skipHeadings?: string[]; numberedChecks?: boolean }
> = {
  "how-to-price-items-on-vinted": { inLanguage: "en" },
  "how-to-find-items-to-flip-on-vinted": { inLanguage: "en" },
  "how-to-get-more-views-on-vinted": { inLanguage: "en" },
  "thrift-store-flipping-guide": { inLanguage: "en" },
  // Title + last section already list four checks. Those numbered lines are
  // the procedure — not the recap heading wrapping them.
  "vinted-item-not-selling": { inLanguage: "en", numberedChecks: true },
  "como-poner-precio-en-vinted": {
    inLanguage: "es",
    skipHeadings: ["Qué miden esas cifras, y qué no"],
  },
}

export const PROCESS_HOWTO_SLUGS = Object.keys(PROCESS_HOWTO)

function stripLinks(text: string): string {
  LINK.lastIndex = 0
  return text.replace(LINK, "$1")
}

function stepNameFromInstruction(text: string): string {
  const clause = text.split(/[—.]/)[0]?.trim() ?? text
  if (clause.length >= 8 && clause.length <= 110) return clause
  return text.length <= 110 ? text : `${text.slice(0, 107).trimEnd()}…`
}

function numberedChecks(sections: HowToSource["sections"]): { name: string; text: string }[] {
  const found: { n: number; text: string }[] = []
  for (const s of sections) {
    for (const para of s.p) {
      const m = para.match(/^(\d+)\.\s+([\s\S]+)$/)
      if (!m) continue
      found.push({ n: Number(m[1]), text: stripLinks(m[2]).trim() })
    }
  }
  found.sort((a, b) => a.n - b.n)
  return found.map((row) => ({
    name: stepNameFromInstruction(row.text),
    text: row.text,
  }))
}

function headingSteps(
  sections: HowToSource["sections"],
  skipHeadings: string[],
): { name: string; text: string }[] {
  const skip = new Set(skipHeadings)
  const steps: { name: string; text: string }[] = []
  for (const s of sections) {
    if (skip.has(s.h)) continue
    const first = s.p.find((para) => stripLinks(para).trim().length > 0)
    if (!first) continue
    steps.push({ name: s.h, text: stripLinks(first).trim() })
  }
  return steps
}

/** Signup walls and campaign tags do not belong inside HowTo schema. */
export function howtoTextIsClean(text: string): boolean {
  return !/\/register/i.test(text) && !/[?&]utm_/i.test(text)
}

/**
 * Build HowTo JSON-LD from a post, or null when the slug is not a process
 * article / the body does not yield at least two real steps.
 */
export function howToJsonLd(post: HowToSource): HowToJsonLd | null {
  const cfg = PROCESS_HOWTO[post.slug]
  if (!cfg) return null

  const raw = cfg.numberedChecks
    ? numberedChecks(post.sections)
    : headingSteps(post.sections, cfg.skipHeadings ?? [])

  if (raw.length < 2) return null

  const step: HowToStepJsonLd[] = raw.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  }))

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.title,
    description: post.description,
    inLanguage: cfg.inLanguage,
    url: `${SITE}/blog/${post.slug}`,
    step,
  }
}
