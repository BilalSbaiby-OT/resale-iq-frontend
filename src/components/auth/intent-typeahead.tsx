/**
 * C180(tony): intent-field typeahead for /register.
 *
 * PROBLEM: Users land on the intent input and have to GUESS catalog brand
 * names. If they type "Gucci" or "Rolex" they hit the coverage-miss state
 * after registering — the worst first impression possible. Before this:
 *   - No autocomplete on the most important input in the funnel
 *   - 11 of 25 accounts ran 0 verdicts (zero first-verdict success rate)
 *
 * FIX: As the user types ≥2 chars, show matching brand+category pairs from
 * the live market snapshot, ranked by sold_7d (demand, not alphabetical).
 * Each suggestion carries the departure count so it doubles as social proof.
 * Keyboard nav (↑/↓/Enter/Escape) keeps power users fast.
 *
 * DATA: fetched from /api/public/market-snapshot on mount (same call
 * register-form.tsx already makes for the demand panel, different consumer).
 * Falls back to static CATALOG_BRANDS from seo-brands.json if fetch fails.
 *
 * Superhuman / Linear pattern: the input does not feel like a form field,
 * it feels like a command palette — you type the item and the product
 * confirms it has data before you commit. Expectation-setting, not friction.
 */
"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { CheckCircle2 } from "lucide-react"
import brandsRaw from "@/data/seo-brands.json" with { type: "json" }

type Suggestion = {
  brand: string
  category: string
  sold_7d: number
}

// Static fallback — brand names from the catalog without live counts.
// Used when the market-snapshot fetch fails so the typeahead still works.
const STATIC_BRANDS: string[] = (
  brandsRaw as { brands: { brand: string }[] }
).brands.map((b) => b.brand).filter(Boolean)

const STATIC_SUGGESTIONS: Suggestion[] = STATIC_BRANDS.map((brand) => ({
  brand,
  category: "",
  sold_7d: 0,
}))

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim()
}

function matchesSuggestion(q: string, s: Suggestion): boolean {
  const nq = normalize(q)
  if (!nq || nq.length < 2) return false
  const label = normalize(`${s.brand} ${s.category}`)
  const brandOnly = normalize(s.brand)
  return label.includes(nq) || brandOnly.startsWith(nq)
}

export type IntentTypeaheadProps = {
  value: string
  onChange: (v: string) => void
  onSelect?: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
  "aria-label"?: string
}

export function IntentTypeahead({
  value,
  onChange,
  onSelect,
  placeholder = "e.g. Stone Island Hoodie, Fred Perry Polo…",
  autoFocus = false,
  className,
  "aria-label": ariaLabel,
}: IntentTypeaheadProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(STATIC_SUGGESTIONS)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch live brand+category pairs sorted by demand.
  // Reuses the same market-snapshot endpoint as the demand panel below —
  // no extra network call if the browser caches it (same URL, GET, no auth).
  useEffect(() => {
    fetch("/api/public/market-snapshot")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.brands) return
        const pairs: Suggestion[] = []
        for (const b of d.brands) {
          if (!b.brand) continue
          if (Array.isArray(b.categories) && b.categories.length > 0) {
            for (const c of b.categories) {
              if (c.sold_7d >= 3) {
                pairs.push({ brand: b.brand, category: c.category, sold_7d: c.sold_7d })
              }
            }
          } else {
            // Brand-only row — use first top_category as label
            const cat = b.top_categories?.[0] ?? ""
            pairs.push({ brand: b.brand, category: cat, sold_7d: b.sold_7d ?? 0 })
          }
        }
        // Highest demand first — resellers scan fast, the hottest item should win
        pairs.sort((a, b) => b.sold_7d - a.sold_7d)
        if (pairs.length > 0) setSuggestions(pairs)
      })
      .catch(() => {
        // Silent: static fallback already loaded
      })
  }, [])

  const filtered = value.trim().length >= 2
    ? suggestions.filter((s) => matchesSuggestion(value, s)).slice(0, 6)
    : []

  const choose = useCallback(
    (s: Suggestion) => {
      const v = s.category ? `${s.brand} ${s.category}` : s.brand
      onChange(v)
      onSelect?.(v)
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.focus()
    },
    [onChange, onSelect],
  )

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) {
      if (e.key === "ArrowDown" && filtered.length > 0) {
        setOpen(true)
        setActiveIdx(0)
        e.preventDefault()
      }
      return
    }
    if (e.key === "ArrowDown") {
      setActiveIdx((i) => (i + 1) % filtered.length)
      e.preventDefault()
    } else if (e.key === "ArrowUp") {
      setActiveIdx((i) => (i <= 0 ? filtered.length - 1 : i - 1))
      e.preventDefault()
    } else if (e.key === "Enter" && activeIdx >= 0) {
      choose(filtered[activeIdx])
      e.preventDefault()
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  const showDropdown = open && filtered.length > 0

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActiveIdx(-1)
        }}
        onFocus={() => {
          if (filtered.length > 0) setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel ?? "What do you want to check today?"}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        autoComplete="off"
        autoFocus={autoFocus}
        className={
          className ??
          "w-full bg-[var(--color-bg-4)] border-2 border-[var(--color-border-2)] focus:border-[var(--color-buy)] rounded-xl px-4 py-3.5 text-[16px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] transition-colors"
        }
      />

      {showDropdown && (
        <ul
          role="listbox"
          aria-label="Brand suggestions"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-ui)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          {filtered.map((s, i) => {
            const label = s.category ? `${s.brand} ${s.category}` : s.brand
            const isActive = i === activeIdx
            return (
              <li
                key={`${s.brand}-${s.category}-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  // mousedown fires before blur so the value sticks
                  e.preventDefault()
                  choose(s)
                }}
                onMouseEnter={() => setActiveIdx(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  cursor: "pointer",
                  background: isActive
                    ? "var(--color-surface-raised,rgba(255,255,255,0.06))"
                    : "transparent",
                  borderBottom: "1px solid var(--color-border-ui)",
                  transition: "background 0.1s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <CheckCircle2
                    size={12}
                    color="var(--color-buy)"
                    aria-hidden
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {s.sold_7d > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                      whiteSpace: "nowrap",
                      marginLeft: 8,
                      flexShrink: 0,
                    }}
                  >
                    {s.sold_7d} dep/7d
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
