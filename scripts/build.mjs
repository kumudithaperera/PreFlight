#!/usr/bin/env node
// Generates AGENTS.md, SKILL.md, PROMPT.md, and the tool-specific wrapper files
// from the single canonical sources under src/ and references/.
//
// Usage:
//   node scripts/build.mjs          rewrite the generated files
//   node scripts/build.mjs --check  fail (exit 1) if generated files are out of date

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = (...p) => join(ROOT, ...p);
const read = (p) => readFileSync(path(p), "utf8");

const CHECK_MODE = process.argv.includes("--check");

const VERSION = read("VERSION").trim();

// ---------------------------------------------------------------------------
// Parse references/vulnerability-checklist.md into { label, items[] } groups,
// flattened across its top-level sections. This is what lets PROMPT.md's
// inlined baseline stay mechanically in sync with the canonical checklist -
// no more hand-typed category lists that can silently drop or add entries.
// ---------------------------------------------------------------------------
function parseChecklistGroups(md) {
  const groups = [];
  let current = null;
  for (const rawLine of md.split("\n")) {
    const line = rawLine.trim();
    const boldHeader = line.match(/^\*\*(.+?)\*\*/);
    if (boldHeader && !line.startsWith("- ")) {
      current = { label: boldHeader[1], items: [] };
      groups.push(current);
      continue;
    }
    if (line.startsWith("- ") && current) {
      current.items.push(line.slice(2).trim());
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Parse references/free-tier-services.md's markdown table into
// { need, options } rows.
// ---------------------------------------------------------------------------
function parseFreeTierRows(md) {
  const rows = [];
  for (const rawLine of md.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 2) continue;
    if (cells[0] === "Need") continue; // header row
    if (/^:?-+:?$/.test(cells[0])) continue; // separator row
    rows.push({ need: cells[0], options: cells[1] });
  }
  return rows;
}

function renderChecklistSummary(groups) {
  return groups
    .map((g) => `   - **${g.label}**: ${g.items.join("; ")}.`)
    .join("\n");
}

function renderFreeTierSummary(rows) {
  return rows.map((r) => `   - **${r.need}**: ${r.options}`).join("\n");
}

// ---------------------------------------------------------------------------
// Load canonical sources
// ---------------------------------------------------------------------------
const processCore = read("src/process-core.md").trim();
const wrapperSummary = read("src/wrapper-summary.md").trim();
const checklistGroups = parseChecklistGroups(read("references/vulnerability-checklist.md"));
const freeTierRows = parseFreeTierRows(read("references/free-tier-services.md"));

const SKILL_DESCRIPTION =
  'Runs a security threat-model check BEFORE implementing any new feature, endpoint, form, integration, or user-facing functionality, and a follow-up code re-check AFTER it\'s implemented. Use this skill any time the user asks to "add", "build", "implement", or "create" a feature - login/auth, file uploads, search, comments, payments, APIs, admin panels, webhooks, anything that touches user input, data storage, or external services - even if they don\'t ask for a security review explicitly. Auto-fixes anything fixable purely in code and only surfaces a priority-ordered checklist for items that genuinely need the developer (new credentials, third-party signups, infra config). Produces a saved markdown report, and pauses only when something blocking needs the developer. Also use when the user asks to "check this for vulnerabilities," "audit my code," or "is this secure."';

if (SKILL_DESCRIPTION.length > 1024) {
  throw new Error(
    `SKILL.md description is ${SKILL_DESCRIPTION.length} chars - Claude Code's limit is 1024.`
  );
}

// ---------------------------------------------------------------------------
// Render each output file
// ---------------------------------------------------------------------------
const outputs = {};

outputs["AGENTS.md"] = `<!-- preflight:start v${VERSION} -->
# PreFlight - Security Preflight for AI Coding Agents

This file follows the [AGENTS.md](https://agents.md/) open standard and is read natively by most modern coding agents (Cursor, GitHub Copilot, Codex, Gemini CLI, Aider, Windsurf, Zed, Jules, and others). If you are an AI coding agent working in this repository - or the repository this file has been copied into - apply the process below whenever you touch feature code. If this project already has other \`AGENTS.md\` content outside these markers, keep it - this block is meant to be appended alongside it, not to replace it.

${processCore}

## Other ways to use this process

- **Claude Code**: \`SKILL.md\` in this repo is the native Claude Code skill format (auto-triggers based on its description field). Install it at \`~/.claude/skills/security-preflight/\` (or \`.claude/skills/security-preflight/\` for a single project) - the destination folder name must be \`security-preflight\` to match the skill's frontmatter, not the name of this repository.
- **Plain chat LLMs without file access** (ChatGPT, Gemini, Claude.ai, etc.): use \`PROMPT.md\` - a self-contained version of this process meant to be pasted into a system prompt or custom-instructions field.
- **Cursor, Cline, GitHub Copilot**: see \`.cursor/rules/security-preflight.mdc\`, \`.clinerules/security-preflight.md\`, and \`.github/copilot-instructions.md\` respectively - thin wrappers around this file for tools that don't yet read \`AGENTS.md\` by default.
<!-- preflight:end -->
`;

const skillMd = `---
name: security-preflight
description: ${SKILL_DESCRIPTION}
---

# Security Preflight

${processCore}
`;

// Written to both the repo root (for the "copy this whole folder to
// ~/.claude/skills/security-preflight/" install path) and under
// skills/security-preflight/ (the path a Claude Code plugin marketplace
// entry discovers by default when `source` points at this repo's root -
// see .claude-plugin/marketplace.json). Same rendered string, two
// destinations, so there's nothing to keep in sync by hand.
outputs["SKILL.md"] = skillMd;
outputs["skills/security-preflight/SKILL.md"] = skillMd;

outputs["PROMPT.md"] = read("src/prompt-template.md")
  .replaceAll("{{VERSION}}", VERSION)
  .replaceAll("{{CHECKLIST_SUMMARY}}", renderChecklistSummary(checklistGroups))
  .replaceAll("{{FREE_TIER_SUMMARY}}", renderFreeTierSummary(freeTierRows));

outputs[".cursor/rules/security-preflight.mdc"] = `---
description: Security threat-model gate - apply before implementing any new feature (auth, uploads, payments, APIs, forms, webhooks, admin panels, or anything touching user input/data/external services), and re-check after implementation. (v${VERSION})
alwaysApply: false
---

${wrapperSummary}
`;

outputs[".clinerules/security-preflight.md"] = `# Security Preflight (v${VERSION})

${wrapperSummary}
`;

outputs[".github/copilot-instructions.md"] = `<!-- preflight:start v${VERSION} -->
# Security Preflight

${wrapperSummary}
<!-- preflight:end -->
`;

// ---------------------------------------------------------------------------
// Write or check
// ---------------------------------------------------------------------------
let drift = false;
for (const [relPath, content] of Object.entries(outputs)) {
  const abs = path(relPath);
  const existing = existsSync(abs) ? readFileSync(abs, "utf8") : null;
  if (existing === content) continue;

  if (CHECK_MODE) {
    drift = true;
    console.error(`OUT OF DATE: ${relPath}`);
    continue;
  }

  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  console.log(`wrote ${relPath}`);
}

if (CHECK_MODE) {
  if (drift) {
    console.error("\nGenerated files are out of date. Run `node scripts/build.mjs` and commit the result.");
    process.exit(1);
  }
  console.log("All generated files are up to date.");
}
