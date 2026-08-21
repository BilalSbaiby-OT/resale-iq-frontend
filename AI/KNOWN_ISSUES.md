# Known issues (frontend)

- Chrome Web Store listing may not be published; hero CTA uses a store search URL unless `NEXT_PUBLIC_CHROME_STORE_URL` is set.
- `/dashboard` auth redirect is client-side (`AppShell`), not middleware.
- Public `sold_7d` on `/data` still carries the snapshot `counting_method` caveat (discovery vs sale) until the corpus saturates.
- Sell-through remains paused product-wide.

Production disk/DR: see `../demand-intel/AI/KNOWN_ISSUES.md` (99% full, empty Coolify backups, no rclone).

See also `../demand-intel/docs/READINESS_AUDIT_2026-08-20.md`.
