import Link from "next/link"
import type { Metadata } from "next"
import { INTENTS } from "@/data/search-intents"
import { FreeChecker } from "@/components/tools/free-checker"

export const metadata: Metadata = {
  title: "Free Vinted Reseller Tools — Resale IQ",
  description:
    "Free tools for Vinted resellers: price checker, sourcing tool, resale analytics and profit calculator, built on 500,000+ listings across 5 EU markets.",
  alternates: { canonical: "/tools" },
}

export default function ToolsIndex() {
  return (
    <div style={{ background: "#0B0D10", color: "#c3cde0", minHeight: "100vh", padding: "44px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#22c55e", fontSize: 13, textDecoration: "none" }}>← Resale IQ</Link>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#eef1f7", margin: "20px 0 12px" }}>Free Vinted reseller tools</h1>
        <p style={{ fontSize: 15.5, color: "#8b99b8", lineHeight: 1.65, marginBottom: 26, maxWidth: 620 }}>
          Check any item free and get the headline verdict. The buy-below price, sell price, best sizes and sell-through
          come with a plan.
        </p>

        <FreeChecker />

        <div style={{ marginTop: 32, display: "grid", gap: 12 }}>
          {INTENTS.map((i) => (
            <Link key={i.slug} href={`/tools/${i.slug}`} style={{ display: "block", background: "#12151d", border: "1px solid #1c2333", borderRadius: 12, padding: "16px 18px", textDecoration: "none" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7" }}>{i.h1}</div>
              <div style={{ fontSize: 13.5, color: "#8b99b8", marginTop: 4, lineHeight: 1.55 }}>{i.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
