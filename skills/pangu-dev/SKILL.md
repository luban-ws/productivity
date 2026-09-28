---
name: pangu-dev
description: "Start a workspace dev server through @systembug/pangu, the interactive demo launcher, without blocking or misreading failure. Use when a pangu.config.* or dev.config.* file lists demos and the task is to launch, restart, or verify one of them; also use when a pangu invocation exits 0 but no server appeared, or when pangu hangs waiting for input."
---

# pangu dev server

`pangu` reads a config file that lists demos — named dev-server targets in a
monorepo — and launches the `dev` script of the package behind the one you pick.
At a terminal it draws an Ink menu. In a non-TTY context it falls back to plain
console output, and that fallback is inconsistent enough to mislead an agent.

Everything below was executed against a real workspace, or is cited to the line of
`@systembug/pangu` source that creates the behaviour.

## When to use this skill

Use it when the repo has a `pangu.config.*` or `dev.config.*` file and the task is
to run, restart, or check a dev server.

Do **not** use it when there is no config file — then there are no demos and
`pangu` has nothing to launch. Use the package's own script (`pnpm --filter <pkg>
dev`) instead.

## The three rules

1. **Always pass an explicit demo value.** Bare `pangu` is the only invocation that
   can block.
2. **The exit code carries no signal.** `pangu` exits 0 on failure. Verify from
   stdout.
3. **Run it in the background.** A successful launch does not return; it holds the
   terminal for as long as the server runs.

## Step 1 — Read the demo list from the config file

Do this before invoking anything. `pangu` only ever looks in the current
directory — there is no upward search (`src/config.ts:44`).

Search order, first match wins:

```
pangu.config.yaml
pangu.config.yml
pangu.config.json
dev.config.yaml
dev.config.yml
dev.config.json
```

Collect every `demos[].value`. Those are your only valid arguments.

A missing config is **not** an error you can see from the exit code: `loadConfig`
warns and returns a default with `demos: []` (`src/config.ts:71`), which then
triggers the `noDemos` alert and an exit 0. If you find no config file, stop and
say so rather than running `pangu`.

## Step 2 — Cross-check with `--help`

```bash
pangu --help
```

Safe, returns immediately, exits 0, and prints the same demo list. Use it to
confirm step 1 rather than to discover demos for the first time. Its output also
shows the resolved package manager.

## Step 3 — Launch in the background

```bash
pangu <demo> [extra args...]
```

`<demo>` is matched case-insensitively against `demos[].value` (`src/cli.ts:40`).
Anything after it is appended to the package's `dev` script string
(`src/process-utils.ts:90`), so `pangu site --port 3001` works if the dev script
forwards arguments.

This command does not return while the server runs. Start it as a background
process and keep the handle. See [references/runtime.md](references/runtime.md) for
the background pattern and how to stop it.

## Step 4 — Verify from stdout, never from the exit code

This is the trap. `pangu nosuchdemo`, in a non-TTY context, prints:

```
❌ Invalid demo name: nosuchdemo
🚀 Pangu · Dev Server
📖 Usage:
  ...
```

and then exits **0** — `exitAfterUserMessage()` is `process.exit(0)`
(`src/exit-utils.ts:7`). A config that fails to parse produces the same class of
exit-0 failure.

So treat a startup as successful only when the child's output shows the server
coming up. A clean `❌ Invalid demo name` line means the demo value was wrong;
re-read the config and use a `value` from it verbatim.

## Step 5 — Stop it

**Do not signal the pid that `$!` gives you.** On a machine with a `volta`, `nvm`,
or similar version manager, the `pangu` on `PATH` is a shim process that spawns the
real node process as its child. Signalling the shim does nothing at all — observed:
the shim stayed alive and the dev server kept holding its port.

Resolve the real process first:

```bash
pangu site > pangu-site.log 2>&1 &
SHIM_PID=$!

# step through any PATH shim to the process that actually runs pangu
PANGU_PID=$(pgrep -P "$SHIM_PID" -f 'cli-entry.js' | head -1)
```

Then signal that:

```bash
kill -INT "${PANGU_PID:-$SHIM_PID}"
```

`pangu` handles SIGINT and SIGTERM (`src/process-utils.ts:187`) and forwards the
signal to the dev server's whole process group via `process.kill(-pid, signal)`
(`src/process-utils.ts:180`). It spawns the child detached on Unix for exactly this
reason (`src/process-utils.ts:135`). Signalling the group, rather than the single
pid, is what guarantees the server and anything it spawned die together.

Verified end to end: after `kill -INT` on the resolved pid, both pangu and vite
were gone and the port was released, with pangu logging
`The server is shutting down gracefully. Thank you!`.

## Requirements pangu enforces

- **`package` must be a real workspace package name.** pangu resolves it with
  `<pm> --filter <package> exec node -p process.cwd()`
  (`src/process-utils.ts:28`). An unresolvable name throws.
- **The package must have a `scripts.dev` that is a non-empty string**
  (`src/process-utils.ts:66`). A missing `package.json`, unparseable JSON, or
  absent `dev` script each raise a distinct error before the server starts.
- **Run from the workspace root**, the directory holding the config file. Both the
  config search and the `node_modules/.bin` PATH injection are `cwd`-relative
  (`src/process-utils.ts:101`).

## Traps

### Bare `pangu` blocks

With no argument, `runDemoSelect` falls back to `selectDemoFromConsole`, which
opens a `readline` interface and awaits a line (`src/ui/console-demo-select.ts:24`).
Observed: it prints the numbered menu and then waits indefinitely.

Never run bare `pangu` from an agent. If a menu is printed, you launched it wrong.

### `description` is required by the type but not by validation

`DemoOption` declares `description` as required (`src/types.ts:15`), but
`loadConfig` only validates `name`, `value`, and `package` (`src/config.ts:98`). A
demo missing `description` loads fine and then renders as a bare value in the menu.
Set it anyway — the human reading the menu needs it.

### A demo may override the package manager

`DemoOption.packageManager` overrides the global `packageManager`
(`src/cli.ts:50`). It must be one your workspace actually uses; pangu will shell
out to it verbatim.

## References

- [references/config-schema.md](references/config-schema.md) — `DevConfig` and
  `DemoOption` fields, file precedence, and validation rules.
- [references/runtime.md](references/runtime.md) — the TTY fallback map, the
  exit-code contract, background invocation, and signal handling.
