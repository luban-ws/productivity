# pangu runtime behaviour

How `pangu` behaves outside a TTY, what its exit code means, and how to launch and
stop it from an agent.

## The TTY fallback map

Every Ink screen checks `isInteractiveTerminal()`, which is
`Boolean(process.stdin.isTTY && process.stdout.isTTY)` (`src/ui/tty.ts:8`). The
fallbacks are **not** uniform, and the differences are what matter here.

| Path                | TTY                | Non-TTY                    | Blocks?                      |
| ------------------- | ------------------ | -------------------------- | ---------------------------- |
| `pangu --help`      | Ink help           | `printHelp`                | no                           |
| `pangu` (no args)   | Ink select         | `selectDemoFromConsole`    | **yes**                      |
| `pangu <bad demo>`  | Ink alert, 600ms   | `printAlert` + `printHelp` | no                           |
| `pangu <good demo>` | Ink startup, 600ms | `runStartupConsole`        | no — then it runs the server |
| config error        | Ink alert          | `printAlert`               | no                           |

Two consequences:

- **Bare `pangu` is the only blocking invocation.** `selectDemoFromConsole` calls
  `createInterface` and awaits `rl.question` (`src/ui/console-demo-select.ts:21-24`).
- **`pangu <good demo>` is genuinely agent-safe.** `runStartup` branches on
  `isInteractiveTerminal()` before rendering (`src/ui/run-startup.tsx:50`), so you
  get plain console lines and the server starts normally.

## Exit code contract

**`pangu` exits 0 on every handled path**, including:

| Situation                      | Exit | Source                                     |
| ------------------------------ | ---- | ------------------------------------------ |
| `--help`                       | 0    | `src/cli.ts:108`                           |
| demo not found                 | 0    | `src/cli.ts:47` via `exitAfterUserMessage` |
| no demos configured            | 0    | `src/cli.ts:104`                           |
| config missing or malformed    | 0    | `src/config.ts:71`, `src/config.ts:111`    |
| package directory unresolvable | 0    | `src/cli.ts:65`                            |
| dev script missing             | 0    | `src/process-utils.ts:69`                  |
| child server exited non-zero   | 0    | `src/process-utils.ts:196`                 |
| user cancelled the menu        | 0    | `src/cli.ts:134`                           |

`exitAfterUserMessage()` is literally `process.exit(0)` (`src/exit-utils.ts:7`).
The comment explains why: the message was already shown, and a non-zero code would
only make the package manager print `ELIFECYCLE` noise on top.

The child's own exit code is discarded — `attachGracefulShutdown` calls
`process.exit(0)` regardless, to avoid `pnpm` reporting a recursive-run failure
(`src/process-utils.ts:190-197`).

So: **judge success by stdout, never by exit code.** The signals to look for:

- `❌ Invalid demo name: <x>` — the value was not in the config.
- `❌ 读取配置文件失败` on stderr — the config did not parse.
- `⚠️ 未找到配置文件` on stderr — no config file at all.
- A `Starting <name>` line followed by the server's own ready output — success.

## Launching in the background

`pangu <demo>` holds the terminal for the life of the server, so run it detached
and keep the handle. On macOS there is no `timeout(1)`; use a shell background job:

```bash
# start and keep the pid, logging next to you
pangu site > pangu-site.log 2>&1 &
SHIM_PID=$!

# wait for the server to come up, then inspect
sleep 5
cat pangu-site.log
```

Redirect to a file. Leaving the child attached to your own stdout means a
backgrounded job can still be killed by signals meant for you, and the Ink
escape sequences make the log unreadable.

## Stopping it

**Resolve the real pid before signalling.** The `pangu` on `PATH` is often a shim:
with volta or nvm installed, `pangu` is a wrapper process whose child is the node
process running `dist/cli-entry.js`. Only the child registers the SIGINT handler.
Signalling the shim is silently ignored.

Observed on this machine: `pangu site &` gave `$!` = 75567, whose process name was
`volta-shi`; `kill -INT 75567` left both pangu and vite running with the port still
held. `pgrep -P 75567 -f 'cli-entry.js'` returned 75574, and `kill -INT 75574` shut
both down cleanly.

```bash
# start, keeping both the shim pid and the resolved pangu pid
pangu site > pangu-site.log 2>&1 &
SHIM_PID=$!
PANGU_PID=$(pgrep -P "$SHIM_PID" -f 'cli-entry.js' | head -1)

# stop
kill -INT "${PANGU_PID:-$SHIM_PID}"
```

If `pgrep` finds nothing, pangu was not launched through a shim, and `$!` is
already the right pid.

### Why the group matters

`pangu` handles SIGINT and SIGTERM (`src/process-utils.ts:187`) and forwards the
signal to the child's **process group** via `process.kill(-pid, signal)`
(`src/process-utils.ts:180`). It spawns the child `detached` on Unix for exactly
this reason (`src/process-utils.ts:135`), so the dev server gets a process group of
its own — observed as a distinct PGID on the vite process.

Signalling that group, rather than the single pid, is what guarantees the dev
server and anything it spawned die together. Signalling an inner process directly,
or killing a pid found in the log, can leave an orphan holding the port.

Confirmed on shutdown: pangu logs `The server is shutting down gracefully. Thank
you!` and both processes exit.

An alternative that avoids the shim problem entirely is to signal every pangu
process for a given demo, but it is broader than it looks and will match other
projects using the same demo name:

```bash
pkill -INT -f 'pangu/dist/cli-entry\.js site'
```

## Environment handed to the dev script

`buildDevEnv` prepends two directories to `PATH`
(`src/process-utils.ts:101`):

```
<packageDirectory>/node_modules/.bin
<workspaceRoot>/node_modules/.bin
```

`workspaceRoot` is `process.cwd()` — the directory you ran `pangu` from. This is
why running from anywhere other than the workspace root tends to produce a
`command not found` for a workspace-level binary, and why a confusing `PATH`
problem is really a wrong-working-directory problem.

The dev script itself is read from the resolved package's `package.json`
(`src/process-utils.ts:66`) and executed with `shell: true`, `stdio: "inherit"`, in
the package directory. Any `args` from the config and any extra CLI arguments are
appended to that script string (`src/process-utils.ts:90`).
