# Eval run progress - 2026-07-29, simulated Claude Code

**STATUS: RUN COMPLETE.** All 7 chunks / 20 scenarios scored. See `results.md` for the aggregate results (100% mitigation rate, 100% trigger precision, 0% noise rate, 8 real defects caught by Phase 2 with 0 surviving to final report).

Method: each scenario is run twice by a fresh subagent working in an isolated scratch copy of the relevant fixture from `evals/fixtures/`. The "with PreFlight" subagent receives the rendered `AGENTS.md` process as its instructions plus the scenario prompt; the "without" subagent receives only the raw scenario prompt. Neither installs dependencies or executes code - scoring is a code-review judgment against the target vulnerability classes in `../../scenarios.md`, per `../../RUBRIC.md`.

This file is the resume point: if the run stops partway, re-read this file and continue from the first `pending` chunk.

## Chunks

| Chunk | Scenarios | Status |
|---|---|---|
| 1 | P01, P02, P03 | **done** - scored in `results.md` |
| 2 | P04, P05, P06 | **done** - scored in `results.md` |
| 3 | P07, P08, P09 | **done** - scored in `results.md` |
| 4 | P10, P11, P12 | **done** - scored in `results.md` |
| 5 | P13, P14, P15 | **done** - scored in `results.md` |
| 6 | N01, N02, N03 | **done** - scored in `results.md` |
| 7 | N04, N05 | **done** - scored in `results.md` |

## Per-scenario status

| ID | With-run | Without-run | Scored |
|---|---|---|---|
| P01 | done | done | yes |
| P02 | done | done | yes |
| P03 | done | done | yes |
| P04 | done | done | yes |
| P05 | done | done | yes |
| P06 | done | done | yes |
| P07 | done | done | yes |
| P08 | done | done | yes |
| P09 | done | done | yes |
| P10 | done | done | yes |
| P11 | done | done | yes |
| P12 | done | done | yes |
| P13 | done | done | yes |
| P14 | done | done | yes |
| P15 | done | done | yes |
| N01 | done | done | yes |
| N02 | done | done | yes |
| N03 | done | done | yes |
| N04 | done | done | yes |
| N05 | done | done | yes |
