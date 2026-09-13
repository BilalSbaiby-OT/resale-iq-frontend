/**
 * FAQPage JSON-LD for public hubs. Visible copy and schema must stay the
 * same strings — Google drops FAQ rich results when they diverge, and a
 * schema-only answer that invents a number is worse than no schema.
 *
 * Answers are plain text. No /register. No UTM query strings. Absolute
 * https://resaleiq.dev URLs are fine; campaign tags are not.
 */

export type FaqItem = { q: string; a: string }

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
}

/** Signup walls and campaign tags do not belong inside FAQ schema. */
export function faqAnswerIsClean(text: string): boolean {
  return !/\/register/i.test(text) && !/[?&]utm_/i.test(text)
}

export type DefinedTermItem = {
  name: string
  description: string
  url: string
}

/** Visible HTML is the source of truth — description must match the on-page lead. */
export function definedTermJsonLd(term: DefinedTermItem) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.name,
    description: term.description,
    url: term.url,
  }
}
