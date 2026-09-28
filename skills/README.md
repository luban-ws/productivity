# Productivity Skills

Agent Skills for the CLIs in this monorepo — [`@systembug/qingniao`](../packages/@systembug/qingniao/) (release) and [`@systembug/pangu`](../packages/@systembug/pangu) (dev server launcher).

Both CLIs are built for a human at a terminal. Each has agent-hostile edges that
are invisible from `--help` and from the README. These skills encode the verified
procedure, so an agent operating in a consuming monorepo invokes them correctly
instead of guessing flags, trusting exit codes, or blocking on a prompt.

## Available skills

| Skill                                     | For                                                             | What it prevents                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [`qingniao-release`](./qingniao-release/) | releasing, versioning, publishing, diagnosing release readiness | publishing unrehearsed; "fixing" exit code 3 by adding `--yes`; a `.ts` config that silently does nothing         |
| [`pangu-dev`](./pangu-dev/)               | launching, restarting, verifying a workspace dev server         | blocking on a readline prompt; reading exit code 0 as success when startup failed; orphaning a server on its port |

## Install

Install into any agent that reads `~/.agents/skills/`:

```bash
# both skills
npx skills add luban-ws/productivity

# one skill
npx skills add luban-ws/productivity --skill qingniao-release
npx skills add luban-ws/productivity --skill pangu-dev
```

To use a skill without installing, symlink it:

```bash
ln -s "$PWD/skills/qingniao-release" ~/.agents/skills/qingniao-release
ln -s "$PWD/skills/pangu-dev"        ~/.agents/skills/pangu-dev
```

Verify discovery from a clone:

```bash
npx skills add . --list
```

## Using a skill

Once installed, a skill activates on its own when the task matches its
description. You can also invoke it directly:

```
/qingniao-release
/pangu-dev
```

## Repository layout

```text
skills/
├── qingniao-release/
│   ├── SKILL.md
│   ├── skill-release.json
│   ├── LICENSE
│   └── references/
│       ├── jsonl-protocol.md
│       └── config.md
└── pangu-dev/
    ├── SKILL.md
    ├── skill-release.json
    ├── LICENSE
    └── references/
        ├── config-schema.md
        └── runtime.md
```

`skills/` is a plain directory of Markdown. It is deliberately **not** a pnpm
workspace member — `pnpm-workspace.yaml` globs only `apps/*`, `packages/*`, and
`packages/@systembug/*` — so adding a skill never triggers an install or a build.

## Contributing a skill

Each skill is self-contained and follows the same contract:

1. Directory name equals the `name` in `SKILL.md` frontmatter and the `skillId` in
   `skill-release.json`.
2. `SKILL.md` and `skill-release.json` are required; `LICENSE` is required;
   `references/` only where the instructions cite it.
3. The `description` states capability plus a concrete `Use when ...` trigger. It
   does not contain the workflow.
4. **Every command, flag, and exit code must have been executed**, or be cited to
   the `file:line` in the package source that creates it. No invented flags.
5. Activation signals first, including when _not_ to use the skill.
6. The first documented action is always read-only.
7. No tests, fixtures, `node_modules/`, build output, secrets, or machine-specific
   absolute paths inside the skill directory.

Validate before committing:

```bash
node ~/.agents/skills/skillify/scripts/validate-skill.mjs skills/<skill-name>
npx skills add . --list
```

Step 4 is the one that matters most. Two documented behaviours were wrong in the
first draft of `pangu-dev` and were only caught by running them: signalling the pid
that `$!` returns does nothing when a version manager shim sits on `PATH`, and
`qingniao --dry-run` still installs dependencies, so it is not side-effect-free.
Packaging validation passed for both while the instructions were wrong.

## Design

Tracked in [RFC 0023](../.spec/rfc/0023-qingniao-pangu-agent-skills.md), with
[0024](../.spec/rfc/0024-qingniao-release-skill.md) and
[0025](../.spec/rfc/0025-pangu-dev-server-skill.md) as its children.

## License

MIT — see [LICENSE](../LICENSE).
