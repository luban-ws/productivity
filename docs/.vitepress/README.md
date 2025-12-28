# VitePress 文档配置

## 本地开发

```bash
# 启动开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

## GitHub Pages 部署

1. 在 GitHub 仓库设置中启用 GitHub Pages：
    - 进入 Settings > Pages
    - Source 选择 "GitHub Actions"

2. 推送代码到 main 分支后，GitHub Actions 会自动构建并部署文档

3. 文档将发布到：`https://<username>.github.io/productivity/`

## 配置说明

- `base` 路径：如果仓库名不是 "productivity"，需要修改 `config.ts` 中的 `base` 配置
- 文档源文件位于 `docs/` 目录
- 构建输出位于 `docs/.vitepress/dist`
