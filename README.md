# PreFlight

**PreFlight** is a security-review process for AI-assisted coding, packaged so it works with almost any LLM or AI coding assistant - not just one tool. It acts as an automatic security gate for feature work: a threat-model check runs *before* a new feature is built, and a verification pass runs *after* it's implemented, so vulnerabilities get caught while the code is being written, not after.

> Not to be confused with Tailwind CSS's "Preflight" base styles, Adobe's PDF Preflight, or a browser CORS preflight request - unrelated projects that happen to share the word.

## Why

Vibe coders and solo developers move fast and often skip formal security review. PreFlight closes that gap automatically: it triggers whenever a feature involving user input, data storage, auth, or external services is requested (login, file uploads, payments, APIs, webhooks, admin panels, etc.), reasons about the feature as an attacker would, and fixes what it can fix directly in code - only asking the developer about things that genuinely need a human (new credentials, third-party accounts, infra decisions).

## How it works

**Phase 1 - Pre-implementation threat model**
- Restates the feature as an attack surface (inputs, data touched, who can reach it, worst case if abused).
- Checks findings against a baseline vulnerability checklist and any project-specific history.
- Splits findings into two buckets:
  - **Auto-fixable** - parameterized queries, password hashing, secure cookies, input validation, IDOR checks, etc. Implemented silently as part of building the feature. Each auto-fix is recorded as a checkable claim (file + a concrete assertion), not just a description.
  - **Needs the developer** - anything requiring a new credential, third-party account, or infra/product decision. Surfaced as a priority-ordered checklist, with free-tier service suggestions where relevant.
- Before the first report in a project, makes sure `security-reports/` is covered by that project's `.gitignore` - these reports list the project's own unresolved vulnerabilities and shouldn't end up committed by accident.
- Saves a report and pauses only if something is genuinely blocking.

**Phase 2 - Post-implementation re-check**
- Re-opens each auto-fix claim from the report and checks it against the *real* code - quoting the matching evidence, not recalling the earlier claim. Prefers deterministic tools (`npm audit`, `pip-audit`, a secret scanner) where they're already available in the project, alongside the reasoning-based check.
- Re-checks the developer checklist for what's resolved vs. still open.
- Flags anything new the implementation introduced (leaked stack traces, debug flags, etc.).
- Updates the saved report and reprints the outstanding checklist.

### See it in action (illustrative)

The transcript below is a hand-written illustration of what a run looks like, not a captured session - a real recorded run will replace this once `evals/` (see below) has some.

> **You:** Add an endpoint so a logged-in user can fetch one of their orders: `GET /api/orders/:id`.
>
> **Agent:** Fixing automatically as I build this: ownership check on the order lookup, parameterized query, generic 404 for orders that don't exist or aren't yours (so the endpoint doesn't leak which order IDs exist).
>
> No developer action needed for this one - nothing here requires a new credential or service.
>
> Saved: `security-reports/order-lookup-preflight.md`

## Works with

The same process is packaged in several formats so it works wherever you're coding:

| Tool | File | Notes |
|---|---|---|
| Claude Code | `SKILL.md` | Native skill format - auto-triggers from its `description` field. See **Installation** below for the folder-naming requirement. |
| Claude Code (plugin marketplace) | `.claude-plugin/marketplace.json` | Lets this repo be added as a marketplace with `/plugin marketplace add` instead of a manual copy. |
| Any AI coding agent (Cursor, Copilot, Codex, Gemini CLI, Aider, Windsurf, Zed, Jules, etc.) | `AGENTS.md` | Follows the open [AGENTS.md](https://agents.md/) standard, read natively by 20+ tools. This is the canonical, most complete version of the process. |
| Cursor | `.cursor/rules/security-preflight.mdc` | Auto-attaching rule, for setups relying on Cursor's own rules system instead of `AGENTS.md`. |
| Cline | `.clinerules/security-preflight.md` | Read automatically from the `.clinerules/` directory. |
| GitHub Copilot | `.github/copilot-instructions.md` | Always included in Copilot Chat context. |
| Any plain LLM chat with no file access (ChatGPT, Gemini, Claude.ai, a custom GPT/Gem, an API system prompt) | `PROMPT.md` | Self-contained - paste it directly into a system prompt / custom-instructions field. |

`SKILL.md` and `AGENTS.md` both point back to `references/` for the full checklists; `PROMPT.md` and the other tool-specific files inline a condensed version so they work without file access to the rest of the repo. **All six files are generated from one canonical source** (see **Maintenance** below), so they can't silently drift out of sync with each other the way hand-duplicated copies do.

## Project structure

```
.
├── VERSION                              # single version string, stamped into every generated file
├── SKILL.md                             # generated - Claude Code skill definition
├── AGENTS.md                            # generated - canonical process, cross-tool standard
├── PROMPT.md                            # generated - self-contained prompt for plain chat LLMs
├── .cursor/rules/security-preflight.mdc # generated
├── .clinerules/security-preflight.md    # generated
├── .github/copilot-instructions.md      # generated
├── .github/workflows/build-check.yml    # CI: fails if generated files are out of date
├── .claude-plugin/marketplace.json      # lets this repo be added as a Claude Code plugin marketplace
├── skills/security-preflight/SKILL.md   # generated - identical copy of SKILL.md, at the path a marketplace install expects
├── src/                                 # hand-edited sources the generator reads
│   ├── process-core.md                  # the canonical process - edit this, not AGENTS.md/SKILL.md directly
│   ├── prompt-template.md               # PROMPT.md's wrapper prose, with placeholders for the checklist/free-tier content
│   └── wrapper-summary.md               # shared body for the Cursor/Cline/Copilot wrapper files
├── scripts/build.mjs                    # the generator - `node scripts/build.mjs` (or `--check` for CI)
├── references/                          # hand-edited, also the source the generator inlines from
│   ├── vulnerability-checklist.md       # baseline checklist by language/stack, backend/data, and platform/AI risk
│   ├── free-tier-services.md            # free-tier third-party service suggestions
│   └── project-edge-cases.md            # learned, project-specific findings (grows over time)
└── evals/                               # scenario set + rubric for measuring whether this actually works (not yet run)
    ├── scenarios.md
    ├── RUBRIC.md
    └── README.md
```

## Installation

Copy the files relevant to your tool into your project. A few of these are easy to get wrong, so read the notes:

- **Claude Code**: copy this repository to `~/.claude/skills/security-preflight/` for a global install, or `.claude/skills/security-preflight/` inside a single project. **The destination folder must be named `security-preflight`** to match the `name:` field in `SKILL.md`'s frontmatter - a plain `git clone` gives you a `PreFlight/` folder, which Claude Code won't discover as a skill. Rename it on the way in.
- **Claude Code (marketplace)**: alternatively, run `/plugin marketplace add <this-repo-url>` and install the `security-preflight` plugin from it - no manual renaming needed, since `.claude-plugin/marketplace.json` and `skills/security-preflight/SKILL.md` already sit at the paths Claude Code expects.
- **Cursor / Cline / Copilot / other `AGENTS.md`-aware agents**: copy `references/` into your project, plus the relevant top-level file(s). **If your project already has an `AGENTS.md` or `.github/copilot-instructions.md`**, don't overwrite it - both of PreFlight's versions are wrapped in `<!-- preflight:start ... -->` / `<!-- preflight:end -->` markers specifically so you can paste that block onto the end of your existing file instead of replacing it.
- **Plain chat LLMs**: copy the contents of `PROMPT.md` into the system prompt / custom instructions field.

Once in place, the process activates automatically when a matching feature request is made - no manual invocation needed (except for `PROMPT.md`, which activates as soon as it's set as the system prompt).

## Maintenance

`SKILL.md`, `AGENTS.md`, `PROMPT.md`, the three wrapper files, and `skills/security-preflight/SKILL.md` are all **generated** - don't hand-edit them, edits will be overwritten. Change the actual behavior in `src/process-core.md` (or `references/vulnerability-checklist.md` / `references/free-tier-services.md`, which the generator also reads from), then run:

```
node scripts/build.mjs
```

`node scripts/build.mjs --check` reports drift without writing anything (exit code 1 if any generated file is stale) - this is what `.github/workflows/build-check.yml` runs in CI, so a PR that changes the sources without regenerating the outputs fails the build instead of silently shipping six files that disagree with each other.

## Does it actually work?

Not yet measured. `evals/` has a scenario set (15 seeded feature requests with known target vulnerabilities, plus 5 negative controls that must not trigger the process) and a scoring rubric, designed to be run by hand against real sessions. No run has been recorded yet - see `evals/README.md` for status and how to run one. Treat the "Why" and "How it works" sections above as the design intent, not a verified result, until real numbers land here.

## Notes

- This is a reasoning-based threat model and code review, not an automated scanner - it evaluates the actual feature and actual code rather than dumping a generic OWASP checklist. Phase 2 prefers pairing that reasoning with real scanners (`npm audit`, `pip-audit`, a secret scanner) where the project already has them available.
- `references/project-edge-cases.md` starts empty and accumulates project-specific context the more the process is used. An entry can add context for why something was previously reviewed; it's not allowed to make a Critical/High finding disappear on a later run.

## License

MIT - see [LICENSE](LICENSE).
