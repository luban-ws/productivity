# @systembug/wenxin

**文心** - 通用 API 文档生成工具，支持 JSDoc 和 TypeScript。

> 文心雕龙，雕琢文档之美

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

# 指定配置文件
npx wenxin -c wenxin.config.json

# 指定输出目录
npx wenxin -o ./docs

# 仅使用 JSDoc
npx wenxin --jsdoc-only

# 仅使用 TypeDoc
npx wenxin --typedoc-only
```

### 配置文件

使用 `wenxin init` 命令生成配置文件，或手动创建 `wenxin.config.json`：

```json
{
    "$schema": "./node_modules/@systembug/wenxin/schemas/config.schema.json",
    "mode": "hybrid",
    "mergeTypes": true,
    "jsdoc": {
        "enabled": true,
        "source": {
            "include": ["src/**/*.ts", "src/**/*.js"],
            "exclude": ["node_modules", "dist", "**/*.test.ts"]
        },
        "opts": {
            "destination": "doc",
            "template": "./jsdoc-template",
            "recurse": true,
            "verbose": true
        },
        "plugins": ["plugins/markdown", "./dist/jsdoc-aliases.js"]
    },
    "typedoc": {
        "enabled": true,
        "entryPoints": ["src/index.ts"],
        "out": "doc",
        "excludePrivate": true,
        "excludeProtected": false,
        "excludeInternal": true
    }
}
```

### 编程式使用

```typescript
import { generateDocs } from "@systembug/wenxin";

// 使用默认配置
await generateDocs();

// 使用自定义配置
await generateDocs("api-doc.config.json", {
    mode: "hybrid",
    jsdoc: {
        enabled: true,
        opts: {
            destination: "./docs",
        },
    },
});
```

## 模式说明

### jsdoc 模式

仅使用 JSDoc 生成文档，适合纯 JavaScript 项目或只需要注释文档的场景。

```bash
npx wenxin --mode jsdoc
```

### typedoc 模式

仅使用 TypeDoc 生成文档，充分利用 TypeScript 类型系统。

```bash
npx wenxin --mode typedoc
```

### hybrid 模式（推荐）

同时使用 JSDoc 和 TypeDoc，自动合并类型信息到 JSDoc 输出中。这是默认模式。

```bash
npx wenxin --mode hybrid
```

## 配置选项

### JSDoc 配置

- `enabled`: 是否启用 JSDoc 处理
- `source.include`: 源文件路径（支持 glob）
- `source.exclude`: 排除的文件路径
- `opts.destination`: 输出目录
- `opts.template`: 模板路径
- `plugins`: 插件列表

### TypeDoc 配置

- `enabled`: 是否启用 TypeDoc 处理
- `entryPoints`: 入口文件列表
- `out`: 输出目录
- `excludePrivate`: 排除私有成员
- `excludeProtected`: 排除受保护成员
- `excludeInternal`: 排除内部成员

## 自定义插件

工具提供了 `jsdoc-aliases` 插件（从 TypeScript 编译），支持 `@aliases` 和 `@category` 标签。

### 使用 @aliases 标签

```typescript
/**
 * 主函数
 * @aliases main, entry
 */
export function primaryFunction() {
    // ...
}
```

### 使用 @category 标签

```typescript
/**
 * 工具函数
 * @category Utilities
 */
export function utilityFunction() {
    // ...
}
```

## 遗留文件

文心工具保留了以下遗留文件以支持向后兼容：

- **`dist/jsdoc-aliases.js`**: JSDoc 插件（从 TypeScript 编译），支持 `@aliases` 和 `@category` 标签
- **`jsdoc-template/`**: JSDoc 模板目录

详细说明请参考 [LEGACY_FILES.md](./LEGACY_FILES.md)。

## 迁移指南

如果你之前使用过这个工具，可以按以下步骤迁移：

1. **生成配置文件**：运行 `npx wenxin init` 生成配置文件
2. **生成新配置**：运行 `npx wenxin init` 生成新的 `wenxin.config.json`
3. **更新路径**：将硬编码路径改为相对路径或使用配置选项
4. **启用 TypeScript 支持**：在新配置中启用 `typedoc` 选项

## 开发

```bash
# 构建
pnpm build

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 格式化
pnpm format
```

## 许可证

MIT
