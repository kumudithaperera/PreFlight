---
name: security-preflight
description: Runs a security threat-model check BEFORE implementing any new feature, endpoint, form, integration, or user-facing functionality, and a follow-up code re-check AFTER it's implemented. Use this skill any time the user asks to "add", "build", "implement", or "create" a feature - login/auth, file uploads, search, comments, payments, APIs, admin panels, webhooks, anything that touches user input, data storage, or external services - even if they don't ask for a security review explicitly. Auto-fixes anything fixable purely in code and only surfaces a priority-ordered checklist for items that genuinely need the developer (new credentials, third-party signups, infra config). Produces a saved markdown report, and pauses only when something blocking needs the developer. Also use when the user asks to "check this for vulnerabilities," "audit my code," or "is this secure."
---

# Security Preflight

A two-phase security gate for feature work: think like an attacker *before* code exists, fix what can be fixed silently, then verify like an auditor *after* the code is written.

## When this triggers

Trigger this skill proactively, without being asked, whenever the user requests a new feature that will exist in real running code - not toy/demo snippets, not pure explanations. Err toward triggering; a missed check is worse than an extra 60 seconds of review. Do NOT trigger for: pure refactors with no new behavior, styling/CSS-only changes, or read-only informational questions ("how does JWT work").

## Core principle: fix in code silently, only surface what needs the developer

For every finding, first decide which bucket it's in:

- **Auto-fixable in code** - anything you can implement yourself with no new credentials, accounts, or out-of-band setup: parameterized queries, password hashing, cookie flags, input validation, ownership/IDOR checks, generic error messages, idempotency keys, path-safe filenames, field allow-listing, etc. **Just implement these as part of building the feature. Don't turn them into checklist items or ask permission for them** - they're exactly what "building it correctly" means. Mention them briefly as a short "fixed automatically" note, not a checkbox.
- **Needs the developer** - anything requiring a new credential/API key, a new third-party account or service, DNS/infra config, or a decision only the product owner can make (e.g. "do we store card data or use a processor?"). These go on the priority checklist described below. When a third-party service is genuinely needed, check `references/free-tier-services.md` and suggest a free-tier option by name - this is for solo/low-budget developers.

## Phase 1 - Pre-implementation threat model (before writing any code)

1. **Restate the feature as an attack surface.** Inputs accepted, what it touches (DB, filesystem, network, other users' data), who can reach it, worst-case outcome if abused.
2. **Enumerate findings**, using `references/vulnerability-checklist.md` as your baseline (read it now - don't rely on memory), plus `references/project-edge-cases.md` for anything specific to this user's project (see "Personalizing to the user's projects over time" below). For each finding capture: what it is, how it'd realistically be exploited against *this* feature, severity (Critical/High/Medium/Low), and whether it's auto-fixable or needs-developer per the rule above.
3. **Build ONE priority-ordered list** of the needs-developer items only (auto-fixable items aren't listed as action items - see above). Order by **implementation order** - i.e. the sequence the developer would actually need to act in (e.g. "get a Stripe account" has to happen before "verify webhook signatures" can even be wired up). If implementation order and severity would suggest a different ordering, **implementation order wins** - but tag any Critical/High item with **(mandatory)** regardless of where it lands in the sequence, so it's clear it's not optional just because it's not first.
4. **Produce two outputs:**
   - **A saved report file** at `security-reports/<feature-slug>-preflight.md` (create the `security-reports/` dir if absent), containing: the full finding list (both auto-fixed and needs-developer, organized under Language/Stack and Backend/Data sub-headers for reference), and the priority-ordered action list.
   - **An inline reply in chat** with two short parts:
     1. A one-line-per-item note of what's being auto-fixed in code (no checkboxes - this is happening regardless):
        ```
        Fixing automatically as I build this: parameterized queries, bcrypt password hashing, secure cookie flags, generic login errors.
        ```
     2. The priority checklist for what needs the developer, as literal markdown checkboxes, in implementation order:
        ```
        ## Before this is production-ready - your action needed

        1. [ ] Create a Stripe account (free, pay-per-transaction) and add STRIPE_SECRET_KEY to your env - (mandatory)
        2. [ ] Add STRIPE_WEBHOOK_SECRET once the endpoint exists, so I can verify webhook signatures - (mandatory)
        3. [ ] Consider Cloudflare Turnstile (free tier) if login abuse becomes a problem - optional, can wait
        ```
     Keep each line to one sentence; full reasoning/severity detail lives in the report file.
5. **Pause only if something is blocking.** If a needs-developer item is required for the feature to actually function (e.g. a payment key with no way to stub it), stop and ask for it before proceeding. If the needs-developer items are non-blocking (the feature can be built and work with a placeholder/env-var name reserved, and hardening added later), go ahead and implement - apply all auto-fixes, wire the code to expect the relevant env vars/config, and present the checklist alongside the finished feature rather than holding it hostage. Use judgment per item, not a blanket pause.

## Resolving a checklist item on request

Whenever the user indicates they want to tackle a specific item from the priority checklist - by number, by name, "let's do #1," "help me set up Stripe," ticking a box, etc. - stop and walk them through **that one item** as a detailed, plain-text numbered list in the chat response itself. Do not render this as a UI widget/artifact/card - this skill has to work the same way for console/CLI users (Claude Code, terminal) as it does in a graphical client, and plain text is the one format that renders everywhere. Write it directly in your reply.

**Before writing the steps, search the web for the service's current setup flow** (e.g. "Cloudflare R2 create bucket API token" or "Stripe webhook signing secret setup"). Dashboards, menu labels, and signup flows change often enough that steps written from memory alone drift out of date and mislead the user. Use what you find to make the steps concrete and current rather than a generic best-guess. If search doesn't turn up anything more specific than what you already know, say the steps are based on the general flow and may have shifted slightly.

Each step should be granular enough to execute without guessing - break "set up the account" into the actual sequence of clicks/pages, not one blob. Cover, as applicable:
1. Exactly where to go (the real, current site/dashboard URL or app/CLI name).
2. What to click, select, or create there, in order - one action per step, not multiple actions bundled into one step.
3. What to name the thing, and exactly what value they'll get back (API key, secret, connection string, etc.).
4. Exactly where that value goes in their project (e.g. "add to `.env` as `SESSION_SECRET=<value>`" or "Vercel → Project Settings → Environment Variables → add `STRIPE_SECRET_KEY`").
5. How to confirm it worked (restart dev server, redeploy, run a test call, check a log line, etc.).

Number the steps plainly (1., 2., 3. …) in your response text. Once the user confirms it's done, mark that item resolved in the saved report file and show the checklist again with it checked off.

## Personalizing to the user's projects over time

`references/project-edge-cases.md` holds things learned about *this specific user's* projects and stack - not generic vulnerability knowledge, which stays in `vulnerability-checklist.md`. This file starts empty and grows the more the skill is used, making later runs more tailored.

**Reading it (every time, Phase 1 step 2):** read `references/project-edge-cases.md` alongside the generic checklist. If it has a section matching the current project (by name, or obviously the same codebase from context), treat those entries as additional baseline checks for this project specifically - on top of, not instead of, the generic checklist. If the project isn't identifiable and the file already has multiple project sections, ask which project this is rather than guessing.

**Writing to it - append a new entry when:**
- The user corrects a finding or says it doesn't apply here because of something about their setup ("we don't need that, we're behind X already") - capture the *why*, not just that the finding was dismissed, so the reasoning carries forward.
- The user mentions an architecture/stack detail the generic checklist wouldn't know (e.g. a shared auth service, a subdomain already locked down, a legacy component with known constraints).
- Phase 2 turns up the same kind of gap more than once for this project - worth capturing as a standing thing to check for next time.

**Don't add:** anything that's just a restatement of a generic checklist item, or a one-off that doesn't generalize to future features in this project.

**How to add it:** use file-editing tools to append the entry under the right `## <Project name>` header in `references/project-edge-cases.md` (create the header if it's a new project). Keep it light-touch in chat - one line is enough: "Noted for next time: <entry>. Saved to this project's edge cases." Don't turn it into an approval step; the point is it accumulates quietly.

## Edge cases this skill must handle correctly

These are known tricky scenarios - handle each one this way, don't improvise differently:

- **Low/minimal attack surface** (static content, no input, no auth, no DB/file/network touch): don't manufacture findings or run the full checklist theater. One or two sentences confirming it's low-risk is enough, then proceed straight to building it.
- **Pure refactors, styling/CSS-only changes, read-only/informational asks**: don't trigger this skill at all - no threat-model commentary, just do the task normally. If a "refactor" request turns out to actually change behavior (new endpoint, new data path) once you look at it, treat it as a feature request instead and trigger normally.
- **Blocking vs. non-blocking developer-action items**: before deciding whether to pause (Phase 1, step 5), explicitly ask "can this feature run at all without this?" If no (e.g. SMS/OTP delivery needs a provider account before any code can send anything) - pause and explain why, don't write dead code around it. If yes (e.g. a hardening upgrade like swapping to Redis-backed rate limiting) - proceed and list it as non-blocking.
- **No good free-tier option exists** for a given need (SMS/OTP delivery is the common one): say so plainly per `references/free-tier-services.md` rather than forcing a free-tier suggestion that doesn't really fit. Name the realistic low-cost option instead.
- **A Phase 1 "auto-fix" that didn't actually land in the code**: this is the most important one to catch. Phase 2 must not just assume auto-fixed items are fine - actually check each one against the real code (see Phase 2 step 2). If something tagged auto-fix and mandatory is missing from the implementation, that's a code bug, not a developer-action item - flag it directly in chat and offer to fix it now, don't quietly downgrade it into a checklist item for the user to do themselves.
- **Ambiguous or partial feature descriptions**: if you genuinely can't tell what the feature touches (e.g. "add a dashboard" with no detail on what data it shows or who can see it), ask one targeted question before running the full threat model rather than guessing at an attack surface that might be wrong.

## Phase 2 - Post-implementation re-check (after the code is written)

1. Re-read the saved preflight report for this feature.
2. Verify each auto-fixed item actually landed correctly in the real code (don't just assume - check it).
3. Re-check the priority action list: which developer-action items are now done (e.g. an env var is present, a config file shows a real key), which are still open. Also scan for anything the plan didn't anticipate that the actual implementation introduced (e.g. a leaked stack trace, a debug flag left on) - bucket it the same way (auto-fix vs needs-developer).
4. Update the report file with current status per item, and print an updated priority checklist in chat reflecting what's still outstanding.
5. If anything still open is tagged (mandatory), say so plainly in the chat, not just in the report, and ask whether to address it now.

## Notes

- This is a threat-model + code-review process performed by reasoning about the code, not an automated scanner - be specific to the actual feature and actual code, not generic OWASP-list dumping.
- Keep the tone practical, not alarmist - vibe coders using this skill are often not security specialists. Explain *why* something is exploitable in plain terms, not just jargon.
- Never invent a "free tier" detail you're not confident is current - name the service and note that limits should be double-checked, rather than quoting specific numbers you're unsure of.
