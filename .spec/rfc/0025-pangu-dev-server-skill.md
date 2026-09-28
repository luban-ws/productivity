# RFC 0025: Skill that drives pangu dev servers without blocking (child of 0023)

**Status:** Implemented

**Parent:** [0023](0023-qingniao-pangu-agent-skills.md)

## Summary

Ship `skills/pangu-dev/`, an Agent Skill that teaches an agent to start a
workspace dev server through `@systembug/pangu` non-interactively: read the demo
list out of `pangu.config.*` before invoking anything, always pass an explicit
`<demo>` argument, run the server as a background process, and never trust the
exit code to decide whether startup succeeded.

## Problem

`pangu` is an Ink TUI with non-TTY fallbacks, but the fallbacks are inconsistent,
and the inconsistency is what breaks agents:

1. **Invalid demo exits 0.** Observed: `pangu nosuchdemo` in a non-TTY prints
   `❌ Invalid demo name` and the help screen, then calls `exitAfterUserMessage()`
   (`exit-utils.ts:7`), which is `process.exit(0)`. Exit-code checking reports
   success on failure.
2. **Bare `pangu` blocks.** With no argument, `runDemoSelect` falls back to
   `selectDemoFromConsole`, which opens a `readline` interface and awaits
   `rl.question` (`console-demo-select.ts:24`). Observed: prints the numbered menu,
   then waits.
3. **Config errors also exit 0.** A missing or invalid config file makes
   `loadConfig` warn and return `DEFAULT_CONFIG` with `demos: []`
   (`config.ts:71-116`), which trips the `noDemos` alert and the same exit-0 path.
4. **`pangu <demo>` is genuinely safe.** `runStartup` checks
   `isInteractiveTerminal()` (`run-startup.tsx:50`) and uses a plain console path
   when there is no TTY, so an agent gets non-ink output for the one invocation
   that matters.
5. **`$!` is often not pangu.** With a version manager installed, the `pangu` on
   `PATH` is a shim whose child is the node process running `dist/cli-entry.js`.
   Only the child registers the SIGINT handler, so `kill -INT "$!"` is silently
   ignored and the dev server keeps its port. Verified on this machine: `$!` was a
   `volta-shi` process; signalling it left pangu and vite both running, while
   `pgrep -P "$!" -f 'cli-entry.js'` followed by `kill -INT` shut both down cleanly.

## Goals

- The skill's rule is unambiguous: the only agent-safe invocation is
  `pangu <demo>` with a `value` read from the config file.
- The skill states that pangu's exit code carries no success/failure signal, and
  gives the stdout check to use instead.
- The skill states that pangu must be run from the directory holding the config
  file, since both the config search (`config.ts:44`) and the workspace-root PATH
  injection (`process-utils.ts:101`) are `cwd`-relative with no upward search.
- Documented config precedence and the `name`/`value`/`package` requirement, with
  the observation that `description` is type-required but not runtime-validated
  (`config.ts:98`).

## Non-goals

- Changing pangu to exit non-zero on a bad demo name. Out of scope; the skill
  works around it.
- The qingniao release skill. That is RFC 0024.
- Porting pangu to a Vite lib build. Already tracked as a To Do in
  `TASK_TRACKING.md`.

## Design

Directory: `skills/pangu-dev/`

```
pangu-dev/
├── SKILL.md              # frontmatter + ordered actions
├── skill-release.json    # identity: skillId, channel, version
├── LICENSE
└── references/
    ├── config-schema.md  # DevConfig/DemoOption keys, file precedence
    └── runtime.md        # TTY fallbacks, exit-code contract, signal handling
```

`SKILL.md` body:

1. Locate the config file in the current directory and read the `demos[].value`
   list. Do not invoke pangu yet.
2. `pangu --help` as a cross-check of that list. Safe; exits promptly.
3. Run `pangu <demo>` as a **background** process, because it does not return.
4. Verify startup from the child's stdout, never from its exit code.
5. Stop it by signalling the process group; pangu forwards SIGINT/SIGTERM to the
   child group and exits 0 (`process-utils.ts:170`).

`references/config-schema.md` transcribes `DevConfig` and `DemoOption` from
`src/types.ts` and the six-file search order from `config.ts:44-62`.

`references/runtime.md` holds the TTY-fallback map, the exit-code contract, the
`--filter <package> exec` directory resolution, and the dev-script requirements
(`scripts.dev` must be a non-empty string; extra args are appended to the script
string, `process-utils.ts:90`).

## Acceptance

- `node ~/.agents/skills/skillify/scripts/validate-skill.mjs pangu-dev` passes.
- `npx skills add . --list` discovers the skill.
- The invalid-demo exit-0 behaviour and the bare-`pangu` readline block were both
  reproduced before being documented, and the skill's claims match the observation.
- `references/` files are cited by relative link from `SKILL.md` and exist.
- No test, fixture, `node_modules/`, or absolute path inside the skill directory.
