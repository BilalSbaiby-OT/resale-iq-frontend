"use client"

/** Shared "try one of these" chips. One implementation so verdict and the
 *  public checker cannot drift (check:dupes). */
export function ModelChips({
  examples, onPick, disabled, label, testId, active,
}: {
  examples: readonly string[]
  onPick: (ex: string) => void
  disabled: boolean
  label: string
  testId?: string
  /** Highlight the chip that matches the example / current item. */
  active?: string | null
}) {
  const activeKey = active?.trim().toLowerCase() ?? ""
  return (
    <div className="riq-model-chips" data-testid={testId}>
      <div className="riq-model-chips-label">
        {label}
      </div>
      <div className="riq-model-chips-row">
        {examples.map(ex => {
          const pressed = activeKey.length > 0 && ex.toLowerCase() === activeKey
          return (
            <button
              key={ex}
              type="button"
              className="riq-model-chip"
              aria-pressed={pressed}
              onClick={() => onPick(ex)}
              disabled={disabled}
            >
              {ex}
            </button>
          )
        })}
      </div>
    </div>
  )
}
