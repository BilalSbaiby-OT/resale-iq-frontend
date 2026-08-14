import type { BrandSeo } from "@/lib/seo-categories"

// Data-driven prose for the /flip/[brand] pages.
//
// WHY THIS EXISTS
// Measured 2026-08-14: every /flip page was 327 visible words, and the PROSE
// was ~100% identical brand to brand — only the numbers in the table and the
// brand name changed. A data *table* was added in an earlier pass, but the
// sentences around it stayed templated, so to a search engine 156 pages read as
// one page with a find-and-replace on the brand name. Google treats that as
// thin / doorway content and declines to rank it — which is a large part of why
// 227 indexed pages pulled ~21 humans/month.
//
// The fix is not more pages; it is making each page genuinely its own. These
// sentences are COMPUTED from the brand's real category numbers, so the words
// themselves differ per brand: which category leads, how wide the price spread
// is, whether it's a high-volume churn brand or a patient high-ticket one. Two
// brands produce two different paragraphs because they have two different
// shapes of data — that is what makes the page worth indexing and worth reading.
//
// Every claim traces to a number already shown on the page. Nothing is invented,
// and nothing asserts a measured accuracy or profit figure we do not have.

interface Cat { category: string; sold_7d: number; avg_price_eur: number }

const eur = (n: number) => `€${Math.round(n)}`
const k = (n: number) => n.toLocaleString("en-GB")

/**
 * 2–4 paragraphs of prose unique to this brand, or a single honest fallback
 * line when the brand has too little category data to say anything specific.
 * Returning fewer, true sentences beats padding a thin brand with boilerplate —
 * padding is the exact problem this replaces.
 */
export function brandNarrative(b: BrandSeo): string[] {
  const cats = (b.categories || [])
    .filter((c): c is Cat => !!c && typeof c.sold_7d === "number" && c.sold_7d > 0)
  if (cats.length < 2) {
    return [
      `${b.brand} moves about ${k(b.sold_7d)} items a week across the five EU Vinted ` +
      `markets at an average of ${eur(b.avg_price_eur)}. With only one category deep ` +
      `enough to report, the decision comes down to the specific model and size — ` +
      `check the exact piece before you buy rather than trusting the brand average.`,
    ]
  }

  const byVol = [...cats].sort((x, y) => y.sold_7d - x.sold_7d)
  const byPrice = [...cats].filter(c => c.avg_price_eur > 0).sort((x, y) => y.avg_price_eur - x.avg_price_eur)
  const topVol = byVol[0]
  const dear = byPrice[0]
  const cheap = byPrice[byPrice.length - 1]
  const paras: string[] = []

  // 1) Volume leader vs value leader — the core "which flip is this" insight.
  if (dear && cheap && topVol.category !== dear.category) {
    paras.push(
      `On Vinted, ${b.brand}'s highest-volume category is ${topVol.category.toLowerCase()} ` +
      `at about ${k(topVol.sold_7d)} sales a week (${eur(topVol.avg_price_eur)} average), ` +
      `while its priciest pieces are ${dear.category.toLowerCase()} at ${eur(dear.avg_price_eur)}. ` +
      `Those are two different games: one rewards turnover, the other rewards margin per ` +
      `item. Which one you play decides what you should be paying at the source.`,
    )
  } else {
    paras.push(
      `For ${b.brand}, ${topVol.category.toLowerCase()} leads on volume ` +
      `(~${k(topVol.sold_7d)} sold a week at ${eur(topVol.avg_price_eur)}) — the obvious ` +
      `place to start, and also the most crowded, so your buy-below discipline matters ` +
      `more here than anywhere else in the catalogue.`,
    )
  }

  // 2) Price spread across categories — wide spread and tight spread imply
  //    genuinely different sourcing advice, and the sentence says which.
  if (dear && cheap && cheap.avg_price_eur > 0) {
    const spread = dear.avg_price_eur / cheap.avg_price_eur
    if (spread >= 2.2) {
      paras.push(
        `${b.brand} prices run wide — from about ${eur(cheap.avg_price_eur)} for ` +
        `${cheap.category.toLowerCase()} to ${eur(dear.avg_price_eur)} for ` +
        `${dear.category.toLowerCase()}. Sourcing the cheap end only pays at volume; the ` +
        `real money is usually knowing which specific pieces sit at the top of that range ` +
        `before you buy, not after.`,
      )
    } else {
      paras.push(
        `${b.brand} sits in a fairly tight price band (roughly ${eur(cheap.avg_price_eur)} to ` +
        `${eur(dear.avg_price_eur)} across categories), so the category you buy matters less ` +
        `than the specific model and size. The average hides more than it tells you here.`,
      )
    }
  }

  // 3) Where the brand sits on the volume spectrum — a claim true only of THIS
  //    brand's number, and directly actionable.
  if (b.sold_7d >= 25000) {
    paras.push(
      `At ${k(b.sold_7d)} sales a week ${b.brand} is one of the highest-volume brands on ` +
      `the platform. High volume means high liquidity but also heavy competition, so the ` +
      `edge is not "can I sell it" — it is "did I buy it cheaply enough", every time.`,
    )
  } else if (b.sold_7d <= 6000) {
    paras.push(
      `${b.brand} is a lower-volume brand here at roughly ${k(b.sold_7d)} sales a week, ` +
      `which cuts both ways: less competition when you list, but you need the size and ` +
      `condition right or the piece can sit. Patience beats volume with a brand like this.`,
    )
  }

  return paras
}
