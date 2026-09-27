---
title: AI 提示词
order: 99
category: tools/ai-prompt
description: "复制到 Cursor / ChatGPT / Claude — 在任意 monorepo 中使用盘古与青鸟"
---

# AI 提示词（消费者仓库）

## 一行版（直接发给 AI）

```text
Install @systembug/pangu and @systembug/qingniao (and @changesets/cli for release). Add to root package.json scripts: "dev": "pangu", "release": "qingniao". Create pangu.config.json with my workspace demos. Then tell me to run pnpm dev and pnpm release.
```

## 完整版（Rules / AGENTS.md）

```text
Set up @systembug/pangu and @systembug/qingniao in this monorepo:

1. pnpm add -D @systembug/pangu @systembug/qingniao @changesets/cli
2. Root package.json scripts: "dev": "pangu", "release": "qingniao"
3. pangu.config.json — demos with workspace package names that have "dev" scripts
4. Optional: qingniao.config.json { "publish": { "skipExisting": true } }
5. Release once: npx qingniao changeset-init

Run: pnpm dev (or pnpm dev <demo>) | pnpm release -y (needs .changeset/*.md + npm login; OTP in terminal)

Never pnpm dev dev. Do not start dev server unless I ask.
```

## 青鸟（给其他 Agent 升版本）

只升版本，不发布。复制下面整段。

```text
Use @systembug/qingniao in this repository to bump versions. Do not publish to npm. Do not edit the version field by hand.

Protocol:
- stdout is JSON Lines. Parse only JSON. Diagnostics go to stderr.
- The last line of each command is a result event. Read status and exitCode. If exitCode is not 0, stop and report code and message.
- --json is not authorization. Any command that writes versions must also pass --yes. Without --yes the exit code is 3. Do not retry and do not edit files.

Order:
1. qingniao doctor --json
2. qingniao plan --json
3. Bump only when the user explicitly asks to bump the version.

Bump without publishing:
qingniao --json --yes --skip-publish --skip-build

How the version is chosen:
- If .changeset/*.md files exist (other than README.md), qingniao bumps with changesets.
- If the .changeset directory exists but there are no changeset files, --yes skips the bump. Write a changeset markdown file first, then run the bump command. Do not run interactive pnpm changeset.
- If there is no .changeset directory, qingniao uses semver from Conventional Commits (feat = minor, fix = patch, BREAKING = major).

The bump updates each package.json version and the top-level version in skill-release.json and plugin.json. Do not edit those files yourself.

Do not run qingniao without --skip-publish. Do not use --dry-run as a bump; dry-run does not write versions. On a non-TTY or with --json, if the registry is not logged in, stop and report the doctor auth error. Do not type passwords.
```
