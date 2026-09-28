# RFC 0023: Qingniao and Pangu agent skills (Umbrella)

**Status:** Implemented

**Type:** Umbrella

## Summary

Package the two CLIs this monorepo ships — `@systembug/qingniao` (release) and
`@systembug/pangu` (dev server launcher) — as Agent Skills, so an agent operating
in a consuming monorepo invokes them correctly instead of guessing flags, trusting
exit codes, or blocking on interactive prompts. This RFC indexes the children and
owns only the conventions they share. It holds no implementation detail.

## Problem

Both CLIs are designed for a human at a TTY, and both have agent-hostile edges that
are invisible from `--help` and from reading the README:

- `qingniao` mutates versions, Git tags, and the npm registry. Its guard is
  interactive, and its agent protocol (`--json` + exit code 3) is documented but
  easy to misread as "already authorized".
- `qingniao` silently ignores `.ts`/`.js`/`.mjs` config files while its own
  `init` command defaults to generating one.
- `pangu` exits **0** on an invalid demo name, so exit-code checking reports success
  on failure.
- `pangu` with no argument blocks on a readline prompt in a non-TTY context.

An agent that does not know these will publish unrehearsed, or hang.

## Goals

- Each child ships a validated skill under `skills/` at the repo root, installable via `npx skills add`
  through a symlink into `~/.agents/skills/`.
- Every command, flag, exit code, and JSONL event documented in a child is one that
  was executed against this repo, not inferred from source reading alone.
- Every documented trap cites the source file and line that creates it.

## Non-goals

- Changing `qingniao` or `pangu` behaviour to remove the traps. The skills document
  reality; fixing the CLIs is separate work.
- Skills for `diting`, `wenxin`, or `tongyu`. Spawn a new child or a new umbrella.
- Publishing the skills to a registry. This umbrella delivers them into the repo
  and the local skill path only.

## Shared conventions

These apply to every child and are the reason this is an umbrella rather than two
unrelated standalones.

1. **Location** — source of truth is `skills/<skill-name>/` at this repo's root,
   per the skillify multi-skill convention, so `npx skills add luban-ws/productivity`
   installs them into any agent. `skills/` is deliberately **not** a pnpm workspace
   member — `pnpm-workspace.yaml` globs only `apps/*`, `packages/*`, and
   `packages/@systembug/*` — so a skill never triggers an install or a build.
2. **Distribution vs activation** — `skills/` distributes; it does not activate.
   The repo's own auto-discovery path is `.claude/skills/`, so a contributor working
   in this repo needs a symlink into `~/.agents/skills/` for the skills to load
   locally. Verified: relocating the directories out of `.claude/skills/` deactivated
   both skills.
3. **Identity** — directory name equals the `name` in `SKILL.md` frontmatter and the
   `skillId` in `skill-release.json`. `SKILL.md` and `skill-release.json` are
   required; `LICENSE` is required; `references/` only where the instructions cite it.
4. **Docs** — a `skills/README.md` carries the install command pointing at the real
   repository and skill name, plus the per-skill table. A root `LICENSE` is required
   by the layout.
5. **Description discipline** — the `description` states capability plus a concrete
   `Use when ...` trigger. It does not contain the workflow; that lives in the body.
6. **Evidence** — every claim is either an observed command output or a
   `file:line` citation into `packages/@systembug/<tool>/src/`. No invented flags.
7. **Scope** — no tests, fixtures, `node_modules/`, or build output inside the skill
   directory. Validation is run from the skillify skill, not shipped.
8. **Read-only first** — a skill's first documented action is always the read-only
   command (`plan`/`doctor`/`--help`). Mutating or long-running commands are opt-in
   steps that state what they change.

## Children

| RFC                                    | Concern                                                |
| -------------------------------------- | ------------------------------------------------------ |
| [0024](0024-qingniao-release-skill.md) | Skill that drives `qingniao` releases safely           |
| [0025](0025-pangu-dev-server-skill.md) | Skill that drives `pangu` dev servers without blocking |

## Acceptance

Umbrella closes when 0024 and 0025 are both Implemented, both pass
`node ~/.agents/skills/skillify/scripts/validate-skill.mjs`, and both skills are
resolvable from a project outside this repository through the symlink.
