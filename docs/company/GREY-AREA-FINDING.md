# We say "I don't know" while holding the answer

**2026-09-01. The founder: *"shit dosnt need to be exact bro as long as it works and fullfill what
the customer need in that niche."* He was right, and this is the evidence.**

---

## The queries we refused to answer

These are real UNKNOWN rows from `verdict_logs` — what people actually typed:

```
Carhartt Detroit    → UNKNOWN (unknown)
Nike Air Max        → UNKNOWN (unknown)
Carhartt jacket     → UNKNOWN (model_too_vague)
Fred Perry polo     → UNKNOWN (model_too_vague)
Puma Suede          → UNKNOWN (unknown)
jordan 3            → INSUFFICIENT_DATA (thin_comparables)
```

**That is how a reseller talks.** Nobody types a canonical model identifier. "Carhartt jacket" is a
normal human sentence, and we answered it with `model_too_vague`.

## What we were holding at that exact moment

Straight from production `market_stats`:

| what they asked | what we had |
|---|---|
| Carhartt jacket | **Carhartt Jackets**, FR: 1,609 listed · **10 departures** · **€48.53 avg** (also PT and ES) |
| Nike Air Max | **Nike Sneakers**: 54,587 listed · **282 departures** · **€107.98 avg** |
| Puma Suede | **Puma Sneakers**: 12,236 listed · **128 departures** · **€49.17 avg** |
| Fred Perry polo | **Fred Perry Shirts**: 1,648 listed · **65 departures** · **€22.04 avg** |
| jordan 3 | **Jordan Sneakers**: 14,216 listed · **67 departures** · **€152.84 avg** |

**Every single one. We said nothing while holding a real number with a real sample size.**

`said_sell_avg` is NULL on all 86 UNKNOWN rows — so this is not a case of computing a number and
withholding it. **We never look.** The match fails against the per-model catalogue and the request
stops there, without ever asking the brand-and-category question we can answer.

## And we are already allowed to say it

`DATA_CONTRACT.md` rule 4: **brand and category aggregates are PUBLIC. Per-model buy-below is the
paid product.**

So the answer above is not a rail we have to break. **It is a rail we already wrote, and never
used.** No gate moves. Nothing gets given away. The paid product — the per-model buy-below — stays
exactly where it is.

## The distinction I had been conflating, and the founder had not

Two things I was treating as one:

1. **Never manufacture proof.** Never invent a number. **This is sacred and does not move.**
2. **Never give an approximate answer.** ← this was never a rule. I inherited it from (1) and
   enforced it as if it were the same thing.

**They are opposites in effect.** Refusing to answer does not protect the customer from a bad number;
it just leaves them with nothing and sends them elsewhere. A reseller typing "Carhartt jacket" does
not need per-model precision. They need *roughly, is this worth my money, and how crowded is it.*

**The honest version of not knowing is not silence. It is a smaller claim, clearly labelled.**

## What the answer should have been

Instead of `UNKNOWN`, for "Carhartt jacket":

> **Carhartt jackets — around €48 when they leave the shelf.**
> 1,609 listed in France right now, 10 departed last week. That is a crowded shelf: about 160 listed
> for every one that moves.
> *This is the brand-and-category average, not this exact jacket. Tell us the model for the number
> for THIS item.*

Every figure traceable. Nothing invented. The sample size is stated. The limitation is stated in the
answer itself, in the same breath as the number — **and it converts a dead end into both a useful
answer and the clearest possible reason to give us a model name.**

## Why this outranks the conditional-buy idea

Both are grey-area answers, but this one is bigger:

- **It converts UNKNOWN — about a third of all current checks — into a real answer.** The conditional
  buy improves WATCH, which is already an answer of sorts.
- **It needs no threshold change and no new data.** The data is sitting in `market_stats`.
- **It fixes the moment that actually loses people.** 92% of anonymous visitors run exactly one check.
  If that one check says "I don't know", we have spent a visitor and given them nothing.

## What this does NOT license

- **No invented numbers.** If `market_stats` has nothing for that brand, the answer is still UNKNOWN.
- **No per-model buy-below given away.** The aggregate is public; the per-model number is the paid
  product and it stays paid.
- **No hiding the limitation.** The sentence saying "this is a brand average, not this item" is part
  of the answer, not a footnote — remove it and this becomes exactly the dishonesty the rails exist
  to prevent.
- **No guaranteed returns**, no days-to-sell, nothing authenticity-adjacent, and it is still
  **watched departures**, never "sold".
