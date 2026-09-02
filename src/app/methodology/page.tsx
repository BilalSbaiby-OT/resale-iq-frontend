import Link from "next/link"
import type { Metadata } from "next"
import { listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers, fmtCount } from "@/lib/market-numbers"
import { TRIAL_LIMITS_SENTENCE } from "@/lib/trial-copy"
import { methodology } from "@/lib/methodology-copy"
import type { Locale } from "@/lib/i18n"
import { canonicalPath, hreflangLanguages } from "@/lib/locale-routes"

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
  alternates: { canonical: "/methodology", languages: hreflangLanguages("/methodology") },
  openGraph: {
    title: "Methodology — how Resale IQ calculates every number",
    description:
      "The formulas, the refresh cadence, and an honest list of what our data cannot do.",
    type: "article",
  },
}

// methodology-copy.ts stores its 58 values as plain TS string literals. Three
// of them (verified across all 6 locales) contain an HTML named entity --
// &apos; in "en" text9, &ldquo;/&rdquo; and &ndash; in text19/text25 in every
// locale -- because they were extracted from JSX where that same entity sat
// as literal text and the JSX compiler decodes entities written that way.
// A TS string literal never does that decoding, and neither does a JSX
// *expression* ({t.textN}) the way literal JSX text does, so piping these
// straight through would render the literal characters "&apos;" on the page
// instead of an apostrophe. Decode the handful the copy file actually uses
// rather than pull in a dependency for three named entities.
const COPY_ENTITIES: Record<string, string> = {
  "&apos;": "'", // U+0027 -- matches what JSX's own &apos; decode produces
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&ndash;": "–",
}
function decodeCopyEntities<T extends Record<string, string>>(obj: T): T {
  const out = {} as T
  for (const k of Object.keys(obj) as (keyof T)[]) {
    out[k] = (obj[k] as string).replace(/&(?:apos|ldquo|rdquo|ndash);/g, (m) => COPY_ENTITIES[m]) as T[typeof k]
  }
  return out
}

// `locale` defaults to "en" so the un-prefixed /methodology route (this
// file) is unchanged; src/app/[locale]/methodology/page.tsx imports this
// same function and passes the path locale. Every string below that comes
// from `t` (methodology(locale)) is verified translated in all 6 locales —
// see methodology-copy.ts's own header. A handful of short fragments have
// no key yet (no key exists for them in any locale) and are left as literal
// English on purpose, identically in every locale, rather than guessed at
// here — grep this file for "no key yet" to find them.
export async function MethodologyPage({ locale = "en" }: { locale?: Locale } = {}) {
  const t = decodeCopyEntities(methodology(locale))
  const tracked = await listingsTrackedLabel()
  const market = await getMarketNumbers()
  const weekly = market.brandNames.reduce((s, name) => {
    const n = market.get(name)?.sold_7d
    return s + (typeof n === "number" ? n : 0)
  }, 0)

  const faq = [
    { q: t.faq0_q, a: t.faq0_a },
    { q: t.faq1_q, a: t.faq1_a },
    { q: t.faq2_q, a: t.faq2_a },
    { q: t.faq3_q, a: t.faq3_a },
    { q: t.faq4_q, a: t.faq4_a },
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
        "Live Vinted listings across Spain, France, Germany, Italy and Portugal, plus which ones leave the shelf, aggregated into per-brand and per-model resale signals.",
      url: `${BASE}${canonicalPath(locale, "/methodology")}`,
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
          {t.text0}
        </h1>
        <p style={{ fontSize: 16.5, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 12 }}>
          {t.text1}
        </p>
        <p style={{ fontSize: 15, color: "#8b99b8", lineHeight: 1.7, marginBottom: 32 }}>
          {t.text2} <Link href="/support" style={{ color: "#22c55e", textDecoration: "none" }}>support</Link>.
        </p>

        <Section title={t.section0}>
          <P>
            {t.text3}
          </P>
          <P>
            {/* no key yet: "left the shelf" has no translation key, left English in every locale */}
            We anchor on listings that{" "}
            <strong style={{ color: "#eef1f7" }}>left the shelf</strong>{t.text4}{" "}
            <strong style={{ color: "#eef1f7" }}>{t.text5}</strong>.
            {/* no key yet: this sentence has no translation key, left English in every locale */}
            {" "}We see a listing disappear from a Vinted search shelf, and we infer a sale at its last
            asking price. A departure is also consistent with the seller delisting it, an account
            ban, an offline sale at a different price, or the seller{" "}
            <strong style={{ color: "#eef1f7" }}>{t.text6}</strong> {t.text7}{" "}
            {/* no key yet: this clause has no translation key, left English in every locale */}
            <em>not</em> selling, so the items most likely
            to generate a fabricated &ldquo;sale&rdquo; are exactly the slow-moving ones a reseller
            most needs an honest warning about. We have not yet measured how often this happens.
            The price shown is therefore an{" "}
            <strong style={{ color: "#eef1f7" }}>{t.text8}</strong> {t.text9}
          </P>
          <P>
            {t.text10} <strong style={{ color: "#eef1f7" }}>watched</strong>{" "}
            {/* no key yet: the rest of this sentence has no translation key, left English in every locale */}
            a listing go from active to gone. Listings we first saw already gone are in the
            catalogue count, not in weekly departures. That is why listings tracked can be millions
            while weekly watched departures are in the hundreds or thousands — not because the
            market died, and not because a refresh zeroed the table.
          </P>
          {weekly > 0 && (
            <Callout label="Right now">
              {fmtCount(market.listingsTracked)} distinct listings tracked ·{" "}
              <strong style={{ color: "#eef1f7" }}>{fmtCount(weekly)} watched departures in 7 days</strong>
              {" "}across {market.brandCount} brands on the public table
              {market.brandsTracked != null ? ` (${market.brandsTracked} brands in the catalogue)` : ""}.
              Last calculated {market.stamp ?? "—"}.
            </Callout>
          )}
        </Section>

        <Section title={t.section1}>
          {/* no key yet: this table's cells have no translation keys, left English in every locale */}
          <Table rows={[
            ["Listing collection", "scheduled every 30 min/market, skips if busy", "measured 2026-09-02 from the scraper run log: 83% of gaps under 1h over the trailing 7 days (n=1,157); 58% under 1h over the last 48h during a current backlog"],
            ["Signal recomputation", "~every 2 hours", "scores, sell-through, buy-below — a slower cycle than collection; 0 skips observed in the same window"],
            ["Departure verification", "every 60 minutes", "confirms a listing left the shelf — not that it sold; 0 skips observed"],
            ["Public page refresh", "no page cache — live per request", "each request renders from the current database; not a 15-minute cache"],
          ]} />
          <P>
            {t.text12}
          </P>
        </Section>

        <Section title={t.section2}>
          <P>
            {t.text13}
          </P>
          <Code>{t.text14}</Code>
          <P>
            {t.text15}
            <Code>sold_observed=1</Code>{t.text16} <Code>sold_at</Code>{t.text17} <em>or</em>{" "}
            {t.text18}
          </P>
          <Callout label="Why this matters">
            {t.text19}
          </Callout>
        </Section>

        <Section title={t.section3}>
          <Code>{t.text20}</Code>
          {/* no key yet: this whole paragraph has no translation key, left English in every locale */}
          <P>
            <code style={{ color: "#8fe3b0" }}>avg_departure_price</code> is the average asking
            price of comparable listings at the moment they left the shelf — the closest honest
            proxy we have for a sale price, not an observed one (see &ldquo;Where the data comes
            from&rdquo; above). The 0.95 is the 5% platform deduction we model for Vinted. The
            0.70 targets roughly a 30% margin. Fee structures differ by platform, by market, and
            by whether you sell privately or as a business — and they change — so substitute your
            own figure if yours differs. The{" "}
            <Link href="/tools/vinted-profit-calculator" style={{ color: "#22c55e", textDecoration: "none" }}>profit calculator</Link>{" "}
            applies current per-platform rates across Vinted, Depop, eBay, Poshmark, StockX and GOAT.
          </P>
        </Section>

        <Section title={t.section4}>
          <P>
            {t.text21}
          </P>
          {/* no key yet: this table's cells have no translation keys, left English in every locale */}
          <Table rows={[
            ["HIGH", "≥ 30 comparable departures and quality ≥ 70", "snapshot younger than 48 hours"],
            ["MEDIUM", "≥ 10 comparable departures and quality ≥ 40", "or HIGH but the snapshot is stale"],
            ["LOW", "thinner than that", "always paired with “Only N comparable departures”"],
          ]} />
          <Callout label="What LOW means">
            {t.text22}
          </Callout>
        </Section>

        <Section title={t.section5}>
          <P>
            {t.text23} <strong style={{ color: "#eef1f7" }}>{t.text24}</strong>
            {t.text25}
          </P>
          {/* no key yet: this table's cells have no translation keys, left English in every locale */}
          <Table rows={[
            ["75–100", "High confidence", "nothing unusual found"],
            ["50–74", "Moderate — verify", "some signals worth checking"],
            ["25–49", "Low confidence", "several unusual signals"],
            ["0–24", "Very low", "multiple red flags"],
          ]} />
          {/* no key yet: the opening clause has no translation key, left English in every locale */}
          <Callout label="What it is not" warm>
            It is <strong style={{ color: "#eef1f7" }}>not</strong> an authentication service and{" "}
            <strong style={{ color: "#eef1f7" }}>not</strong> {t.text26}
          </Callout>
        </Section>

        <Section title={t.section6}>
          <P>
            {t.text27}
          </P>
          <Bullets items={[
            t.bullet0_0,
            t.bullet0_1,
            t.bullet0_2,
            t.bullet0_3,
            t.bullet0_4,
            t.bullet0_5,
            t.bullet0_6,
          ]} />
        </Section>

        <Section title={t.section7}>
          <Bullets items={[
            t.bullet1_0,
            // no key yet: this sentence is figure-interpolated (${tracked}) and has
            // no translation key, left English in every locale on purpose — the
            // page's own edit rule is every figure here must be traceable to code.
            `Overstate the dataset. The site says ${tracked} because that is what COUNT(DISTINCT external_id) returns — the five Vinted domains are one catalogue, so a raw row count would say 2.8M and overstate by about 3x. We previously said 30M+, which came from a development database that does not serve this site. Both were corrected.`,
            t.bullet1_1,
          ]} />
        </Section>

        <div style={{ padding: "22px 24px", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12, marginTop: 32 }}>
          <div style={{ fontSize: 16.5, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>
            {t.text28}
          </div>
          {/* no key yet: this sentence is figure-interpolated (TRIAL_LIMITS_SENTENCE) and
              has no translation key, left English in every locale */}
          <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.65, marginBottom: 16 }}>
            The aggregate market data is public and free to cite with attribution. {TRIAL_LIMITS_SENTENCE} No card.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href="/register?plan=free" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              {t.text29}
            </Link>
            <Link href="/data" style={{ border: "1px solid #263147", color: "#8fa3c4", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              {t.text30}
            </Link>
            <Link href="/manual" style={{ border: "1px solid #263147", color: "#8fa3c4", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              {t.text31}
            </Link>
          </div>
        </div>

        {/* no key yet: "Questions" heading has no translation key, left English in every locale */}
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

export default MethodologyPage

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
