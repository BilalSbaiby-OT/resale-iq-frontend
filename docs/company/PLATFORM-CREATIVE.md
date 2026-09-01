# Platform Creative Spec — TikTok / Instagram Reels / X

**Written 2026-09-01, in response to `WORKBOARD.md` row W57 and the founder's "the videos you making
aint marketing shit bruv" (W8).** We published 20 posts on 2026-09-01 and treated three platforms as
one feed. The evidence, read from the actual artifacts, not from a summary:

- `ffprobe -show_entries stream=codec_type` on `samba-demo-9x16.mp4`, `aspirational-double-100-es.mp4`
  and `aspirational-50-euros-fr.mp4` returns `video` only — **no audio stream on any of the three.**
  (`WORKBOARD.md` W57, run against the files directly.)
- `samba-demo-9x16.mp4` is the same encoded file, reused for `content` rows **123, 124, 129, 130, 131,
  132, 134, 135, 136, 137** (10 rows in the DB, spanning ES/FR/DE/IT/PT on both TikTok and Instagram —
  the task brief that opened this file says 11; the row list in W57 names 10. Recorded as W57 states it;
  re-run the row list against `growth.db` before quoting either number as final).
- Platforms fingerprint identical uploads. Consistent with **4 TikTok posts ERROR**ing and only **1 of
  8** "published" TikTok posts carrying a real `/video/` id (W57).
- The two `aspirational-*` renders are **540×960** — half of the 1080×1920 both TikTok and Reels
  require. (`samba-demo-9x16.mp4` itself is already 1080×1920 per its own build note in W8; the
  540×960 problem is specific to whatever pipeline produced the aspirational pair, not
  `capture_demo.mjs`, which captures at viewport 540×960 with `deviceScaleFactor:2` — i.e. a 1080×1920
  *pixel* screenshot despite the 540/960 constants in the script. Verify the aspirational pipeline
  separately; do not assume it used the same capture path.)
- Two Instagram posts went out as **stories** (24h expiry) and one as a **feed post**, and this was
  not a deliberate per-post choice: Postiz's Instagram adapter
  (`resale-iq-growth/src/publish/postiz.js:145-150`) sets `post_type: row.format === 'story' ? 'story'
  : 'post'` — it reads straight off the content row's `format` column. If `format` was set to
  `'story'` by whatever produced those two rows (rather than `'reel'`/`'post'`), Postiz did exactly
  what it was told. **This is a queue-authoring bug, not a Postiz bug** — fix it where `format` gets
  set, not in the adapter.
- **Nine of the 20 posts produced one measured social visitor** (cited in the task brief; not
  independently re-measured for this document — re-run `resale-iq-growth`'s `npm run sync` /
  `/api/admin/growth-funnel` before citing this figure again, since `syncAnalytics()` in
  `postiz.js:309-364` explicitly has no reach endpoint and depends on manual platform reads).

None of that is a content-quality problem. It's an assembly-pipeline problem: silent video, wrong
resolution, one asset reused eleven ways, wrong Instagram surface. This document fixes what a human
decides (Part 1) and gives runnable templates that make the failure mode structurally harder to repeat
(Part 2).

---

## Part 1 — the per-platform spec

### Shared, non-negotiable, all three platforms

From `CONTENT-RULES.md` and `ORGANIC-GROWTH.md` (doctrine, not a preference):

- **`resaleiq.dev`, never `.com`.**
- **"watched departures" / "left the shelf", never "sold".** `sold_observed` means a listing left the
  shelf; it can leave by delisting, edit or reservation.
- **Aggregates only.** Brand/category volume, average price, concentration are free to publish.
  **Never a per-model buy-below as the message** — it may appear briefly inside a live product demo
  (that's the free tier working), never as the headline number of a caption or on-screen text.
- **No Balenciaga, nothing authenticity-adjacent.** No counterfeit filter exists; don't imply one.
- **ES · FR · DE · IT · PT only.** No UK claim, no UK flag, no "we cover the UK." 71% of our search
  impressions are US/GB — markets we cannot serve — so English-only content actively recruits the
  wrong audience. Default to the market the query/insight is actually drawn from.
- **`buy_below = avg_price × 0.95 × 0.70`** is public and fine to show on screen mid-demo.
- **Never state or imply a guaranteed return.** "Double your money in a week" survives only as a
  question or a demonstration, never as a promise.
- **Never manufacture proof.** No invented customers, testimonials, revenue, or stats. Every number on
  screen is either read live off `resaleiq.dev` in the capture, or a brand/category aggregate that
  traces to `growth.db` / the public snapshot.

### TikTok

**What earns the first 1.5 seconds.** TikTok punishes a slow open harder than any other platform here —
the algorithm's own signal is completion rate measured from frame one, and a static logo card or a
voiceover-before-visual opening reads as an ad and gets swiped. The frame at t=0 must already show
**motion and a claim**, not a wind-up:
- Cold open on the live product mid-interaction (cursor already typing, or the result already
  animating in) — never a title card first. If a hook card is used at all, it is composited **under**
  1.2s and paired with on-screen motion (the typed query racing in behind it), not held alone.
  `capture_demo.mjs`'s first 8 frames (the empty state, ~0.6s at 12fps) are the wrong opening for
  TikTok specifically — cut in at frame ~9, where typing has already started, and hold the empty state
  for Reels/X instead where the pace tolerance is higher.
- Text on screen by 1.2s stating the stakes as a question or a number, not the brand name.
  ("Would you pay €31 for this?" beats "ResaleIQ checks Vinted prices.")
- No logo, no intro sting, no "ResaleIQ presents."

**Caption.** Short, native, lowercase-tolerant, one idea. 1–2 sentences above the fold (TikTok truncates
around 150 characters before "more"), a single call-to-action, link **in bio**, not typed in the
caption — TikTok captions are not clickable text, so a URL in the caption is dead weight. End with 3–5
hashtags max, mixed broad + niche (see hashtag policy below).

**On-screen text.** Large, high-contrast, centered in the safe zone: TikTok's own UI overlays the
**bottom ~200px** (caption/music/profile row) and a **right-side column ~120px wide** (like/comment/
share stack) on a 1080×1920 frame. Keep all text inside `x: 90–990, y: 200–1550`. 2–4 words per beat,
not full sentences — this is the existing `captionPng.js` band (4 words / 26 chars max group) and it is
already tuned correctly; the fix needed here is resolution and safe margin, not the caption logic.

**Audio.** Voiceover is mandatory, not optional — TikTok's own ranking signal favors sound-on
completion, and a silent video in a sound-first feed is the single defect W57 found across all three
broken renders. Use `gen_voice.py` (ElevenLabs `eleven_multilingual_v2`, verified voice id
`21m00Tcm4TlvDq8ikWAM`) in the post's own market language — not English dubbed everywhere. Native
percussive SFX (a short "reveal" tick on the number appearing) is optional and secondary to the voice
track; never auto-added platform music (Postiz already sets `autoAddMusic: 'no'` for exactly this
reason — a licensing decision nobody made).

**Story vs reel vs feed.** N/A — TikTok has one surface. Every post is the main feed; there is no
ephemeral option to misconfigure here, which is why this platform's incident was entirely about audio
and resolution, not surface choice.

**Hashtag policy.** 3–5 tags: one broad (`#vinted`, `#reselling`), one specific (`#vintedseller`,
`#thrifting`), one branded/discovery (`#resaleiq`). Never stuff 10+ — TikTok's own creator guidance and
observed practice both treat that as a spam signal. No hashtag in ES/FR/DE/IT/PT videos duplicates the
English set verbatim; localize at minimum the broad one (`#vinted` stays, but pair with
`#revente`/`#wiederverkauf`/`#rivendita`/`#revenda` where natural).

### Instagram Reels

**What earns the first 1.5 seconds.** Reels tolerates a half-beat more setup than TikTok — its audience
skews toward aesthetic/production quality and the algorithm's early-engagement window is closer to 3s
than TikTok's ~1.5s — but "tolerates more" does not mean "slow." A clean hook card (the existing
`make_cards.mjs` hook: *"Vinted won't tell you this price. This will."*) held for **under 1.5s** with a
subtitle already visible works here in a way it does not on TikTok, provided motion starts immediately
after. Visual polish (the deal-card typography, the brand green accent) reads as a plus on Reels; it
reads as "ad" on TikTok. Reuse the same underlying footage, re-cut the first beat.

**Caption.** Longer than TikTok is tolerated (Instagram captions are more often read, not just heard),
but the first line still has to work alone — Instagram truncates to roughly the first 125 characters
before "more." Front-load the claim in line one. Link **in bio** here too; Reels captions are not
clickable either. 2–3 short paragraphs max, one CTA.

**On-screen text.** Same 1080×1920 canvas, same safe-area discipline, but Instagram's own UI reserves
slightly more on the **bottom** (~280px: caption preview + like/comment row) when Reels are viewed from
the main feed rather than full-screen. Use the same `CAPTION_BOTTOM = 520` margin already in
`video.js` — it already clears both platforms' worst case; do not shrink it for Reels specifically.

**Audio.** Same requirement as TikTok: voiceover, native language, `gen_voice.py`. Reels supports
trending-audio overlays as a discovery mechanic Reels-specific tools expose, but that is a distribution
lever to test later (`ORGANIC-GROWTH.md`'s experimentation section), not a Week-1 requirement — ship
voiced-and-silent-trending-audio-off first, since a licensed-music decision nobody made is exactly the
mistake `autoAddMusic: 'no'` already avoids on TikTok.

**Story vs reel vs feed — the actual bug.** This is the one that broke on 2026-09-01. Postiz reads
`content.format` and posts as an Instagram **Story** only when `format === 'story'`; anything else
posts as a normal feed item (`postiz.js:145-150`). A vertical product-demo video is a **Reel**, and it
must ship with `format` set to something other than `'story'` (the codebase's own convention is
`'reel'`) so it lands in the main feed / Reels tab and has a life past 24 hours. **Use `'story'` only
when the ephemeral 24h window is the intended design** — a behind-the-scenes teaser, a poll, a "we're
live" nudge — never for a finished demo video that is supposed to be the durable asset. Before
scheduling any Instagram video row: read `content.format` off the row and confirm it matches the
surface you actually want, don't trust that whoever authored the row got it right.

**Hashtag policy.** Instagram tolerates more tags than TikTok without a spam penalty (up to ~30 is
technically allowed), but observed best practice on product accounts is 5–8, placed at the end of the
caption or in the first comment. Same mix as TikTok (broad / specific / branded), plus one
market-language tag per post.

### X

**What earns the first 1.5 seconds.** X's native audience defaults to sound-off autoplay in-feed, so
the **on-screen text must carry the claim with the sound muted** — captions/on-screen text are not
optional decoration here, they are the primary channel. Video is secondary to data/opinion on this
platform; a static image with a sharp number, or a short (under 20s) clip with the number burned in
large, outperforms a full voiced demo. Open on the number, not the setup.

**Caption — the hard constraint.** X has a **hard 280-character limit**, and `postiz.js:239-256`
**refuses to auto-truncate**: it throws `PostizError` naming the exact overage rather than cutting a
sentence mid-thought. This means **X copy must be written short natively** — draft it for X first, at
280 chars, not translated down from a TikTok/Reels caption. A caption that fails this check does not
silently post short; it fails the whole schedule call. Write the X version as its own artifact, not a
trim pass on the long-form caption.

**On-screen text.** X's own UI overlays less of the frame than TikTok/Reels (no bottom action rail
docked over the video in the same way), so the safe area is more forgiving, but readability with sound
off is the binding constraint — go 10–15% larger than the TikTok/Reels caption band for anything meant
to read standalone, and keep it on screen at least 0.5s longer per beat than the word-timing alone
would suggest, since a muted viewer reads slower than a listening one.

**Audio.** Optional, not load-bearing — most X video plays start muted. If a voiceover exists (reused
from the Reels cut), it should be additive, not required: the on-screen text must stand alone. 16:9
(`gen_video.py --aspect 16:9`) is the native X frame; a 9:16 vertical clip letterboxes badly in the X
timeline, so where budget allows, cut a wide version rather than reusing the vertical asset unmodified
(`hook-wide.mp4` already exists as a starting point for this).

**Story vs reel vs feed.** N/A. X has one video surface; the story-vs-feed bug does not apply here.

**Hashtag policy.** Minimal to none. 0–2 tags max, and only if genuinely discoverable
(`#vinted`, `#reselling`) — X's own engagement data across product accounts consistently shows tags
add little and sometimes read as noise against the platform's opinion/data-led voice. Prefer the data
point speaking for itself over a hashtag.

---

## Part 2 — three distinct video templates

All three render at **1080×1920** (TikTok/Reels native — see the X note above for the 16:9 exception),
composite captions as **PNG overlays** (this ffmpeg build has no libass — `video.js:26-30` already
documents this; do not attempt `-vf subtitles=`), and mux voiceover with:

```
ffmpeg -i v.mp4 -i vo.mp3 -c:v copy -c:a aac -shortest out.mp4
ffprobe -v error -show_entries stream=codec_type,codec_name -of csv=p=0 out.mp4
```

The second command is the check W57 found nobody had run. **It must print both `video,...` and
`audio,aac` lines before a file is considered postable — a `video` line alone is the exact defect this
whole spec exists to fix.**

### Template A — "Live Check" (screen-recorded product demo)

The existing, correct-shaped asset (`samba-demo-9x16.mp4`'s lineage). Real product, real number, no
generated footage.

```
node scripts/capture_demo.mjs "Adidas Samba"          # or any real, in-market query
node scripts/make_cards.mjs                            # hook + end cards, 1080×1920
bash .claude/bin/with-secrets.sh python3 scripts/gen_voice.py \
  --text "Vinted won't tell you this price. This will." \
  --out docs/marketing/assets/renders/vo/live-check-hook.mp3
```
Then assemble: hook card (0.0–1.2s, TikTok cut starts later per the Part 1 note) → capture frames
(typing + reveal) → end card, concat via ffmpeg, mux the voiceover, verify with `ffprobe`.
**Distinguishing trait:** the only template where the number on screen is never composed — it is
whatever the live site actually returned at capture time, so no two runs can look identical even with
the same script.

### Template B — "Data Drop" (aggregate market snapshot, generated backdrop)

For brand/category aggregates that have no single listing to demo (the sourcing-list / demand-shaped
findings `dealcard.js` already serves with the secondary CTA).

```
bash .claude/bin/with-secrets.sh python3 scripts/gen_image.py \
  --prompt "Abstract dark backdrop, deep navy #0a0d14, faint upward-trending line chart motif, \
  no text, no logos, no people, cinematic, vertical 9:16 composition" \
  --out docs/marketing/assets/renders/data-drop-backdrop.png \
  --model gemini-3-pro-image
bash .claude/bin/with-secrets.sh python3 scripts/gen_voice.py \
  --text "<the aggregate claim, in-market language>" \
  --out docs/marketing/assets/renders/vo/data-drop.mp3
```
Composite the brand/category numbers (never a per-model price) over the generated backdrop using the
existing `dealcard.js` HTML/Chrome-screenshot path — the backdrop is abstract B-roll per `.env.example`
("used ONLY for backdrops... NEVER to depict a listing, a price, or a result"), the actual figures are
rendered as real HTML/CSS text, not asked of the image model. **Distinguishing trait:** static generated
backdrop + live-rendered data overlay, motion comes from the caption band and a slow push-in
(`video.js`'s existing zoompan path for non-card b-roll), not from screen capture.

### Template C — "Worth It?" (Veo-generated scenario, product-adjacent, no invented data)

For the pain-point / aspirational lane (`CONTENT-RULES.md`'s expanding-the-market playbook) where the
opening beat is a relatable scenario (someone scrolling Vinted, a pile of clothes) rather than the
product UI itself — the product only appears in the payoff beat.

```
bash .claude/bin/with-secrets.sh python3 scripts/gen_video.py \
  --prompt "Handheld phone POV scrolling a Vinted-style resale listings feed, natural indoor \
  lighting, no on-screen text, no logos, no readable brand names, 9:16 vertical, 6 seconds" \
  --out docs/marketing/assets/renders/worth-it-scenario.mp4 \
  --aspect 9:16
bash .claude/bin/with-secrets.sh python3 scripts/gen_voice.py \
  --text "Can you actually tell if this is underpriced? Here's what the data says." \
  --out docs/marketing/assets/renders/vo/worth-it.mp3
```
Cut the Veo scenario (beats 1–2) directly into the Template A capture (beats 3–4, the real reveal) so
the payoff is still a real, live number — Veo supplies only the cold-open scenario, never the data.
**Distinguishing trait:** the only template that opens on a generated scene rather than the product or
a data card, and it is the one most different-looking at a thumbnail glance, which is the actual
requirement (no two posts should look identical again).

### Why no rendered files ship with this document

**This session has no shell/execution tool** — `Read`, `Edit`, `Write`, `Grep`, `Glob` and a browser
pane, nothing that can run `node`, `python3`, `ffmpeg` or `ffprobe`. That is the exact gap
`WORKBOARD.md` W8 already recorded once today for a `designer`-lane session ("I gave it a browser and
no shell, so `gen_video.py` was unreachable — my briefing error") and the founder's own file naming
convention (`docs/marketing/assets/renders/`) implies rendering was expected to happen in this pass.

Per this company's own rule — **never manufacture proof** — the honest move is to say so rather than
invent `ffprobe` output for files that were never produced. The three command blocks above are
complete and copy-pasteable; they need an agent or session with shell access (the same access the CEO
used for `capture_demo.mjs → make_cards.mjs → ffmpeg concat` per W8) to actually execute, verify with
`ffprobe`, and drop the outputs under `docs/marketing/assets/renders/` with names distinct enough to
tell apart at a glance (e.g. `live-check-samba-es.mp4`, `data-drop-newbalance-fr.mp4`,
`worth-it-declutter-de.mp4` — subject and market in the filename, never a shared generic name, which is
the specific mistake that put one file on 10+ rows).

**Recommend to whoever dispatches the next pass:** re-run this task, or the render half of it, from a
session with `Bash`/shell access. Everything upstream of "press render" — the spec, the exact template
definitions, the exact commands, the exact verification gate — is done and on disk now.

**What was verified this session, with the tools available (browser, no shell):** navigated the live
`https://resaleiq.dev` and confirmed, against the DOM directly (not assumed from the script), that
`capture_demo.mjs`'s two selectors still resolve on production today — `input[placeholder*="Adidas"]`
matches the real placeholder `"e.g. Adidas Samba, Nike Air Force 1, New Balance 530"`, and
`getByRole('button', { name: /check it free/i })` matches the real button, currently reading
"Check it free". So Template A's capture command is not stale against a since-changed UI. Did not
complete a full manual type-and-submit walk (pixel-coordinate clicks against the rendered input were
unreliable in this pane across three attempts — click landed but focus/typing did not consistently
register); that is a tooling limitation of this session, not a finding about the product, and it does
not block a real `node scripts/capture_demo.mjs` run, which drives the DOM directly rather than pixel
coordinates.
