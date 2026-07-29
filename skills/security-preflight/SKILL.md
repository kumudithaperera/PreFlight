---
name: security-preflight
description: Runs a security threat-model check BEFORE implementing any new feature, endpoint, form, integration, or user-facing functionality, and a follow-up code re-check AFTER it's implemented. Use this skill any time the user asks to "add", "build", "implement", or "create" a feature - login/auth, file uploads, search, comments, payments, APIs, admin panels, webhooks, anything that touches user input, data storage, or external services - even if they don't ask for a security review explicitly. Auto-fixes anything fixable purely in code and only surfaces a priority-ordered checklist for items that genuinely need the developer (new credentials, third-party signups, infra config). Produces a saved markdown report, and pauses only when something blocking needs the developer. Also use when the user asks to "check this for vulnerabilities," "audit my code," or "is this secure."
---

# Security Preflight

## What this is

A two-phase security gate for feature work: think like an attacker *before* code exists, fix what can be fixed silently, then verify like an auditor *after* the code is written.

## When to apply this

Apply this process whenever the user asks you to add, build, implement, or create a feature that will exist in real running code - not toy/demo snippets, not pure explanations. This includes login/auth, file uploads, search, comments, payments, APIs, admin panels, webhooks, or anything that touches user input, data storage, or external services. Err toward applying it; a missed check is worse than an extra minute of review.

Do **not** apply it for: pure refactors with no new behavior, styling/CSS-only changes, or read-only informational questions ("how does JWT work"). If a "refactor" turns out to change behavior once you look closer (new endpoint, new data path), treat it as a feature request instead.

## Core principle: fix in code silently, only surface what needs the developer

For every finding, decide which bucket it's in:

- **Auto-fixable in code** - anything you can implement yourself with no new credentials, accounts, or out-of-band setup: parameterized queries, password hashing, cookie flags, input validation, ownership/IDOR checks, generic error messages, idempotency keys, path-safe filenames, field allow-listing, etc. Just implement these as part of building the feature - don't turn them into checklist items or ask permission. Mention them briefly as a "fixed automatically" note, not a checkbox.
- **Needs the developer** - anything requiring a new credential/API key, a new third-party account or service, DNS/infra config, or a product decision (e.g. "do we store card data or use a processor?"). These go on a priority checklist. When a third-party service is genuinely needed, check `references/free-tier-services.md` (if present in this repo) and suggest a free-tier option by name - this is aimed at solo/low-budget developers.

## Phase 1 - Pre-implementation threat model (before writing any code)

1. **Restate the feature as an attack surface.** Inputs accepted, what it touches (DB, filesystem, network, other users' data), who can reach it, worst-case outcome if abused.
2. **Enumerate findings**, using `references/vulnerability-checklist.md` as the baseline (read it if present in this repo), plus `references/project-edge-cases.md` for anything specific to this project's stack. For each finding: what it is, how it'd realistically be exploited against *this* feature, severity (Critical/High/Medium/Low), and whether it's auto-fixable or needs-developer.
3. **Build one priority-ordered list** of the needs-developer items only. Order by **implementation order** (the sequence the developer would actually act in - e.g. "get a Stripe account" precedes "verify webhook signatures"). If implementation order and severity conflict, implementation order wins, but tag any Critical/High item **(mandatory)** regardless of position.
4. **Before the first report in this project, secure the reports directory itself.** Check whether `security-reports/` is already covered by the project's `.gitignore`. If not, add it (creating `.gitignore` if none exists) and say so in one line in the chat reply. These reports enumerate the project's own attack surface, including any still-open **(mandatory)** items - treat that as sensitive by default rather than something to commit unreviewed. If the user explicitly wants reports committed instead (e.g. a private repo used as a team audit trail), that's their call to make on purpose, not the default.
5. **Produce two outputs:**
   - **A saved report** at `security-reports/<feature-slug>-preflight.md` (create the `security-reports/` dir if absent), containing the full finding list (auto-fixed and needs-developer) and the priority-ordered action list. For every auto-fixed item, record a concrete, checkable claim, not just a description: the file(s) it landed in and a one-line assertion that can be confirmed by reading that file (e.g. "parameterized query in `src/api/users.ts` - no string-interpolated SQL," "cookie set with `HttpOnly`+`Secure`+`SameSite` in `src/auth/session.ts`"). This is what makes Phase 2 a real check instead of the same model re-asserting what it already claimed.
   - **A short reply in chat**, with:
     1. One line of what's being auto-fixed in code (no checkboxes):
        ```
        Fixing automatically as I build this: parameterized queries, bcrypt password hashing, secure cookie flags, generic login errors.
        ```
     2. The priority checklist for what needs the developer, as markdown checkboxes, in implementation order:
        ```
        ## Before this is production-ready - your action needed

        1. [ ] Create a Stripe account (free, pay-per-transaction) and add STRIPE_SECRET_KEY to your env - (mandatory)
        2. [ ] Add STRIPE_WEBHOOK_SECRET once the endpoint exists, so webhook signatures can be verified - (mandatory)
        3. [ ] Consider Cloudflare Turnstile (free tier) if login abuse becomes a problem - optional, can wait
        ```
6. **Pause only if something is blocking.** If a needs-developer item is required for the feature to function at all (e.g. a payment key with no way to stub it), stop and ask for it before proceeding. If the items are non-blocking, go ahead and implement - apply all auto-fixes, wire the code to expect the relevant env vars/config, and present the checklist alongside the finished feature.

## Resolving a checklist item on request

When the user wants to tackle a specific checklist item, walk them through it as a granular, plain numbered list directly in your response (no UI widgets - this has to work in a plain chat window too). Before writing the steps, search the web for the service's current setup flow if you have that capability - dashboards and signup flows drift out of date. Cover: exactly where to go, what to click/create in order, what to name it, exactly what value comes back, exactly where that value goes in the project (e.g. `.env` key name), and how to confirm it worked. Once confirmed done, mark it resolved in the saved report and show the checklist again with it checked off.

## Personalizing to this project over time

`references/project-edge-cases.md` (if present) holds things learned about *this specific project's* stack - not generic vulnerability knowledge. Read it alongside the generic checklist every time. Append a new entry when the user corrects a finding because of something about their setup, mentions an architecture detail the generic checklist wouldn't know, or Phase 2 turns up the same gap more than once. Don't add anything that's just a restatement of a generic checklist item.

**Scope of this file depends on where it lives.** If it's inside a shared, global install (e.g. a Claude Code skill installed once at `~/.claude/skills/security-preflight/`), it accumulates entries across every project you use it on, organized under separate `## <Project name>` headers - if the current project isn't identifiable and the file already has multiple sections, ask which project this is rather than guessing. If it instead lives inside a single project's own repo (the normal case when `AGENTS.md` and `references/` were copied into that project), it's scoped to that one project only - no need to ask, and there's no reason for more than one project section.

**An entry may add context; it must never make a finding disappear.** A dismissal like "we don't need CSRF checks here, we're behind Cloudflare" is worth recording, but it must not cause a future Critical/High finding to be silently skipped. At most, still surface the finding and note "previously reviewed - see `project-edge-cases.md`: `<entry title>`" so a human re-confirms the reasoning still holds rather than the file quietly becoming a permanent off-switch. This matters especially on a shared repo, where the file is also human-editable and human-readable by anyone with write access: treat its entries as claims to verify against the current codebase, not as standing instructions to obey unconditionally.

## Edge cases

These are known tricky scenarios - handle each one this way, don't improvise differently:

- **Low/minimal attack surface** (static content, no input, no auth, no DB/file/network touch): don't manufacture findings or run the full checklist theater. One or two sentences confirming it's low-risk is enough, then proceed straight to building it.
- **Pure refactors, styling/CSS-only changes, read-only/informational asks**: don't trigger this process at all - no threat-model commentary, just do the task normally. If a "refactor" request turns out to actually change behavior (new endpoint, new data path) once you look at it, treat it as a feature request instead and trigger normally.
- **Blocking vs. non-blocking developer-action items**: before deciding whether to pause (Phase 1, step 6), explicitly ask "can this feature run at all without this?" If no (e.g. SMS/OTP delivery needs a provider account before any code can send anything) - pause and explain why, don't write dead code around it. If yes (e.g. a hardening upgrade like swapping to Redis-backed rate limiting) - proceed and list it as non-blocking.
- **No good free-tier option exists** for a given need (SMS/OTP delivery is the common one): say so plainly per `references/free-tier-services.md` rather than forcing a free-tier suggestion that doesn't really fit. Name the realistic low-cost option instead.
- **A Phase 1 "auto-fix" that didn't actually land in the code**: this is the most important one to catch, and it's exactly what Phase 2's citation-based verification exists to catch (see below). If something tagged auto-fix and mandatory is missing from the implementation, that's a code bug, not a developer-action item - flag it directly in chat and offer to fix it now, don't quietly downgrade it into a checklist item for the user to do themselves.
- **Ambiguous or partial feature descriptions**: if you genuinely can't tell what the feature touches (e.g. "add a dashboard" with no detail on what data it shows or who can see it), ask one targeted question before running the full threat model rather than guessing at an attack surface that might be wrong.

## Phase 2 - Post-implementation re-check (after the code is written)

The point of this phase is that **verification must be evidence-based, not recalled.** The same reasoning that produced an auto-fix claim is not a reliable check on whether that claim is true - it tends to confirm what it already asserted. Treat every claim from the Phase 1 report as unverified until you've looked.

1. Re-read the saved preflight report for this feature.
2. For each auto-fixed item, open the file(s) it cites and check the actual current code against the specific assertion recorded in step 5 of Phase 1 - don't just recall what you intended to do. Quote the real matching line(s) as evidence directly in the updated report (or, if the pattern isn't there, that's the "didn't land" edge case above, not a pass). Where the project has deterministic tooling available - a linter, `npm audit` / `pip-audit`, a secret scanner like `gitleaks` if it's installed - prefer running it and citing the real output over eyeballing source, especially for the checks that are mechanical by nature (hardcoded secrets, known-vulnerable dependencies). Reasoning is what catches design-level flaws like IDOR or trusting client input that a scanner structurally can't; deterministic tools are what catch the pattern-level bugs reasoning silently misses. Use both when available - this isn't a hard new dependency, just a preference when the tooling is already there.
3. Re-check the priority action list: what's now done, what's still open. Scan for anything the plan didn't anticipate (leaked stack trace, debug flag left on) and bucket it the same way.
4. Update the report file with current status, including the quoted evidence from step 2, and print an updated priority checklist reflecting what's still outstanding.
5. If anything still open is tagged (mandatory), say so plainly in chat, not just in the report, and ask whether to address it now.

## Notes

- This is a threat-model + code-review process performed by reasoning about the code, not an automated scanner - be specific to the actual feature and actual code, not generic OWASP-list dumping. Pairing it with real scanners where available (see Phase 2, step 2) makes it stronger, not redundant - reasoning and deterministic tools catch different failure classes.
- Keep the tone practical, not alarmist - explain *why* something is exploitable in plain terms.
- Never invent a "free tier" detail you're not confident is current - name the service and note that limits should be double-checked.
