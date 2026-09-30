import Link from "next/link"
import type { Metadata } from "next"
import { LINKABLE_POSTS } from "@/lib/related-links"
import { fillTracked, listingsTrackedLabel } from "@/lib/stats"
import { requestLocale } from "@/lib/request-locale"
import { canonicalPath } from "@/lib/locale-routes"
import { getPublicBuyList } from "@/lib/ssr-buy-list"
import { BlogIndexCheckoutCta } from "@/components/blog/blog-index-checkout-cta"
import { RoiExampleCard } from "@/components/landing/roi-example-card"
import { BlogIndexFreeChecker } from "@/components/blog/blog-index-free-checker"
import { getMarketNumbers } from "@/lib/market-numbers"

import { withFittedMetadata } from "@/lib/meta-fit"
import { breadcrumbJsonLd } from "@/lib/breadcrumbs"
async function generateMetadataRaw(): Promise<Metadata> {
  const tracked = await listingsTrackedLabel()
  const desc = `Practical guides for Vinted resellers backed by ${tracked} tracked listings across Spain, France, Germany, Italy and Portugal. What sells, how to price it, and whether to buy.`
  return {
    title: "Resale IQ Blog — Vinted Reseller Guides & Market Data",
    description: desc,
    alternates: { canonical: "https://resaleiq.dev/blog" },
    openGraph: {
      title: "Resale IQ Blog — Vinted Reseller Guides & Market Data",
      description: desc,
      url: "https://resaleiq.dev/blog",
      siteName: "Resale IQ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Resale IQ Blog — Vinted Reseller Guides & Market Data",
      description: desc,
    },
  }
}

export default async function BlogIndex() {
  const locale = await requestLocale()
  const tracked = await listingsTrackedLabel()
  const posts = fillTracked([...LINKABLE_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1)), tracked)
  // H77 CRO: fetch live buy-list so the blog index proves the product BEFORE the
  // post list. /blog gets 130 weekly visitors — the highest-traffic page outside
  // the homepage — but showed ZERO live data. Visitor from ChatGPT sees article
  // titles and nothing showing the tool working.
  // Same SSR proof strip used on /pricing (H66) and homepage (H75): rows are
  // clickable → /tools pre-filled → paywall at moment of intent.
  // Revenue 2026-09-23.
  // H130 CRO: increased from 4→8 so showLockedFomo gets 2 locked rows (FOMO)
  // instead of 1 (3 free + 1 locked with limit=4). Same as /pricing (8). 2026-09-28.
  const [buyList, market] = await Promise.all([
    getPublicBuyList(8).catch(() => null),
    getMarketNumbers().catch(() => null),
  ])

  // H164 CRO: live "what's selling" paragraph — replaces hardcoded numbers that
  // became stale immediately after publishing (H161). The paragraph carries today's
  // date, so stale numbers are a credibility failure: a fact-checker sees "updated
  // 2026-09-29" and checks — Stone Island 279 vs live 268 is provable on-page.
  // Building from the same getMarketNumbers() call used on /pricing and the homepage:
  // zero extra requests, identical source to every other published number.
  // CRO #1 (clarity: honest, current) + #7 (trust: numbers that match the site).
  // Never renders when market is unavailable — falls back to null silently.
  // Revenue 2026-09-29. H164.
  const liveSellingParagraph = (() => {
    if (!market || !market.brandNames.length) return null
    const brands = market.brandNames
      .slice(0, 5)
      .map(name => ({ name, f: market.get(name) }))
      .filter((b): b is { name: string; f: NonNullable<ReturnType<typeof market.get>> } => b.f !== null && b.f.sold_7d != null)
    if (brands.length < 3) return null
    const date = new Date().toISOString().slice(0, 10)
    const parts = brands.map(({ name, f }) => {
      const sold = f.sold_7d!.toLocaleString("en-GB")
      const avg = f.avg_price_eur != null ? ` averaging €${Math.round(f.avg_price_eur)}` : ""
      const cats = f.top_categories?.slice(0, 1)[0]
      const catNote = cats ? ` (mostly ${cats.toLowerCase()})` : ""
      return `${name} at ${sold} departures${catNote}${avg}`
    })
    return `What\u2019s selling on Vinted this week (updated ${date}): ${parts.join("; ")}. Observed active-to-sold transitions over the trailing 7 days across 5 EU markets\u2014a directional lower bound, useful for comparing brands. Full rankings at resaleiq.dev/data, sourced from ${tracked} tracked listings.`
  })()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Resale IQ Blog",
    url: "https://resaleiq.dev/blog",
    description:
      `Data-backed guides for Vinted resellers, from ${await listingsTrackedLabel()} analyzed listings across 5 EU markets.`,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `https://resaleiq.dev/blog/${p.slug}`,
    })),
  }

  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh", padding: "48px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbJsonLd([["Resale IQ", "/"], ["Blog", "/blog"]])]) }} />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--color-buy-ink)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", minHeight: 44}}>← Resale IQ</Link>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.6px", color: "var(--color-text-primary)", margin: "22px 0 8px" }}>The Resale IQ Blog</h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginBottom: 32, lineHeight: 1.6, maxWidth: 620 }}>
          Data-backed guides for Vinted resellers — what sells, how to price, and how to source profitably.
          Built on {tracked} analyzed listings across 5 EU markets.
        </p>

        {/* H164 CRO: live "what's selling" paragraph — replaces H161's hardcoded numbers
            with live data from getMarketNumbers() (same source as /pricing and homepage).
            The paragraph carries today's date; stale numbers are a credibility failure for
            AI crawlers that cross-reference the site's other pages. Numbers now match
            /data exactly. Falls back to null when market is unavailable — no render,
            no wrong numbers. CRO #1 (clarity: honest) + #7 (trust: reproducible numbers).
            Revenue 2026-09-29. H164. */}
        {liveSellingParagraph && (
          <p style={{ fontSize: 13.5, color: "var(--color-text-body)", lineHeight: 1.7, marginBottom: 28, padding: "16px 18px", background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 10 }}>
            {liveSellingParagraph}{" "}
            <Link href="/data" style={{ color: "var(--color-buy-ink)", textDecoration: "none" }}>See full rankings →</Link>
          </p>
        )}

        {/* DECLUTTER (founder feedback 2026-09-28/29): the pasted buy-list
            proof strip above the article list is gone — /blog is an index,
            not a second sales page. A short text link sends anyone who wants
            to see the tool working straight to /tools instead. */}
        <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginBottom: 32 }}>
          Want to see it work first? <Link href="/tools" style={{ color: "var(--color-buy-ink)", textDecoration: "none" }}>Try a free check →</Link>
        </p>

        {/* H162 CRO: interactive free checker on /blog index — 130/7d visitors with
            zero product experience before this. Three free sample chips (AF1/Samba/Fred Perry Polo)
            return live verdicts inline, no navigation required. After the verdict: email
            capture + GuestCheckoutButton at peak conviction. "Check YOUR item" input
            handles custom queries → 402 PAYWALL → comparable_n → personalized ask.
            Plausible/Fathom pattern: experience the product on the page, THEN pay.
            Placed between the buy-list strip and the article list so the visitor's path
            is: see live BUY rows → try the tool → see your item priced → convert.
            CRO #4 (does it work?) + #7 (trust: live data) + #12 (experience → ask).
            Revenue 2026-09-29. H162. */}
        <BlogIndexFreeChecker locale={locale} buyListPreview={buyList} />

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 14px" }}>
          All guides
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              style={{ display: "block", background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: "18px 20px", textDecoration: "none" }}
            >
              <div style={{ fontSize: 11, color: "var(--color-buy-ink)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
                {p.category} · {p.readMins} min read
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", margin: "6px 0" }}>{p.title}</div>
              <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>{p.description}</div>
            </Link>
          ))}
        </div>

        {/* The guides are the site's strongest pages by a wide margin — Search
            Console for 2026-07-30..08-26 put 84% of all impressions on /blog/*,
            against 4% for the 156 /flip URLs and zero for the nine /category ones.
            Sending readers (and crawlers) from here into the data pages is the
            cheapest way to share that standing. */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", margin: "40px 0 10px" }}>
          Go straight to the numbers
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-body)", lineHeight: 1.7, marginBottom: 14 }}>
          The guides explain the method. The data pages apply it to live listings:{" "}
          <Link href="/flip" style={{ color: "var(--color-buy-ink)", textDecoration: "none" }}>
            every tracked brand ranked by what it sells each week
          </Link>
          ,{" "}
          <Link href="/category" style={{ color: "var(--color-buy-ink)", textDecoration: "none" }}>
            every category ranked by which brands move in it
          </Link>
          , and the{" "}
          <Link href="/data" style={{ color: "var(--color-buy-ink)", textDecoration: "none" }}>
            full weekly market data
          </Link>
          , published free.
        </p>

        {/* Founder feedback 2026-09-29: /partners had no inbound links anywhere on
            the site. /blog has no shared <footer> either — smallest honest fix,
            same pattern as the /pricing link just added. */}
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 14 }}>
          <Link href="/partners" style={{ color: "var(--color-text-muted)", textDecoration: "underline" }}>
            Partners / Affiliate programme
          </Link>
        </p>

        {/* H160 CRO: ROI worked example on /blog index — conviction before ask (130/7d).
            /blog has the buy-list proof strip (H77) but sends visitors straight to a generic
            checkout CTA with no concrete payback example. Homepage + /pricing both show
            RoiExampleCard ("Buy X at €Y, flip for ~€Z margin — covers your Starter month")
            and it is the single most objection-specific component in the codebase.
            /blog (130/7d, highest-traffic) was missing it entirely.
            buyList already fetched above (no extra request). Renders nothing when no
            suitable row is available — zero-risk.
            CRO #4 (objection: worth it?) + #8 (specificity: real €€€ not "save money")
            + #12 (demonstration → conviction → ask). Revenue 2026-09-29. H160. */}
        {buyList && buyList.length > 0 && (
          <RoiExampleCard items={buyList} />
        )}

        <div style={{ marginTop: 40, padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)" }}>Stop guessing what sells.</div>
          <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", margin: "8px 0 16px" }}>
            Get a data-backed BUY / WATCH / SKIP on any item — buy-below price, best sizes, sell-through.
          </p>
          {/* H96 CRO: direct Stripe checkout replaces SmartCTA → /pricing detour.
              /blog gets 130 visitors/7d. The old "Get the numbers" SmartCTA sent cold
              visitors to /pricing — adding an entire navigation step before they could
              reach Stripe. BlogIndexCheckoutCta goes direct to Stripe for anon visitors,
              keeps "Open dashboard →" for paid accounts.
              CRO #10 (CTA discipline: solution-aware → direct CTA) + #12 (conversion
              momentum: intent built on the page, don't defer it). Revenue 2026-09-23. */}
          <BlogIndexCheckoutCta locale={locale} />
          {/* Fine-print refund line below /blog CTA */}
          <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 10, marginBottom: 0, lineHeight: 1.5 }}>
            <a href="/terms" style={{ color: "var(--color-text-muted)", textDecoration: "underline" }}>Full refund within 30 days of your first payment — see Terms</a>
          </p>
          {/* Paid door is /pricing with organic/blog UTMs, not the signup wall. */}
          <div style={{ marginTop: 10 }}>
            <Link href="/pricing?src=blog_index" style={{ color: "var(--color-text-muted)", fontSize: 13, textDecoration: "underline" }}>
              See plans — from €19/mo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Length-fit title/description (<=60/<=160) for every variant this generator returns.
export const generateMetadata = withFittedMetadata(generateMetadataRaw)
