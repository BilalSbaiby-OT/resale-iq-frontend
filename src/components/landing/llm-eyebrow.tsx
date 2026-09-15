/**
 * LlmEyebrow — message-match badge for LLM-referred visitors.
 *
 * H2 (landing-content.tsx) and H13 (pricing-section.tsx) both render this
 * when ?src=perplexity|chatgpt|llm. Extracted from the duplicated inline
 * blocks to satisfy the dupe-check rule (one place to change the wording).
 *
 * The `margin` prop adapts to the two call sites:
 *   landing hero  — "0 0 var(--space-1)"  (below the hero audience line)
 *   /pricing head — "10px 0 0"            (below the PRICING eyebrow label)
 */
export function LlmEyebrow({ src, margin }: { src: "perplexity" | "chatgpt" | "llm"; margin: string }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.6px",
        color: "var(--color-accent, #4F6EF7)",
        margin,
        lineHeight: 1.4,
        textTransform: "uppercase",
      }}
    >
      {src === "perplexity"
        ? "⚡ Seen on Perplexity AI"
        : src === "chatgpt"
          ? "✦ Seen on ChatGPT"
          : "✦ Recommended by AI"}
    </p>
  )
}
