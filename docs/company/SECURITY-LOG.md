# SECURITY-LOG

Every blocked call and every tripwire hit. Written by hooks only (`.claude/hooks/guard.py`, `.claude/hooks/activity.py`). Never edit by hand.

- `2026-08-31T16:22:30Z` **DRILL** Phase 0 rails installed and tested, 26/26 including negative controls. Drill rows were moved to `docs/audit/proof/W36/phase0/`; re-run with that `proof.sh`.
- `2026-08-31T16:22:30Z` **NOTE** `.claude/UNLOCK_HARNESS` was used once during Phase 0 bootstrap to let the hooks accept `COMPANY_OS_LOG_DIR`, then removed. The gate is armed again.
- `2026-08-31T16:22:33Z` **BLOCKED** Write — protected harness path (.claude/hooks/) — `/Users/bilalsbaiby/Desktop/resale-iq/.claude/hooks/guard.py`
