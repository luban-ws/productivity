# RFC 0024: Skill that drives qingniao releases safely (child of 0023)

**Status:** Implemented

**Parent:** [0023](0023-qingniao-pangu-agent-skills.md)

## Summary

Ship `skills/qingniao-release/`, an Agent Skill that teaches an agent to
drive `@systembug/qingniao` through its JSON Lines protocol: start from the read-only
`plan` and `doctor` commands, treat exit code 3 as "not authorized" rather than
"failed", rehearse with `--json --yes --dry-run`, and only then run the real release
with explicit user consent.

## Problem

`qingniao` is the only tool in this repo that writes to a public registry. Three
things make an untrained agent dangerous with it:

1. **Authorization is not implied by `--json`.** Observed: `qingniao --json` exits
   **3** with `confirmation_required` and changes nothing. An agent that reads a
   non-zero exit as "broken" will "fix" it by adding `--yes` — which is exactly the
   mutating invocation. `--json --yes --dry-run` is the authorized rehearsal form,
   and it is not side-effect-free: it still installs dependencies, so a lockfile can
   appear (verified).
2. **`.ts`/`.js`/`.mjs` config files are silently ignored.** `config/loader.ts`
   parses only `.json` (line 180-184); the other branches are a `// TODO`. But
   `qingniao init` defaults to `--format ts`. Verified: a `qingniao.config.ts`
   setting `publish.enabled: false` left `plan --json` still reporting `publish` in
   `actions`; the same setting in `.json` removed it. `doctor` reports only
   `Missing qingniao.config.json (optional)` — a `warn`, not an error
   (`doctor/checks.ts:217`) — so the inert file is easy to skim past. Because the
   first match wins, a stray `.ts` even shadows a correct `.json` beside it.
3. **Config load can block.** `config/loader.ts:69` prompts via `select` when the
   package manager cannot be auto-detected — a hang in a non-TTY agent context.

## Goals

- An agent that has read the skill runs `plan` before `doctor`, and both before any
  mutating command.
- Every flag, exit code, and JSONL event in the skill is backed by an observed run
  or a `file:line` citation.
- The skill names the three traps above explicitly, each with its source location.
- The required root-script set for a clean `doctor` is stated, with which are
  `error` versus `warn`.

## Non-goals

- Making `--json` imply authorization, or changing exit code 3. Documented as-is.
- Adding real JSON Schema validation to qingniao's config. That is RFC 0010.
- The pangu dev-server skill. That is RFC 0025.

## Design

Directory: `skills/qingniao-release/`

```
qingniao-release/
├── SKILL.md              # frontmatter + ordered actions
├── skill-release.json    # identity: skillId, channel, version
├── LICENSE
└── references/
    ├── jsonl-protocol.md # event types, exit codes, parsing rules
    └── config.md         # PublishConfig keys, precedence, the .ts trap
```

`SKILL.md` body is ordered so the read-only path comes first:

1. `qingniao plan --json` — enumerate publishable packages and planned actions.
2. `qingniao doctor --json` — classify each `check` as ok/warn/error.
3. `qingniao doctor --fix` — only with user consent; states it writes root
   `package.json` scripts, creates `qingniao.config.json`, and may run
   `changeset init`.
4. `qingniao --json --yes --dry-run` — authorized rehearsal.
5. `qingniao --json --yes` — real release, gated on explicit user instruction.

`references/jsonl-protocol.md` holds the event union and the verified exit codes
(0 success, 1 failed, 2 invalid options, 3 confirmation required) plus the rule
that stdout carries only JSONL and raw command diagnostics go to stderr.

`references/config.md` holds the `PublishConfig` key list transcribed from
`src/types.ts`, the merge order (auto-detect → `package.json#qingniao` → config
file), and the `.ts`-is-ignored trap with its citation.

Per RFC 0023 convention 6, step 1 is the first action in the file, and step 5 is
the only one that mutates the registry.

## Acceptance

- `node ~/.agents/skills/skillify/scripts/validate-skill.mjs qingniao-release` passes.
- `npx skills add . --list` discovers the skill.
- Every command in `SKILL.md` was executed against this repo, and its observed
  output is consistent with what the skill claims.
- `references/` files are cited by relative link from `SKILL.md` and exist.
- No test, fixture, `node_modules/`, or absolute path inside the skill directory.
