# CONTENT RULES

**Founder-written, 2026-09-01: *"this should be rules — always work toward it."*** Sits under
`OBJECTIVE.md` (maximise long-term profit) and `ORGANIC-GROWTH.md` (the growth charter). Every agent
producing anything a customer sees works from this.

---

## The ten content types that work here

1. **Pain-point memes** — dead stock, overpaying, the size that never sells
2. **"Should I buy this?"** — real BUY / WATCH / SKIP verdicts on real listings
3. **Data insights & market snapshots**
4. **Before → After sourcing results**
5. **Live deal finds** — opportunities under buy-below right now
6. **Size & demand deep-dives**
7. **Educational** — "stop guessing"
8. **Build-in-public & data transparency**
9. **Reseller war stories / diaries**
10. **Soft CTA** — pain → solution

## Weekly mix

| share | content |
|---|---|
| **35%** | Pain memes + verdict examples |
| **25%** | Data insights + deal finds |
| **20%** | Educational |
| **15%** | Proof + build-in-public |
| **5%** | Engagement questions |

## The ten producer lanes

`pain-humor` · `verdict-decision` · `data-insight` · `deal-finder` · `educational-method` ·
`proof-results` · `build-in-public` · `comparison-hot-take` · `soft-cta` · `community-engagement`

Each is a **brief shape**, not a new agent file — `content-social` and `designer` run them.

---

## EXPANDING THE MARKET — the founder's biggest strategic instruction

> *"market using our tool to make money. get people into reselling. use the Andrew Tate method but in
> a smart way — so even people who don't resell. hooks like 'how to double your money in a week'.
> ethical ways to make money. businesses to get into — which is reselling, using our tool. give info
> and include our tool."*

**This is the single largest expansion of the addressable market available to us.** Every piece of
content until now targeted **people who already resell** — a small, hard-to-reach audience. The
aspirational lane targets **people who want income and have not chosen a method**, which is
enormously larger and far more responsive on TikTok, Reels and Shorts.

**The playbook:** lead with the outcome, teach the method for real, and the tool is the thing that
makes the method work.

- *"€100 to €300 in three weeks, using stuff people throw away"*
- *"The side business you can start today with €50 and a phone"*
- *"Why most people lose money flipping — and the one number that fixes it"*
- *"I bought 5 items for €X. Here's what they're actually worth."*

**Teach genuinely.** The audience is not stupid and the algorithm punishes bait. The content has to
be useful **on its own** — then the tool is the obvious next step rather than the price of the
lesson.

### The one line that keeps this profitable rather than fatal

**Never state or imply a guaranteed return.** *"Double your money in a week"* as a **promise** is a
financial claim; as a **question or a demonstration** it is a hook.

- ✅ *"Can you double €100 in a week on Vinted? Here's what the data actually says."*
- ✅ *"This item sold for 3× what it was listed at. Here's how to find them."*
- ❌ *"Double your money in a week. Guaranteed."*

**This is commercial, not moral.** Guaranteed-income claims get accounts **permanently banned** on
every platform we are on, and in the EU they attract consumer-protection enforcement. **One banned
TikTok costs more than every post that account will ever carry.** The hook survives; the promise
does not.

**And never fabricate a result.** No invented earnings, no fake before/after, no testimonial we did
not receive. Our numbers are checkable by any reseller with a Vinted account — one disproven claim
costs the channel permanently. **Real data is the moat; inventing it hands the moat away.**

---

## Standing rules for every piece

- **`resaleiq.dev`.** Never `.com` — we do not own it and it resolves to someone else.
- **"watched departures" / "left the shelf", never "sold".** `sold_observed` means a listing left the
  shelf; it can leave by delisting, edit or reservation.
- **Aggregates public, per-model buy-below paid** (`DATA_CONTRACT.md` rule 4). Brand and category
  volume, average price and concentration are free to publish. **A per-model price may appear inside
  a product demo — that is the free tier working — never as the message.**
- **No Balenciaga, nothing authenticity-adjacent** (`GTM.md` §B3). No counterfeit filter exists.
- **ES · FR · DE · IT · PT.** No UK claim. **71% of our search impressions are US/GB — markets we
  cannot serve**, so English-only content actively recruits the wrong audience.
- **Never glue "12.7M listings" to "26 markets."** 12.7M is the tracked corpus on 5 EU markets; the
  26 are live pass-through search.
- **Platform-native.** One insight, adapted — never one post reposted five ways.


---

## ASSET VERIFICATION — added 2026-09-02 after two broken videos reached the queue

**`ffprobe` is not verification. It reports codec, resolution and audio. It cannot see that the video
shows our product failing.**

Two drafts (rows 149, 151) were the only Instagram content with UTMs *and* assets — the obvious
things to publish — and both **ended on a failure screen**:

> *"No data found for 'Zara blazer'. Try a brand + model name."*

They passed every automated check we have: `video+audio+1080`, distinct md5, correct duration. A
third asset previously reported as verified-good, `carhartt-demo-9x16.mp4`, ends on
*"'Carhartt jacket' is not a product in the catalog."*

### The rule

**Before any video is published, pull its last frame and look at it.**

```
ffmpeg -v error -sseof -0.5 -i VIDEO.mp4 -frames:v 1 -y /tmp/last.png
```

**If the frame shows an error, a "no data" message, or an empty result, the asset is dead.** Mark the
row `blocked_broken_asset` with the reason. Do not publish and do not quietly delete — a broken asset
kept with its reason teaches more than a note saying one existed.

### The cause, so it stops recurring

**Videos shot against a VAGUE query produce failure screens. Videos shot against a SPECIFIC MODEL
produce real results.**

| shot against | outcome |
|---|---|
| `Zara blazer`, `Carhartt jacket` | ❌ "no data found" — unusable |
| `Adidas Samba` (r131) | ✅ buy-below €21 · market €32 · 63 left shelf vs 19,700 listed · WATCH |

**Shoot against a model the catalogue actually holds.** Note that W60 has since changed this: a vague
query now returns a **brand average** instead of nothing, so re-shooting the same query today would
work. **Re-shoot; do not discard.**

### Also check the caption matches the video

Row 131's caption is about **New Balance in Portuguese**; its video shows **Adidas Samba**. Both are
real, so nothing false was published — but a caption promising one thing over footage showing another
is the kind of sloppiness a viewer notices before we do.
