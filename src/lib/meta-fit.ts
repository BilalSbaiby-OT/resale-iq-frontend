/**
 * Length fitting for <title> / <meta description> — the one place that turns an
 * over-budget string into a SERP-safe one, so every metadata generator can call
 * it instead of each family re-implementing (or forgetting) the cap.
 *
 * Google truncates titles near 60 characters and descriptions near 160. A
 * truncated snippet keeps the head, so we cut at a sentence/word boundary and
 * never move text around: figures a generator front-loaded stay in front.
 *
 * Plain module (no "@/" imports) so `node --test` can load it.
 */
export const TITLE_MAX = 60
export const DESC_MAX = 160

const SUFFIXES = [" — Resale IQ", " | Resale IQ", " - Resale IQ"]

function cutAtWord(s: string, max: number): string {
  if (s.length <= max) return s
  const room = s.slice(0, max - 1)
  const sp = room.lastIndexOf(" ")
  const base = sp > max * 0.6 ? room.slice(0, sp) : room
  return base.replace(/[\s,;:—–\-(]+$/, "") + "…"
}

/** <= 60 chars. Drops the brand suffix first (the domain already brands the SERP row), then cuts at a word. */
export function fitTitle(title: string): string {
  const t = title.trim()
  if (t.length <= TITLE_MAX) return t
  for (const suf of SUFFIXES) {
    if (t.endsWith(suf) && t.length - suf.length >= 20) {
      const head = t.slice(0, -suf.length)
      if (head.length <= TITLE_MAX) return head
      return cutAtWord(head, TITLE_MAX)
    }
  }
  return cutAtWord(t, TITLE_MAX)
}

/** <= 160 chars. Prefers whole sentences; falls back to a word boundary with an ellipsis. */
export function fitDescription(desc: string): string {
  const d = desc.replace(/\s+/g, " ").trim()
  if (d.length <= DESC_MAX) return d
  const window = d.slice(0, DESC_MAX)
  const stop = Math.max(window.lastIndexOf(". "), window.lastIndexOf("? "), window.lastIndexOf("! "))
  if (stop >= 80) return window.slice(0, stop + 1)
  return cutAtWord(d, DESC_MAX)
}

type Loose = Record<string, unknown>

function fitTitleField(v: unknown): unknown {
  if (typeof v === "string") return fitTitle(v)
  if (v && typeof v === "object") {
    const o = v as Loose
    const out: Loose = { ...o }
    if (typeof o.absolute === "string") out.absolute = fitTitle(o.absolute)
    if (typeof o.default === "string") out.default = fitTitle(o.default)
    return out
  }
  return v
}

/**
 * Fit title + description (and the og:/twitter: copies of them) on a Next
 * Metadata-shaped object. Generic so callers keep their own Metadata type.
 */
export function fitMetadata<T extends object>(meta: T): T {
  const m = meta as Loose
  const out: Loose = { ...m }
  if ("title" in m) out.title = fitTitleField(m.title)
  if (typeof m.description === "string") out.description = fitDescription(m.description)
  for (const k of ["openGraph", "twitter"] as const) {
    const sub = m[k]
    if (sub && typeof sub === "object") {
      const s: Loose = { ...(sub as Loose) }
      if ("title" in s) s.title = fitTitleField(s.title)
      if (typeof s.description === "string") s.description = fitDescription(s.description)
      out[k] = s
    }
  }
  return out as T
}

/** Wrap a Next `generateMetadata` so every variant it returns is length-fitted. */
export function withFittedMetadata<A extends unknown[], T extends object>(
  fn: (...args: A) => Promise<T> | T,
): (...args: A) => Promise<T> {
  return async (...args: A) => fitMetadata(await fn(...args))
}
