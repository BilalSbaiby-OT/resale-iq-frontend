#!/usr/bin/env node
/**
 * Customer / agent firewall — frontend half.
 *
 * WHY THIS EXISTS
 * ---------------
 * The company spec's §0 says customers must never reach the Hermes agent
 * workforce, and §54 requires an automated test proving "the frontend contains
 * no Hermes secrets" that runs in CI.
 *
 * The backend repo has the matching check (tests/test_agent_isolation.py), but
 * its frontend assertions SKIP when this repo isn't checked out — which is
 * exactly what happens in backend CI. So that half was enforced nowhere. This
 * closes it on the side that actually matters: anything here ships to every
 * visitor's browser.
 *
 * It scans the BUILD OUTPUT as well as source. Source-only scanning misses the
 * real failure mode: a secret that reaches the client because it was inlined at
 * build time (NEXT_PUBLIC_*, or a value baked into a prerendered page). The
 * bundle is the artefact the customer receives, so the bundle is what gets
 * checked.
 *
 * Stdlib only, no dependencies, no network — matching this project's house
 * style and so it can never be skipped for want of an install.
 *
 * Usage:
 *   node scripts/check-agent-isolation.mjs           # source only
 *   node scripts/check-agent-isolation.mjs --built   # also scan .next (run after build)
 *
 * Exit 0 = clean. Exit 1 = a violation. Exit 2 = asked to scan a build that isn't there.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_BUILD = process.argv.includes("--built");

/** Credentials that belong ONLY to the isolated Hermes container. */
const AGENT_CREDENTIAL_NAMES = [
  "OPENROUTER_API_KEY",
  "HERMES_TELEGRAM_BOT_TOKEN",
  "TELEGRAM_BOT_TOKEN",
  "COOLIFY_TOKEN",
  "GITHUB_PAT",
  "HERMES_MODEL",
];

/** Value shapes, in case a key is pasted without its variable name. */
const VALUE_PATTERNS = [
  { name: "OpenRouter key", rx: /sk-or-v1-[A-Za-z0-9]{16,}/ },
  { name: "GitHub PAT (classic)", rx: /\bghp_[A-Za-z0-9]{20,}/ },
  { name: "GitHub PAT (fine-grained)", rx: /github_pat_[A-Za-z0-9_]{20,}/ },
  { name: "Telegram bot token", rx: /\b\d{8,12}:AA[A-Za-z0-9_-]{30,}/ },
  { name: "Coolify Sanctum token", rx: /\b\d+\|[A-Za-z0-9]{40,}/ },
];

/** Agent infrastructure that must not be discoverable from the client. */
const INFRA_PATTERNS = [
  { name: "Hermes container host path", rx: /\/opt\/data\b/ },
  { name: "Hermes home directory", rx: /\.hermes\b/ },
  { name: "OpenRouter endpoint", rx: /openrouter\.ai/ },
  { name: "Coolify API", rx: /62\.238\.51\.83:8000/ },
];

const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".yml", ".yaml"]);
const BUILD_EXT = new Set([".js", ".mjs", ".json", ".html", ".txt"]);
const SKIP_DIRS = new Set([".git", "node_modules", ".next", "out", "dist", "build", "coverage"]);

function walk(dir, exts, skip, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (skip.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, exts, skip, acc);
    else if (exts.has(extname(full))) acc.push(full);
  }
  return acc;
}

const violations = [];

function scan(files, label) {
  for (const file of files) {
    // This checker necessarily names the things it looks for.
    if (file.endsWith("check-agent-isolation.mjs")) continue;
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const rel = relative(ROOT, file);

    for (const name of AGENT_CREDENTIAL_NAMES) {
      if (text.includes(name)) {
        violations.push(`[${label}] ${rel}: references agent credential ${name}`);
      }
    }
    for (const { name, rx } of VALUE_PATTERNS) {
      if (rx.test(text)) {
        violations.push(`[${label}] ${rel}: contains a value shaped like a ${name}`);
      }
    }
    for (const { name, rx } of INFRA_PATTERNS) {
      if (rx.test(text)) {
        violations.push(`[${label}] ${rel}: exposes agent infrastructure (${name})`);
      }
    }
  }
  return files.length;
}

const sourceFiles = walk(ROOT, SOURCE_EXT, SKIP_DIRS);
const nSource = scan(sourceFiles, "source");

let nBuilt = 0;
if (SCAN_BUILD) {
  const nextDir = join(ROOT, ".next");
  if (!existsSync(nextDir)) {
    console.error("check-agent-isolation: --built given but .next/ does not exist. Run `npm run build` first.");
    process.exit(2);
  }
  // Scan what actually ships: the client chunks and the prerendered HTML.
  const builtFiles = walk(nextDir, BUILD_EXT, new Set(["cache"]));
  nBuilt = scan(builtFiles, "BUILD OUTPUT");
}

if (violations.length) {
  console.error("\n✗ customer/agent firewall VIOLATED\n");
  for (const v of violations) console.error("  " + v);
  console.error(
    "\nAnything in this repo — and especially in the build output — is delivered to " +
      "every visitor. Agent credentials live only in the Hermes container's own " +
      "environment. See COMPANY-SPEC.md §0 and §54.\n"
  );
  process.exit(1);
}

console.log(
  `✓ customer/agent firewall intact — ${nSource} source file(s)` +
    (SCAN_BUILD ? ` + ${nBuilt} build artefact(s)` : " (source only; pass --built to scan the bundle)") +
    " clean"
);
