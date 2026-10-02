import { departureDisplay } from "./departure-display.ts"

/**
 * The weekly watched-departure TOTAL as a bare count for a trust line
 * ("2,671 watched departures / week"). The name is historical: this is NOT a
 * sell-through rate — that is a share, and methodology-copy.ts forbids calling a
 * departure total "sell-through". It used to append "/wk", which printed
 * "2,671/wk watched departures / week" on /pricing.
 *
 * Goes through the display floor: "—" for an unknown or sub-floor total, never
 * a zero and never a frozen figure.
 */
export function formatSellThrough(n: number | null | undefined): string {
  const d = departureDisplay(n)
  return d.kind === "number" ? d.text : "—"
}
