# Security (frontend)

- CSP + frame-ancestors none on all Next routes.
- Paid fields must be absent when `locked: true`, never CSS-blurred.
- `null` must not render as `0`.
- Do not commit `.env` or tokens.
- Extension does not read the Vinted session.
