"use client"

/** Shared "try one of these" chips. One implementation so verdict and the
 *  public checker cannot drift (check:dupes). */
export function ModelChips({
  examples, onPick, disabled, label, testId,
}: {
  examples: readonly string[]
  onPick: (ex: string) => void
  disabled: boolean
  label: string
  testId?: string
}) {
  return (
    <div style={{ marginTop: 12 }} data-testid={testId}>
      <div style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {examples.map(ex => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            disabled={disabled}
            style={{ background: "#1a2030", border: "1px solid #263147", color: "#c3cde0", fontSize: 12.5, padding: "7px 12px", borderRadius: 999, cursor: disabled ? "wait" : "pointer" }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
