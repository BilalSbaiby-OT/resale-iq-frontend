# ESCALATION — how the company reaches the founder when it must

**Written 2026-09-01**, after the founder gave a mobile number and said *"find a way."*

## The number is NOT in this file, and that is deliberate

A personal mobile committed to a git repository is personal data in version control. It survives
deletion in the history, it travels to every clone, and this repo has a GitHub remote.

The role that would object is our own. `legal-compliance` carries **"no PII in logs"** as its
counter-KPI, and it spent tonight documenting that our live privacy page already promises data
handling the backend does not deliver. Writing the founder's mobile into `docs/` in the same week
that finding is open would be the company failing its own audit.

**Where it goes instead:** the credentials file, as `FOUNDER_PHONE`. Gitignored, never read into a
session, reached only through `.claude/bin/with-secrets.sh` — which puts a value into a child process
and scrubs it back out of the output. That is the same path the live Stripe key already takes, and
the founder adds it himself in one line without any agent seeing the value.

## What I can and cannot do

**Cannot:** place a call or send an SMS. There is no telephony tool in this harness, and I am not
going to wire up a third-party SMS provider and begin sending to a real number autonomously
overnight. An outbound message to a person is not something to bootstrap unsupervised.

**Can, and it already exists:** the company has a working pager. `scripts/health_check.py` sends to
Telegram via `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`, and `job_health_check` runs it every six
hours and pages on failure. `users.telegram_chat_id` exists for per-user alerts.

**A channel that already works and has been exercised beats a new one built at 4am.** If the founder
wants his phone reached specifically, the shortest honest path is a Telegram message to himself from
the bot that is already wired — not a new integration.

## What actually warrants waking him

The failure mode to avoid is a pager that fires often enough to be ignored. Escalate on these, and
nothing else:

| Wake him | Why |
|---|---|
| Production is down, or serving wrong prices to paying users | money and trust, immediately |
| A secret may have leaked | irreversible |
| A decision the roster cannot resolve **and** work is blocked on it | he is the tiebreak |
| A deploy the roster has approved is about to go out | AM-7 keeps him informed, not asked |

**Do not wake him for:** an agent disagreeing with the CEO — that is normal, and happened four times
on 2026-09-01, correctly, every time. A metric rendering UNKNOWN — that is the system working. A
proof that is failing on purpose. Anything that can wait for the digest.

## The default remains the digest

Everything else goes to `docs/company/DIGEST-<date>.md` and `APPROVALS.md`, which he reads when he
wakes.

**A company that needs to phone its founder overnight has usually failed earlier, somewhere a digest
would have caught.** The escalation path exists so that it is available and rare, not so that it is
used.
