# BUY is unreachable by construction

**2026-09-02. Found by the grey-area design workflow, verified independently by the CEO against
production before being acted on.**

---

## The finding

`api/routes.py:1177`:

```python
if score >= 65 and momentum in ("HOT", "RISING"):
    verdict = "BUY"
```

Production `model_signals`, all 100 models:

```
opportunity_score   min 9.3   avg 21.0   MAX 59.2        BUY needs >= 65
momentum_label      STABLE 54 · FADING 20 · RISING 16 · DEAD 6 · HOT 4

models that can EVER return BUY:  0 of 100
```

**The bar is set above the ceiling of the data. Not one model on the board can produce a BUY, and
the average model scores 21 against a threshold of 65.**

That is why the product has said BUY **six times in its life and not once in twelve days**. It was
never a market judgement. It was arithmetic.

## What this corrects

Both the founder's framing and mine were wrong, and it is worth writing down exactly how:

- **The founder's read:** the free tier is too generous, so nobody registers. Measured: **92% of
  anonymous visitors run exactly ONE check** and only 2 of 60 ever reached the cap. The cap was never
  the reason.
- **My read:** `buy_below = avg × 0.95 × 0.70` is too strict, so almost nothing qualifies. Measured
  by the workflow: **21.4% of watched departures already clear that line.** Re-tuning those constants
  would have changed nothing.
- **The actual cause:** a second gate downstream — `opportunity_score >= 65` — that no row in the
  dataset can pass, plus a momentum filter that excludes the **54 STABLE models**, including the two
  most-queried items.

**I spent hours on the wrong constant.** The formula on the homepage is fine. The gate behind it is
impossible.

## Why nobody noticed

Every surface reported honestly. WATCH is a legitimate verdict, so 118 WATCHes looked like a market
with few bargains rather than a threshold nobody could clear. **Nothing errored. Nothing logged.** A
verdict distribution is only alarming if you compare it against what the thresholds could produce,
and no check ever did.

This is the **silent-failure** class from `POST-MORTEM.md` in its purest form: the system did exactly
what it was told, and what it was told was impossible.

## What must NOT happen next

**Do not lower the threshold until someone can say what 65 was supposed to mean.** The number is
either:

1. **Calibrated against a scale that changed** — if `opportunity_score` was rescaled at some point,
   65 is a fossil and the fix is to recalibrate against the live distribution.
2. **Aspirational** — set for a market with better opportunities than this one, in which case
   lowering it to fire on today's data manufactures a BUY that the original author would not have
   endorsed.

**Moving a threshold until the answer becomes "yes" is the exact shape of manufacturing proof.** A
BUY that exists because we lowered the bar is a lie with a number attached, and it is worse than
never saying BUY — a customer who loses money on our first-ever yes never comes back, and tells
people.

**The honest sequence:** establish what the score means and what its live distribution is, decide the
threshold against that, and say in the release note that the bar moved and why.

## Owner

`data-scientist` — the score is theirs, and this is a calibration question, not a code fix.
`backend-eng` owns the change once the number is decided. **One named doer per row.**

## The wider point

**Three separate diagnoses tonight — the founder's, mine, and the first workflow proposal's — were
all confidently wrong about the same symptom.** All three were reasoning from plausible mechanisms
instead of measuring the gate. The finding took one query against a table we had been reading all
night.

Ask what the code can actually output before asking why it does not output it.
