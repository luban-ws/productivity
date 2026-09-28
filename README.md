# Productivity Tools

A collection of development tools used by Systembugtj to build his projects.

This monorepo contains various productivity tools and utilities that streamline the development workflow, including publishing tools, documentation generators, and other development automation utilities.

## Packages

- **[@systembug/qingniao](./packages/@systembug/qingniao/)**: Universal publish tool for managing releases and versioning.
- **[@systembug/pangu](./packages/@systembug/pangu/)**: Interactive development server launcher.
- **[@systembug/diting](./packages/@systembug/diting/)**: Documentation and tooling utilities.
- **[@systembug/wenxin](./packages/@systembug/wenxin/)**: Universal API documentation generator supporting JSDoc and TypeScript.

## Agent Skills

Agent Skills for the CLIs in this repo, installable into any agent:

- **[qingniao-release](./skills/qingniao-release/)** — drive `qingniao` releases through its JSON Lines protocol without publishing unrehearsed.
- **[pangu-dev](./skills/pangu-dev/)** — start `pangu` dev servers without blocking or misreading failure.

```bash
npx skills add luban-ws/productivity
```

See **[skills/README.md](./skills/README.md)** for per-skill detail and the contribution contract.

## Documentation

- 📖 **[在线文档](https://conouch.io/productivity/)** - 完整的工具使用指南
- 📖 **[RFCs](.spec/ROADMAP.md)** - Design documents and standards

### 本地查看文档

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

> **提示**：如果 `pnpm docs` 打开了 npm 网站，请使用 `pnpm run docs` 代替
