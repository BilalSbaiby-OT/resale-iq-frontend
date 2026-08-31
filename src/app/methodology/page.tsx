import Link from "next/link"
import type { Metadata } from "next"
import { listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers, fmtCount } from "@/lib/market-numbers"
import { TRIAL_LIMITS_SENTENCE } from "@/lib/trial-copy"

// The trust page. Three questions kill conversion on a data product: where did
// the number come from, how old is it, and what does it actually mean. This
// answers all three in public, including the parts that are unflattering.
//
// Publishing limitations is the point, not a risk. Anyone can claim "900,000+
// listings"; almost nobody shows the formula and names what the data cannot do.
// A reseller deciding whether to trust a buy-below price is exactly the person
// who checks.
//
// RULE FOR EDITS: every figure here must be traceable to code. The refresh
// intervals come from config.py, the sell-through conversion from
// api/routes.py, the authenticity bands from engine/authenticity.py. If you
// change those, change this page in the same commit.
export const revalidate = 900

const BASE = "https://resaleiq.dev"

export const metadata: Metadata = {
  title: "Methodology — how Resale IQ calculates every number",
  description:
    "Exactly where our Vinted data comes from, how often it refreshes, how sell-through and buy-below prices are calculated, and what the data cannot tell you.",
  alternates: { canonical: "/methodology" },
  openGraph: {
    title: "Methodology — how Resale IQ calculates every number",
    description:
      "The formulas, the refresh cadence, and an honest list of what our data cannot do.",
    type: "article",
  },
}

export default async function MethodologyPage() {
  const tracked = await listingsTrackedLabel()
  const market = await getMarketNumbers()
  const weekly = market.brandNames.reduce((s, name) => {
    const n = market.get(name)?.sold_7d
    return s + (typeof n === "number" ? n : 0)
  }, 0)

  const faq = [
    {
      q: "How fresh is Resale IQ's Vinted data?",
      a: "The scraper runs about every 30 minutes across all five EU Vinted domains — measured on production, 97% of gaps land under an hour. Signals are recomputed on a slower cycle, roughly every 2 hours. Sold-item verification runs every 60 minutes, and public pages revalidate every 15 minutes. So a new listing is usually found within 30 minutes; the score built from it can lag up to about 2 hours behind that.",
    },
    {
      q: "How is sell-through rate calculated?",
      a: "Watched sales divided by watched sales plus still-listed items. Only transitions we observed (sold_observed). We withhold the percentage (null, not 0) when watched sales are below 30 or still-listed is 0 — that last case is the 100% hole, not a rate. Raw counts stay. We never label weekly turns as sell-through.",
    },
    {
      q: "How is the buy-below price calculated?",
      a: "Recent average sale price for that specific model, minus the platform deduction we model for Vinted (5%), multiplied by 0.70 to target roughly a 30% margin. Substitute your own fee figure if yours differs — the arithmetic does not care what the number is, only that you use the real one.",
    },
    {
      q: "What does HIGH / MEDIUM / LOW confidence mean?",
      a: "It is a band from data-quality score, comparable watched sales and snapshot recency — not a model guessing. HIGH needs at least 30 comparable sold items. LOW always says how many comparables we have. LOW is not a SKIP.",
    },
    {
      q: "Is the authenticity check a guarantee?",
      a: "No. It is a confidence score, not a verification, and it never sees the physical item. It weighs how far the price sits below market, seller trust signals and listing patterns, then returns a 0-100 score with a band. It cannot authenticate anything and must not be treated as a guarantee. For anything valuable, use a professional authentication service.",
    },
  ]

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Resale IQ Vinted market dataset",
      description:
        "Live and sold Vinted listings across Spain, France, Germany, Italy and Portugal, aggregated into per-brand and per-model resale signals.",
      url: `${BASE}/methodology`,
      creator: { "@type": "Organization", name: "Resale IQ", url: BASE },
      spatialCoverage: "Spain, France, Germany, Italy, Portugal",
      isAccessibleForFree: true,
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${BASE}/api/public/market-snapshot`,
      },
    },
  ]

  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", textDecoration: "none", fontSize: 13 }}>← Resale IQ</Link>

        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#eef1f7", lineHeight: 1.16, margin: "22px 0 14px" }}>
          How every number on this site is calculated
        </h1>
        <p style={{ fontSize: 16.5, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 12 }}>
          You are being asked to make buying decisions with our data. That is only reasonable if
          you can check how it is produced — so here is the whole method, including the parts
          that are unflattering.
        </p>
        <p style={{ fontSize: 15, color: "#8b99b8", lineHeight: 1.7, marginBottom: 32 }}>
          If a figure on this page ever disagrees with the product, the product is wrong and we
          want to hear about it: <Link href="/support" style={{ color: "#22c55e", textDecoration: "none" }}>support</Link>.
        </p>

        <Section title="Where the data comes from">
          <P>
            We continuously read public live and sold listings from all five main EU Vinted
            domains — Spain, France, Germany, Italy and Portugal. Nothing is bought from a
            third party. Prices and counts trace back to listings that actually existed;
            momentum and sell-through are ratios computed from them, not predictions.
          </P>
          <P>
            We anchor on <strong style={{ color: "#eef1f7" }}>sold</strong> listings, not active
            ones. Active listings tell you what sellers hope to get. Sold listings tell you what
            buyers agreed to pay. Most tools quote the former because it is far easier to collect.
          </P>
          <P>
            A sale on this site means we <strong style={{ color: "#eef1f7" }}>watched</strong> a
            listing go from active to gone. Listings we first saw already sold are in the
            catalogue count, not in weekly sold. That is why listings tracked can be millions
            while weekly observed sales are in the hundreds or thousands — not because the
            market died, and not because a refresh zeroed the table.
          </P>
          {weekly > 0 && (
            <Callout label="Right now">
              {fmtCount(market.listingsTracked)} distinct listings tracked ·{" "}
              <strong style={{ color: "#eef1f7" }}>{fmtCount(weekly)} watched sales in 7 days</strong>
              {" "}across {market.brandCount} brands on the public table
              {market.brandsTracked != null ? ` (${market.brandsTracked} brands in the catalogue)` : ""}.
              Last calculated {market.stamp ?? "—"}.
            </Callout>
          )}
        </Section>

        <Section title="How fresh it is">
          <Table rows={[
            ["Listing collection", "about every 30 minutes", "all 5 EU domains — measured on production, 97% of gaps under an hour"],
            ["Signal recomputation", "~every 2 hours", "scores, sell-through, buy-below — a slower cycle than collection"],
            ["Sold-item verification", "every 60 minutes", "confirms items actually sold"],
            ["Public page refresh", "every 15 minutes", "ISR on this site"],
          ]} />
          <P>
            So a new listing is usually in the dataset within 30 minutes; the signal computed
            from it — buy-below, sell-through, confidence — can lag up to about 2 hours behind
            that. We publish the measured cadence rather than a rounder number that sounds
            better, and this table is the one we correct first if the schedule ever changes.
          </P>
        </Section>

        <Section title="Sell-through rate — the formula">
          <P>
            Sell-through is the share of the universe we actually watched: items we
            saw listed and then saw sell, versus items still listed. It is not weekly
            turns (sold ÷ active × 100), which can exceed 100% and must never be
            labelled sell-through.
          </P>
          <Code>str = sold_observed / (sold_observed + active_listings) × 100</Code>
          <P>
            The numerator is only transitions we watched
            (<Code>sold_observed=1</Code>) — never a discovery-stamped <Code>sold_at</Code>.
            Null, not 0 or 100, when watched sales are below 30 <em>or</em> still-listed
            is 0 (active≤0 is the only way this share hits 100%). Raw sold and listed
            counts still show.
          </P>
          <Callout label="Why this matters">
            A tool showing you &ldquo;760% sell-through&rdquo; is not showing you a sell-through
            rate. It is showing you weekly turns and hoping you do not ask. 760 watched
            sales against 100 still listed is 88.4% — a share.
          </Callout>
        </Section>

        <Section title="Buy-below price — the formula">
          <Code>buy_below = avg_sale_price × 0.95 × 0.70</Code>
          <P>
            The 0.95 is the 5% platform deduction we model for Vinted. The 0.70 targets roughly a
            30% margin on the sale. Fee structures differ by platform, by market, and by whether
            you sell privately or as a business — and they change — so substitute your own figure
            if yours differs. The{" "}
            <Link href="/tools/vinted-profit-calculator" style={{ color: "#22c55e", textDecoration: "none" }}>profit calculator</Link>{" "}
            applies current per-platform rates across Vinted, Depop, eBay, Poshmark, StockX and GOAT.
          </P>
        </Section>

        <Section title="Verdict confidence — HIGH / MEDIUM / LOW">
          <P>
            Every BUY / WATCH / SKIP carries a confidence band from the data we actually have:
            data-quality score, comparable watched sales, and snapshot recency. It is not a
            model guessing how sure it is.
          </P>
          <Table rows={[
            ["HIGH", "≥ 30 comparable sold items and quality ≥ 70", "snapshot younger than 48 hours"],
            ["MEDIUM", "≥ 10 comparable sold items and quality ≥ 40", "or HIGH but the snapshot is stale"],
            ["LOW", "thinner than that", "always paired with “Only N comparable sold items”"],
          ]} />
          <Callout label="What LOW means">
            LOW is not a SKIP. It means we will not pretend precision we do not have.
            A call from four watched sales is labelled LOW on purpose.
          </Callout>
        </Section>

        <Section title="The authenticity check is a confidence score, not a verdict">
          <P>
            This one needs stating plainly because the downside of a misunderstanding is someone
            buying a fake. The check <strong style={{ color: "#eef1f7" }}>never sees the physical
            item</strong>. It reads a listing and weighs three things: how far the price sits below
            the real market for that model, seller trust signals, and patterns in how the listing
            is written and photographed. It returns a 0&ndash;100 confidence score in one of four bands.
          </P>
          <Table rows={[
            ["75–100", "High confidence", "nothing unusual found"],
            ["50–74", "Moderate — verify", "some signals worth checking"],
            ["25–49", "Low confidence", "several unusual signals"],
            ["0–24", "Very low", "multiple red flags"],
          ]} />
          <Callout label="What it is not" warm>
            It is <strong style={{ color: "#eef1f7" }}>not</strong> an authentication service and{" "}
            <strong style={{ color: "#eef1f7" }}>not</strong> a guarantee. A high score means we
            found nothing unusual in the listing — not that the item is genuine. A low score means
            the listing looks odd, which is sometimes just an unusual seller. For anything
            valuable, use a professional authentication service and your own inspection. We will
            not reimburse a purchase on the strength of this score.
          </Callout>
        </Section>

        <Section title="What this data cannot tell you">
          <P>
            Every dataset has edges. Ours are these, and we would rather you learn them here than
            discover them after a bad buy.
          </P>
          <Bullets items={[
            "Sale timestamps are when our tracker first saw an item marked sold, not the moment money changed hands. Vinted does not publish the transaction time.",
            "Days-to-sell is only directly observed for a very small fraction of items, because most sold items are first seen already sold. Speed is therefore inferred from weekly momentum against a monthly baseline for nearly all models, not measured per item.",
            "Momentum needs roughly 30 days of history to rank models against each other. Before that the board collapses onto STABLE — and we now say so in the product rather than showing confident labels we cannot support.",
            "Around 30–45% of listings fall into an 'Other' category because our multilingual keyword matching did not hit a term. That is a real bucket, not a discard bin, but it means category volumes understate reality.",
            "We track a fixed set of brands. A brand we do not track has no data here — that is coverage, not a market signal.",
            "For 11 of the tracked brands we have no per-model breakdown, either because the brand genuinely does not name its products (Zara, Pull&Bear, Bershka, Mango) or because our model catalogue has not been extended to them yet.",
          ]} />
        </Section>

        <Section title="What we will not do">
          <Bullets items={[
            "Quote an accuracy figure. We log every verdict to a prediction ledger so accuracy can be measured honestly later. Until enough of those have been scored against real outcomes, any number we published would be invented — so there isn't one.",
            `Overstate the dataset. The site says ${tracked} because that is what COUNT(DISTINCT external_id) returns — the five Vinted domains are one catalogue, so a raw row count would say 2.8M and overstate by about 3x. We previously said 30M+, which came from a development database that does not serve this site. Both were corrected.`,
            "Count the same listing five times. Vinted's five domains are largely one shared catalogue — most listings appear on several at an identical price. Summing per-country volumes inflates the total by roughly 2.5–3.5×. We publish one aggregated figure.",
          ]} />
        </Section>

        <div style={{ padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, marginTop: 32 }}>
          <div style={{ fontSize: 16.5, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>
            Check the data yourself
          </div>
          <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.65, marginBottom: 16 }}>
            The aggregate market data is public and free to cite with attribution. {TRIAL_LIMITS_SENTENCE} No card.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href="/register?plan=free" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              Create a free account
            </Link>
            <Link href="/data" style={{ border: "1px solid #263147", color: "#8fa3c4", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              Open market data
            </Link>
            <Link href="/manual" style={{ border: "1px solid #263147", color: "#8fa3c4", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              The reselling manual
            </Link>
          </div>
        </div>

        <section style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: "#eef1f7", marginBottom: 14 }}>Questions</h2>
          {faq.map((f) => (
            <div key={f.q} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>{f.q}</div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#a9b6d0" }}>{f.a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

/* ── presentational helpers ──────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#eef1f7", marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 15, lineHeight: 1.78, marginBottom: 14 }}>{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 16px" }}>
      <pre style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, padding: "13px 16px", fontSize: 13.5, color: "#8fe3b0", fontFamily: "ui-monospace, monospace", margin: 0 }}>
        {children}
      </pre>
    </div>
  )
}

function Callout({ label, warm, children }: { label: string; warm?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      background: warm ? "rgba(251,191,36,.06)" : "#12151d",
      borderLeft: `3px solid ${warm ? "#fbbf24" : "#22c55e"}`,
      borderRadius: "0 10px 10px 0", padding: "14px 18px", margin: "6px 0 16px",
    }}>
      <div style={{ fontSize: 11.5, color: warm ? "#fbbf24" : "#22c55e", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "#c3cde0" }}>{children}</div>
    </div>
  )
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 420 }}>
        <tbody>
          {rows.map(([a, b, c]) => (
            <tr key={a} style={{ borderTop: "1px solid #1c2333" }}>
              <td style={{ padding: "10px 12px 10px 0", color: "#eef1f7", fontWeight: 600, whiteSpace: "nowrap" }}>{a}</td>
              <td style={{ padding: "10px 12px", color: "#22c55e", whiteSpace: "nowrap" }}>{b}</td>
              <td style={{ padding: "10px 0 10px 12px", color: "#8b99b8" }}>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
      {items.map((t) => (
        <li key={t} style={{ display: "flex", gap: 10, fontSize: 14.5, lineHeight: 1.65, color: "#a9b6d0" }}>
          <span style={{ color: "#5b6b8c", flexShrink: 0 }}>—</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}
