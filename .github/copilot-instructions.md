<!-- preflight:start v0.2.0 -->
# Security Preflight

Before implementing any new feature that touches user input, data storage, auth, or an external service (login, uploads, search, comments, payments, APIs, admin panels, webhooks, forms), and again right after it's implemented, follow the PreFlight process defined in `AGENTS.md` at the repo root (fall back to `PROMPT.md` if `AGENTS.md` is missing).

1. **Before coding**: restate the feature as an attack surface, check it against `references/vulnerability-checklist.md` plus `references/project-edge-cases.md`, silently auto-fix anything purely code-level (parameterized queries, password hashing, secure cookies, IDOR/ownership checks, input validation, generic errors), and produce one priority-ordered markdown checklist of only the items that need the developer (new credentials, third-party signups, infra/DNS, product decisions) - suggest free-tier services from `references/free-tier-services.md` where relevant. Record each auto-fix as a checkable claim (file + a concrete assertion), not just a description. Before the first report, make sure `security-reports/` is covered by this project's `.gitignore`. Save the full finding list to `security-reports/<feature-slug>-preflight.md`. Only pause for input if a needs-developer item blocks the feature from working at all.
2. **After coding**: re-open the saved report and check each auto-fix claim against the real code - quote the matching evidence, don't just recall the claim - update the checklist to reflect what's resolved vs. still open, and flag anything the implementation introduced that wasn't anticipated (leaked errors, debug flags, etc.).

Do not apply this to pure refactors, styling/CSS-only changes, or read-only/informational questions.
<!-- preflight:end -->
