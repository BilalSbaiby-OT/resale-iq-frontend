import { LandingContent } from "@/components/landing/landing-content"
import { listingsTrackedLabel, listingsTrackedExact } from "@/lib/stats"
import { getMarketNumbers } from "@/lib/market-numbers"
import { getHeroVerdict } from "@/lib/hero-verdict"
import { copy } from "@/lib/i18n"
import { hreflangLanguages } from "@/lib/locale-routes"
import type { FaqItem } from "@/lib/faq-schema"

import type { Metadata } from "next"

// Visible FAQ + FAQPage on English `/` only (3 Qs max). Compact pricing
// hides the /pricing FAQ, so this is the homepage’s own block — answers
// match hero copy, no invented stats, no /register, no UTM.
const HOME_FAQS: FaqItem[] = [
  {
    q: "What is Resale IQ?",
    a:
      "Resale IQ is demand intelligence for people who buy second-hand to resell. It answers what sells, what it is worth, and whether to buy at this price. Item checks start at €19 a month. Weekly brand volumes stay public at https://resaleiq.dev/data.",
  },
  {
    q: "Which markets does Resale IQ cover?",
    a:
      "Spain, France, Germany, Italy and Portugal. Those five EU markets are what the live market pulse and the public weekly volumes describe. Vinted is the first marketplace we watch; where you source can be anywhere.",
  },
  {
    q: "What is a buy-below price?",
    a:
      "The most you can pay for an item and still keep a healthy margin after fees. One search gives you that ceiling, plus a BUY, WATCH or SKIP call on whether to buy. Item-level buy-below numbers are on a paid plan at https://resaleiq.dev/pricing.",
  },
]

// The landing had NO metadata export, so "/" was the only page on the site
// without a self-referencing canonical — and www.resaleiq.dev serves a full
// 200 duplicate rather than redirecting, so Google saw two identical
// homepages and had nothing telling it which one to index. Deep pages were
// already fine: metadataBase makes their canonicals absolute to the apex.
//
// alternates.languages now emits the reciprocal hreflang block for the five
// translated homepages (src/app/[locale]/page.tsx), plus x-default -> "/".
// Before this, the site had ZERO hreflang anywhere and no /es /fr /de /it /pt
// paths existed at all — a translated page and a one-way (or missing) hreflang
// is treated by Google as noise, not a signal.
export const metadata: Metadata = {
  alternates: { canonical: "/", languages: hreflangLanguages() },
}

// Server Component ON PURPOSE. This is the site's most-linked page and its
// entire content must exist in the prerendered HTML — see RedirectIfAuthed for
// the full reasoning. Only the two genuinely interactive pieces (the signed-in
// redirect and the pricing section) are Client Components. Do not add
// "use client" here to get a hook; extract a child component instead.
//
// ALWAYS renders English. It used to read Accept-Language and silently swap
// in another language's copy with no URL change and no Vary header — the
// exact thing that made every translated page invisible to Google (a crawler
// does not send a meaningful Accept-Language, so it only ever saw English
// here regardless of what a browser saw). Language switching is now a URL
// decision: src/proxy.ts redirects a first-time visitor whose browser prefers
// a market we translate to "/<locale>"; "/" itself is the fixed English page
// those locale pages point x-default at.
export default async function Landing({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const tracked = await listingsTrackedLabel()
  // Exact in the proof band: it moves with every scrape, and a precise
  // figure is the harder claim. Anyone can write a round number.
  const trackedExact = await listingsTrackedExact()
  const market = await getMarketNumbers()
  const hero = await getHeroVerdict()
  // H2 CRO: extract ?src= for message-match eyebrow (LLM referral) — Revenue 2026-09-15.
  const sp = searchParams ? await searchParams : {}
  const srcRaw = Array.isArray(sp.src) ? sp.src[0] : (sp.src ?? null)
  const llmSrc = (srcRaw === "perplexity" || srcRaw === "chatgpt" || srcRaw === "llm") ? srcRaw : null
  return (
    <LandingContent t={copy.en} locale="en" tracked={tracked} trackedExact={trackedExact} market={market} heroQuery={hero.query} heroResult={hero.result} faqs={HOME_FAQS} llmSrc={llmSrc} />
  )
}
