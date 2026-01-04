---
title: 青鸟快速开始
order: 1
category: tools/qingniao
description: "零配置优先的通用发布工具，专为 monorepo 项目设计。自动检测包管理器、workspace 类型、构建工具，让发布流程如青鸟飞行般优雅流畅"
---

# 青鸟 (Qingniao)

🌌 零配置优先的通用发布工具，专为 monorepo 项目设计

## 简介

青鸟是中国神话中西王母的信使，负责将消息和物品准确、及时地传递到人间。正如李商隐《无题》所描绘："蓬山此去无多路，青鸟殷勤为探看"，青鸟工具如诗中的信使一般，殷勤地将您的代码包准确、优雅地传递到 NPM 仓库。

`@systembug/qingniao` 是一个**完全零配置优先**的发布工具，自动从 `package.json` 和 workspace 配置推断所有必要信息，让发布流程如青鸟飞行般优雅流畅。

## 核心特性

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

- **配置文件支持**：支持 JSON/YAML/TypeScript 配置文件
- **命令行参数**：所有配置项都可通过命令行参数覆盖
- **环境变量**：支持通过环境变量配置

## 安装

```bash
pnpm add -D @systembug/qingniao
# 或
npm install --save-dev @systembug/qingniao
# 或
yarn add -D @systembug/qingniao
```

## 快速开始

### 基本使用

```bash
# 零配置使用（自动检测所有配置）
npx qingniao

# 或使用短命令
npx qn
```

### 发布流程

青鸟会自动执行以下步骤：

1. **检测项目配置**：自动检测包管理器、workspace 类型、构建工具
2. **构建项目**：按依赖顺序构建所有包
3. **版本管理**：使用 Changeset 或自动版本管理
4. **发布到 NPM**：自动发布到 NPM 仓库
5. **Git 操作**：自动提交、打标签、推送到远程

## 配置

### 零配置模式

大多数情况下，青鸟可以自动检测所有配置，无需任何配置文件。

### 配置文件

如果需要自定义配置，可以创建 `qingniao.config.json`：

```json
{
    "packageManager": "pnpm",
    "workspaceType": "pnpm",
    "buildTool": "vite",
    "versionStrategy": "changeset"
}
```

## 更多信息

- [GitHub 仓库](https://github.com/systembug/productivity/tree/main/packages/@systembug/qingniao)
- [NPM 包](https://www.npmjs.com/package/@systembug/qingniao)
