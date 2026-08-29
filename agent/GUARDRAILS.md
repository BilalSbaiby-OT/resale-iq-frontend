# GUARDRAILS — read before anything that leaves this machine

The loop runs unattended with `--permission-mode acceptEdits`. Nobody is
watching. These are the things that cannot be undone by the next session.

## READ THIS FIRST — since 2026-08-29, A PUSH TO `main` IS A DEPLOY

`git push origin main` now ships to production by itself. Both repos have a
`Deploy` workflow that fires automatically once CI passes:

- `resale-iq` — after **Agent Isolation** goes green → resaleiq.dev rebuilds
- `demand-intel` — after **Tests** goes green → the customer-facing API rebuilds

There is no second confirmation, no human in the loop, and nothing to click.
The gate is CI: a red build does not deploy. That is the whole safety net.

So `PUSH: yes` in HANDOFF no longer means "publishing the commit is safe" — it
means **"deploying to production is safe."** If you are not ready for customers
to get your change, commit on a branch and do not push `main`.

To ship without deploying, push a branch. To deploy deliberately, run
`gh workflow run deploy.yml`.

## NEVER, without a human saying so in HANDOFF
- `git push` to `main` — this DEPLOYS (see above). Commits stay LOCAL, or on a
  branch, unless HANDOFF says `PUSH: yes`
- Deploy anything by any other route (Coolify UI/API, `gh repo edit
  --visibility public`) — the automatic pipeline above is the sanctioned path,
  and it is the only one that runs the CI gate first
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
