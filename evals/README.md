# Evals

PreFlight makes a behavioral claim: that it changes what an AI coding agent actually writes for security-relevant features. This directory is the scenario set and scoring rubric built to test that claim, plus one completed run's results.

## What's here

- **`scenarios.md`** - 15 seeded feature-request prompts with known target vulnerability classes, plus 5 negative controls that must not trigger the process at all.
- **`RUBRIC.md`** - what to record per scenario, how to aggregate into top-line numbers, and how to read the results.
- **`fixtures/`** - minimal scratch codebases (`generic/`, `supabase/`, `nextjs/`) that each scenario is run against, so an agent has something real to extend rather than an empty directory. See `fixtures/README.md` for which fixture backs which scenario.
- **`results/`** - dated result files from actual runs. `results/2026-07-29-simulated-claude-code/` is the first completed run - see its `results.md` for per-scenario scoring and top-line numbers, and `PROGRESS.md` for the run log/methodology.

## Status

**One full run completed** (2026-07-29, all 20 scenarios, methodology described below). Headline numbers - 100% mitigation rate, 100% trigger precision, 0% noise rate, 8/8 self-introduced defects caught by Phase 2 with none surviving to the final report - are in `results/2026-07-29-simulated-claude-code/results.md`. Read that file's own caveats section before treating these as generalizable: it's a single simulated run (subagents standing in for fresh sessions, one model, small hand-built fixtures), not a large-sample statistical eval. The next useful step is repeating this same scenario set against additional target tools/models to see whether the numbers hold up outside the conditions of this specific run.

## How to run this again (or against a new target)

1. Read `RUBRIC.md` for what to record.
2. Pick a target tool (Claude Code is the easiest to start with, since `SKILL.md` requires no copy-paste setup).
3. For each scenario in `scenarios.md`, start from a clean copy of the relevant `fixtures/` codebase, paste the prompt, and record what happens - once without PreFlight active, once with it active. (The 2026-07-29 run used fresh subagents in isolated scratch copies per scenario per condition, with the with-PreFlight subagent given the rendered `AGENTS.md` process as its instructions; see `results/2026-07-29-simulated-claude-code/PROGRESS.md` for the exact methodology.)
4. Save the completed table as `evals/results/<date>-<target>.md` using the template in `RUBRIC.md`.
5. Update the main README's "Does it actually work?" section if the new run's numbers change the headline picture.

## Why this isn't automated (yet)

A fully automated harness would need a way to script an actual agentic coding session (e.g. `claude -p` headless mode) against a seeded scratch repo, then grep/diff the result. That's a reasonable next step once a few manual runs establish that the scenarios and rubric are actually measuring the right thing - automating a bad eval just produces bad numbers faster.
