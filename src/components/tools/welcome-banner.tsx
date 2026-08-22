"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { chromeStoreUrl } from "@/components/landing/extension-hero"

function BannerInner() {
  const params = useSearchParams()
  if (params.get("welcome") !== "1") return null
  return (
    <div
      role="status"
      style={{
        marginBottom: 18,
        background: "rgba(34,197,94,.08)",
        border: "1px solid rgba(34,197,94,.28)",
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>
        Check your first item
      </div>
      <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginTop: 6, lineHeight: 1.55 }}>
        Type a brand and a real model you source — try <strong>Nike Air Force 1</strong>.
        A year or a brand-only search returns empty on purpose: we will not invent a shoe.
        <span className="hidden md:inline"> Then add the Chrome panel so the same number sits on the Vinted listing.</span>
      </p>
      <Link
        href={chromeStoreUrl()}
        className="hidden md:inline-block"
        style={{ marginTop: 10, color: "var(--color-buy)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
      >
        Add to Chrome →
      </Link>
    </div>
  )
}

export function WelcomeBanner() {
  return (
    <Suspense fallback={null}>
      <BannerInner />
    </Suspense>
  )
}
