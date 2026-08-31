# SECURITY-LOG

Every blocked call and every tripwire hit. Written by hooks only (`.claude/hooks/guard.py`, `.claude/hooks/activity.py`). Never edit by hand.

- `2026-08-31T16:22:30Z` **DRILL** Phase 0 rails installed and tested, 26/26 including negative controls. Drill rows were moved to `docs/audit/proof/W36/phase0/`; re-run with that `proof.sh`.
- `2026-08-31T16:22:30Z` **NOTE** `.claude/UNLOCK_HARNESS` was used once during Phase 0 bootstrap to let the hooks accept `COMPANY_OS_LOG_DIR`, then removed. The gate is armed again.
- `2026-08-31T16:22:33Z` **BLOCKED** Write — protected harness path (.claude/hooks/) — `/Users/bilalsbaiby/Desktop/resale-iq/.claude/hooks/guard.py`
- `2026-08-31T16:32:31Z` **BLOCKED** Read — protected harness path (docs/company/OS.md) — `/Users/bilalsbaiby/Desktop/resale-iq/docs/company/OS.md`
- `2026-08-31T16:32:58Z` **BLOCKED** Read — protected harness path (docs/company/OS.md) — `/Users/bilalsbaiby/Desktop/resale-iq/docs/company/OS.md`
- `2026-08-31T16:33:39Z` **BLOCKED** Read — protected harness path (docs/company/OS.md) — `/Users/bilalsbaiby/Desktop/resale-iq/docs/company/OS.md`
- `2026-08-31T16:34:09Z` **BLOCKED** Read — protected harness path (docs/company/OS.md) — `/Users/bilalsbaiby/Desktop/resale-iq/docs/company/OS.md`
- `2026-08-31T16:34:36Z` **BLOCKED** Read — protected harness path (docs/company/OS.md) — `/Users/bilalsbaiby/Desktop/resale-iq/docs/company/OS.md`
- `2026-08-31T16:35:42Z` **BLOCKED** Bash — touches a .env file — `cd /Users/bilalsbaiby/Desktop/demand-intel && echo "=== .gitignore ===" && cat .gitignore && echo && echo "=== git ls-files | grep env ===" && git ls-files | grep -i env; echo "(end)"; echo; echo "=== git check-ignore -v .env ===" && git check-ignore -v .env; echo "(exit code: $?)"`
- `2026-08-31T16:35:52Z` **BLOCKED** Bash — touches a .env file — `cd /Users/bilalsbaiby/Desktop/resale-iq echo "=== frontend env vars (process.env.*) ===" grep -rhoE "process\.env\.[A-Z_]+" src/ next.config.ts scripts/ 2>/dev/null | sort -u echo cd /Users/bilalsbaiby/Desktop/demand-intel echo "=== backend env vars (os.environ/os.getenv) ===" grep -rhoE "os\.(envir`
- `2026-08-31T16:36:13Z` **BLOCKED** Write — protected harness path (.claude/hooks/) — `/Users/bilalsbaiby/Desktop/resale-iq/.claude/hooks/session-start.sh`
