import Link from "next/link"

export const metadata = { title: "Page not found — Resale IQ" }

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0B0D10", color: "#eef1f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#34C759", lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "16px 0 8px" }}>This page doesn&apos;t exist</h1>
        <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.6, marginBottom: 24 }}>
          The link may be broken, or the page may have moved.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none" }}>
            Go to dashboard
          </Link>
          <Link href="/" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", color: "#a9b6d0", fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none" }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
