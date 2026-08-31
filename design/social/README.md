# Social design system — how to use this directory

**Scope note (2026-08-31):** the CEO originally asked for all 10 week-1 Instagram
posts from `resale-iq-growth/QUEUE-INSTAGRAM-W1.md` designed individually. Mid-task
the CEO cut that back: no marketing-strategy pass or copy-humanizer had touched the
queue yet, so designing all 10 finished posts risked being thrown away. This pass
built **the reusable system** instead — components and templates, proven against
two real posts, not ten finished graphics. The other eight posts' content may still
change; the system underneath will not.

Canvas: **https://claude.ai/code/artifact/5fef50b6-7277-4a60-8ec8-0fe3fbce2e82**
(Claude Design canvas — pan/zoom, click into any artboard to edit, PNG export per
artboard from the toolbar.)

## What's on the canvas

| Artboard | Size | What it is |
|---|---|---|
| `Main` | 1240×3600 | System overview: the amber/red decision, type scale, both components previewed in place, safe-margin diagrams. Read this first. |
| `NumbersCard` | 900×620 | **Component.** The reusable stat card — 1–3 stats plus a fixed `n / period / market` row. `dc-import` this into any slide; never redraw it. |
| `HonestyCard` | 900×780 | **Component.** The "we don't know this one" treatment — same chrome, radius and shadow as `design/extension-panel/insufficient.html`, so the honest state never reads as an error. |
| `CarouselHook` | 1080×1350 | Carousel slide 1 template. Bracket placeholder copy — not final. |
| `CarouselData` | 1080×1350 | Carousel data-slide template, **worked with Post 1's real numbers** (New Balance 530: 542 sold · €40 median · €26.88 ceiling · n=174, 7d, EU5), via `dc-import` of `NumbersCard`. |
| `CarouselCTA` | 1080×1350 | Carousel closing-slide template. Structural CTA (button + "link in bio" + methodology line) is real and repeats across every post in the queue; the one variable line is placeholdered. |
| `ReelCover` | 1080×1920 | Reel cover-frame (0s) template. Bracket placeholder hook. |
| `ReelEndCard` | 1080×1920 | Reel end-card template, **worked with Post 1's real end-card text**, via `dc-import` of `NumbersCard` — proves the same component holds up at both aspect ratios. |
| `HonestyReelEnd` | 1080×1920 | Reel end-card, **worked with Post 3's real content** (the honesty post), via `dc-import` of `HonestyCard`. This is the most important artboard in the set — see below. |

Two worked examples only, per the CEO's instruction: Post 1 (carousel data slide +
reel end card) and Post 3 (the honesty treatment). The other eight posts are not
designed yet — they wait on the strategy/humanizer pass.

## The amber / red decision

`design/tokens.json` → `known_splits` records three ambers (`#f59e0b` token,
`#eab308` dashboard, `#fbbf24` extension) and two reds (`#ef4444` token, `#f87171`
extension) shipping simultaneously. For social, chosen:

- **Amber → `#fbbf24`** (`extension/content.css:18,32,77`)
- **Red → `#f87171`** (`extension/content.css:19,33,64,78`)

**Why:** these are the only two of the five candidate values `tokens.json` records
as deliberately chosen for contrast against a *dark card* (`#12151d`) — the exact
surface every social asset shares (dark card, phone screen, arm's length). The
site token amber and the dashboard amber were tuned for lighter contexts (chips,
hero mockups); the site token red the same. Buy green (`#22c55e`) and the honesty
tan (`#c4a574`) have no split and are used unchanged.

**This does not reconcile the split.** `src/` and `extension/` still ship three
ambers and two reds at once. Fixing that is a code change, out of `design/`'s
remit — flagged here again, not fixed.

## Type scale, spacing, safe margins

All on the `Main` artboard. Summary:

- Fonts: **Inter** (sans, headlines/body) + **JetBrains Mono** (numbers), both
  loaded via Google Fonts, matching `tokens.json` → `type.font_sans` /
  `type.font_mono`.
- Floor: **28px at 1080px width** — nothing on a shipped artboard goes smaller,
  per the brief's non-negotiable. The one exception is the single-letter "R"
  glyph inside the 40–52px logo badge, treated as an icon glyph, not reading text.
- Carousel safe margin: 90px side padding; the profile-grid thumbnail
  center-crops a 4:5 post to a square, losing ~135px top and bottom — keep the
  one essential line inside the un-cropped center band.
- Reel safe margin: 260px top (profile/audio row), 340px bottom (caption,
  username, audio title), 220px right (like/comment/share/save column) — all
  built in as padding on the templates, not drawn as a visible guide, so nothing
  shows up in an exported frame that shouldn't.

## The honesty treatment — why it's the important one

`HonestyCard`, worked in `HonestyReelEnd` with Post 3's real content (six
zero-model brands: Zara, Mango, Bershka, Pull&Bear, Hugo Boss, Calvin Klein),
is deliberately built to the same visual weight as `NumbersCard`: same card
chrome, same radius, same shadow, same left-accent-border pattern — only the
accent color (honesty tan, not a verdict color) and the content differ. The
"Models tracked: —" statement sits in the exact slot a big stat number would
occupy, at the same font weight. This mirrors
`design/extension-panel/insufficient.html`'s own design note: the state the
brand is built on gets no less design care than the confident state, or it
reads as broken instead of honest.

## What a reviewer diffs against

1. **Component fidelity first.** Open `NumbersCard` and `HonestyCard` standalone
   and check card chrome — radius (28px), left-accent border (10px), padding
   (56px 60px), background (`#12151d`), border (`#1c2333`) — matches across both;
   this is what makes every future post read as one system.
2. **The provenance row never shrinks or drops.** `n / period / market` in
   `NumbersCard` is laid out as an equal-weight row, not a caption — check that
   any future edit keeps it that way rather than trimming it for space.
3. **Verdict color vs. honesty color are never mixed.** Buy green, the chosen
   amber/red, are verdict signals. Honesty tan (`#c4a574`) is a separate channel
   — confidence/coverage, never "what to do." `HonestyCard` must never pick up a
   verdict color.
4. **Every number keeps its `n`.** Both worked examples (Post 1, Post 3) are
   verbatim from `QUEUE-INSTAGRAM-W1.md` — diff future worked posts against the
   queue text directly, not against a paraphrase.
5. **28px floor, safe margins.** Any new artboard built from these templates
   should hold both without the designer having to re-derive them.

## Export sizes

- Carousel artboards: 1080×1350 (4:5), matches Instagram's tallest feed slot.
- Reel frames: 1080×1920 (9:16), cover + end card only. **Video assembly is a
  separate job** — these are still frames, not motion. The reel templates assume
  a ~15s vertical clip with the numbers spoken over it (per the queue's own media
  briefs), landing on the end card as the last frame.
- PNG export is per-artboard from the canvas toolbar.

## Working files

`design/social/canvas/*.dc.html` + `canvas.json` are the source the canvas was
seeded from — edit these, not the published artifact's HTML, for any future
change. `design/social/resale-iq-social-kit.html` is the seeded, publishable
copy; regenerate it with the Claude Design `seed-canvas.mjs` helper after any
edit to the working files, then republish to the same artifact URL.
