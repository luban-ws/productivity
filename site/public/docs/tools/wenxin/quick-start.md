---
title: 文心快速开始
order: 2
category: tools/wenxin
description: "通用 API 文档生成工具，支持 JSDoc 和 TypeScript。混合模式自动合并类型信息到 JSDoc 文档，让文档生成如文心雕龙般精美"
---

# 文心 (Wenxin)

📚 通用 API 文档生成工具，支持 JSDoc 和 TypeScript

> 文心雕龙，雕琢文档之美

## 简介

文心是一个通用 API 文档生成工具，支持 JSDoc 和 TypeScript。混合模式自动合并类型信息到 JSDoc 文档，让文档生成如文心雕龙般精美。

## 功能特性

- ✅ 支持 JSDoc 注释提取
- ✅ 支持 TypeScript 类型信息提取
- ✅ 混合模式：自动合并类型信息到 JSDoc 文档
- ✅ 配置化：支持配置文件或命令行参数
- ✅ 向后兼容：保留原有 JSDoc 工具的所有功能

## 安装

```bash
pnpm add -D @systembug/wenxin
# 或
npm install --save-dev @systembug/wenxin
# 或
yarn add -D @systembug/wenxin
```

## 快速开始

### 初始化配置（可选）

```bash
# 生成配置文件模板
npx wenxin init

# 指定格式（json/js/ts）
npx wenxin init --format json
npx wenxin init --format js
npx wenxin init --format ts

# 强制覆盖已存在的配置文件
npx wenxin init --force
```

### 基本使用

```bash
# 使用默认配置（零配置）
npx wenxin

# 或使用短命令
npx wx
```

## 配置

### 零配置模式

文心支持零配置模式，会自动检测项目类型和配置。

### 配置文件

创建 `wenxin.config.json`：

```json
{
  "entryPoints": ["src/index.ts"],
  "outDir": "docs",
  "mode": "hybrid"
}
```

## 更多信息

- [GitHub 仓库](https://github.com/systembug/productivity/tree/main/packages/@systembug/wenxin)
- [NPM 包](https://www.npmjs.com/package/@systembug/wenxin)
