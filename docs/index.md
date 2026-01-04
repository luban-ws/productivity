# Productivity Tools

欢迎来到 Productivity 工具集合文档。这里包含了所有可用的工具及其详细使用指南。

## 🛠️ 工具列表

### [🌌 谛听 (Diting)](./tools/diting.md)

**平台中立的日志库** - 使用 chalk 和 pino 进行日志记录

- ✅ 平台中立（Node.js + 浏览器）
- ✅ TypeScript 支持
- ✅ 多日志级别（DEBUG, INFO, WARN, ERROR）
- ✅ 彩色输出和结构化日志
- ✅ 可插拔传输器

[查看详细文档 →](./tools/diting.md)

### [🌌 青鸟 (Qingniao)](./tools/qingniao.md)

**零配置优先的通用发布工具** - 专为 monorepo 项目设计

- ✅ 完全零配置，自动检测所有配置
- ✅ 支持 pnpm/yarn/npm workspace
- ✅ 深度集成 Changeset、Turbo、Nx
- ✅ 智能版本管理和依赖同步
- ✅ 自动化构建验证和 NPM 发布

[查看详细文档 →](./tools/qingniao.md)

## 📚 其他资源

- **[RFCs](./rfc/README.md)** - 设计文档和规范
- **[GitHub Repository](https://github.com/luban-ws/productivity)**

## 🚀 快速开始

### 本地查看文档

如果你想在本地查看和编辑文档：

```bash
# 启动文档开发服务器（支持热重载，自动打开浏览器）
pnpm run docs
# 或
pnpm docs:dev

# 构建文档（用于 GitHub Pages）
pnpm docs:build

# 预览构建后的文档
pnpm docs:preview
```

启动后会自动打开浏览器，或手动访问：**http://localhost:5173**

> **注意**：本地开发时使用根路径 `/`，GitHub Pages 部署时自动使用 `/productivity/` 路径

### 安装工具

```bash
# 安装谛听日志库
pnpm add @systembug/diting

# 安装青鸟发布工具
pnpm add -D @systembug/qingniao
```

### 使用工具

每个工具都有详细的使用指南，请点击上方工具列表查看。

## 📄 License

MIT
