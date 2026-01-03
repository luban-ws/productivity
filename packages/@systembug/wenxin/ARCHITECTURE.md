# 文心工具架构说明

本文档解释文心工具的架构设计，特别是 `jsdoc-template` 的位置和工作流程。

## 目录结构

```
wenxin/
├── src/                    # TypeScript 源代码（我们的工具代码）
│   ├── cli.ts             # CLI 入口
│   ├── config.ts          # 配置管理
│   ├── jsdoc-processor.ts # JSDoc 处理器
│   └── ...
├── jsdoc-template/         # JSDoc 模板（在 src 外面）
│   ├── publish.js         # JSDoc 模板发布器
│   ├── tmpl/              # 模板文件
│   └── static/            # 静态资源
└── dist/                  # 编译后的代码
```

## 为什么 `jsdoc-template` 在 `src` 外面？

### 1. **JSDoc 是独立工具**

JSDoc 是一个独立的命令行工具，它：
- 不通过我们的 TypeScript 代码运行
- 直接通过文件系统路径访问模板目录
- 在运行时动态加载 `publish.js` 和模板文件

### 2. **模板文件格式要求**

模板文件必须是：
- **`publish.js`**: CommonJS 格式的 JavaScript 文件
- **`.tmpl` 文件**: HTML 模板文件（使用 Underscore Template 语法）
- **静态资源**: CSS、JavaScript 文件

这些文件**不能被 TypeScript 编译**，必须保持原样。

### 3. **运行时路径访问**

JSDoc 通过**绝对路径**访问模板：

**文心工具的处理流程**：
```typescript
// 1. 在 src/config.ts 中，默认配置解析为绝对路径
template: resolve(__dirname, "../jsdoc-template")
// 结果: "/absolute/path/to/@systembug/wenxin/jsdoc-template"

// 2. 在 src/jsdoc-processor.ts 中，写入临时配置文件
{
  "opts": {
    "template": "/absolute/path/to/@systembug/wenxin/jsdoc-template"
  }
}

// 3. JSDoc 读取配置文件，获得绝对路径
var templatePath = opts.template;  // 绝对路径
view = new template.Template(templatePath + '/tmpl');  // 直接访问文件系统
```

**为什么需要绝对路径？**
- JSDoc 在独立进程中运行，工作目录可能不同
- 使用绝对路径确保无论从哪里运行都能找到模板
- 文心工具负责将相对路径转换为绝对路径

### 4. **打包到包中**

模板目录需要作为资源文件打包：

```json
// package.json
{
  "files": [
    "dist/",
    "jsdoc-template/",  // 必须包含在包中
    "schemas/"
  ]
}
```

用户安装包后（使用 pnpm/npm/yarn），模板目录会在：
```
node_modules/@systembug/wenxin/jsdoc-template/
```

## 工作流程顺序

### 完整执行流程

```
1. 用户运行命令
   └─> npx wenxin

2. 文心 CLI (src/cli.ts)
   └─> 加载配置
   └─> 调用 generateDocs()

3. 文心核心 (src/index.ts)
   └─> 根据模式选择处理器
   └─> 调用 processJSDoc()

4. JSDoc 处理器 (src/jsdoc-processor.ts)
   ├─> 解析模板路径（相对路径 → 绝对路径）
   │   └─> resolve(__dirname, "../jsdoc-template")
   │   └─> 或 resolve(cwd, userConfig.template)
   ├─> 创建临时配置文件
   │   └─> 包含模板的绝对路径
   │   └─> 例如: "/path/to/node_modules/@systembug/wenxin/jsdoc-template"
   └─> 执行 JSDoc CLI 命令
       └─> jsdoc -c /tmp/jsdoc-config.json

5. JSDoc 工具（独立进程）
   ├─> 读取临时配置文件
   ├─> 获取模板的绝对路径
   ├─> 解析源代码
   ├─> 提取注释和类型信息
   ├─> 生成 doclets（文档对象）
   └─> 加载模板系统
       └─> 通过文件系统路径访问模板目录
       └─> require('/path/to/jsdoc-template/publish.js')
           └─> 调用 exports.publish(taffyData, opts, tutorials)

6. JSDoc 模板系统 (jsdoc-template/publish.js)
   ├─> 处理 doclets 数据
   ├─> 渲染模板文件 (.tmpl)
   ├─> 生成 HTML 文件
   └─> 复制静态资源 (CSS, JS)

7. 输出结果
   └─> doc/ 目录包含生成的 HTML 文档
```

### 模板路径解析流程

**关键点：文心工具负责将模板路径解析为绝对路径**

```
用户配置（可选）
  └─> template: "./node_modules/@systembug/wenxin/jsdoc-template"
      或
      template: "./custom-template"

文心工具解析
  └─> src/config.ts: resolve(__dirname, "../jsdoc-template")
      └─> 转换为绝对路径
      └─> 例如: "/Users/.../node_modules/@systembug/wenxin/jsdoc-template"

写入临时配置
  └─> src/jsdoc-processor.ts: createJSDocConfig()
      └─> 将绝对路径写入临时配置文件
      └─> {
            "opts": {
              "template": "/absolute/path/to/jsdoc-template"
            }
          }

JSDoc 读取配置
  └─> JSDoc CLI 读取临时配置文件
      └─> 获得模板的绝对路径
      └─> 通过文件系统直接访问该路径
```

### 关键点

1. **文心工具**（TypeScript）→ 调用 **JSDoc CLI**（独立工具）
2. **JSDoc CLI** → 加载 **模板系统**（通过文件路径）
3. **模板系统** → 生成 **HTML 文档**

## 数据流向

```
源代码文件 (*.ts, *.js)
    ↓
JSDoc 解析器
    ↓
Doclets (文档对象) → TaffyDB
    ↓
publish.js (模板发布器)
    ↓
模板文件 (.tmpl) + 数据
    ↓
HTML 文档
```

## 为什么不能放在 `src/` 里？

### 如果放在 `src/` 里会有什么问题？

1. **编译问题**
   - TypeScript 编译器会尝试编译 `publish.js`
   - 但 `publish.js` 使用 CommonJS，需要 JSDoc 的运行时环境
   - 编译后的文件可能无法被 JSDoc 正确加载

2. **路径问题**
   - 编译后文件在 `dist/` 目录
   - JSDoc 需要访问原始模板文件，不是编译后的
   - 路径会变得复杂：`dist/jsdoc-template/` vs `jsdoc-template/`

3. **依赖问题**
   - `publish.js` 依赖 JSDoc 的内部模块（`jsdoc/template`, `jsdoc/fs` 等）
   - 这些模块在 JSDoc 运行时环境中可用
   - 如果编译，这些依赖关系会丢失

4. **静态资源问题**
   - CSS 和 JavaScript 文件需要原样复制
   - 如果放在 `src/`，需要额外的构建步骤来复制这些文件

## 正确的架构

```
┌─────────────────────────────────────┐
│  文心工具 (TypeScript)              │
│  src/                               │
│  ├── 配置管理                       │
│  ├── JSDoc 处理器                   │
│  └── TypeScript 处理器              │
└──────────┬──────────────────────────┘
           │ 调用 CLI
           ↓
┌─────────────────────────────────────┐
│  JSDoc CLI (独立工具)               │
│  - 解析源代码                       │
│  - 生成 doclets                     │
└──────────┬──────────────────────────┘
           │ 通过文件路径加载
           ↓
┌─────────────────────────────────────┐
│  JSDoc 模板系统                     │
│  jsdoc-template/                   │
│  ├── publish.js (CommonJS)          │
│  ├── tmpl/*.tmpl (模板文件)         │
│  └── static/ (静态资源)             │
└─────────────────────────────────────┘
```

## 总结

- **`src/`**: 我们的 TypeScript 工具代码，会被编译
- **`jsdoc-template/`**: JSDoc 的模板系统，必须保持原样，不能被编译
- **分离的原因**: JSDoc 是独立工具，通过文件系统路径访问模板，不是通过我们的代码

这种架构确保了：
1. ✅ 我们的代码可以正常编译和打包
2. ✅ JSDoc 可以正确加载和使用模板
3. ✅ 模板文件作为资源文件正确打包到包中
4. ✅ 用户安装包后可以正常使用模板

