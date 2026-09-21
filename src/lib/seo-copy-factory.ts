import type { LandingCopy } from "./seo-landings.ts"
import type { Locale } from "./i18n.ts"

export type SixCopy = Record<Locale, LandingCopy>

export function landingCopyOf(
  title: string, h1: string, description: string, intro: string, verdict: string,
  hA: string, pA1: string, pA2: string, hB: string, pB1: string, pB2: string,
  cap: string, head: string[], rows: string[][],
  faqs: LandingCopy["faqs"], ctaSub: string,
): LandingCopy {
  return {
    title, h1, description, intro, verdict,
    sections: [{ h: hA, p: [pA1, pA2] }, { h: hB, p: [pB1, pB2] }],
    table: { caption: cap, head, rows },
    faqs, ctaSub,
  }
}

export function cloneCopyOf(
  title: string, h1: string, description: string, intro: string, verdict: string,
  hA: string, pA1: string, pA2: string, hB: string, pB1: string, pB2: string,
  faqs: LandingCopy["faqs"], ctaSub: string,
): LandingCopy {
  return landingCopyOf(
    title, h1, description, intro, verdict,
    hA, pA1, pA2, hB, pB1, pB2,
    "", [], [],
    faqs, ctaSub,
  )
}

export function sixLocales(
  en: LandingCopy, es: LandingCopy, fr: LandingCopy, de: LandingCopy, it: LandingCopy, pt: LandingCopy,
): SixCopy {
  return { en, es, fr, de, it, pt }
}

export function packLanding(
  slug: string,
  en: Parameters<typeof landingCopyOf>,
  es: Parameters<typeof landingCopyOf>,
  fr: Parameters<typeof landingCopyOf>,
  de: Parameters<typeof landingCopyOf>,
  it: Parameters<typeof landingCopyOf>,
  pt: Parameters<typeof landingCopyOf>,
): [string, SixCopy] {
  return [slug, sixLocales(
    landingCopyOf(...en), landingCopyOf(...es), landingCopyOf(...fr),
    landingCopyOf(...de), landingCopyOf(...it), landingCopyOf(...pt),
  )]
}

export function packClone(
  slug: string,
  en: Parameters<typeof cloneCopyOf>,
  es: Parameters<typeof cloneCopyOf>,
  fr: Parameters<typeof cloneCopyOf>,
  de: Parameters<typeof cloneCopyOf>,
  it: Parameters<typeof cloneCopyOf>,
  pt: Parameters<typeof cloneCopyOf>,
): [string, SixCopy] {
  return [slug, sixLocales(
    cloneCopyOf(...en), cloneCopyOf(...es), cloneCopyOf(...fr),
    cloneCopyOf(...de), cloneCopyOf(...it), cloneCopyOf(...pt),
  )]
}
