---
title: 谛听快速开始
order: 4
category: tools/diting
description: "平台中立的日志库，使用 chalk 和 pino 进行日志记录。如谛听能听万物、辨真伪、记录善恶，为应用程序提供全面的日志记录能力"
---

# 谛听 (Diting)

👂 平台中立的日志库，使用 chalk 和 pino 进行日志记录

## 简介

谛听是地藏菩萨的坐骑，具有"能听万物"的神通，能够听到三界六道中的一切声音，辨别真伪，记录善恶。正如神话中的谛听能够听万物、辨真伪、记录善恶，谛听日志库也致力于为应用程序提供全面的日志记录能力。

## 特性

- ✅ 平台中立（Node.js + 浏览器）
- ✅ TypeScript支持
- ✅ 多日志级别（DEBUG, INFO, WARN, ERROR）
- ✅ 使用 chalk 进行彩色输出
- ✅ 使用 pino 进行结构化日志记录
- ✅ 可插拔传输器
- ✅ 上下文支持
- ✅ 生产环境自动禁用日志

## 安装

```bash
pnpm add @systembug/diting
# 或
npm install @systembug/diting
# 或
yarn add @systembug/diting
```

## 快速开始

### 基本使用

```typescript
import { createLogger } from "@systembug/diting";

// 创建 logger
const logger = createLogger("MyService");

// 使用不同级别的日志
logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");
```

### 带上下文的日志

```typescript
const logger = createLogger("MyService", {
    context: {
        userId: "123",
        requestId: "abc",
    },
});

logger.info("User action", { action: "login" });
```

## 配置

### 日志级别

```typescript
import { setLogLevel } from "@systembug/diting";

// 设置全局日志级别
setLogLevel("info"); // 只显示 info 及以上级别
```

### 生产环境

在生产环境中，日志会自动禁用，除非明确启用。

## 更多信息

- [GitHub 仓库](https://github.com/luban-ws/productivity/tree/main/packages/@systembug/diting)
- [NPM 包](https://www.npmjs.com/package/@systembug/diting)
