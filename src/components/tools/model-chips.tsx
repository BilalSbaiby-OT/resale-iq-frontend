"use client"

/** Shared "try one of these" chips. One implementation so verdict and the
 *  public checker cannot drift (check:dupes). */
export function ModelChips({
  examples, onPick, disabled, label, testId, align = "start",
}: {
  examples: readonly string[]
  onPick: (ex: string) => void
  disabled: boolean
  label: string
  testId?: string
  align?: "start" | "center"
}) {
  const centered = align === "center"
  return (
    <div
      className={centered ? "riq-model-chips riq-model-chips--center" : "riq-model-chips"}
      data-testid={testId}
    >
      <div className="riq-model-chips-label">
        {label}
      </div>
      <div className="riq-model-chips-row">
        {examples.map(ex => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            disabled={disabled}
            className="riq-model-chip"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
