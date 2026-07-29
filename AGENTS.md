# PreFlight - Security Preflight for AI Coding Agents

This file follows the [AGENTS.md](https://agents.md/) open standard and is read natively by most modern coding agents (Cursor, GitHub Copilot, Codex, Gemini CLI, Aider, Windsurf, Zed, Jules, and others). If you are an AI coding agent working in this repository - or the repository this file has been copied into - apply the process below whenever you touch feature code.

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
4. **Produce two outputs:**
   - **A saved report** at `security-reports/<feature-slug>-preflight.md` (create the `security-reports/` dir if absent), containing the full finding list (auto-fixed and needs-developer) and the priority-ordered action list.
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
5. **Pause only if something is blocking.** If a needs-developer item is required for the feature to function at all (e.g. a payment key with no way to stub it), stop and ask for it before proceeding. If the items are non-blocking, go ahead and implement - apply all auto-fixes, wire the code to expect the relevant env vars/config, and present the checklist alongside the finished feature.

## Resolving a checklist item on request

When the user wants to tackle a specific checklist item, walk them through it as a granular, plain numbered list directly in your response (no UI widgets - this has to work in a plain chat window too). Before writing the steps, search the web for the service's current setup flow if you have that capability - dashboards and signup flows drift out of date. Cover: exactly where to go, what to click/create in order, what to name it, exactly what value comes back, exactly where that value goes in the project (e.g. `.env` key name), and how to confirm it worked. Once confirmed done, mark it resolved in the saved report and show the checklist again with it checked off.

## Personalizing to this project over time

`references/project-edge-cases.md` (if present) holds things learned about *this specific project's* stack - not generic vulnerability knowledge. Read it alongside the generic checklist every time. Append a new entry when the user corrects a finding because of something about their setup, mentions an architecture detail the generic checklist wouldn't know, or Phase 2 turns up the same gap more than once. Don't add anything that's just a restatement of a generic checklist item.

## Edge cases

- **Low/minimal attack surface** (static content, no input, no auth, no DB/file/network touch): don't manufacture findings. One or two sentences confirming it's low-risk is enough, then proceed.
- **Pure refactors, styling-only, read-only questions**: skip this process entirely.
- **Blocking vs. non-blocking**: ask "can this feature run at all without this?" If no, pause and explain why. If yes, proceed and list it as non-blocking.
- **No good free-tier option exists** (SMS/OTP delivery is the common case): say so plainly rather than forcing a suggestion that doesn't fit.
- **An auto-fix that didn't actually land in the code**: Phase 2 must verify, not assume. If something tagged auto-fix and mandatory is missing from the implementation, that's a code bug - flag it directly and offer to fix it now, don't downgrade it into a developer checklist item.
- **Ambiguous feature descriptions**: ask one targeted question before running the full threat model rather than guessing at an attack surface that might be wrong.

## Phase 2 - Post-implementation re-check (after the code is written)

1. Re-read the saved preflight report for this feature.
2. Verify each auto-fixed item actually landed correctly in the real code - don't just assume.
3. Re-check the priority action list: what's now done, what's still open. Scan for anything the plan didn't anticipate (leaked stack trace, debug flag left on) and bucket it the same way.
4. Update the report file with current status, and print an updated priority checklist reflecting what's still outstanding.
5. If anything still open is tagged (mandatory), say so plainly in chat, not just in the report, and ask whether to address it now.

## Notes

- This is a threat-model + code-review process performed by reasoning about the code, not an automated scanner - be specific to the actual feature and actual code, not generic OWASP-list dumping.
- Keep the tone practical, not alarmist - explain *why* something is exploitable in plain terms.
- Never invent a "free tier" detail you're not confident is current - name the service and note that limits should be double-checked.

## Other ways to use this skill

- **Claude Code**: `SKILL.md` in this repo is the native Claude Code skill format (auto-triggers based on its description field).
- **Plain chat LLMs without file access** (ChatGPT, Gemini, Claude.ai, etc.): use `PROMPT.md` - a self-contained version of this process meant to be pasted into a system prompt or custom-instructions field.
- **Cursor, Cline, GitHub Copilot**: see `.cursor/rules/security-preflight.mdc`, `.clinerules/security-preflight.md`, and `.github/copilot-instructions.md` respectively - thin wrappers around this file for tools that don't yet read `AGENTS.md` by default.
