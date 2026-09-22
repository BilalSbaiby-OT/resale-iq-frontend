import { LandingContent } from "@/components/landing/landing-content"
import { listingsTrackedLabel, listingsTrackedExact } from "@/lib/stats"
import { getMarketNumbers } from "@/lib/market-numbers"
import { getHeroVerdict } from "@/lib/hero-verdict"
import { formatHomeCite, getTeaserVerdict } from "@/lib/teaser-verdict"
import { getPublicBuyList } from "@/lib/ssr-buy-list"
import { copy } from "@/lib/i18n"
import { hreflangLanguages } from "@/lib/locale-routes"
import type { FaqItem } from "@/lib/faq-schema"

import type { Metadata } from "next"

// Visible FAQ + FAQPage on English `/` only. Compact pricing
// hides the /pricing FAQ, so this is the homepage’s own block — answers
// match hero copy, no invented stats, no /register, no UTM.
const HOME_FAQS: FaqItem[] = [
  {
    q: "What is Resale IQ?",
    a:
      "Resale IQ is demand intelligence for second-hand clothes. You already have suppliers — we tell you which items and models are worth buying to resell. Adidas Samba, Nike Air Force 1, and New Balance 530 can be checked on /tools with no account. Item checks start at €19 a month for every other model. Weekly brand volumes stay public at https://resaleiq.dev/data.",
  },
  {
    q: "Which clothes do you cover?",
    a:
      "Clothing brands and models we actually track — Nike, Adidas, Levi's, Zara, Gucci and the rest of the live catalog. Samba, Air Force 1, and NB 530 are free to check on https://resaleiq.dev/tools. Other item checks need Starter at €19 a month. Weekly volumes stay public at https://resaleiq.dev/data.",
  },
  {
    q: "What is a buy-below price?",
    a:
      "The most you can pay for a garment and still keep a healthy margin after fees. Samba, Air Force 1, and NB 530 return that ceiling for free. Other item-level numbers need Starter at €19 a month at https://resaleiq.dev/pricing. Public weekly volumes stay free at https://resaleiq.dev/data.",
  },
  {
    q: "What if you don’t track my item?",
    a:
      "A miss means that model is not in the catalog we watch — not that it has no demand, and not a number waiting behind Starter. New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 are the free samples. Weekly volumes for brands we publish stay at https://resaleiq.dev/data.",
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
  const samba = await getTeaserVerdict("Adidas Samba")
  const homeCite = formatHomeCite("Adidas Samba", samba)
  // SSR buy list for first-render proof — renders in initial HTML so the
  // reseller sees Stone Island BUY €70 / Fred Perry BUY €18 without waiting
  // for JS. HomeBuyList client component is kept as live-refresh fallback.
  const ssrBuyList = await getPublicBuyList(5)
  // Cite, example card, and first free chip are the same SKU (Samba).
  // 530 remains a free chip; it is no longer a second competing example.
  const example = samba ?? hero.result
  const exampleQuery = samba ? "Adidas Samba" : hero.query
  // H2 CRO: extract ?src= for message-match eyebrow (LLM referral) — Revenue 2026-09-15.
  const sp = searchParams ? await searchParams : {}
  const srcRaw = Array.isArray(sp.src) ? sp.src[0] : (sp.src ?? null)
  const llmSrc = (srcRaw === "perplexity" || srcRaw === "chatgpt" || srcRaw === "llm") ? srcRaw : null
  return (
    <LandingContent t={copy.en} locale="en" tracked={tracked} trackedExact={trackedExact} market={market} heroQuery={exampleQuery} heroResult={example} faqs={HOME_FAQS} llmSrc={llmSrc} homeCite={homeCite} ssrBuyList={ssrBuyList} />
  )
}
