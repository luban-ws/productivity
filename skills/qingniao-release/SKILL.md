---
name: qingniao-release
description: "Drive @systembug/qingniao, the zero-config monorepo release CLI, through its agent JSON Lines protocol. Use when releasing, versioning, publishing packages, or diagnosing release readiness in a pnpm/npm/yarn workspace monorepo that uses the qingniao or qn binary; also use when a release command exits 3, exits 2, or a qingniao config file appears to be ignored."
---

# qingniao release

`qingniao` publishes a monorepo to npm: it bumps versions, commits, tags, and
uploads. An agent that misreads it will publish unrehearsed. This skill is the
verified procedure.

Everything below was executed against a real workspace, or is cited to the line of
`@systembug/qingniao` source that creates the behaviour. Nothing here is inferred
from `--help`.

## When to use this skill

Use it when the task involves `qingniao`, `qn`, `pnpm release`,
`qingniao.config.*`, or a question like "is this repo ready to release?".

Do **not** use it to publish a single non-workspace package, or when a different
publish tool owns the release. Do not use it to fix a failing test or build — those
are the repo's own scripts, run by `qingniao`, not by you.

## The three rules

1. **Never mutate without explicit user consent.** Steps 4 and 5 change versions,
   Git history, and a public registry.
2. **`--json` is not authorization.** It is an output format. Adding `--yes` is
   what authorizes, and that is the mutating step.
3. **Read the last line.** Every JSONL invocation ends with a `result` event. Judge
   success from its `status` and `exitCode`, not from the last line you happened to
   read.

## Step 1 — Read the plan (always safe, never mutating)

```bash
qingniao plan --json
```

Observed output shape:

```json
{"schemaVersion":1,"event":"plan","packages":[{"name":"@systembug/pangu","version":"0.1.15"}],"actions":["auth","git","verify","version","publish"],"requiresConfirmation":true,"timestamp":"..."}
{"schemaVersion":1,"event":"result","status":"succeeded","exitCode":0,"summary":"Release plan completed","timestamp":"..."}
```

`packages` excludes private packages. `requiresConfirmation` is always `true` —
`qingniao` never self-authorizes. Report the package list to the user and wait.

## Step 2 — Diagnose (read-only)

```bash
qingniao doctor --json
```

Each line is a `check` event with a `status` of `ok`, `warn`, or `error`. Group
them for the user rather than pasting the raw stream.

To make warnings fail the run, add `--strict`. To change what gets checked at all,
set `checks.*` in config — see [references/config.md](references/config.md).

### The root scripts `doctor` requires

`doctor` fails with `error` for a missing root `package.json` script in any of
these, and with `warn` for a missing `release` script:

| Script         | Severity | Source                     |
| -------------- | -------- | -------------------------- |
| `lint`         | error    | `src/doctor/checks.ts:129` |
| `format`       | error    | `src/doctor/checks.ts:135` |
| `format:check` | error    | `src/doctor/checks.ts:141` |
| `typecheck`    | error    | `src/doctor/checks.ts:149` |
| `test`         | error    | `src/doctor/checks.ts:157` |
| `build`        | error    | `src/doctor/checks.ts:163` |
| `release`      | warn     | `src/doctor/checks.ts:169` |

Other checks that commonly fire: `npm-auth` (`error` when not logged in),
`git-dirty` and `git-unpushed` (`warn`), `changeset-pending` (`warn` when no
changeset file is staged), `qingniao-config` (`warn` when absent).

## Step 3 — Fix, only with consent

```bash
qingniao doctor --fix
```

State what it will do before running it, because it writes to disk. It:

- adds any missing root scripts from the table above, using `turbo run <task>` or
  `pnpm -r run <task>` depending on whether `turbo.json` exists
  (`src/utils/root-scripts.ts:55`);
- creates `qingniao.config.json` containing `{ "publish": { "skipExisting": true } }`
  (`src/doctor/fixes.ts:17`);
- runs `changeset init` **only if** `@changesets/cli` is already a devDependency
  (`src/doctor/fixes.ts:52`).

It never overwrites an existing script or config file.

## Step 4 — Rehearse (authorized, but not side-effect-free)

```bash
qingniao --json --yes --dry-run
```

`--yes` authorizes; `--dry-run` is what keeps it from writing release state. This is
the only combination that runs the real pipeline without publishing.

**It is not free of side effects.** Verified against a throwaway workspace: after
`--json --yes --dry-run`, package versions were unchanged, no Git tag was created,
and nothing was published — but an untracked `pnpm-lock.yaml` had appeared, because
the pipeline still runs the install step. Expect `node_modules/` and a possibly
rewritten lockfile. Run it on a clean tree, and check `git status` afterwards
rather than assuming the tree is untouched.

Get the user's go-ahead first, and say up front that it will install dependencies.

## Step 5 — Release (mutating)

```bash
qingniao --json --yes
```

This bumps versions, creates a commit and tag, and publishes to npm. Run it only
on an explicit instruction such as "release 0.2.0" or "publish it". Do not infer
consent from "ship it", "fix the release", or a passing `--dry-run`.

Useful modifiers: `--skip-version` (publish without bumping), `--skip-build`,
`--skip-publish` (version and build only), `-c <path>` for a config outside the
root, `-v` for verbose human output.

## Exit codes

| Code | Meaning               | What it is not                                               |
| ---- | --------------------- | ------------------------------------------------------------ |
| 0    | succeeded             | —                                                            |
| 1    | failed                | —                                                            |
| 2    | invalid options       | `--json` combined with `--silent` (`src/cli.ts:181`)         |
| 3    | confirmation required | **not** a crash, and **not** fixed by adding `--yes` blindly |

Code 3 is the guard working. Handle it by asking the user, not by retrying.

## Traps

### A `.ts` or `.js` config file is silently ignored

`qingniao.config.ts`, `.mjs`, and `.js` are located by `findConfigFile`
(`src/config/loader.ts:22`) but only `.json` is ever parsed — the other branches
are a `// TODO` at `src/config/loader.ts:184`. Yet `qingniao init` defaults to
`--format ts`.

Verified: a `qingniao.config.ts` containing `{ publish: { enabled: false } }` left
`plan --json` still reporting `publish` in `actions` — the setting had no effect.
The same setting in `qingniao.config.json` removed it from `actions` immediately.

Two ways this bites:

- The default `init` output is a file that does nothing.
- `doctor` reports only `Missing qingniao.config.json (optional)` — a **`warn`**,
  naming the `.json` file specifically (`src/doctor/checks.ts:217`). It is easy to
  skim past, and it does not fail the run.

Worse, because the first match wins, a stray `qingniao.config.ts` **shadows** a
correct `qingniao.config.json` sitting next to it.

**Always use JSON.** Generate it with `qingniao init --format json`. If a release
seems to ignore your settings, check for a higher-priority filename in the list
above before anything else.

### An undetectable package manager hangs the process

`loadConfig` prompts through `select` when the package manager cannot be inferred
(`src/config/loader.ts:69`). In a non-TTY agent that is a hang, not a question.
Make sure the root `package.json` has a `packageManager` field, or set
`project.packageManager` in config, before running any command that loads config.

### stdout is JSONL; stderr is not

`--json` writes only JSONL to stdout; raw underlying command diagnostics go to
stderr (`src/cli.ts:165`, and RFC 0006). Parse stdout line by line and skip stderr
when extracting structure. Read stderr when you need the actual failure text.

### Missing scripts surface as a command error

A step whose script does not exist fails with the exec error naming the command,
for example:

```
Command not found
Command: pnpm format:check
Working directory: /path/to/repo
Timeout: 300 seconds
```

Recognise it by the `Command not found` line plus the `Command:` line naming the
script, and add the script from the table in step 2 — do not go hunting through the
pnpm stack. `src/utils/script-errors.ts:8` additionally collapses
`Missing script:` / `Unknown script` / `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL` shapes
into a single line, so both forms read the same way.

## References

- [references/jsonl-protocol.md](references/jsonl-protocol.md) — event types,
  parsing rules, and the full exit-code contract.
- [references/config.md](references/config.md) — every `PublishConfig` key, merge
  order, and the `.ts`-is-ignored trap in full.
