/**
 * Module-resolution hooks that let a plain `node` script import this repo's
 * TypeScript source the way TypeScript itself resolves it.
 *
 * WHY THIS EXISTS
 * Node's ESM resolver requires a file extension; TypeScript and Next do not,
 * and this repo's house style is extensionless — `import type { Locale } from
 * "./i18n"`, `from "@/lib/trial-copy"`. scripts/check-locale-english.mjs reads
 * the copy modules by importing them, so without these hooks every module with
 * a *value* import of a sibling fails to load.
 *
 * That failure is silent by design in the check (most files in src/ are React
 * components that legitimately cannot be imported), so the practical effect is
 * a copy file quietly dropping out of the scan. It happened immediately: the
 * new src/lib/structured-data-copy.ts imports TRIAL_LIMITS_SENTENCE_BY_LOCALE
 * as a value, failed to resolve "./trial-copy", and its six locales went
 * unchecked until the MUST_SCAN assertion caught it.
 *
 * The alternative was to add ".ts" to the imports in the source files, i.e. to
 * change shipped product code to suit a build script. These hooks are the
 * smaller change and keep the source idiomatic.
 */
import { existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, resolve as resolvePath } from "node:path"

const SRC = fileURLToPath(new URL("../../src/", import.meta.url))

/** Extensions TypeScript would try, in its order. */
const CANDIDATES = [".ts", ".tsx", "/index.ts", "/index.tsx"]

export async function resolve(specifier, context, nextResolve) {
  // The "@/..." path alias from tsconfig.json, which Node knows nothing about.
  if (specifier.startsWith("@/")) {
    const base = resolvePath(SRC, specifier.slice(2))
    for (const ext of ["", ...CANDIDATES]) {
      if (ext !== "" || existsSync(base)) {
        const candidate = base + ext
        if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true }
      }
    }
  }

  // Extensionless relative imports: "./trial-copy" -> "./trial-copy.ts".
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier)
    for (const ext of CANDIDATES) {
      if (existsSync(base + ext)) return { url: pathToFileURL(base + ext).href, shortCircuit: true }
    }
  }

  return nextResolve(specifier, context)
}
