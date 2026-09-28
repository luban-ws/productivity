# qingniao configuration

`qingniao` is zero-config by design. You should rarely need this file — read it
when a `doctor` check fails that you do not understand, or when auto-detection
picks the wrong thing.

## The trap: only `.json` is parsed

`findConfigFile` searches eight filenames in this order
(`src/config/loader.ts:22`):

```
qingniao.config.ts
qingniao.config.mjs
qingniao.config.js
qingniao.config.json
publish.config.ts
publish.config.mjs
publish.config.js
publish.config.json
```

The **first match wins**. But `loadConfig` parses only files ending in `.json`:

```ts
if (foundConfigPath.endsWith(".json")) {
    const fileConfig = JSON.parse(readFileSync(foundConfigPath, "utf-8"));
    config = deepMerge(config, fileConfig);
}
// TODO: support .js/.mjs/.ts config files
```

— `src/config/loader.ts:180-184`

Consequences, all of which have bitten real setups:

- A `qingniao.config.ts` is found, then ignored. No warning, no error.
- `qingniao init` defaults to `--format ts`, so the file it writes by default does
  nothing (`src/cli.ts:41`).
- `doctor`'s `qingniao-config` check only tests for the literal filename
  `qingniao.config.json` (`src/doctor/checks.ts:217`), so a `.ts` config passes
  diagnosis while being inert.
- Because the first match wins, a stray `qingniao.config.ts` **shadows** a correct
  `qingniao.config.json` sitting next to it.

**Always use JSON.** Generate it with `qingniao init --format json`. If a release
seems to ignore your settings, check for a higher-priority filename in the list
above before anything else.

## Merge order

Later wins. From `src/config/loader.ts:163`:

1. zero-config auto-detection
2. the `qingniao` field in root `package.json`
3. a config file (`-c <path>`, else the first filename found)

Auto-detection (`src/config/loader.ts:64`) infers the package manager from
`packageManager`, the workspace from `pnpm-workspace.yaml` or `workspaces`, the
build tool preferring Nx over Turbo, `version.strategy` as `changeset` when a
`.changeset` directory exists and `manual` otherwise, and defaults
`git.tagPrefix` to `"v"`.

### Blocking prompt

If the package manager cannot be detected, auto-detection prompts through `select`
(`src/config/loader.ts:69`). In a non-TTY that hangs. Guarantee detection by having
`packageManager` in the root `package.json`, or by setting it explicitly:

```json
{
    "project": { "packageManager": "pnpm" }
}
```

## PublishConfig keys

Transcribed from `src/types.ts`. Every key is optional; omit what auto-detection
already gets right.

### `project`

`name`, `rootDir`, `packageManager` (`"npm" | "pnpm" | "yarn"`).

### `git`

`enabled`, `branch` (string or array), `requireClean`, `requireUpToDate`,
`autoPull`, `tagPrefix`, `commitMessage` (string or `(version) => string`).

### `version`

`strategy` (`"changeset" | "manual" | "semver" | "custom"`), `bumpTypes`,
`syncAll`, `syncWorkspaceDeps`, `files`.

### `changeset`

`enabled`, `configPath`, `createCommand`, `versionCommand`, `publishCommand`,
`autoCreate`, `skipVersion`, `skipPublish`, `readConfig`.

### `build`

`enabled`, `steps[]` (`{ name, command, cwd?, silent?, skipOnError?, condition? }`),
`verifyArtifacts[]` (`{ package, path, required?, minFiles? }`), `useTurbo`,
`turboConfigPath`, `turboTasks`, `useNx`, `nxTargets`, `artifactPaths`,
`skipMissingArtifacts`, `preLintBuild`.

`preLintBuild` names packages that must be built before linting — an
eslint-plugin has no lintable source until it is built.

### `workspace`

`enabled`, `configPath`, `autoDetect`.

### `packages`

`root`, `pattern` (string or array), `exclude`, `filter` (`(pkg) => boolean`),
`usePnpmList`. Setting `pattern` switches discovery off `pnpm list` and onto glob
matching — which is also what `plan` keys off (`src/commands/plan.ts:31`).

### `dependencies`

`respectDependencyOrder`, `buildOrder` (`"topological" | "parallel" | "custom"`),
`customOrder`.

### `publish`

`enabled`, `registry`, `access` (`"public" | "restricted"`), `dryRun`,
`skipExisting`, `otpRequired`, `replaceWorkspaceProtocols`, `protocolReplacement`
(`"version" | "range" | "custom"`), `customProtocolReplacer`.

Scoped packages need `access: "public"` to publish publicly. `skipExisting: true`
is what `doctor --fix` writes by default (`src/doctor/fixes.ts:17`), because it
makes re-running a release after a partial failure survivable.

### `checks`

`auth`, `git`, `build`, `tests`, `lint`, `typecheck`, `format` — each a boolean.
Setting one to `false` removes that check from `doctor` and that action from
`plan.actions`. Use it to silence a check that does not apply, not to hide a real
failure.

### `hooks`

`beforeVersion`, `afterVersion`, `beforeChangesetCreate`, `afterChangesetCreate`,
`beforeChangesetVersion`, `afterChangesetVersion`, `beforeChangesetPublish`,
`afterChangesetPublish`, `beforeBuild`, `afterBuild`, `beforePublish`,
`afterPublish` — each `(ctx) => Promise<void>`.

Hooks are functions, so they only work in a JavaScript config. Since only `.json`
is parsed, **hooks are currently unreachable** (`src/config/loader.ts:184`).
Treat hook configuration as unsupported; wiring it up is RFC 0008.

### `prompts`

`confirmVersion`, `confirmPublish`, `dryRunFirst`. Relevant only on the human
path.

## Minimal example

```json
{
    "publish": { "skipExisting": true }
}
```

That is exactly what `doctor --fix` creates, and it is enough for most repos.
Add keys only when `doctor` or `plan` shows you something wrong.
