#!/usr/bin/env node
/**
 * OS VERIFY — does the harness AS CONFIGURED actually use what we built?
 *
 * This exists because the previous proof suite could not answer that. It invoked
 * the hooks by hardcoded absolute path, so 41/41 green was fully compatible with a
 * settings.json that registered none of them — which is exactly what happened. The
 * Stop gate reported "armed" and never fired through two production deploys, and
 * 21 agent files sat where the session could not see them.
 *
 * So every check here reads the LIVE configuration and asks whether the thing is
 * wired, not whether the file exists.
 *
 * Two rules, inherited from resale-iq-growth's verify.mjs because they were learned
 * the hard way there:
 *   1. A check that inspected nothing is a FAILURE, not a pass. ∅ exits non-zero.
 *   2. An unrunnable check (—) is reported apart from a passing one. Different facts.
 *
 *   node scripts/company/os_verify.mjs            human report
 *   node scripts/company/os_verify.mjs --json     machine output for status_report
 */
import { execFileSync } from 'node:child_process';
import { accessSync, constants, readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  hookRegistrations, invalidEvents, eventParity, ephemeralHooks,
  rosterFrom, rosterNameMismatches, scopeGaps, unignoredFlags, VALID_HOOK_EVENTS,
} from '../../../resale-iq-growth/skills/resale-iq-verify/scripts/wiring.mjs';

const HOME = process.env.HOME;
const REPO = join(HOME, 'Desktop/resale-iq');
const DESKTOP = join(HOME, 'Desktop');
const JSON_OUT = process.argv.includes('--json');

const ROOTS = [
  { label: 'desktop', dir: DESKTOP, settings: join(DESKTOP, '.claude/settings.json') },
  { label: 'resale-iq', dir: REPO, settings: join(REPO, '.claude/settings.json') },
  { label: 'user', dir: HOME, settings: join(HOME, '.claude/settings.json') },
];

const results = [];
/** ok:true|false, n = how many things were actually inspected. n===0 is ∅, a failure. */
function check(id, fn) {
  try {
    const r = fn();
    results.push({ id, ...r });
  } catch (e) {
    results.push({ id, ok: false, n: 0, detail: `threw: ${e.message}` });
  }
}
const readJson = p => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);

// ---------------------------------------------------------------- harness layer
const regsByRoot = {};
for (const r of ROOTS) {
  const s = readJson(r.settings);
  regsByRoot[r.label] = s ? hookRegistrations(s, r.dir) : [];
}
const allRegs = Object.values(regsByRoot).flat();

check('harness/settings-parse', () => {
  const found = ROOTS.filter(r => existsSync(r.settings));
  return { ok: found.length > 0, n: found.length,
           detail: found.map(f => f.label).join(', ') };
});

check('harness/hook-commands-exist', () => {
  const withTarget = allRegs.filter(r => r.resolvedPath);
  const missing = withTarget.filter(r => !existsSync(r.resolvedPath));
  return { ok: missing.length === 0, n: withTarget.length,
           detail: missing.length ? missing.map(m => `${m.event} -> ${m.resolvedPath}`).join('; ')
                                  : 'every registered hook resolves to a real file',
           fix: missing.length ? 'remove the dead registration, or restore the script' : null };
});

check('harness/hook-commands-executable', () => {
  const present = allRegs.filter(r => r.resolvedPath && existsSync(r.resolvedPath));
  const notExec = present.filter(r => {
    try { accessSync(r.resolvedPath, constants.X_OK); return false; } catch { return true; }
  });
  return { ok: notExec.length === 0, n: present.length,
           detail: notExec.length ? notExec.map(m => m.resolvedPath).join('; ') : 'all executable',
           fix: notExec.length ? 'chmod +x the hook' : null };
});

check('harness/event-names-valid', () => {
  const bad = invalidEvents(allRegs);
  const events = [...new Set(allRegs.map(r => r.event))];
  return { ok: bad.length === 0, n: events.length,
           detail: bad.length ? `not dispatched by Claude Code: ${bad.join(', ')}` : events.join(', '),
           fix: bad.length ? 'remove it; it has never fired' : null };
});

check('harness/event-parity-across-roots', () => {
  const gaps = eventParity(regsByRoot['desktop'], regsByRoot['resale-iq'], 'desktop', 'resale-iq');
  const n = new Set([...regsByRoot['desktop'], ...regsByRoot['resale-iq']].map(r => r.event)).size;
  return { ok: gaps.length === 0, n,
           detail: gaps.length ? gaps.map(g => `${g.event} in ${g.present} only`).join('; ')
                               : 'both roots wire identical events',
           fix: gaps.length ? 'wire it in both, or neither — a session loads only its own root' : null };
});

check('harness/hooks-not-ephemeral', () => {
  const withTarget = allRegs.filter(r => r.resolvedPath);
  const bad = ephemeralHooks(withTarget);
  return { ok: bad.length === 0, n: withTarget.length,
           detail: bad.length ? bad.map(b => b.resolvedPath).join('; ') : 'none in a tmp-cleaned tree',
           fix: bad.length ? 'move it somewhere the OS will not delete' : null };
});

check('harness/roster-resolves-from-session-root', () => {
  const dir = join(DESKTOP, '.claude/agents');
  if (!existsSync(dir)) return { ok: false, n: 0, detail: 'no agents dir at the session root — every spawn falls back to general-purpose',
                                 fix: 'symlink or copy the roster into the session root' };
  const entries = readdirSync(dir).filter(f => f.endsWith('.md'))
    .map(f => ({ name: f, content: readFileSync(join(dir, f), 'utf8') }));
  const roster = rosterFrom(entries);
  const mismatches = rosterNameMismatches(roster);
  return { ok: roster.length > 0 && mismatches.length === 0, n: roster.length,
           detail: mismatches.length ? `name/filename mismatch: ${mismatches.map(m => m.file).join(', ')}`
                                     : `${roster.length} agents resolve from the session root`,
           fix: mismatches.length ? 'frontmatter name must equal the filename' : null };
});

check('harness/guard-scope-covers-session-roots', () => {
  const src = readFileSync(join(REPO, '.claude/hooks/guard.py'), 'utf8');
  const m = /SCOPE = \(([\s\S]*?)\)/.exec(src);
  const scope = m ? [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]) : [];
  const required = [DESKTOP, REPO, join(HOME, '.claude/plans')];
  const gaps = scopeGaps(scope, required);
  return { ok: gaps.length === 0, n: scope.length,
           detail: gaps.length ? `not covered: ${gaps.join(', ')}` : `${scope.length} entries cover every session root`,
           fix: gaps.length ? 'add the root to guard.py SCOPE' : null };
});

check('harness/gate-flags-gitignored', () => {
  const flags = ['.claude/LOCK', '.claude/UNLOCK_HARNESS', '.claude/STOP_GATE_ON', '.claude/DEPLOY_APPROVED'];
  const checked = flags.map(f => {
    let ignored = false;
    try { execFileSync('git', ['check-ignore', '-q', f], { cwd: REPO }); ignored = true; } catch { ignored = false; }
    return { path: f, ignored };
  });
  const bad = unignoredFlags(checked);
  return { ok: bad.length === 0, n: checked.length,
           detail: bad.length ? `committable: ${bad.join(', ')}` : 'all four founder-gate flags ignored',
           fix: bad.length ? 'add to .gitignore — DEPLOY_APPROVED lifts the production deploy block' : null };
});

/**
 * The heart of it. For each hook that is ACTUALLY REGISTERED, feed it the payload
 * that must be refused and the control that must pass. This is what makes "the
 * component works" and "the component is wired" one assertion instead of two.
 */
check('harness/registered-gates-actually-block', () => {
  const probes = [
    { event: 'PreToolUse', block: { tool_name: 'Bash', tool_input: { command: 'git ' + 'push origin main' } },
      allow: { tool_name: 'Bash', tool_input: { command: 'npm run build' } } },
    { event: 'PreToolUse', block: { tool_name: 'Write', tool_input: { file_path: join(REPO, 'docs/company/OS.md') } },
      allow: { tool_name: 'Write', tool_input: { file_path: join(REPO, 'src/app/page.tsx') } } },
  ];
  let ran = 0; const bad = [];
  for (const p of probes) {
    const regs = allRegs.filter(r => r.event === p.event && r.resolvedPath && existsSync(r.resolvedPath));
    for (const r of regs) {
      ran++;
      const run = payload => {
        try { execFileSync(r.resolvedPath, { input: JSON.stringify(payload), stdio: ['pipe','pipe','pipe'] }); return 0; }
        catch (e) { return e.status ?? -1; }
      };
      if (run(p.block) !== 2) bad.push(`${r.resolvedPath} did not block a must-block payload`);
      if (run(p.allow) !== 0) bad.push(`${r.resolvedPath} blocked its negative control`);
    }
  }
  return { ok: bad.length === 0 && ran > 0, n: ran,
           detail: bad.length ? bad.join('; ') : `${ran} registered gate probes behaved correctly`,
           fix: bad.length ? 'the hook is registered but not enforcing' : null };
});

check('harness/proof-suite-targets-registered-hooks', () => {
  const p = join(REPO, 'docs/audit/proof/W36/phase0/test_rails.py');
  if (!existsSync(p)) return { ok: false, n: 0, detail: 'proof suite missing' };
  const src = readFileSync(p, 'utf8');
  // Substring-matching 'settings.json' passed for the wrong reason: the string
  // appears inside test-case DATA (write(R + ".claude/settings.json")). Third time
  // this session a check was fooled by a substring. Assert the actual property:
  // no hardcoded hooks directory, and the subject list comes from the registry.
  const hardcoded = /^\s*H\s*=\s*["'][^"']*\.claude\/hooks/m.test(src);
  const derived = !hardcoded && /REGISTERED_HOOKS|hooks_from_settings/.test(src);
  return { ok: derived, n: 1,
           detail: derived ? 'proof suite derives its subjects from the settings registry'
                           : 'proof suite hardcodes hook paths — it can be 41/41 green on an ungated repo',
           fix: derived ? null : 'derive the hook paths from settings.json' };
});

// ---------------------------------------------------------------- report
const failed = results.filter(r => !r.ok && r.n > 0).length;
const empty = results.filter(r => r.n === 0).length;
const passed = results.filter(r => r.ok && r.n > 0).length;

if (JSON_OUT) {
  console.log(JSON.stringify({
    generated_at: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    layer: 'harness', results, passed, failed, empty,
  }, null, 2));
} else {
  const C = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', x: '\x1b[0m' };
  console.log(`\n  OS VERIFY — harness layer\n`);
  for (const r of results) {
    const sym = r.n === 0 ? `${C.y}∅${C.x}` : r.ok ? `${C.g}✓${C.x}` : `${C.r}✗${C.x}`;
    console.log(`  ${sym} ${r.id.padEnd(46)} ${C.d}n=${String(r.n).padEnd(4)}${C.x} ${r.ok ? C.d : C.r}${r.detail}${C.x}`);
    if (!r.ok && r.fix) console.log(`      ${C.y}→ ${r.fix}${C.x}`);
  }
  console.log(`\n  ${results.length} checks · ${failed} failed · ${empty} inspected nothing\n`);
}
process.exit(failed || empty ? 1 : 0);
