---
title: 工具文档快速开始
order: 0
category: tools
description: "鲁班工坊生产力工具文档中心，包含青鸟、文心、盘古、谛听等工具的完整文档"
---

# 鲁班工坊工具文档

欢迎来到鲁班工坊生产力工具文档中心！

## 我们的工具

鲁班工坊提供一系列高质量的开源工具，帮助开发者提升工作效率。

### 🌌 [青鸟 (Qingniao)](/docs/tools/qingniao)

零配置优先的通用发布工具，专为 monorepo 项目设计。自动检测包管理器、workspace 类型、构建工具，让发布流程如青鸟飞行般优雅流畅。

### 📚 [文心 (Wenxin)](/docs/tools/wenxin)

通用 API 文档生成工具，支持 JSDoc 和 TypeScript。混合模式自动合并类型信息到 JSDoc 文档，让文档生成如文心雕龙般精美。

### 🚀 [盘古 (Pangu)](/docs/tools/pangu)

交互式开发服务器启动工具。从配置文件读取 demo 列表，快速启动开发服务器，如盘古开天辟地般开启开发之旅。

### 👂 [谛听 (Diting)](/docs/tools/diting)

平台中立的日志库，使用 chalk 和 pino 进行日志记录。如谛听能听万物、辨真伪、记录善恶，为应用程序提供全面的日志记录能力。

## 快速开始

每个工具都支持零配置使用，大多数情况下可以直接运行：

```bash
# 青鸟 - 发布工具
npx qingniao

# 文心 - 文档生成
npx wenxin

# 盘古 - 开发服务器
npx pangu

# 谛听 - 日志库
import { createLogger } from '@systembug/diting';
```

## 获取帮助

- 查看每个工具的详细文档
- 访问 [GitHub 仓库](https://github.com/systembug/productivity)
- 提交 Issue 或 Pull Request
