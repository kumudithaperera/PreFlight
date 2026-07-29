# PreFlight

**PreFlight** is a security-review process for AI-assisted coding, packaged so it works with almost any LLM or AI coding assistant — not just one tool. It acts as an automatic security gate for feature work: a threat-model check runs *before* a new feature is built, and a verification pass runs *after* it's implemented, so vulnerabilities get caught while the code is being written, not after.

## Why

Vibe coders and solo developers move fast and often skip formal security review. PreFlight closes that gap automatically: it triggers whenever a feature involving user input, data storage, auth, or external services is requested (login, file uploads, payments, APIs, webhooks, admin panels, etc.), reasons about the feature as an attacker would, and fixes what it can fix directly in code — only asking the developer about things that genuinely need a human (new credentials, third-party accounts, infra decisions).

## How it works

**Phase 1 — Pre-implementation threat model**
- Restates the feature as an attack surface (inputs, data touched, who can reach it, worst case if abused).
- Checks findings against a baseline vulnerability checklist and any project-specific history.
- Splits findings into two buckets:
  - **Auto-fixable** — parameterized queries, password hashing, secure cookies, input validation, IDOR checks, etc. Implemented silently as part of building the feature.
  - **Needs the developer** — anything requiring a new credential, third-party account, or infra/product decision. Surfaced as a priority-ordered checklist, with free-tier service suggestions where relevant.
- Saves a report and pauses only if something is genuinely blocking.

**Phase 2 — Post-implementation re-check**
- Re-verifies every auto-fixed item actually landed in the real code.
- Re-checks the developer checklist for what's resolved vs. still open.
- Flags anything new the implementation introduced (leaked stack traces, debug flags, etc.).
- Updates the saved report and reprints the outstanding checklist.

## Works with

The same process is packaged in several formats so it works wherever you're coding:

| Tool | File | Notes |
|---|---|---|
| Claude Code | `SKILL.md` | Native skill format — auto-triggers from its `description` field. |
| Any AI coding agent (Cursor, Copilot, Codex, Gemini CLI, Aider, Windsurf, Zed, Jules, etc.) | `AGENTS.md` | Follows the open [AGENTS.md](https://agents.md/) standard, read natively by 20+ tools. This is the canonical, most complete version of the process. |
| Cursor | `.cursor/rules/security-preflight.mdc` | Auto-attaching rule, for setups relying on Cursor's own rules system instead of `AGENTS.md`. |
| Cline | `.clinerules/security-preflight.md` | Read automatically from the `.clinerules/` directory. |
| GitHub Copilot | `.github/copilot-instructions.md` | Always included in Copilot Chat context. |
| Any plain LLM chat with no file access (ChatGPT, Gemini, Claude.ai, a custom GPT/Gem, an API system prompt) | `PROMPT.md` | Self-contained — paste it directly into a system prompt / custom-instructions field. |

`SKILL.md` and `AGENTS.md` both point back to `references/` for the full checklists; `PROMPT.md` and the other tool-specific files inline a condensed version so they work without file access to the rest of the repo.

## Project structure

```
.
├── SKILL.md                            # Claude Code skill definition
├── AGENTS.md                           # Canonical process, cross-tool standard
├── PROMPT.md                           # Self-contained prompt for plain chat LLMs
├── .cursor/rules/security-preflight.mdc
├── .clinerules/security-preflight.md
├── .github/copilot-instructions.md
└── references/
    ├── vulnerability-checklist.md      # Baseline checklist by language/stack and backend/data risk
    ├── free-tier-services.md           # Free-tier third-party service suggestions
    └── project-edge-cases.md           # Learned, project-specific findings (grows over time)
```

## Installation

Copy the files relevant to your tool into your project:
- **Claude Code**: drop the whole directory in as a skill so `SKILL.md` is discoverable.
- **Cursor / Cline / Copilot / other AGENTS.md-aware agents**: copy `AGENTS.md`, `references/`, and (optionally) the tool-specific rule file into your project root.
- **Plain chat LLMs**: copy the contents of `PROMPT.md` into the system prompt / custom instructions field.

Once in place, the process activates automatically when a matching feature request is made — no manual invocation needed (except for `PROMPT.md`, which activates as soon as it's set as the system prompt).

## Notes

- This is a reasoning-based threat model and code review, not an automated scanner — it evaluates the actual feature and actual code rather than dumping a generic OWASP checklist.
- `references/project-edge-cases.md` starts empty and accumulates project-specific context the more the process is used.
