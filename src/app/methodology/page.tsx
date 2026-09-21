import Link from "next/link"
import type { Metadata } from "next"
import { listingsTrackedLabel } from "@/lib/stats"
import { getMarketNumbers, fmtCount } from "@/lib/market-numbers"
import { TRIAL_LIMITS_SENTENCE_BY_LOCALE } from "@/lib/trial-copy"
import { methodology } from "@/lib/methodology-copy"
import type { Locale } from "@/lib/i18n"
import { canonicalPath, hreflangLanguages } from "@/lib/locale-routes"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"

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

// EX-PRICING-CTR — AEO title (how numbers are calculated). H1 stays text0.
const TITLE = "How Buy-Below and Every Number Are Calculated — Resale IQ"
const DESCRIPTION =
  "How buy-below and sell-through are calculated from watched Vinted listings, how often data refreshes, and what the numbers cannot tell you."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/methodology", languages: hreflangLanguages("/methodology") },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
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
// see methodology-copy.ts's own header, both the original 58 keys and the
// g_*/fresh*/conf*/auth* keys added to close the fragments that were still
// English on first ship of locale routing (all closed as of this commit;
// see methodology-copy.ts's changelog note for the source of each batch).
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
        <Link href={canonicalPath(locale)} style={{ color: "#34C759", textDecoration: "none", fontSize: 13 }}>← Resale IQ</Link>

        <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.6px", color: "#eef1f7", lineHeight: 1.16, margin: "22px 0 14px" }}>
          {t.text0}
        </h1>
        <p style={{ fontSize: 16.5, color: "#a9b6d0", lineHeight: 1.7, marginBottom: 12 }}>
          {t.text1}
        </p>
        <p style={{ fontSize: 15, color: "#8b99b8", lineHeight: 1.7, marginBottom: 32 }}>
          {t.text2} <Link href={canonicalPath(locale, "/support")} style={{ color: "#34C759", textDecoration: "none" }}>{t.g_support_link}</Link>.
        </p>

        <Section title={t.section0}>
          <P>
            {t.text3}
          </P>
          <P>
            {t.g_anchor_prefix}{" "}
            <strong style={{ color: "#eef1f7" }}>{t.g_leftshelf}</strong>{t.text4}{" "}
            <strong style={{ color: "#eef1f7" }}>{t.text5}</strong>.
            {" "}{t.g_disappear}{" "}
            <strong style={{ color: "#eef1f7" }}>{t.text6}</strong> {t.text7}{" "}
            {t.g_notselling}{" "}
            <strong style={{ color: "#eef1f7" }}>{t.text8}</strong> {t.text9}
          </P>
          <P>
            {t.text10} <strong style={{ color: "#eef1f7" }}>{t.g_watched}</strong>{" "}
            {t.g_departure_tail}
          </P>
          {weekly > 0 && (
            <Callout label={t.g_rightnow_label}>
              {fmtCount(market.listingsTracked)} {t.g_tracked_suffix} ·{" "}
              <strong style={{ color: "#eef1f7" }}>{fmtCount(weekly)} {t.g_departures_7d}</strong>
              {" "}{t.g_across} {market.brandCount} {t.g_brands_table}
              {market.brandsTracked != null ? ` (${market.brandsTracked} ${t.g_brands_catalogue})` : ""}.
              {" "}{t.g_last_calculated} {market.stamp ?? "—"}.
            </Callout>
          )}
        </Section>

        <Section title={t.section1}>
          <Table rows={[
            [t.fresh0_0, t.fresh0_1, t.fresh0_2],
            [t.fresh1_0, t.fresh1_1, t.fresh1_2],
            [t.fresh2_0, t.fresh2_1, t.fresh2_2],
            [t.fresh3_0, t.fresh3_1, t.fresh3_2],
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
          <Callout label={t.g_whyitmatters_label}>
            {t.text19}
          </Callout>
        </Section>

        <Section title={t.section3}>
          <Code>{t.text20}</Code>
          <P>
            <code style={{ color: "#8fe3b0" }}>avg_departure_price</code> {t.g_buybelow_a}{" "}
            &ldquo;{t.section0}&rdquo; {t.g_buybelow_b}{" "}
            <Link href="/tools/vinted-profit-calculator" style={{ color: "#34C759", textDecoration: "none" }}>{t.g_profit_calc}</Link>{" "}
            {t.g_buybelow_c}
          </P>
        </Section>

        <Section title={t.section4}>
          <P>
            {t.text21}
          </P>
          <Table rows={[
            ["HIGH", t.conf0_1, t.conf0_2],
            ["MEDIUM", t.conf1_1, t.conf1_2],
            ["LOW", t.conf2_1, t.conf2_2],
          ]} />
          <Callout label={t.g_lowmeans_label}>
            {t.text22}
          </Callout>
        </Section>

        <Section title={t.section5}>
          <P>
            {t.text23} <strong style={{ color: "#eef1f7" }}>{t.text24}</strong>
            {t.text25}
          </P>
          <Table rows={[
            ["75–100", t.auth0_1, t.auth0_2],
            ["50–74", t.auth1_1, t.auth1_2],
            ["25–49", t.auth2_1, t.auth2_2],
            ["0–24", t.auth3_1, t.auth3_2],
          ]} />
          <Callout label={t.g_whatnot_label} warm>
            {t.g_notauth_a} <strong style={{ color: "#eef1f7" }}>{t.g_not}</strong> {t.g_notauth_mid}{" "}
            <strong style={{ color: "#eef1f7" }}>{t.g_not}</strong> {t.text26}
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
            `${t.g_overstate_a} ${tracked} ${t.g_overstate_b}`,
            t.bullet1_1,
          ]} />
        </Section>

        <div style={{ padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, marginTop: 32 }}>
          <div style={{ fontSize: 16.5, fontWeight: 700, color: "#eef1f7", marginBottom: 8 }}>
            {t.text28}
          </div>
          <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.65, marginBottom: 16 }}>
            {t.g_cta_a} {TRIAL_LIMITS_SENTENCE_BY_LOCALE[locale]} {t.g_cta_b}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <GuestCheckoutButton locale={locale} label={t.text29} src="methodology" />
            <Link href="/data" style={{ border: "1px solid var(--color-border-2)", color: "#8fa3c4", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              {t.text30}
            </Link>
            <Link href="/manual" style={{ border: "1px solid var(--color-border-2)", color: "#8fa3c4", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 9, textDecoration: "none" }}>
              {t.text31}
            </Link>
          </div>
        </div>

        <section style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: "#eef1f7", marginBottom: 14 }}>{t.g_questions}</h2>
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
      <pre style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 10, padding: "13px 16px", fontSize: 13.5, color: "#8fe3b0", fontFamily: "ui-monospace, monospace", margin: 0 }}>
        {children}
      </pre>
    </div>
  )
}

function Callout({ label, warm, children }: { label: string; warm?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      background: warm ? "rgba(251,191,36,.06)" : "#12151d",
      borderLeft: `3px solid ${warm ? "#FF9F0A" : "#34C759"}`,
      borderRadius: "0 10px 10px 0", padding: "14px 18px", margin: "6px 0 16px",
    }}>
      <div style={{ fontSize: 11.5, color: warm ? "#FF9F0A" : "#34C759", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700, marginBottom: 6 }}>
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
            <tr key={a} style={{ borderTop: "1px solid var(--color-border-ui)" }}>
              <td style={{ padding: "10px 12px 10px 0", color: "#eef1f7", fontWeight: 600, whiteSpace: "nowrap" }}>{a}</td>
              <td style={{ padding: "10px 12px", color: "#34C759", whiteSpace: "nowrap" }}>{b}</td>
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
