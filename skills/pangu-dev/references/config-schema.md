# pangu config schema

Transcribed from `src/types.ts` and `src/config.ts`. Both JSON and YAML are
supported.

## File discovery

`findConfigFile` checks six paths in the current directory and takes the first
that exists (`src/config.ts:44`):

1. `pangu.config.yaml`
2. `pangu.config.yml`
3. `pangu.config.json`
4. `dev.config.yaml`
5. `dev.config.yml`
6. `dev.config.json`

There is **no upward search**. Run `pangu` from the directory holding the file, and
expect the workspace root to be that same directory.

## DevConfig

| Field            | Type           | Required | Meaning                                  |
| ---------------- | -------------- | -------- | ---------------------------------------- |
| `demos`          | `DemoOption[]` | yes      | the launchable targets                   |
| `projectName`    | `string`       | no       | shown in the welcome line                |
| `packageManager` | `string`       | no       | default `"pnpm"`; a demo may override it |

## DemoOption

| Field            | Type       | Runtime-validated | Meaning                                      |
| ---------------- | ---------- | ----------------- | -------------------------------------------- |
| `name`           | `string`   | yes               | display name in the menu                     |
| `value`          | `string`   | yes               | the CLI argument; matched case-insensitively |
| `package`        | `string`   | yes               | workspace package to run the dev script in   |
| `description`    | `string`   | **no**            | menu subtitle; required by the type only     |
| `packageManager` | `string`   | no                | per-demo override of the global one          |
| `args`           | `string[]` | yes, if present   | prepended to any CLI arguments               |

Validation is `src/config.ts:92-105`. A missing or non-array `demos`, or a demo
missing `name`/`value`/`package`, throws. `args`, when present, must be an array.

`description` is declared non-optional in `DemoOption` (`src/types.ts:15`) but is
not in that check, so a demo without one loads and renders as a bare value. Always
set it — the menu is for humans.

## Full example

```json
{
    "projectName": "鲁班工坊",
    "packageManager": "pnpm",
    "demos": [
        {
            "name": "Site - 生产力工具集展示网站",
            "value": "site",
            "description": "启动展示网站开发服务器",
            "package": "@luban-ws/productivity"
        }
    ]
}
```

The same file in YAML, with per-demo overrides:

```yaml
projectName: 鲁班工坊
packageManager: pnpm
demos:
    - name: Site
      value: site
      description: 启动展示网站开发服务器
      package: "@luban-ws/productivity"
    - name: Docs
      value: docs
      description: 启动文档开发服务器
      package: "@luban-ws/productivity"
      packageManager: pnpm
      args: ["--host"]
```

`args` are prepended to arguments given on the command line, so
`args: ["--host"]` plus `pangu docs --port 5174` becomes
`<dev script> --host --port 5174` (`src/cli.ts:51`).

## Failure behaviour

A missing config file logs a warning and yields the default config
(`projectName: "quizerjs"`, `packageManager: "pnpm"`, `demos: []`) — `src/config.ts:71`.

A malformed config logs `❌ 读取配置文件失败`, then also falls back to the default
(`src/config.ts:111`).

Both paths end at the same place: `demos` is empty, so `main` raises the `noDemos`
alert and calls `exitAfterUserMessage()`, which exits **0**. You cannot detect a
broken config from the exit code — read stderr, or check the file first.
