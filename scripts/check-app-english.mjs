#!/usr/bin/env node
/**
 * Fails when raw English JSX text / user-visible attributes appear in the logged-in app
 * (src/app/(dashboard), src/app/(auth), layout/dashboard/ui/auth components) instead of
 * going through tx("…") (src/lib/ui-translate.ts). Owner-only /admin is exempt.
 * Heuristic on purpose (closed regex, no AST): it catches the common leak shapes —
 * text between tags and title/label/placeholder/aria-label/alt="…" — not every string.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
const ROOTS = ["src/app/(dashboard)", "src/app/(auth)", "src/components/layout", "src/components/dashboard", "src/components/ui", "src/components/auth", "src/components/consent-banner.tsx"]
const SKIP = [/\/admin\//, /primitives\//, /social-links/, /admin-nav/]
const ALLOW = new Set(["Nike", "https://www.vinted.es/items/...", "Resale IQ", "RESALE·IQ", "BUY", "WATCH", "SKIP", "Starter", "Pro", "Free", "Vinted", "Stripe", "Google", "Email", "Password"])
function walk(p, out = []) { const st = statSync(p); if (st.isDirectory()) for (const n of readdirSync(p)) walk(join(p, n), out); else if (p.endsWith(".tsx")) out.push(p); return out }
const hits = []
for (const r of ROOTS) for (const f of walk(r)) {
  if (SKIP.some((s) => s.test(f))) continue
  const src = readFileSync(f, "utf8")
  src.split("\n").forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*|\{\/\*)/.test(line)) return
    for (const m of line.matchAll(/>\s*([A-Z][A-Za-z][^<>{}"`]{3,}?)\s*</g)) if (!ALLOW.has(m[1].trim())) hits.push(`${f}:${i + 1}: JSX text "${m[1].trim()}"`)
    for (const m of line.matchAll(/\b(?:placeholder|aria-label|title|alt|label)="([A-Za-z][^"{}]{3,})"/g)) if (!ALLOW.has(m[1])) hits.push(`${f}:${i + 1}: attr "${m[1]}"`)
  })
}
if (hits.length) { console.error(`check:app-english — ${hits.length} raw English string(s) in the logged-in app; wrap in tx("…") and add a row to src/lib/ui-strings.ts:\n` + hits.join("\n")); process.exit(1) }
console.log("check:app-english OK")
