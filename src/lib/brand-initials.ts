/** Two-letter tile when we have no local logo. Name is never drawn in the mark. */
const INITIAL_OVERRIDE: Record<string, string> = {
  "The North Face": "NF",
  "H&M": "HM",
  "Louis Vuitton": "LV",
  "Calvin Klein": "CK",
  "Tommy Hilfiger": "TH",
  "Ralph Lauren": "RL",
  "Levi's": "LE",
}

export function brandInitials(name: string): string {
  const hit = INITIAL_OVERRIDE[name]
  if (hit) return hit
  const cleaned = name.replace(/['’]/g, "").replace(/&/g, " ")
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  const word = parts[0] ?? ""
  return word.slice(0, 2).toUpperCase()
}
