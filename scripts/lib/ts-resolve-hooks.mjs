/**
 * Module hooks that let a plain `node` script import this repo's TypeScript
 * source the way TypeScript itself resolves and compiles it.
 *
 * WHY THE RESOLVE HOOK EXISTS
 * Node's ESM resolver requires a file extension; TypeScript and Next do not,
 * and this repo's house style is extensionless — `import type { Locale } from
 * "./i18n"`, `from "@/lib/trial-copy"`. scripts/check-locale-english.mjs reads
 * the copy modules by importing them, so without this hook every module with a
 * *value* import of a sibling fails to load.
 *
 * That failure is silent by design in the check (most files in src/ are React
 * components that legitimately cannot be imported), so the practical effect is
 * a copy file quietly dropping out of the scan. It happened immediately: the
 * new src/lib/structured-data-copy.ts imports TRIAL_LIMITS_SENTENCE_BY_LOCALE
 * as a value, failed to resolve "./trial-copy", and its six locales went
 * unchecked until the check's MUST_SCAN assertion caught it.
 *
 * WHY THE LOAD HOOK EXISTS
 * The check originally relied on Node's built-in TypeScript type stripping.
 * That works on the Node 24 a developer runs locally and NOT on the Node 20
 * that .github/workflows/agent-isolation.yml pins, so the first CI run failed
 * with all eight copy modules unloadable. The MUST_SCAN assertion turned what
 * would have been a permanently green check scanning zero files into a loud
 * red one — which is the entire reason it exists.
 *
 * The fix is to stop depending on the runtime's TypeScript support and do the
 * transform explicitly, with the `typescript` devDependency this repo already
 * has. That makes the check independent of which Node runs it, which is the
 * right property for a build guard: bumping CI's Node version to suit a lint
 * script would have changed the build and deploy environment for every other
 * lane, in an i18n PR.
 *
 * The alternative to both hooks was adding ".ts" to imports in shipped source
 * to suit a build script. These hooks are the smaller change.
 */
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, resolve as resolvePath } from "node:path"
import ts from "typescript"

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

/**
 * Compile .ts/.tsx to ESM in memory. transpileModule is per-file and does no
 * type checking — which is what is wanted here (tsc --noEmit already runs in
 * this repo, and this hook only needs the values) and is also why it reliably
 * erases `import type` rather than leaving an unresolvable runtime import.
 */
export async function load(url, context, nextLoad) {
  if (!/\.tsx?(\?|$)/.test(url)) return nextLoad(url, context)
  const fileName = fileURLToPath(url)
  const { outputText } = ts.transpileModule(readFileSync(fileName, "utf8"), {
    fileName,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      verbatimModuleSyntax: false,
    },
  })
  return { format: "module", source: outputText, shortCircuit: true }
}
