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
