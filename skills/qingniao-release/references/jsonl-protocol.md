# qingniao JSON Lines protocol

`--json` makes every command emit JSONL on **stdout**. One object per line, each
carrying `schemaVersion: 1` and a `timestamp`. Underlying command diagnostics go to
**stderr** and are not part of the stream.

Transcribed from `src/reporters/types.ts` and `src/reporters/json-reporter.ts`.

## Events

| `event`  | Fields                                            | Emitted by                                                         |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| `plan`   | `packages[]`, `actions[]`, `requiresConfirmation` | `plan --json`                                                      |
| `check`  | `check`, `status`, `message`                      | `doctor --json`                                                    |
| `stage`  | `stage`, `status`                                 | root command, `status` is `started`/`succeeded`/`failed`/`skipped` |
| `error`  | `code`, `message`                                 | any command, on failure                                            |
| `result` | `status`, `exitCode`, `summary`                   | **every** command, last line                                       |

`result.status` is only ever `succeeded` or `failed`. `result.exitCode` mirrors the
process exit code.

## Parsing rule

Read stdout line by line, `JSON.parse` each line, and dispatch on `event`. Ignore
stderr for structure. Always read the `result` event to decide the outcome — a
stream can end with a `stage` that says `failed` and a `result` that agrees, but
only `result` is guaranteed to be last and only `result` carries `exitCode`.

On a `plan` or `doctor` failure, the stream is an `error` event followed by a
`failed` `result`:

```json
{"schemaVersion":1,"event":"error","code":"plan_failed","message":"...","timestamp":"..."}
{"schemaVersion":1,"event":"result","status":"failed","exitCode":1,"summary":"Release plan failed","timestamp":"..."}
```

## Exit codes

| Code | Emitted when                                     | Source                            |
| ---- | ------------------------------------------------ | --------------------------------- |
| 0    | success                                          | —                                 |
| 1    | any command failure; unhandled promise rejection | `src/cli.ts:226`, `src/cli.ts:30` |
| 2    | `--json` with `--silent`                         | `src/cli.ts:181`                  |
| 3    | root command with `--json` but no `--yes`        | `src/cli.ts:187`                  |

The root command is the only one that uses 2 and 3.

```json
{"schemaVersion":1,"event":"error","code":"confirmation_required","message":"Pass --yes to authorize release changes","timestamp":"..."}
{"schemaVersion":1,"event":"result","status":"failed","exitCode":3,"summary":"Release requires explicit confirmation","timestamp":"..."}
```

```json
{"schemaVersion":1,"event":"error","code":"invalid_options","message":"--json cannot be combined with --silent","timestamp":"..."}
{"schemaVersion":1,"event":"result","status":"failed","exitCode":2,"summary":"Invalid command options","timestamp":"..."}
```

**Code 3 is the authorization gate, not a malfunction.** `qingniao` will not change
a version, a tag, or the registry without it. The correct response is to obtain
user consent and re-run with `--yes`. Adding `--yes` to "fix the error" is exactly
the mutation the gate exists to prevent — so only add it once the user has agreed.

## `--dry-run` and `--yes` are independent

`--yes` authorizes. `--dry-run` prevents writing. They are orthogonal, which gives
exactly one safe rehearsal form:

| Invocation               | Reads | Writes versions/git | Publishes | Other side effects        |
| ------------------------ | ----- | ------------------- | --------- | ------------------------- |
| `--json`                 | yes   | no                  | no        | none; exits 3             |
| `--json --yes --dry-run` | yes   | no                  | no        | **installs dependencies** |
| `--json --yes`           | yes   | **yes**             | **yes**   | installs, commits, tags   |

`--dry-run` suppresses release state, not the install step. Verified on a
throwaway workspace: versions unchanged, zero tags created, nothing published, and
an untracked `pnpm-lock.yaml` present afterwards. Check `git status` after a dry
run rather than assuming the tree is untouched.

A dry run can still fail, because it runs the real verification steps. On a
workspace with no prettier installed it ended with a `stage` `failed`, a
`release_failed` error whose message began `Command not found\nCommand: pnpm
format:check`, and a `failed` `result` with `exitCode` 1.

## Human output

Drop `--json` and add `-v` when a human is watching and you want the progress
spinners. Never mix the two: the human path writes to stdout with `ora` spinners
that will corrupt JSONL parsing.
