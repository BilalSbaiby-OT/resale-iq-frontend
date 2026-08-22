/**
 * Rounded DOWN to the nearest 10k, so a "+" claim stays true between refreshes.
 * Pure — safe to import from client components. Do not put warehouse/fs here.
 */
export function floorTo10k(n: number): string {
  return (Math.floor(n / 10_000) * 10_000).toLocaleString("en-GB")
}
