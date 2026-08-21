# GUARDRAILS — read before anything that leaves this machine

The loop runs unattended with `--permission-mode acceptEdits`. Nobody is
watching. These are the things that cannot be undone by the next session.

## NEVER, without a human saying so in HANDOFF
- `git push` — commits stay LOCAL unless HANDOFF says `PUSH: yes`
- Deploy anything (Coolify, `gh repo edit --visibility public`, any deploy API)
- Write to the production database
- Change Stripe prices, products, webhooks, or any dashboard setting
- Publish/update the Chrome extension listing
- Send email, post publicly, or touch DNS
- Rotate, print, or commit a secret

Hitting one of these is not a failure — it is a `BLOCKED`. Write the exact
action a human must take, set `STATUS: BLOCKED`, exit.

## Scope
- **This repo** `~/Desktop/resale-iq` — Next.js frontend + `extension/`. Commit here.
- **Sibling repo** `~/Desktop/demand-intel` — FastAPI backend. If a task needs a
  backend change, commit it THERE, separately, and say so in HANDOFF.
- Never edit anything outside those two directories.

## Verify before commit — always
`npx tsc --noEmit` and `npm run build` must both pass. Reading the code is not
verification. This repo has shipped handlers that were never reachable.

## Data honesty (the product's whole thesis)
- Never invent, round up, or hardcode a count. Numbers come from one source.
- A number we cannot measure is withheld and labelled — never shown as `0`.
- `sold_7d = 0` can mean "nothing sold" OR "we cannot see this brand". They are
  not the same and must not render the same.
