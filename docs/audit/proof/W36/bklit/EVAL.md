# Bklit UI — go/no-go

Written by `seo` (content-social lane), 2026-08-31, on the founder's direct
ask. **Read-only against `resale-iq/src` — no install, no edit to that tree.**
This is a recommendation for the founder to act on (OS §0.10: new dependency
is a founder gate), not an implementation.

## Verdict: **Conditional go — real, but blocked on one missing prerequisite**

The product surfaces genuinely need what Bklit offers (below), and the
license/positioning check out. But this repo does not actually have the one
thing Bklit requires before it can be installed at all: shadcn/ui is not
initialized here. That's a same-day fix, not a redesign — hence conditional,
not no.

---

## 1 — Does `resale-iq` actually run shadcn/ui + Tailwind, compatibly?

Checked directly, 2026-08-31:

| Requirement | State | Evidence |
|---|---|---|
| Tailwind CSS | **Yes, v4** | `package.json`: `"tailwindcss": "^4"`, `"@tailwindcss/postcss": "^4"`, `tailwind.config.ts` present |
| `clsx` / `tailwind-merge` (the `cn()` utility pair shadcn scaffolds) | **Yes** | `package.json`: `"clsx": "^2.1.1"`, `"tailwind-merge": "^3.6.0"` |
| shadcn/ui actually initialized | **No** | No `components.json` anywhere in the repo — that's the file the `shadcn` CLI creates on `init` and reads on every `add`. Its absence means shadcn is not wired up, whatever the folder naming suggests. |
| A `src/components/ui/` folder | **Exists, but isn't shadcn** | 11 hand-written components (`kpi-card.tsx`, `score-bar.tsx`, `skeleton.tsx`, `momentum-badge.tsx`, etc.) — same *folder convention* shadcn uses, but none of the actual shadcn primitives (`button.tsx`, `card.tsx`, `dialog.tsx`…) are there, and there's no Radix UI or `class-variance-authority` in `package.json` — both of which real shadcn/ui components depend on. This is a custom design system that happens to share a folder name, not shadcn/ui. |
| Next.js / React version | Next `^16.3.0`, React `19.2.4` | `package.json` — current, no obvious incompatibility flagged by Bklit's own docs, but see §4 |

**So: half the prerequisite is true (Tailwind v4, the utility layer) and half
isn't (shadcn/ui itself was never initialized).** Bklit's own install docs
(`bklit.com/docs/installation`, fetched live 2026-08-31) are explicit:
*"shadcn/ui set up in your project"* is required before adding any Bklit
component, and the documented first step is `npx shadcn@latest init` — which
this repo has never run. Installing a Bklit chart today would fail at that
step, not because of an incompatibility, but because the prerequisite is
simply missing.

This is not a large gap — `shadcn init` on a Tailwind v4 project with
`clsx`/`tailwind-merge` already present is normally a few minutes and mostly
confirms conventions already in place — but it is itself a new-dependency,
config-touching action (it writes `components.json`, may adjust
`globals.css` / `tailwind.config.ts`), so it's covered by the same founder
gate as the Bklit install itself, not something to do as a side effect of
writing this eval.

---

## 2 — What Bklit actually is (verified live, not assumed)

Fetched `bklit.com` and `bklit.com/docs/installation` directly, 2026-08-31
(not taken from the founder's brief without checking):

- Described on its own site as **"a component library built on top of
  shadcn/ui"** for data visualization — confirms the founder's framing.
- **17 chart types** (area, bar, candlestick, choropleth, composed, funnel,
  gauge, heatmap, line, profit/loss line, live line, pie, radar, ring,
  scatter, sankey, sunburst) plus utility primitives (legend, grid,
  tooltip, brush, axis controls, a `useChart` hook).
- Install is via the **shadcn CLI, not npm directly**: `npx shadcn@latest
  add @bklit/line-chart` (or `pnpm dlx` / `yarn dlx` / `bunx` — same
  pattern). Components are vendored into the project as source (the shadcn
  registry model), not pulled in as an opaque compiled dependency — which
  matters for the "real cost" section below, since it means real, readable
  ownership of the chart code, not a black-box package.
- `@bklit/shimmering-text` installs automatically alongside `line-chart`,
  `area-chart` or `heatmap-chart` — an extra sub-component, not opt-out per
  the docs as fetched.

**Not independently confirmed:**
- **License.** The founder's brief states MIT. Neither `bklit.com` nor
  `bklit.com/docs` states a license anywhere on the pages fetched this
  session, and the GitHub repo path guessed (`github.com/bklit-ui/bklit`)
  returned 404 — wrong org/repo name, not evidence against MIT. **Mark this
  UNKNOWN until someone opens the actual repo linked from the site and reads
  the LICENSE file** — a five-minute check, not a blocker to this eval, but
  a blocker to actually installing.
- **Exact runtime dependencies added to `package.json`** (d3 or d3-adjacent
  packages are likely, given "d3" in the founder's framing and the chart
  breadth, but the fetched docs pages don't enumerate them). The only way to
  know precisely what lands in the lockfile is to actually run `shadcn add`
  once shadcn is initialized — which is exactly the install step this eval
  is not authorized to perform.

---

## 3 — Which product surfaces would genuinely benefit

Checked the three named pages directly, 2026-08-31 — this is the part of the
eval that changes the verdict from "interesting library" to "worth doing":

**None of `market`, `trends`, or `portfolio` render a single chart today.**

- `src/app/(dashboard)/trends/page.tsx` (87 lines): category tiles with a
  single current number (`sold_7d`, `avg_price`), a "Trending Right Now"
  list using `MomentumBadge` (a colored text pill) and `ScoreBar`.
- `src/components/ui/score-bar.tsx`: a **static single-value progress bar**
  — one `<div>` with a width percentage. Not a chart, no time axis, no
  history.
- `src/app/(dashboard)/market/page.tsx` (123 lines): a table with a
  `TrendArrow` component that is **literally an up/down arrow icon**
  (`lucide-react`), not a rendered trend line.
- `src/app/(dashboard)/portfolio/page.tsx` (109 lines): no chart-adjacent
  code at all (`grep` for `history|series|trend|chart` — zero matches).

So the honest framing is not "Bklit would improve the existing charts" —
**there are no existing charts to improve.** Every one of these three pages
currently shows the reader a snapshot number and, at best, a direction arrow
or a static bar. A reseller asking "is this model's price rising or has it
been flat for three weeks" has no way to see that anywhere in the product
today. That's the actual gap `line-chart` and `area-chart` would fill —
real, not manufactured to justify the library.

**Where it fits, concretely:**
- **`trends`** — a real line chart of `sold_7d` / `opportunity_score` over
  the last N snapshots per trending model, replacing the momentum *label*
  (HOT/RISING, a static badge) with the shape that produced it.
- **`market`** — `TrendArrow` (an icon, no magnitude, no history) is the
  clearest direct-replacement candidate: a small sparkline-style line chart
  in the same table cell would show magnitude and shape, not just direction.
- **`portfolio`** — a value-over-time chart for the reseller's own tracked
  items/holdings, which the page has zero visualization for today.

**What it would NOT replace:** `ScoreBar` (a deliberately simple, single-
value confidence/opportunity indicator — the code comment in
`score-bar.tsx` explains real design intent behind keeping a withheld score
visually distinct from a zero score; a chart library doesn't improve that,
it's a different job) and `MomentumBadge` (a categorical label, not a
value to chart).

---

## 4 — The real cost

Not "a new dependency" in the abstract — concretely, for this repo:

1. **The missing prerequisite.** `npx shadcn@latest init` has to run first,
   touching `components.json`, likely `globals.css` and possibly
   `tailwind.config.ts`. Small, but it's a real config change to a
   production app, and it's the founder's call same as the Bklit install
   itself — bundling both into one approval makes sense rather than gating
   them separately.
2. **Unknown exact package additions.** Can't be fully priced until
   `shadcn add @bklit/line-chart` is actually run once the prerequisite is
   met — the honest answer here is "probably d3-family packages plus
   `@bklit/shimmering-text`," not a verified list. Whoever does the install
   should read the resulting `package.json` diff before committing it, not
   assume this eval's guess.
3. **React 19 / Next 16 currency risk.** Neither Bklit's marketing page nor
   its installation docs (both fetched live) state a peer-dependency range.
   Nothing found suggests incompatibility, but nothing found confirms
   compatibility either — worth a real `shadcn add` dry run in a branch
   before trusting it in the dashboard.
4. **License unresolved** (§2) — a five-minute check, but a real blocker to
   "install this," not just a formality, given OS §0.10 treats a new
   dependency as a gate regardless of how small.
5. **Maintenance surface.** Because Bklit vendors component source into the
   repo (the shadcn registry model) rather than shipping a black-box npm
   package, the team owns and maintains that code going forward — a real,
   ongoing cost most vendored-component libraries carry, not unique to
   Bklit, but worth naming since "just add a dependency" undersells it
   slightly.

---

## Recommendation

**Worth doing, in this order, each still gated to the founder per OS §0.10:**
1. Confirm the license (open the real GitHub repo from `bklit.com`, read
   `LICENSE`).
2. `npx shadcn@latest init` on a branch, confirm it doesn't collide with the
   existing hand-rolled `src/components/ui/` (namespacing should be fine —
   shadcn init doesn't touch existing files it doesn't own — but verify,
   don't assume).
3. `npx shadcn@latest add @bklit/line-chart` on the same branch, read the
   `package.json`/`package-lock.json` diff before deciding whether the
   actual dependency footprint is acceptable.
4. Prototype exactly one chart — the `market` page's `TrendArrow` cells are
   the smallest, lowest-risk real replacement — before deciding whether to
   roll it out to `trends` and `portfolio` too.

This eval does not do any of the four steps above. It answers whether the
idea is sound (yes — the pages genuinely have no charts today) and what
stands between here and installing it (shadcn was never initialized, and
the license needs a five-minute confirmation).

---

## Sources

- `resale-iq/package.json`, `resale-iq/tailwind.config.ts` — read 2026-08-31.
- `find` for `components.json` (repo-wide) — none found, 2026-08-31.
- `src/components/ui/*.tsx` (11 files, listed and `score-bar.tsx` read in
  full) — read 2026-08-31.
- `src/app/(dashboard)/trends/page.tsx` (read in full, 87 lines),
  `src/app/(dashboard)/market/page.tsx`, `src/app/(dashboard)/portfolio/page.tsx`
  (both grepped for chart-adjacent code, zero matches beyond `TrendArrow`)
  — read/grepped 2026-08-31.
- `bklit.com`, `bklit.com/docs/installation`, `bklit.com/docs` — fetched
  live, 2026-08-31. `github.com/bklit-ui/bklit` — fetched, 404 (wrong
  guessed path, not evidence either way on the real repo).
- `docs/company/OS.md` §0.10 — new-dependency founder gate, cited not
  re-derived.
