import Link from "next/link"
import type { Metadata } from "next"
import { INTENTS as RAW_INTENTS } from "@/data/search-intents"
import { FreeChecker } from "@/components/tools/free-checker"
import { listingsTrackedLabel } from "@/lib/stats"
import { fillTracked } from "@/lib/stats"
import { WelcomeBanner } from "@/components/tools/welcome-banner"

export async function generateMetadata(): Promise<Metadata> {
  const tracked = await listingsTrackedLabel()
  return {
    title: "Free Vinted Reseller Tools — Resale IQ",
    description:
      `Free tools for Vinted resellers: price checker, sourcing tool, resale analytics and profit calculator, built on ${tracked} unique listings across 5 EU markets.`,
    alternates: { canonical: "/tools" },
  }
}

export default async function ToolsIndex() {
  const INTENTS = fillTracked(RAW_INTENTS, await listingsTrackedLabel())
  return (
    <div style={{ background: "var(--color-bg)", color: "#c3cde0", minHeight: "100vh", padding: "32px 16px 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <main id="main">
        <Link href="/" style={{ color: "var(--color-buy)", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--color-text-primary)", margin: "16px 0 10px", letterSpacing: "-0.4px" }}>Check the market before you buy</h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 20, maxWidth: 620 }}>
          Type the item in your hand. You get BUY, WATCH or SKIP, the most you should pay, and how many watched departures sit behind the number.
          Sell-through and sizes stay on a plan. Null is not zero.
        </p>

        <WelcomeBanner />
        <FreeChecker />

        <div style={{ marginTop: 36, display: "grid", gap: 12 }}>
          {INTENTS.map((i) => (
            <Link key={i.slug} href={`/tools/${i.slug}`} style={{ display: "block", background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 12, padding: "16px 18px", textDecoration: "none" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>{i.h1}</div>
              <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginTop: 4, lineHeight: 1.55 }}>{i.description}</div>
            </Link>
          ))}
        </div>
        </main>
      </div>
    </div>
  )
}
