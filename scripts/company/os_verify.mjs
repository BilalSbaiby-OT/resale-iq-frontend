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
const REPO = join(HOME, 'work/resale-iq');
const DESKTOP = join(HOME, 'Desktop');
const JSON_OUT = process.argv.includes('--json');

const WORK = join(HOME, 'work');
const ROOTS = [
  { label: 'work', dir: WORK, settings: join(WORK, '.claude/settings.json') },
  { label: 'resale-iq', dir: REPO, settings: join(REPO, '.claude/settings.json') },
  { label: 'user', dir: HOME, settings: join(HOME, '.claude/settings.json') },
  // ~/Desktop is only a config root while a session still starts there. A launchd
  // job cannot read it at all (TCC), and the verifier used to die with EPERM trying.
  // Unreadable is a THIRD state: not present, not fine — reported, and skipped.
  { label: 'desktop', dir: DESKTOP, settings: join(DESKTOP, '.claude/settings.json'), optional: true },
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
const unreadable = [];
const readJson = (p, label) => {
  try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; }
  catch (e) { unreadable.push(`${label}: ${e.code || e.message}`); return null; }
};

// ---------------------------------------------------------------- harness layer
const regsByRoot = {};
for (const r of ROOTS) {
  const s = readJson(r.settings, r.label);
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
  const gaps = eventParity(regsByRoot['work'], regsByRoot['resale-iq'], 'work', 'resale-iq');
  const n = new Set([...regsByRoot['work'], ...regsByRoot['resale-iq']].map(r => r.event)).size;
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
  const dir = existsSync(join(WORK, '.claude/agents')) ? join(WORK, '.claude/agents') : join(DESKTOP, '.claude/agents');
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
  // Was: regex the SCOPE tuple out of guard.py. The regex was non-greedy and
  // guard.py has "(APPROVALS A9)" in a comment mid-tuple, so it captured 5 of 11
  // entries and reported the rest as uncovered -- red board, nothing wrong.
  // A parenthesis in a comment is not a security finding.
  //
  // Now: ask the guard. Hand it a real path in each root and see whether it
  // refuses. Behaviour, not spelling -- survives comments, reordering, refactors.
  const guard = join(REPO, '.claude/hooks/guard.py');
  if (!existsSync(guard)) return { ok: false, n: 0, detail: 'guard.py missing' };
  const probe = dir => {
    try {
      execFileSync(guard, {
        input: JSON.stringify({ tool_name: 'Read', tool_input: { file_path: join(dir, 'scope-probe.txt') } }),
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return 0;
    } catch (e) { return e.status ?? -1; }
  };
  const required = [WORK, REPO, join(HOME, '.claude/plans')];
  const gaps = required.filter(d => probe(d) !== 0);
  return { ok: gaps.length === 0, n: required.length,
           detail: gaps.length ? `guard refuses in-scope roots: ${gaps.join(', ')}`
                               : `guard accepts all ${required.length} session roots`,
           fix: gaps.length ? 'add the root to guard.py SCOPE (founder-gated: needs .claude/UNLOCK_HARNESS)' : null };
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
  // Each probe names the founder flag that LIFTS it. Flag absent -> the payload
  // must be refused. Flag present -> it must be ALLOWED, because a gate the
  // founder has deliberately lifted and which still blocks is also broken.
  //
  // Before this, the push-to-main probe asserted exit 2 unconditionally. The
  // founder wrote .claude/DEPLOY_APPROVED on 2026-09-01 ("i give authorization"),
  // the guard honoured it correctly, and the check called that "not enforcing" --
  // holding the board RED for 22 hours over the system working as designed.
  // A board that is red for a non-reason is a board nobody reads.
  const probes = [
    { event: 'PreToolUse', liftFlag: '.claude/DEPLOY_APPROVED',
      block: { tool_name: 'Bash', tool_input: { command: 'git ' + 'push origin main' } },
      allow: { tool_name: 'Bash', tool_input: { command: 'npm run build' } } },
    { event: 'PreToolUse', liftFlag: null,   // force-push is never sanctioned, by any flag
      block: { tool_name: 'Bash', tool_input: { command: 'git ' + 'push --force origin feature' } },
      allow: { tool_name: 'Bash', tool_input: { command: 'git status' } } },
    { event: 'PreToolUse', liftFlag: '.claude/UNLOCK_HARNESS',
      block: { tool_name: 'Write', tool_input: { file_path: join(REPO, 'docs/company/OS.md') } },
      allow: { tool_name: 'Write', tool_input: { file_path: join(REPO, 'src/app/page.tsx') } } },
  ];
  let ran = 0; const bad = []; const lifted = [];
  for (const p of probes) {
    const isLifted = !!p.liftFlag && existsSync(join(REPO, p.liftFlag));
    const regs = allRegs.filter(r => r.event === p.event && r.resolvedPath && existsSync(r.resolvedPath));
    for (const r of regs) {
      ran++;
      const run = payload => {
        try { execFileSync(r.resolvedPath, { input: JSON.stringify(payload), stdio: ['pipe','pipe','pipe'] }); return 0; }
        catch (e) { return e.status ?? -1; }
      };
      const got = run(p.block);
      if (isLifted) {
        // The founder lifted it. Honouring that IS the correct behaviour.
        if (got !== 0) bad.push(`${p.liftFlag} is present but the gate still blocked — the founder's lift does not work`);
        else lifted.push(p.liftFlag);
      } else if (got !== 2) {
        bad.push(`${r.resolvedPath} did not block a must-block payload`);
      }
      if (run(p.allow) !== 0) bad.push(`${r.resolvedPath} blocked its negative control`);
    }
  }
  const note = lifted.length ? ` · LIFTED BY FOUNDER: ${[...new Set(lifted)].join(', ')}` : '';
  return { ok: bad.length === 0 && ran > 0, n: ran,
           detail: bad.length ? bad.join('; ') : `${ran} registered gate probes behaved correctly${note}`,
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

// ------------------------------------------------------- credentials layer
//
// Presence is not capability. I told the founder twice that Reddit was connectable
// because REDDIT_CLIENT_ID appeared in a list of variable NAMES; the value is empty.
// doctor.js:6 had already written the rule — "a key that is set but rejected is
// worse than no key" — and nobody was running it. So these authenticate.
//
// Values are never printed. Run under .claude/bin/with-secrets.sh, which puts them
// in this process and scrubs them from stdout. Without it, these report `—` NOT
// CHECKED, which is deliberately different from a pass.
const LIVE = !!process.env.STRIPE_SECRET_KEY || !!process.env.POSTIZ_API_KEY;

async function httpStatus(url, headers, timeoutMs = 20000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers, signal: ac.signal });
    return r.status;
  } catch (e) {
    return `err:${e.name === 'AbortError' ? 'timeout' : e.message.slice(0, 40)}`;
  } finally { clearTimeout(t); }
}

const asyncChecks = [];
function acheck(id, fn) { asyncChecks.push({ id, fn }); }

acheck('credentials/values-not-just-names', async () => {
  if (!LIVE) return { skip: 'run under .claude/bin/with-secrets.sh' };
  // Only what the company actually needs. REDDIT_* is deliberately absent: Postiz
  // owns publishing, and job_reddit_bot is now gated, so an empty Reddit credential
  // is a correct state rather than a fault. A required-list that lists things nobody
  // needs trains you to ignore it.
  const required = ['STRIPE_SECRET_KEY', 'POSTIZ_API_KEY', 'JWT_SECRET'];
  const placeholder = /^(changeme|your-key-here|dev-secret-change-me|xxx+)$/i;
  const bad = required.filter(k => {
    const v = (process.env[k] || '').trim();
    return !v || placeholder.test(v);
  });
  return { ok: bad.length === 0, n: required.length,
           detail: bad.length ? `empty or placeholder: ${bad.join(', ')}` : `${required.length} required credentials have real values`,
           fix: bad.length ? 'set a value in the env file, then re-run' : null };
});

acheck('credentials/stripe-authenticates', async () => {
  if (!process.env.STRIPE_SECRET_KEY) return { skip: 'no STRIPE_SECRET_KEY in this process' };
  const st = await httpStatus('https://api.stripe.com/v1/balance',
                              { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY });
  const mode = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  return { ok: st === 200, n: 1, detail: `GET /v1/balance -> ${st} (${mode} key)`,
           fix: st === 200 ? null : 'the key is set but rejected — rotate it in Stripe' };
});

acheck('credentials/postiz-authenticates', async () => {
  if (!process.env.POSTIZ_API_KEY) return { skip: 'no POSTIZ_API_KEY in this process' };
  const base = process.env.POSTIZ_API_URL || 'https://api.postiz.com/public/v1';
  const st = await httpStatus(`${base}/integrations`, { Authorization: process.env.POSTIZ_API_KEY });
  return { ok: st === 200, n: 1, detail: `GET /integrations -> ${st}`,
           fix: st === 200 ? null : 'key set but rejected — copy it again from Postiz settings' };
});

acheck('credentials/production-ssh', async () => {
  try {
    const name = execFileSync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', 'resaleiq',
      'docker ps --format "{{.Names}}" | grep ph5clxk | head -1'], { encoding: 'utf8', timeout: 25000 }).trim();
    return { ok: !!name, n: 1,
             detail: name ? `backend container up: ${name.slice(0, 42)}` : 'ssh ok but no backend container',
             fix: name ? null : 'the backend container is not running' };
  } catch (e) {
    return { ok: false, n: 1, detail: `ssh resaleiq failed: ${String(e.message).slice(0, 60)}`,
             fix: 'check the host alias and key' };
  }
});

// --------------------------------------------------------- production layer
acheck('production/public-api-serves-data', async () => {
  try {
    const r = await fetch('https://resaleiq.dev/api/public/market-snapshot', { signal: AbortSignal.timeout(25000) });
    if (!r.ok) return { ok: false, n: 1, detail: `HTTP ${r.status}`, fix: 'the public API is down' };
    const j = await r.json();
    const tracked = j.listings_tracked ?? j.tracked ?? j.unique_items ?? 0;
    // A 200 with zero rows is the outage that reports all-clear. n=0 makes it ∅.
    return { ok: tracked > 0, n: tracked > 0 ? 1 : 0,
             detail: `listings_tracked = ${Number(tracked).toLocaleString()}`,
             fix: tracked > 0 ? null : 'API answers but has no data' };
  } catch (e) {
    return { ok: false, n: 1, detail: String(e.message).slice(0, 60), fix: 'production unreachable' };
  }
});

acheck('production/dashboard-data-fresh', async () => {
  const p = join(REPO, 'dashboard/data.json');
  if (!existsSync(p)) return { ok: false, n: 0, detail: 'no dashboard/data.json', fix: 'build_dashboard.py --prod' };
  const d = JSON.parse(readFileSync(p, 'utf8'));
  const ageH = (Date.now() - Date.parse(d.generated_at)) / 3.6e6;
  const ok = ageH < 24 && d.prod_included === true;
  return { ok, n: 1,
           detail: `generated ${ageH.toFixed(1)}h ago, prod_included=${d.prod_included}`,
           fix: ok ? null : 'with-secrets.sh python3 scripts/company/build_dashboard.py --prod' };
});

// ---------------------------------------------------------------- report
for (const { id, fn } of asyncChecks) {
  try {
    const r = await fn();
    // `skip` is a third state. An unrunnable check and a passing one are different
    // facts, and collapsing them is how a report goes green on an unconnected system.
    results.push(r.skip ? { id, ok: true, n: 0, skipped: true, detail: r.skip } : { id, ...r });
  } catch (e) {
    results.push({ id, ok: false, n: 0, detail: `threw: ${e.message}` });
  }
}

const failed = results.filter(r => !r.ok && r.n > 0).length;
const empty = results.filter(r => r.n === 0 && !r.skipped).length;
const skipped = results.filter(r => r.skipped).length;
const passed = results.filter(r => r.ok && r.n > 0).length;

if (JSON_OUT) {
  console.log(JSON.stringify({
    generated_at: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    layer: 'harness+credentials+production', results, passed, failed, empty, skipped,
  }, null, 2));
} else {
  const C = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', x: '\x1b[0m' };
  console.log(`\n  OS VERIFY${LIVE ? '' : '  (offline — credentials not checked)'}\n`);
  for (const r of results) {
    const sym = r.skipped ? `${C.y}—${C.x}` : r.n === 0 ? `${C.y}∅${C.x}` : r.ok ? `${C.g}✓${C.x}` : `${C.r}✗${C.x}`;
    console.log(`  ${sym} ${r.id.padEnd(46)} ${C.d}n=${String(r.n).padEnd(4)}${C.x} ${r.ok ? C.d : C.r}${r.detail}${C.x}`);
    if (!r.ok && r.fix) console.log(`      ${C.y}→ ${r.fix}${C.x}`);
  }
  console.log(`\n  ${results.length} checks · ${failed} failed · ${empty} inspected nothing · ${skipped} not checked\n`);
}
process.exit(failed || empty ? 1 : 0);
