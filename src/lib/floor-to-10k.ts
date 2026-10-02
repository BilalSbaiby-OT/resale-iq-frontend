/**
 * Rounded DOWN to the nearest 10k, so a "+" claim stays true between refreshes.
 * Pure — safe to import from client components. Do not put warehouse/fs here.
 */
export function floorTo10k(n: number): string {
  return (Math.floor(n / 10_000) * 10_000).toLocaleString("en-GB")
}

/**
 * THE headline format for the dataset size: floored to the whole million,
 * with a "+" — 14,334,127 -> "14M+".
 *
 * Why a whole million and not floorTo10k: the 10k floor moved every ~2.5 hours
 * at ~96k records/day, so the same page said "14,278,554" in one render and
 * "14,330,000+" in the next and no two surfaces agreed for long. A whole-million
 * floor holds still for about a week, stays true through a 0.33M fall, and is
 * locale-neutral (no thousands separators to get wrong in de/fr/es/it/pt).
 *
 * Below one million (a dev or mock backend) there is no whole-million to claim,
 * so it falls back to the 10k floor rather than printing "0M+".
 *
 * Pure — safe to import from client components. The ONE place the format lives:
 * stats.ts (server) and use-tracked-label.ts (client) both call this.
 */
export function floorToMillion(n: number): string {
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M+`
  return `${floorTo10k(n)}+`
}
