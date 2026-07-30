# Eval Fixtures

Minimal scratch codebases that give an agent something real to extend for each `scenarios.md` entry, rather than starting from an empty directory. None of these are meant to actually run (`npm install` is never executed) - they only need to be plausible enough to write against and review afterward.

| Fixture | Used by |
|---|---|
| `generic/` | P01-P11, P14, P15, N01, N02, N04, N05 (a small Express app plus a couple of React components) |
| `supabase/` | P12 |
| `nextjs/` | P13 |
| *(none - no code)* | N03 (pure informational question) |

Each eval run copies the relevant fixture into a fresh scratch directory per scenario per condition (with-PreFlight / without-PreFlight) so runs don't interfere with each other or with these committed originals.
