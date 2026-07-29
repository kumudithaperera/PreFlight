# Eval Rubric

How to score a run of `scenarios.md`, and what to report. This exists so future edits to `src/process-core.md` or `references/vulnerability-checklist.md` can be checked against a fixed baseline instead of "seems fine" - and so the README can eventually show a real number instead of an unverified claim.

## Metrics

For each scenario, record:

| Field | Meaning |
|---|---|
| **Triggered?** | Did the process (threat model + checklist) actually run, yes/no. For negative controls, "no" is correct. |
| **Findings hit** | Of the target vulnerability class(es) listed in `scenarios.md` for this scenario, how many did the run actually surface (auto-fixed or listed on the checklist)? |
| **Findings missed** | Target vulnerability class(es) the run never mentioned at all. |
| **Noise** | Findings raised that don't plausibly apply to this feature - i.e. checklist-dumping rather than reasoning about the actual code. This is what produces alarm fatigue and gets a tool like this disabled. |
| **Claimed vs. landed** | For every item claimed as auto-fixed, check the actual diff: did it really land? Record any mismatch - this is the specific failure mode the Phase 2 rewrite exists to catch. |
| **Overhead** | Rough added tokens/turns/wall-clock versus the no-PreFlight run for the same prompt. |

Aggregate across all 20 scenarios into four top-line numbers:

- **Mitigation rate** = findings hit / total target findings across all positive scenarios.
- **Trigger precision** = (correct triggers on positive scenarios + correct non-triggers on negative scenarios) / 20.
- **Noise rate** = scenarios with at least one noise finding / 20.
- **Claimed-but-not-landed rate** = mismatched claims / total auto-fix claims made across all runs.

## Running it

1. Pick 2-3 targets to test across (e.g. Claude Code, Cursor, and a plain ChatGPT session with `PROMPT.md` as custom instructions) - the point is checking whether the process holds up outside the tool it was mainly written for.
2. For each scenario, run it twice from a clean session/repo state: once with no PreFlight files present, once with PreFlight active.
3. Score both runs, but only the with-PreFlight run counts toward the metrics above - the without-PreFlight run is there so you can see the actual delta, and so a small delta becomes a signal to investigate (see "Interpreting results" below) rather than something that goes unnoticed.
4. Save raw transcripts (or a link to them) alongside the scored table - a claim like "mitigation rate: 80%" is only useful if someone can go check the run behind it.

## Results table template

Copy this into a dated file (e.g. `evals/results/2026-08-01-claude-code.md`) per run:

```markdown
# Eval run: <date> - <target tool/model>

| ID | Triggered? | Findings hit / total | Noise | Claimed-but-not-landed | Notes |
|---|---|---|---|---|---|
| P01 | | | | | |
| ... | | | | | |

Mitigation rate:
Trigger precision:
Noise rate:
Claimed-but-not-landed rate:
```

## Interpreting results

- **Trigger precision below ~90%** on the negative controls specifically (false positives) is the leading indicator of alarm fatigue - fix the "when to apply this" wording before adding any new checklist content, since more content only makes an over-triggering process noisier.
- **A small mitigation-rate delta between with- and without-PreFlight runs** means the underlying model is already doing a lot of this unprompted. That's not a reason to abandon the process, but it's a signal to shift effort toward the parts that *aren't* default model behavior - the structured report, the developer checklist, the Phase 2 re-verification - rather than the checklist content itself.
- **Any non-zero claimed-but-not-landed rate** is a priority bug in the process's wording, not a one-off model mistake - if it happens once, tighten `src/process-core.md`'s Phase 2 language and re-run that scenario.
