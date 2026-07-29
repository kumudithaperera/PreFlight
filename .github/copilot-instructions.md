# Security Preflight

This repository ships the PreFlight security-preflight process. Whenever you're asked to add, build, or implement a feature that will run as real code - auth, file uploads, search, comments, payments, APIs, admin panels, webhooks, forms, or anything touching user input, stored data, or an external service - follow the process in `AGENTS.md` at the repo root (use `PROMPT.md` as a fallback if `AGENTS.md` isn't available in context).

In short:

- **Before implementing**: describe the attack surface, check findings against `references/vulnerability-checklist.md` and `references/project-edge-cases.md`, silently fix anything code-level (parameterized queries, hashing, secure cookies, IDOR checks, input validation, generic errors - don't ask permission for these), and list only the items that need the developer (new credentials, third-party accounts, infra config) as a priority-ordered checklist, referencing `references/free-tier-services.md` for free-tier suggestions. Save the report to `security-reports/<feature-slug>-preflight.md`.
- **After implementing**: re-check the saved report - verify each auto-fix actually landed, update what's resolved vs. still open, and flag anything unanticipated the code introduced.
- Only pause for a response before coding if a needs-developer item is required for the feature to function at all; otherwise implement now and present the checklist alongside the finished feature.
- Skip this process for pure refactors, styling-only changes, or read-only/informational questions.
