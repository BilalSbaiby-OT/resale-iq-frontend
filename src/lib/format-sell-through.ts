export function formatSellThrough(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? `${n.toLocaleString("en-GB")}/wk` : "—"
}