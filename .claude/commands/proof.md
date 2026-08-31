---
description: Re-run every proof.sh cold and report the tally — OS rule 6
allowed-tools: Bash(bash docs/audit/proof/*), Bash(find docs/audit/proof*), Read
---
OS §0 rule 6: not proven on disk is not done. Re-run the proofs from a directory that is not the
repo, so a proof that quietly depends on cwd fails here rather than in front of the founder.

```bash
find docs/audit/proof -name proof.sh
```

Run each one from `/tmp`. Report per-proof pass/fail and the total.

**Rules for reporting:**
- A proof that errors is a FAILURE, not a skip.
- A proof that passes having asserted nothing is also a failure — check the assertion count is
  non-zero, not just the exit code. This is the same rule as `n = 0` on a check.
- Do not fix a failing proof in the same pass as running it. Report first; the doer must not also be
  the scorer (OS §0 rule 7).
