// Node --test resolver for the "@/..." alias and extensionless relative imports,
// so unit tests can load real generator data (blog-posts, seo-brands.json, ...)
// without a bundler. Register with: register("./test-support/alias-loader.mjs", import.meta.url)
import { pathToFileURL, fileURLToPath } from "node:url"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const EXTS = ["", ".ts", ".tsx", ".json", "/index.ts"]

function pick(base) {
  for (const e of EXTS) {
    const p = base + e
    if (existsSync(p) && !p.endsWith("/") && /\.[a-z]+$/.test(p)) return p
  }
  return null
}

export async function resolve(spec, ctx, next) {
  if (spec.startsWith("@/")) {
    const p = pick(join(SRC, spec.slice(2)))
    if (p) return { url: pathToFileURL(p).href, shortCircuit: true }
  } else if ((spec.startsWith("./") || spec.startsWith("../")) && ctx.parentURL?.startsWith("file:")) {
    const base = join(dirname(fileURLToPath(ctx.parentURL)), spec)
    if (!/\.[a-z]+$/.test(spec)) {
      const p = pick(base)
      if (p) return { url: pathToFileURL(p).href, shortCircuit: true }
    }
  }
  return next(spec, ctx)
}

export async function load(url, ctx, next) {
  if (url.endsWith(".json")) {
    return { format: "json", source: readFileSync(fileURLToPath(url), "utf8"), shortCircuit: true }
  }
  return next(url, ctx)
}
