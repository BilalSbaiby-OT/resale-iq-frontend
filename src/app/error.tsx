"use client"
import { useEffect } from "react"
import Link from "next/link"

// App Router error boundary. Catches render/runtime errors in any route and
// shows a friendly recovery screen instead of a white page or a stack trace.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Once Sentry is wired at deploy, report here. For now, console only.
    console.error("App error boundary:", error)
  }, [error])

  return (
    <div style={{ minHeight: "100vh", background: "#0B0D10", color: "#eef1f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#f87171", lineHeight: 1 }}>!</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "12px 0 8px" }}>Something went wrong</h1>
        <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.6, marginBottom: 24 }}>
          A temporary error stopped this page from loading. Trying again usually fixes it.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={reset} style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, border: "none", cursor: "pointer" }}>
            Try again
          </button>
          <Link href="/dashboard" style={{ background: "#12151d", border: "1px solid #1c2333", color: "#a9b6d0", fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
