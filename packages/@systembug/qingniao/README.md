# @systembug/qingniao

> **相见时难别亦难，东风无力百花残。**
> **春蚕到死丝方尽，蜡炬成灰泪始干。**
> **晓镜但愁云鬓改，夜吟应觉月光寒。**
> **蓬山此去无多路，青鸟殷勤为探看。**
> —— 李商隐《无题》

🌌 青鸟 - 零配置优先的通用发布工具，专为 monorepo 项目设计

## 📖 关于这首诗

### 作者简介

**李商隐**（约813年—约858年），字义山，号玉溪生，晚唐著名诗人，与杜牧合称"小李杜"。他的诗歌以含蓄深沉、意境优美著称，尤其擅长写爱情诗和无题诗，其作品在中国古典诗歌史上占有重要地位。

### 诗歌背景

《无题》是李商隐的代表作之一，创作于晚唐时期。这首诗以"无题"命名，体现了李商隐诗歌的典型风格——含蓄隐晦、意境深远。诗中通过"春蚕"、"蜡炬"等意象，表达了深切的思念和执着的追求。

### 青鸟意象

诗中"青鸟殷勤为探看"一句，引用了中国古代神话传说。**青鸟**是西王母的信使，在《山海经》等古籍中多有记载。传说中，青鸟负责为西王母传递消息，是沟通天界与人间的使者。李商隐借用这一意象，表达了对远方之人的思念和期盼，希望青鸟能够代为探看、传递消息。

### 与工具的联系

正如诗中的青鸟殷勤传递消息，青鸟工具也致力于将代码包准确、及时地传递到 NPM 仓库。即使前路遥远（"蓬山此去无多路"），青鸟也会殷勤地完成使命（"青鸟殷勤为探看"），这正是本工具的设计理念——可靠、优雅、使命必达。

## 📜 项目概述

青鸟是中国神话中西王母的信使，负责将消息和物品准确、及时地传递到人间。正如李商隐《无题》所描绘："蓬山此去无多路，青鸟殷勤为探看"，青鸟工具如诗中的信使一般，殷勤地将您的代码包准确、优雅地传递到 NPM 仓库，即使前路遥远，也必使命必达。

`@systembug/qingniao` 是一个**完全零配置优先**的发布工具，自动从 `package.json` 和 workspace 配置推断所有必要信息，让发布流程如青鸟飞行般优雅流畅。

## 🌟 核心特性

### 🎯 零配置优先

- **自动检测**：自动检测包管理器、workspace 类型、构建工具
- **智能推断**：从项目结构自动推断构建步骤、产物路径、版本策略
- **开箱即用**：大多数项目无需配置文件即可使用

### 🚀 深度集成

- **pnpm/yarn/npm workspace**：完整支持，自动处理依赖顺序
- **Changeset**：深度集成，自动检测和使用 changeset
- **Turbo**：自动检测并使用 Turbo 的依赖图
- **Git**：自动处理版本提交、标签创建、远程推送

### ⚙️ 灵活配置

- **配置文件可选**：仅在需要时覆盖自动检测结果
- **部分覆盖**：只需配置需要自定义的部分
- **多种格式**：支持 JSON、JavaScript、TypeScript 配置文件

## 🚀 快速开始

### 安装

```bash
# 全局安装
npm install -g @systembug/qingniao

# 或项目本地安装
npm install --save-dev @systembug/qingniao
```

#### 可选依赖

如果使用 changeset 进行版本管理，需要单独安装 `@changesets/cli`（2 或 3）：

Changesets 3 需要 Node.js `^22.11 || ^24 || >=26`。没有待发布 changeset 时，`changeset version` 的退出码 1 视为跳过版本更新。私有包默认不再升版本；要保持 v2 行为，在 `.changeset/config.json` 里设置 `"privatePackages": { "version": true, "tag": false }`。

```bash
pnpm add -D @changesets/cli
# 或
npm install --save-dev @changesets/cli
# 或
yarn add -D @changesets/cli
```

#### 初始化 Changeset

安装 `@changesets/cli` 后，使用以下命令初始化 changeset：

```bash
# 使用 qingniao 命令初始化
qingniao changeset-init
# 或使用简短别名
qn ci

# 如果 .changeset 目录已存在，使用 --force 强制重新初始化
qingniao changeset-init --force
```

这将创建 `.changeset` 目录和配置文件，之后 qingniao 会自动检测并使用 changeset 策略。

### 零配置使用

```bash
# 在标准 monorepo 项目中，直接运行：
qingniao

# 或使用简短命令
qn
```

工具会自动：

- 检测 pnpm/yarn/npm workspace
- 发现所有可发布的包
- 检测并使用 changeset（如果存在）
- 从 package.json 推断构建步骤
- 自动处理版本管理和发布

### Agent / CI 使用

`--json` 输出 JSON Lines：stdout 只包含机器事件；原始命令诊断写入 stderr。Agent 不应解析人类文本。

```bash
# 无副作用：发现包和将执行的步骤
qingniao plan --json

# 无副作用：检查认证、Git、scripts 和 changeset
qingniao doctor --json

# 需要明确授权；没有 --yes 会以退出码 3 停止
qingniao --json --yes --dry-run
```

每次 JSON 命令以单个 `result` 事件结束。检查 `exitCode` 与 `status`；错误事件提供稳定 `code` 和可读 `message`。

给其他仓库的 Agent 升版本时，把下面整段交给代理。这段只升版本，不发布。

```text
Use @systembug/qingniao in this repository to bump versions. Do not npm publish. Do not edit the version field by hand.

Setup, only if the CLI is missing:
- pnpm add -D @systembug/qingniao @changesets/cli
- Root package.json scripts: "release": "qingniao"
- First time only: npx qingniao changeset-init

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

### 最小配置示例

```json
// qingniao.config.json
// 只覆盖 Git 分支，其他全部自动检测
{
    "git": {
        "branch": "develop"
    }
}
```

## 📋 使用示例

### 零配置（推荐）

```bash
# 项目结构：
# .
# ├── .changeset/          # 自动检测 changeset
# ├── package.json         # 自动检测包管理器
# ├── pnpm-workspace.yaml  # 自动检测 workspace
# ├── turbo.json           # 自动检测 turbo
# └── packages/
#     └── @zouwu-wf/
#         └── workflow/

# 直接运行，完全依赖自动检测
qingniao
```

### 自定义配置

```typescript
// qingniao.config.ts
import { PublishConfig } from "@systembug/qingniao";

export default {
    // 只覆盖需要自定义的部分
    git: {
        branch: "main",
        tagPrefix: "v",
    },
    build: {
        steps: [{ name: "自定义构建", command: "pnpm build:custom" }],
    },
    // 其他配置保持自动检测
};
```

## 🔧 核心功能

### 版本管理

- **Changeset 集成**：自动检测和使用 changeset
- **手动版本**：支持 major/minor/patch 手动选择
- **版本同步**：自动同步所有 workspace 包的版本
- **Workspace 协议**：自动替换 `workspace:*` 为实际版本

### 构建验证

- **自动推断**：从 package.json scripts 自动生成构建步骤
- **产物验证**：自动检测和验证构建产物
- **依赖顺序**：按依赖关系拓扑排序构建
- **Pre-lint 构建**：支持在 lint 之前构建特定包（如 eslint-plugin）

### NPM 发布

- **智能发布**：按依赖顺序发布包
- **Dry-run 支持**：发布前验证
- **OTP 支持**：自动处理 2FA 认证
- **错误处理**：详细的错误信息和恢复建议

## 📚 配置参考

### 完整配置示例

```typescript
import { PublishConfig } from "@systembug/qingniao";

const config: PublishConfig = {
    project: {
        name: "My Project",
        packageManager: "pnpm",
    },
    git: {
        branch: "main",
        tagPrefix: "v",
    },
    version: {
        strategy: "changeset",
        syncAll: true,
    },
    build: {
        steps: [
            { name: "安装依赖", command: "pnpm install --frozen-lockfile" },
            { name: "代码检查", command: "pnpm lint" },
            { name: "类型检查", command: "pnpm typecheck" },
            { name: "测试", command: "pnpm test" },
            { name: "构建", command: "turbo build" },
        ],
    },
    publish: {
        skipExisting: true,
    },
};

export default config;
```

## 🎨 青鸟哲学

正如古诗所描绘的，青鸟作为信使具有以下特质：

- **殷勤**：主动检测和推断，无需繁琐配置
- **可靠**：确保版本同步、依赖正确、构建完整
- **优雅**：提供流畅的发布体验，如青鸟飞行般优雅
- **智能**：自动处理复杂逻辑，让开发者专注于代码

## 📖 相关文档

- [RFC 0001: 青鸟通用发布工具设计规范](../../../.spec/rfc/0001-universal-publish-tool.md)
- [零配置指南](./docs/zero-config.md)
- [配置参考](./docs/configuration.md)
- [API 文档](./docs/api.md)

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

> **相见时难别亦难，东风无力百花残。**
> **春蚕到死丝方尽，蜡炬成灰泪始干。**
> **晓镜但愁云鬓改，夜吟应觉月光寒。**
> **蓬山此去无多路，青鸟殷勤为探看。**
> —— 李商隐《无题》

让代码发布如青鸟传递消息般优雅流畅！
