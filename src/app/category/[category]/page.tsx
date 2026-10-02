import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { CATEGORIES, getCategory, catSlug, type CategoryEntry } from "@/lib/seo-categories"
import { getMarketNumbers, fmtEur } from "@/lib/market-numbers"
import { departureDisplay, departureSupportsConclusion } from "@/lib/departure-display"
import {
  categoryLeafTitle,
  categoryLeafDescription,
  articleSocialMeta,
  rankedBrandsPhrase,
} from "@/lib/flip-category-meta"
import { FreshnessNotice } from "@/components/ui/freshness-notice"
import { HubFaq } from "@/components/seo/hub-faq"
import { faqPageJsonLd } from "@/lib/faq-schema"

import { withFittedMetadata } from "@/lib/meta-fit"
import { RelatedLinks } from "@/components/seo/related-links"
// Programmatic SEO, cross-brand cut: one page per category, ranking every
// tracked brand by that category's own weekly watched-departure volume. This is the axis
// the brand pages can't answer — "I want to flip sneakers, which brand?" —
// and the ranking is data nobody else publishes.
//
// Exposure policy is unchanged from /flip: aggregate weekly volume and average
// price at departure only. No buy-below prices, no scores, no model names.
//
// Counts follow the display floor (departure-display.ts): under 5 an em-dash,
// 5-9 "<10", digits from 10. A RANKING claim ("has the most", "highest average
// price", "easy to shift") needs n >= 30 — on this board a third of the
// brand x category cells are below 10, and a brand with one departure must not
// head a table or win a "highest average" card.
export const revalidate = 900

const MARKETS = "Spain, France, Germany, Italy and Portugal"

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

async function generateMetadataRaw(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params
  const c = getCategory(category)
  if (!c) return { title: "Not found — Resale IQ" }
  const market = await getMarketNumbers()
  const entries = withLiveVolumes(c.entries, c.category, market)
  const top = entries.find(e => e.sold_7d != null)
  const title = categoryLeafTitle(c.category)
  const description = categoryLeafDescription({
    category: c.category,
    // Ranked rows only: c.entries is the frozen list of brand pages for this
    // category, including brands the live snapshot has no figure for.
    brandCount: entries.filter(e => e.sold_7d != null).length,
    topBrand: top && top.sold_7d != null ? top.brand : null,
    topSold: top?.sold_7d,
  })
  return articleSocialMeta(title, description, `/category/${c.slug}`)
}

interface LiveEntry {
  brand: string
  slug: string
  sold_7d: number | null
  avg_price_eur: number | null
}

/** Overlay live volumes. Missing live ≠ frozen JSON. */
function withLiveVolumes(entries: CategoryEntry[], category: string, market: Awaited<ReturnType<typeof getMarketNumbers>>): LiveEntry[] {
  return entries
    .map((e) => {
      const live = market.get(e.brand)
      const row = live?.categories.find((c) => c.category === category)
      return {
        brand: e.brand,
        slug: e.slug,
        sold_7d: row?.sold_7d ?? null,
        // The CATEGORY's own average price at departure. The brand-wide average
        // (`live.avg_price_eur`) is a different number and was being printed
        // beside this category's count.
        avg_price_eur: row?.avg_price_eur ?? null,
      }
    })
    .sort((a, b) => (b.sold_7d ?? -1) - (a.sold_7d ?? -1))
}

export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params
  const c = getCategory(category)
  if (!c) notFound()
  if (category !== c.slug) redirect(`/category/${c.slug}`)

  const market = await getMarketNumbers()
  const entries = withLiveVolumes(c.entries, c.category, market)
  const total = entries.reduce(
    (sum, e) => (e.sold_7d != null ? sum + e.sold_7d : sum),
    0,
  )
  const lower = c.category.toLowerCase()
  // Brands with a live figure in this category: what the table ranks and what
  // `total` sums. entries.length also counts brands that render an em-dash.
  const liveCount = entries.filter(e => e.sold_7d != null).length
  const top = entries.find(e => e.sold_7d != null) ?? entries[0]
  // A "highest average price" is a ranking: only brands with n >= 30 may win it.
  const dearest = [...entries]
    .filter(e => e.avg_price_eur != null && departureSupportsConclusion(e.sold_7d))
    .sort((a, b) => (b.avg_price_eur ?? 0) - (a.avg_price_eur ?? 0))[0]
  const topRanked = top != null && departureSupportsConclusion(top.sold_7d)
  const totalShown = departureDisplay(total > 0 ? total : null)

  // NO per-brand departure count anywhere on this page (founder decision
  // 2026-10-02): "only 6 Zara pants got sold" costs trust. The answer leads with
  // price; the ranking order (by weekly volume) stays, the numbers do not. Only
  // the category-wide total below is quoted.
  const answer =
    top && topRanked
      ? (dearest?.avg_price_eur != null
          ? `${c.category} on Vinted carry the most margin at ${dearest.brand}, with an average price at departure of ${fmtEur(dearest.avg_price_eur)}. `
          : "") +
        `${top.brand} is the brand with the most ${lower} leaving the shelf across ${MARKETS}. ` +
        `Volume and price pull in opposite directions: the high-volume brands move fast at thin margins, ` +
        `the expensive ones carry more margin per unit but sit longer.`
      : `${c.category} demand across ${MARKETS} is tracked live. No brand has enough watched departures in this snapshot to rank (we need at least 30 in a week), so check a specific model rather than a brand average.`

  const faqs = [
    {
      q: `Which brand sells the most ${lower} on Vinted?`,
      a: answer,
    },
    {
      q: `How many ${lower} leave the shelf on Vinted each week?`,
      a:
        liveCount > 0
          ? `${rankedBrandsPhrase(liveCount).replace(/^the/, "The")} ${liveCount === 1 ? "accounts" : "account"} for roughly ${totalShown.text} ` +
            `${lower} watched leaving the shelf per week across ${MARKETS}. That is tracked-brand volume, not the whole category — ` +
            `unbranded and untracked listings are not counted.`
          : `Weekly ${lower} volume for the brands on this page is not available in the current snapshot. ` +
            `Any figure here is tracked-brand volume, not the whole category.`,
    },
    {
      q: `How do I use this ${lower} ranking with buy-below?`,
      a:
        `Volume tells you ${lower} demand exists among tracked brands — it is not a buy-below. ` +
        `Buy-below is the most you should pay for a specific listing after fees. ` +
        `Weekly brand volumes stay public at https://resaleiq.dev/data. ` +
        `Item-level buy-below, sizes and BUY/WATCH/SKIP are on a paid plan at https://resaleiq.dev/pricing.`,
    },
  ]

  const jsonLd = [
    faqPageJsonLd(faqs),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Brands ranked by weekly ${lower} watched departures on Vinted`,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: entries.length,
      itemListElement: entries.slice(0, 10).map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.brand,
        url: `https://resaleiq.dev/flip/${e.slug}/${catSlug(c.category)}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resale IQ", item: "https://resaleiq.dev" },
        { "@type": "ListItem", position: 2, name: "Categories", item: "https://resaleiq.dev/category" },
        { "@type": "ListItem", position: 3, name: c.category, item: `https://resaleiq.dev/category/${c.slug}` },
      ],
    },
  ]

  const others = CATEGORIES.filter((x) => x.slug !== c.slug)

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ fontSize: 13, marginBottom: 18 }}>
          <Link href="/" style={{ color: "#34C759", textDecoration: "none" }}>Resale IQ</Link>
          <span style={{ color: "#3f4a63" }}> / </span>
          <Link href="/data" style={{ color: "#34C759", textDecoration: "none" }}>Market data</Link>
        </div>

        <FreshnessNotice stamp={market.stamp} updatedAt={market.updatedAt} stale={market.stale} />
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", lineHeight: 1.18, marginBottom: 14 }}>
          Best brands for reselling {lower} on Vinted
        </h1>
        <p style={{ fontSize: 16, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 24 }}>{answer}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            [totalShown.text, `${lower} left the shelf / week`],
            // 0 ranked brands is "no figure", not a count of zero: same em-dash rule as the other tiles.
            [liveCount > 0 ? String(liveCount) : "—", liveCount === 1 ? "brand ranked" : "brands ranked"],
            [dearest ? `${fmtEur(dearest.avg_price_eur)}` : "—", dearest ? `highest avg (${dearest.brand})` : "highest avg"],
          ].map(([v, l]) => (
            <div key={l} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#eef1f7" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#5b6b8c", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 12 }}>
          {c.category} on Vinted: brands ranked by weekly volume, with average price
        </h2>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 460 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#5b6b8c", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                <th style={{ padding: "8px 10px 8px 0", fontWeight: 600 }}>#</th>
                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Brand</th>
                <th style={{ padding: "8px 0 8px 10px", fontWeight: 600, textAlign: "right" }}>Avg price at departure</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.slug} style={{ borderTop: "1px solid var(--color-border-ui)" }}>
                  <td style={{ padding: "10px 10px 10px 0", color: "#5b6b8c" }}>{i + 1}</td>
                  <td style={{ padding: "10px" }}>
                    <Link href={`/flip/${e.slug}/${catSlug(c.category)}`} style={{ color: "#8fa3c4", textDecoration: "none", fontWeight: 600 }}>
                      {e.brand}
                    </Link>
                  </td>
                  <td style={{ padding: "10px 0 10px 10px", textAlign: "right", color: "#a9b6d0" }}>
                    {fmtEur(e.avg_price_eur)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: "#5b6b8c", lineHeight: 1.6, marginBottom: 28 }}>
          Brands are ordered by the listings we watched leave the shelf in the last 7 days across Vinted ES, FR, DE, IT and PT,
          for the brands Resale IQ tracks — a departure, not a confirmed sale (see{" "}
          <Link href="/methodology" style={{ color: "#8fa3c4" }}>methodology</Link>). Average price is the average asking price at
          departure for {lower} alone, not the brand&apos;s average across all its categories.
        </p>

        <section style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#eef1f7", marginBottom: 10 }}>
            How to read this ranking
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
            The top of the table is where the most listings leave the shelf, not where the profit is.{" "}
            A brand that moves quickly is easy to shift, which also means
            the supply side is crowded and the price is well known to everyone sourcing. The margin usually lives one or two
            rows down, or at the expensive end of the list where fewer people can afford the buy-in.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>
            Read the rank as competition. The brand at the top is the default choice for every reseller in the market.
            That is fine if you can source below everyone else, and a trap if you cannot.
          </p>
        </section>

        <HubFaq items={faqs} />

        <div style={{ padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>Check a specific item</div>
          <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 16px" }}>
            Category volume tells you demand exists. The verdict tells you whether this item, at this price, makes money.
          </p>
          <Link href={`/tools?q=${encodeURIComponent(`${top.brand} ${lower}`)}&src=cat-check`} style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}>
            Try a live check — {top.brand} {lower} →
          </Link>
          {/* Second, lower-emphasis door — this page and its 8 siblings had
              zero route to /pricing (measured live 2026-09-09). Primary CTA
              above is unchanged; this adds the offer without competing with it. */}
          <div style={{ marginTop: 14 }}>
            <Link href="/pricing?src=category" style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "underline" }}>
              See plans — from €19/mo
            </Link>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, color: "#5b6b8c", marginBottom: 10, letterSpacing: "0.1px" }}>Other categories</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/category/${o.slug}`} style={{
                fontSize: 13, color: "#a9b6d0", textDecoration: "none",
                background: "var(--color-surface)", border: "1px solid var(--color-border-ui)",
                borderRadius: 8, padding: "7px 12px",
              }}>
                {o.category}
              </Link>
            ))}
          </div>
          {/* Reciprocal links into the guides — see the same block on
              /flip/[brand]. The blog carries 84% of site impressions and now
              links into these pages; this closes the loop rather than ending it. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Link href="/blog/what-sells-best-on-vinted" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → What sells best on Vinted, by category and brand
            </Link>
            <Link href="/blog/seasonal-reselling-calendar" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → The seasonal calendar: what to buy, and when
            </Link>
            <Link href="/manual" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → The Vinted reselling manual: how to price, source and turn stock
            </Link>
            <Link href="/buy" style={{ color: "#8fa3c4", fontSize: 14, textDecoration: "none" }}>
              → What to pay — buy-below prices by brand &amp; category
            </Link>
          </div>
        </div>
        <RelatedLinks to={{ kind: "category", slug: c.slug }} />
      </div>
    </div>
  )
}

// Length-fit title/description (<=60/<=160) for every variant this generator returns.
export const generateMetadata = withFittedMetadata(generateMetadataRaw)
