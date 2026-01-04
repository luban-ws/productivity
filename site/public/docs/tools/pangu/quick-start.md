---
title: 盘古快速开始
order: 3
category: tools/pangu
description: "交互式开发服务器启动工具。从配置文件读取 demo 列表，快速启动开发服务器，如盘古开天辟地般开启开发之旅"
---

# 盘古 (Pangu)

🚀 交互式开发服务器启动工具

## 简介

盘古是中国神话中的开天辟地之神，此工具用于"启动"开发服务器，寓意开启开发之旅。

## 功能特性

- 📋 从配置文件读取 demo 列表（支持 JSON 和 YAML）
- 🎯 交互式菜单选择 demo
- 🚀 快速启动开发服务器
- 🔧 支持自定义包管理器（pnpm/npm/yarn）

## 安装

```bash
pnpm add -D @systembug/pangu
# 或
npm install -D @systembug/pangu
# 或
yarn add -D @systembug/pangu
```

## 使用方法

### 1. 创建配置文件

在项目根目录创建 `dev.config.json` 或 `dev.config.yaml`：

**dev.config.json:**

```json
{
  "projectName": "my-project",
  "packageManager": "pnpm",
  "demos": [
    {
      "name": "Vue Demo",
      "value": "vue",
      "description": "Vue 3 演示项目",
      "package": "@myproject/demo-vue"
    },
    {
      "name": "React Demo",
      "value": "react",
      "description": "React 18 演示项目",
      "package": "@myproject/demo-react"
    }
  ]
}
```

### 2. 运行盘古

```bash
# 启动交互式菜单
npx pangu

# 或使用短命令
npx pg
```

### 3. 选择 Demo

盘古会显示交互式菜单，选择要启动的 demo 即可。

## 配置选项

- `projectName`: 项目名称
- `packageManager`: 包管理器（pnpm/npm/yarn）
- `demos`: Demo 列表，每个 demo 包含：
  - `name`: 显示名称
  - `value`: 标识值
  - `description`: 描述
  - `package`: 包名

## 更多信息

- [GitHub 仓库](https://github.com/systembug/productivity/tree/main/packages/@systembug/pangu)
- [NPM 包](https://www.npmjs.com/package/@systembug/pangu)
