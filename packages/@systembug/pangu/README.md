# @systembug/pangu

**盘古** - 交互式开发服务器启动工具

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
  "projectName": "quizerjs",
  "packageManager": "pnpm",
  "demos": [
    {
      "name": "Vue",
      "value": "vue",
      "description": "Vue 3 演示项目",
      "package": "@quizerjs/demo-vue"
    },
    {
      "name": "React",
      "value": "react",
      "description": "React 18 演示项目",
      "package": "@quizerjs/demo-react"
    }
  ]
}
```

**dev.config.yaml:**
```yaml
projectName: quizerjs
packageManager: pnpm
demos:
  - name: Vue
    value: vue
    description: Vue 3 演示项目
    package: "@quizerjs/demo-vue"
  - name: React
    value: react
    description: React 18 演示项目
    package: "@quizerjs/demo-react"
```

### 2. 使用 CLI

```bash
# 显示交互式菜单
npx pangu

# 直接启动指定的 demo
npx pangu vue

# 显示帮助
npx pangu --help
```

### 3. 在 package.json 中添加脚本

```json
{
  "scripts": {
    "dev": "pangu"
  }
}
```

然后运行：
```bash
pnpm dev
```

## 配置说明

### DevConfig

```typescript
interface DevConfig {
  /**
   * 项目名称（用于欢迎信息）
   * 默认: "项目"
   */
  projectName?: string;

  /**
   * 包管理器命令
   * 默认: "pnpm"
   * 可选: "pnpm" | "npm" | "yarn"
   */
  packageManager?: string;

  /**
   * Demo 选项列表（必需）
   */
  demos: DemoOption[];
}
```

### DemoOption

```typescript
interface DemoOption {
  /**
   * Demo 显示名称
   */
  name: string;

  /**
   * Demo 值（用于命令行参数）
   */
  value: string;

  /**
   * Demo 描述
   */
  description: string;

  /**
   * 包名（用于 pnpm --filter）
   */
  package: string;
}
```

## 工作原理

1. 查找配置文件：按优先级查找 `dev.config.yaml` > `dev.config.yml` > `dev.config.json`
2. 解析配置：支持 JSON 和 YAML 格式
3. 显示菜单：如果没有提供参数，显示交互式菜单
4. 启动服务器：使用配置的包管理器启动对应的 demo

## License

MIT
