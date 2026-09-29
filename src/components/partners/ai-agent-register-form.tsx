"use client"
/**
 * AiAgentRegisterForm — the human-friendly form on /partners that calls the
 * SAME backend endpoint an AI agent would call directly
 * (POST /api/public/affiliate/register). This is not a separate signup path;
 * it exists so a person who does not want to write a curl command can still
 * register themselves OR register an agent they operate.
 *
 * Shows the returned link + stats link once, and shows the token ONCE with an
 * explicit "copy it now, we cannot show it again" warning — the backend
 * contract states the token is "shown once", so this form must not re-fetch
 * or persist it anywhere a page reload could lose silently.
 *
 * Fails honestly: if the backend endpoint is not live yet (404/network error),
 * this shows a plain error rather than a fake success — never fabricate a
 * ref_code or link on a public page.
 */
import { useState } from "react"

type RegisterResponse = {
  ref_code: string
  link: string
  token: string
  stats_url: string
  terms_url?: string
  commission?: unknown
}

export function AiAgentRegisterForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isAgent, setIsAgent] = useState(false)
  const [agentName, setAgentName] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RegisterResponse | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!acceptTerms) {
      setError("You must accept the terms to register.")
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/public/affiliate/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          accept_terms: true,
          kind: isAgent ? "ai_agent" : "human",
          ...(name ? { name } : {}),
          ...(isAgent && agentName ? { agent_name: agentName } : {}),
        }),
      })
      if (res.status === 409) {
        setError("That email is already registered. Check your inbox for your existing link, or contact support@resaleiq.dev.")
        return
      }
      if (res.status === 429) {
        setError("Too many attempts — please wait a moment and try again.")
        return
      }
      if (!res.ok) {
        setError(`Registration is not available right now (status ${res.status}). Try again later or email support@resaleiq.dev.`)
        return
      }
      const data = (await res.json()) as RegisterResponse
      setResult(data)
    } catch (err) {
      // Shown to the visitor via setError below; also logged so a network
      // failure here (e.g. the backend endpoint not deployed yet) is
      // findable in the browser console, not just a silent form no-op.
      console.error("[ai-agent-register-form] register request failed:", err)
      setError("Could not reach the registration service. Try again later or email support@resaleiq.dev.")
    } finally {
      setBusy(false)
    }
  }

  if (result) {
    return (
      <div
        data-testid="riq-affiliate-register-result"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-buy)",
          borderRadius: 12,
          padding: "20px 20px",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 10 }}>
          You&apos;re registered — code {result.ref_code}
        </p>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 6 }}>Your link:</p>
        <code style={{ display: "block", fontSize: 13, background: "var(--color-bg-4)", borderRadius: 8, padding: "8px 10px", marginBottom: 12, wordBreak: "break-all" }}>
          {result.link}
        </code>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 6 }}>Your stats page:</p>
        <code style={{ display: "block", fontSize: 13, background: "var(--color-bg-4)", borderRadius: 8, padding: "8px 10px", marginBottom: 12, wordBreak: "break-all" }}>
          {result.stats_url}
        </code>
        <p style={{ fontSize: 12.5, color: "var(--color-warn, #f5a623)", fontWeight: 600, marginBottom: 6 }}>
          Your token (shown once — copy it now, it cannot be shown again):
        </p>
        <code style={{ display: "block", fontSize: 13, background: "var(--color-bg-4)", borderRadius: 8, padding: "8px 10px", wordBreak: "break-all" }}>
          {result.token}
        </code>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid="riq-affiliate-register-form"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-2)",
        borderRadius: 12,
        padding: "20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <label htmlFor="riq-aff-email" style={{ display: "block", fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 4 }}>
          Email
        </label>
        <input
          id="riq-aff-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-border-2)", background: "var(--color-bg)", color: "var(--color-text-primary)", fontSize: 14 }}
        />
      </div>
      <div>
        <label htmlFor="riq-aff-name" style={{ display: "block", fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 4 }}>
          Your name (optional)
        </label>
        <input
          id="riq-aff-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-border-2)", background: "var(--color-bg)", color: "var(--color-text-primary)", fontSize: 14 }}
        />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--color-text-body)" }}>
        <input type="checkbox" checked={isAgent} onChange={(e) => setIsAgent(e.target.checked)} />
        I&apos;m registering an AI agent
      </label>
      {isAgent && (
        <div>
          <label htmlFor="riq-aff-agent-name" style={{ display: "block", fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            Agent name
          </label>
          <input
            id="riq-aff-agent-name"
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-border-2)", background: "var(--color-bg)", color: "var(--color-text-primary)", fontSize: 14 }}
          />
        </div>
      )}
      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--color-text-body)", lineHeight: 1.4 }}>
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} style={{ marginTop: 2 }} />
        <span>
          I accept the <a href="#terms" style={{ color: "var(--color-buy)" }}>affiliate terms</a>, including responsibility for my
          agent&apos;s behaviour and disclosing this relationship wherever I share my link.
        </span>
      </label>
      {error && (
        <p role="alert" style={{ fontSize: 13, color: "#ff6961", margin: 0 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        style={{
          background: "var(--color-buy)",
          color: "var(--color-on-buy)",
          fontWeight: 700,
          fontSize: 14,
          padding: "12px 20px",
          borderRadius: 10,
          border: "none",
          cursor: busy ? "wait" : "pointer",
        }}
      >
        {busy ? "Registering…" : "Get my referral link"}
      </button>
    </form>
  )
}
