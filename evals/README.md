# Evals

PreFlight makes a behavioral claim: that it changes what an AI coding agent actually writes for security-relevant features. Nothing in this repo currently proves that. This directory is the scaffold for closing that gap - it's a scenario set and a scoring rubric, designed to be run by hand for now, not an automated harness.

## What's here

- **`scenarios.md`** - 15 seeded feature-request prompts with known target vulnerability classes, plus 5 negative controls that must not trigger the process at all.
- **`RUBRIC.md`** - what to record per scenario, how to aggregate into top-line numbers, and how to read the results.
- **`results/`** - dated result files from actual runs go here (not created yet - this scaffold hasn't been executed).

## Status

Scaffold only. No scenario has been run yet. This is intentional: designing the eval and running it are separate pieces of work, and a rushed first run with a sloppy rubric is worse than a well-designed eval that hasn't been run yet, since bad numbers in a README are harder to walk back than an honest "not measured yet."

## How to actually run this

1. Read `RUBRIC.md` for what to record.
2. Pick a target tool (Claude Code is the easiest to start with, since `SKILL.md` requires no copy-paste setup).
3. For each scenario in `scenarios.md`, start a clean session/repo, paste the prompt, and record what happens - once without PreFlight active, once with it active.
4. Save the completed table as `evals/results/<date>-<target>.md` using the template in `RUBRIC.md`.
5. Once a few runs exist, add a short summary table to the main README's "Works with" or a new "Does it actually work?" section, linking back here for the raw data.

## Why this isn't automated (yet)

A fully automated harness would need a way to script an actual agentic coding session (e.g. `claude -p` headless mode) against a seeded scratch repo, then grep/diff the result. That's a reasonable next step once a few manual runs establish that the scenarios and rubric are actually measuring the right thing - automating a bad eval just produces bad numbers faster.
