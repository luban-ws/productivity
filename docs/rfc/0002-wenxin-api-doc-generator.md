# RFC 0002: 文心(Wen Xin)通用 API 文档生成工具设计规范

- **开始日期**: 2025-01-XX
- **更新日期**: 2025-01-XX
- **RFC PR**:
- **实现议题**:
- **作者**: AI Assistant
- **状态**: Implemented
- **命名空间**: `@systembug/wenxin`

## 摘要

本 RFC 设计一个通用的 API 文档生成工具——**文心(Wen Xin)**，支持 JSDoc 和 TypeScript 文档生成。该工具将原有的项目特定 JSDoc 工具通用化，支持配置化、TypeScript 类型提取，以及混合模式文档生成。工具遵循**零配置优先**原则，自动从项目结构推断配置，同时支持完整的配置定制。

## 文心哲学

文心雕龙是中国古代文学理论著作，强调文章的精雕细琢。文档生成工具文心体现这些原则：

- **雕琢文档之美**：精心生成清晰、完整的 API 文档
- **兼容并蓄**：同时支持 JSDoc 注释和 TypeScript 类型系统
- **智能融合**：自动合并类型信息与注释，提供最佳文档体验
- **灵活配置**：支持零配置使用，也支持深度定制

## 动机

项目中存在一个项目特定的 JSDoc 工具（`@systembug/tools`），存在以下问题：

1. **硬编码路径**：配置文件中的路径是硬编码的，无法在不同项目间复用
2. **功能单一**：仅支持 JSDoc，无法充分利用 TypeScript 类型系统
3. **缺乏验证**：配置文件没有 schema 验证，容易出错
4. **使用不便**：缺少 CLI 工具和初始化命令

通过设计一个通用的文档生成工具，可以：

- **提高可重用性**：通过配置化支持不同项目结构
- **增强功能**：集成 TypeScript 类型提取，提供更完整的文档
- **改善体验**：提供 CLI 工具、配置验证和初始化命令
- **向后兼容**：保留原有 JSDoc 工具的所有功能

## 设计目标

1. **通用化**：支持任意项目的文档生成，不依赖特定项目结构
2. **类型支持**：充分利用 TypeScript 类型系统，自动提取类型信息
3. **混合模式**：支持 JSDoc、TypeDoc 和混合模式
4. **配置验证**：使用 JSON Schema 验证配置文件
5. **零配置优先**：自动检测项目结构，提供合理的默认配置
6. **开发友好**：清晰的 CLI 接口、错误提示和文档

## 详细设计

### 1. 包结构

```
@systembug/wenxin/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── index.ts                    # 主入口，导出 API
│   ├── cli.ts                      # CLI 命令处理
│   ├── config.ts                   # 配置管理（加载、合并、验证）
│   ├── jsdoc-processor.ts          # JSDoc 处理器
│   ├── typescript-processor.ts     # TypeScript 类型提取
│   ├── merger.ts                   # 类型与注释合并器
│   ├── types.ts                    # TypeScript 类型定义
│   └── commands/
│       └── init.ts                 # 初始化命令实现
├── schemas/
│   └── config.schema.json          # JSON Schema 配置定义
├── jsdoc-template/                 # JSDoc 模板（保留原有）
│   ├── publish.js
│   ├── tmpl/
│   └── static/
├── jsdoc-aliases.js                # JSDoc 插件（保留原有）
├── jsdoc-conf.json                 # 示例配置文件
└── README.md
```

### 2. 配置系统

#### 2.1 零配置模式（Zero Config）

文心支持**完全零配置**模式，自动从项目结构推断所有必要信息：

**自动检测流程**：

1. **项目类型检测**
   ```typescript
   // 检测 TypeScript/JavaScript
   // 1. 检查 tsconfig.json 存在 -> TypeScript
   // 2. 检查 package.json 中的 type 字段
   // 3. 默认 JavaScript
   ```

2. **源文件目录检测**
   ```typescript
   // 优先级顺序：
   // 1. src/
   // 2. lib/
   // 3. source/
   // 4. 默认 src/
   ```

3. **入口文件检测**
   ```typescript
   // 检测可能的入口文件：
   // - src/index.ts
   // - src/index.js
   // - src/main.ts
   // - src/main.js
   // - index.ts
   // - index.js
   ```

#### 2.2 配置文件格式

支持三种配置文件格式：

1. **JSON** (`wenxin.config.json`) - 推荐，支持 schema 验证
2. **JavaScript** (`wenxin.config.js`) - 支持动态配置
3. **TypeScript** (`wenxin.config.ts`) - 类型安全

#### 2.3 配置 Schema

使用 JSON Schema 进行配置验证：

```json
{
  "$schema": "./node_modules/@systembug/wenxin/schemas/config.schema.json",
  "mode": "hybrid",
  "jsdoc": { ... },
  "typedoc": { ... }
}
```

### 3. 核心功能

#### 3.1 文档生成模式

支持三种模式：

1. **jsdoc 模式**：仅使用 JSDoc 生成文档
   - 适合纯 JavaScript 项目
   - 或只需要注释文档的场景

2. **typedoc 模式**：仅使用 TypeDoc 生成文档
   - 充分利用 TypeScript 类型系统
   - 自动提取类型信息

3. **hybrid 模式**（推荐）：同时使用 JSDoc 和 TypeDoc
   - 合并类型信息到 JSDoc 文档
   - 提供最完整的文档体验

#### 3.2 JSDoc 处理

文心使用 JSDoc 模板系统生成文档：

- **模板系统**：使用 `jsdoc-template/` 目录中的模板
  - `publish.js`：模板发布器（JSDoc 标准接口）
  - `tmpl/`：Underscore Template 模板文件（`.tmpl`）
  - `static/`：静态资源（CSS、JavaScript）
- **插件系统**：支持自定义插件（保留原有的 aliases 和 category 插件）
- **Markdown 解析**：支持在注释中使用 Markdown
- **配置化**：所有路径和选项均可配置

#### 3.3 TypeScript 类型提取

文心使用 TypeDoc 提取 TypeScript 类型信息：

- **TypeDoc 集成**：使用 TypeDoc Application API 进行类型提取
- **主题系统**：支持 TypeDoc 默认主题和自定义主题
- **配置选项**：支持排除私有/受保护/内部成员
- **入口文件**：可配置多个入口点

#### 3.4 混合模式文档生成

在 **hybrid 模式**下，文心同时使用 JSDoc 和 TypeDoc 生成完整的 API 文档：

**工作流程**：
1. **JSDoc 阶段**：解析源代码，提取 JSDoc 注释，生成 doclets
2. **TypeDoc 阶段**：解析 TypeScript 类型，提取类型信息
3. **类型合并**：将 TypeScript 类型信息合并到 JSDoc 注释中
   - 如果 JSDoc 中没有类型信息，使用 TypeScript 类型
   - 如果 JSDoc 中没有参数类型，使用 TypeScript 参数类型
   - 如果 JSDoc 中没有返回类型，使用 TypeScript 返回类型
4. **文档生成**：使用合并后的数据生成最终文档

**输出结构**：
- JSDoc 生成的 HTML 文档（使用自定义模板）
- TypeDoc 生成的类型文档（可选，用于类型参考）
- 合并后的完整 API 文档

### 4. CLI 接口

#### 4.1 主命令

```bash
wenxin [options]
wx [options]  # 短命令
```

**选项**：
- `-c, --config <path>`: 指定配置文件路径
- `-m, --mode <mode>`: 文档生成模式 (jsdoc|typedoc|hybrid)
- `-o, --output <dir>`: 输出目录
- `--jsdoc-only`: 仅使用 JSDoc
- `--typedoc-only`: 仅使用 TypeDoc
- `--no-merge`: 不合并类型信息

#### 4.2 子命令

**init**: 生成配置文件模板
```bash
wenxin init [options]
```

**选项**：
- `-f, --force`: 强制覆盖已存在的配置文件
- `--format <format>`: 配置文件格式 (ts|js|json)，默认 json

**config**: 显示默认配置
```bash
wenxin config
```

### 5. 配置接口

#### 5.1 TypeScript 类型定义

```typescript
interface ApiDocConfig {
  mode?: 'jsdoc' | 'typedoc' | 'hybrid';
  mergeTypes?: boolean;
  cwd?: string;
  jsdoc?: Partial<JSDocOptions>;
  typedoc?: Partial<TypeDocOptions>;
}
```

#### 5.2 编程式 API

```typescript
import { generateDocs } from '@systembug/wenxin';

// 使用默认配置
await generateDocs();

// 使用自定义配置
await generateDocs('wenxin.config.json', {
  mode: 'hybrid',
  jsdoc: {
    enabled: true,
    opts: {
      destination: './docs'
    }
  }
});
```

### 6. 模板系统设计

#### 6.1 当前实现（JSDoc 标准模板）

当前使用 JSDoc 标准的模板系统：

- **publish.js**：CommonJS 模块，实现 `exports.publish()` 接口
- **Underscore Template**：使用 `.tmpl` 文件，语法为 `<?js= variable ?>`
- **TaffyDB**：内存数据库，存储和查询 doclets

**问题**：
- `publish.js` 设计复杂，难以维护
- Underscore Template 语法不够直观
- 模板逻辑与数据混合，难以分离

#### 6.2 改进方案：基于 DSL 的模板系统

为了解决上述问题，文心将引入一个**基于 DSL 的模板定义系统**：

**设计目标**：
1. **声明式配置**：使用 YAML/JSON 定义模板结构，而非命令式代码
2. **逻辑分离**：将模板逻辑与数据分离，提高可维护性
3. **类型安全**：提供 TypeScript 类型定义，确保配置正确性
4. **向后兼容**：保留对现有 JSDoc 模板的支持

**DSL 设计**：

```yaml
# wenxin-template.yaml
template:
  name: "文心默认模板"
  version: "1.0.0"

  # 页面布局
  layout:
    html:
      head:
        title: "{{title}} - API 文档"
        stylesheets:
          - "styles/default.css"
          - "styles/custom.css"
        scripts:
          - "scripts/highlight.js"
      body:
        header:
          title: "{{project.name}}"
          nav: "{{navigation}}"
        main:
          content: "{{content}}"
        footer:
          text: "Generated by 文心"

  # 页面类型定义
  pages:
    index:
      title: "API 索引"
      template: "index.hbs"
      data:
        - type: "classes"
          query: "kind:class"
          sort: "name"
        - type: "functions"
          query: "kind:function"
          sort: "name"

    class:
      title: "类: {{name}}"
      template: "class.hbs"
      data:
        - type: "class"
          query: "longname:{{name}}"
        - type: "methods"
          query: "memberof:{{name}}"
          groupBy: "category"
        - type: "properties"
          query: "memberof:{{name}} kind:member"

    method:
      title: "{{name}}"
      template: "method.hbs"
      data:
        - type: "method"
          query: "longname:{{name}}"
        - type: "params"
          from: "method.params"
        - type: "returns"
          from: "method.returns"

  # 组件定义（可复用）
  components:
    params:
      template: "components/params.hbs"
      iterate: "params"
      fields:
        - name: "name"
        - type: "type"
        - description: "description"

    returns:
      template: "components/returns.hbs"
      fields:
        - type: "type"
        - description: "description"

    signature:
      template: "components/signature.hbs"
      format: "{{name}}({{params}}): {{returns}}"

  # 样式配置
  styles:
    theme: "default"
    colors:
      primary: "#1890ff"
      secondary: "#52c41a"
    typography:
      fontFamily: "Inter, sans-serif"
      fontSize: "14px"

  # 输出配置
  output:
    format: "html"
    minify: true
    sourceMaps: false
```

**实现方案**：

1. **模板编译器**：将 YAML/JSON DSL 编译为 JSDoc 兼容的模板
   - 解析 DSL 配置
   - 生成 `publish.js` 和 `.tmpl` 文件
   - 支持 Handlebars 或其他现代模板引擎

2. **运行时支持**：
   - 在文档生成时，自动检测 DSL 配置文件
   - 如果存在 `wenxin-template.yaml`，使用 DSL 模板
   - 否则，回退到传统的 `publish.js` 模板

3. **模板引擎选择**：
   - **Handlebars**：推荐，语法清晰，支持 partials 和 helpers
   - **EJS**：备选，更接近 JavaScript
   - **Nunjucks**：备选，功能强大

**示例：Handlebars 模板**

```handlebars
{{! templates/index.hbs }}
<div class="api-index">
  <h1>{{title}}</h1>

  {{#each classes}}
    <section class="class-section">
      <h2><a href="{{url}}">{{name}}</a></h2>
      <p>{{description}}</p>
    </section>
  {{/each}}

  {{#each functions}}
    <section class="function-section">
      <h2><a href="{{url}}">{{name}}</a></h2>
      {{> signature this}}
      <p>{{description}}</p>
    </section>
  {{/each}}
</div>
```

```handlebars
{{! templates/components/signature.hbs }}
<div class="signature">
  <code>
    {{name}}(
    {{#each params}}
      {{name}}: {{type}}{{#unless @last}}, {{/unless}}
    {{/each}}
    ): {{returns.type}}
  </code>
</div>
```

**迁移路径**：

1. **阶段 1**：实现 DSL 解析器和编译器
2. **阶段 2**：提供默认 DSL 模板配置
3. **阶段 3**：支持 DSL 和传统模板共存
4. **阶段 4**：逐步迁移到 DSL 优先

### 7. 向后兼容

- 保留原有的 `jsdoc-template/` 目录和模板（传统模式）
- 支持新的 DSL 模板系统（推荐模式）
- 保留原有的 `jsdoc-aliases.js` 插件
- 支持 `@aliases` 和 `@category` 标签

## 实施计划

### 阶段 1: 基础架构 ✅

- [x] 创建包结构和基础文件
- [x] 定义 TypeScript 类型接口
- [x] 实现配置管理系统
- [x] 实现 JSDoc 处理器
- [x] 实现 TypeScript 处理器

### 阶段 2: 核心功能 ✅

- [x] 实现类型合并器
- [x] 实现主 API 接口
- [x] 创建 CLI 工具
- [x] 集成 ora 和 chalk 改进用户体验

### 阶段 3: 配置和验证 ✅

- [x] 创建 JSON Schema
- [x] 实现配置验证
- [x] 实现 init 命令
- [x] 支持多种配置文件格式

### 阶段 4: 文档和优化

- [x] 编写 README 文档
- [x] 编写架构文档（ARCHITECTURE.md）
- [x] 编写模板系统说明（HOW_IT_WORKS.md）
- [ ] 编写使用示例
- [ ] 性能优化
- [ ] 错误处理改进

### 阶段 5: DSL 模板系统（计划中）

- [ ] 设计 DSL 语法规范
- [ ] 实现 DSL 解析器
- [ ] 实现模板编译器（DSL → JSDoc 模板）
- [ ] 集成 Handlebars 模板引擎
- [ ] 提供默认 DSL 模板配置
- [ ] 实现模板迁移工具
- [ ] 编写 DSL 文档和示例

## 技术决策

### 1. 为什么同时使用 JSDoc 和 TypeDoc？

**JSDoc 的优势**：
- 成熟的注释系统，广泛使用
- 灵活的模板系统，可深度定制
- 支持 JavaScript 和 TypeScript
- 丰富的插件生态

**TypeDoc 的优势**：
- 深度集成 TypeScript 类型系统
- 自动提取类型信息，无需手动注释
- 现代化的主题系统
- 官方维护，与 TypeScript 同步更新

**混合模式的价值**：
- **最佳实践**：JSDoc 提供详细注释，TypeDoc 提供类型信息
- **完整性**：结合两者优势，生成最完整的文档
- **灵活性**：用户可以选择最适合的模式

### 2. 为什么设计 DSL 模板系统？

**问题分析**：
- `publish.js` 设计复杂，需要理解 JSDoc 内部机制
- Underscore Template 语法不够直观
- 模板逻辑与数据混合，难以维护和测试

**DSL 方案的优势**：
- **声明式**：使用 YAML/JSON 定义结构，而非命令式代码
- **可维护性**：逻辑与数据分离，易于理解和修改
- **类型安全**：提供 TypeScript 类型定义
- **现代化**：支持 Handlebars 等现代模板引擎
- **向后兼容**：保留对传统模板的支持

**技术选择**：
- **Handlebars**：语法清晰，支持 partials 和 helpers，社区活跃
- **YAML/JSON**：人类可读，易于版本控制，支持注释（YAML）

### 3. 为什么使用 JSON Schema？

- 提供配置验证，减少配置错误
- IDE 自动补全和类型检查
- 清晰的配置文档
- 标准化的验证机制

### 4. 为什么保留原有模板？

- **向后兼容**：现有项目可以继续使用
- **迁移平滑**：用户可以逐步迁移到 DSL
- **灵活性**：支持传统和现代两种方式

## 已知限制

1. **JS/TS 配置文件**：当前版本仅支持 JSON 格式的配置文件，JS/TS 格式需要运行时支持（未来改进）

2. **类型合并**：类型合并功能是简化实现，完整实现需要更复杂的集成

3. **性能**：对于大型项目，文档生成可能需要较长时间

## 未来改进

### 短期（v1.1）

1. **DSL 模板系统**：实现基于 YAML/JSON 的模板 DSL
   - DSL 解析器和编译器
   - Handlebars 模板引擎集成
   - 默认 DSL 模板配置
   - 模板迁移工具

2. **增强类型合并**：更智能的类型信息合并算法
   - 类型推断和补全
   - 参数类型自动匹配
   - 返回类型增强

3. **支持 JS/TS 配置文件**：实现运行时加载 JS/TS 配置文件

### 中期（v1.2-v1.3）

4. **插件系统**：支持自定义插件扩展功能
   - 插件 API 设计
   - 插件注册和加载机制
   - 官方插件库

5. **主题定制**：基于 DSL 的主题系统
   - 主题配置 DSL
   - 主题预览和切换
   - 主题市场

6. **增量生成**：只生成变更部分的文档
   - 文件变更检测
   - 增量编译
   - 缓存机制

### 长期（v2.0+）

7. **多语言支持**：支持生成多语言文档
   - i18n 配置
   - 多语言模板
   - 翻译工具集成

8. **实时预览**：开发时实时预览文档
   - 文件监听
   - 热重载
   - 开发服务器

9. **文档分析**：文档质量分析和建议
   - 覆盖率统计
   - 缺失注释检测
   - 文档完整性评分

## 迁移指南

### 从原有工具迁移

1. **安装新工具**
   ```bash
   pnpm add -D @systembug/wenxin
   ```

2. **生成配置文件**
   ```bash
   npx wenxin init
   ```

3. **更新脚本**
   ```json
   {
     "scripts": {
       "docs": "wenxin"
     }
   }
   ```

4. **测试**
   ```bash
   npx wenxin
   ```

### 配置文件迁移

原有的 `jsdoc-conf.json` 可以继续使用，或迁移到新的 `wenxin.config.json`：

```json
{
  "$schema": "./node_modules/@systembug/wenxin/schemas/config.schema.json",
  "mode": "jsdoc",
  "jsdoc": {
    "enabled": true,
    "source": {
      "include": ["src/**/*.ts"],
      "exclude": ["node_modules", "dist"]
    },
    "opts": {
      "destination": "doc",
      "template": "./node_modules/@systembug/wenxin/jsdoc-template"
    }
  }
}
```

## 参考

- [JSDoc 官方文档](https://jsdoc.app/)
- [TypeDoc 官方文档](https://typedoc.org/)
- [JSON Schema 规范](https://json-schema.org/)
- [RFC 0001: 青鸟通用发布工具](./0001-universal-publish-tool.md)

## 变更日志

### 2025-01-XX - RFC 更新：DSL 模板系统设计

- 📝 明确 JSDoc 模板系统使用方式
- 📝 明确 TypeDoc 集成和使用方式
- 📝 明确混合模式文档生成流程
- 🎨 设计基于 DSL 的模板系统方案
- 📋 定义 DSL 语法规范和实现计划
- 🔄 更新未来改进路线图

### 2025-01-XX - 初始实现

- ✅ 完成基础架构和核心功能
- ✅ 实现配置系统和验证
- ✅ 实现 CLI 工具和 init 命令
- ✅ 创建 JSON Schema
- ✅ 集成 ora 和 chalk 改进用户体验
- ✅ 重命名包为 @systembug/wenxin
- ✅ 支持 pnpm/npm/yarn 包管理器

