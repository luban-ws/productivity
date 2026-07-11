# RFC 0003: 通语(Tong Yu) CLI Locale 包设计规范

- **开始日期**: 2026-07-11
- **更新日期**: 2026-07-11
- **RFC PR**:
- **实现议题**:
- **作者**: AI Assistant
- **状态**: Implemented
- **命名空间**: `@systembug/tongyu`
- **依赖**: 无

**变更历史**:

- 2026-07-11: 初稿 — locale-only 共享层、各工具自持文案、Vite 构建

## 摘要

本 RFC 定义 **通语(Tong Yu)** — `@systembug/cli` 生态共享的 **OS locale 解析** 包。通语只负责「读系统语言偏好」，**不包含** 各 CLI 的用户文案 catalog 与 `t()` 翻译逻辑。首个消费者为 **盘古(pangu)**；后续 **青鸟(qingniao)** 等工具复用同一 locale 层。

## 黄金法则 (Golden Rules)

- **100% 测试覆盖率是强制要求**：`@systembug/tongyu` 源码须达到 lines / functions / branches / statements 均为 100%。
- **库构建必须使用 Vite**：与 `@systembug/diting`、`@systembug/qingniao` 一致，双格式输出（ESM + CJS），禁止用 `tsc` 作为库 build 入口。
- **翻译归各包**：catalog、`formatMessage`、`createTranslator` 留在 `pangu`、`qingniao` 等消费者内部，通语不导出。

## 动机

### 问题

1. **Ctrl+C 退出体验差**：pangu 经 `pnpm --filter` 启动时 SIGINT 触发 `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`。
2. **语言硬编码**：CLI 文案固定中文或英文，未尊重 OS / shell locale。
3. **重复实现风险**：多个 `@systembug/*` CLI 各自解析 `LANG` / `LC_*`，行为不一致。

### 目标

1. 统一、可测试的 OS locale 检测（基于 [os-locale](https://github.com/sindresorhus/os-locale)）。
2. 各工具保留独立文案与翻译函数，仅依赖通语解析 `zh` | `en`。
3. 共享包构建与 monorepo 黄金法则对齐（Vite lib mode）。

## 范围

### In-Scope

- 新建 `@systembug/tongyu` 包
- `resolveLocale()`、`getOsLocaleTag()`、`localeTagToSupported()` 等纯函数 API
- `SYSTEMBUG_LOCALE` 全局覆盖 + 工具可选 `overrideEnvKeys`（如 `PANGU_LANG`）
- pangu 集成：包内 `messages.ts` + 本地 translator；CLI 全量使用 `t()`
- pangu 子进程优雅退出（包目录内 `pnpm dev`、SIGINT 130/143 视为成功）

### Out-of-Scope

- 共享文案 catalog
- 共享 `createTranslator` / `formatMessage` 导出
- 超过 `zh` / `en` 的语言扩展（可后续 RFC）
- i18next / ICU 等重量级方案
- 全 monorepo Vite 8 升级（单独变更，本 RFC 仅要求 tongyu 与现有 @systembug 库 Vite 模式一致）

## 通语哲学

**通语** — 共通之语：让各 CLI **听懂 OS 在说什么**，而非替它们 **说什么**。

| 包 | 职责 |
|----|------|
| **通语 tongyu** | OS / env → `SupportedLocale` |
| **盘古 pangu** | pangu 专属 catalog + `t()` |
| **青鸟 qingniao** | qingniao 专属 catalog + `t()`（后续） |

## 技术设计

### 1. Locale 优先级

```
SYSTEMBUG_LOCALE
  → 工具 overrideEnvKeys（如 PANGU_LANG）
  → os-locale()  // LC_ALL, LC_MESSAGES, LANG, LANGUAGE + OS 系统语言
  → 映射为 zh | en
```

### 2. `@systembug/tongyu` 公开 API

```typescript
// 常量
LOCALE_OVERRIDE_ENV = "SYSTEMBUG_LOCALE"
SupportedLocale = "zh" | "en"

// 标签工具
normalizeLocaleTag(locale: string): string
isChineseLocale(locale: string): boolean
localeTagToSupported(locale: string): SupportedLocale

// 解析
readLocaleOverride(env, overrideEnvKeys?): string | undefined
resolveLocale(options?: ResolveLocaleOptions): SupportedLocale
getOsLocaleTag(options?): string
```

**不导出**：`formatMessage`、`createTranslator`、`MessageCatalog`。

### 3. 消费者模式（以 pangu 为例）

```
packages/@systembug/pangu/src/
├── i18n/
│   └── translator.ts    # 本地 formatMessage + createTranslator(resolveLocale from tongyu)
├── messages.ts          # PANGU_CATALOG + export t()
├── cli.ts               # 全部用户可见字符串走 t()
└── process-utils.ts     # 优雅退出 + resolvePackageDirectory
```

```typescript
import { resolveLocale, type SupportedLocale } from "@systembug/tongyu";

// pangu/src/i18n/translator.ts — 仅 pangu 内部使用
export function createTranslator<TKey extends string>(
  catalog: Record<SupportedLocale, Record<TKey, string>>,
  options?: { overrideEnvKeys?: string[]; locale?: SupportedLocale },
): (key: TKey, params?: Record<string, string | number>) => string;
```

### 4. 包结构与构建

对齐 `@systembug/diting`：

```
packages/@systembug/tongyu/
├── package.json          # exports: .mjs + .cjs + .d.ts
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── constants.ts
│   ├── locale-tag.ts
│   └── resolve-locale.ts
└── tests/
    └── *.test.ts
```

```json
{
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.mjs" },
      "require": { "types": "./dist/index.d.ts", "default": "./dist/index.cjs" }
    }
  }
}
```

依赖：`os-locale@^8`（Node >= 20）。

### 5. pangu 行为变更摘要

| 项 | 变更 |
|----|------|
| 启动 | `pnpm --filter` → 解析包目录后在包内 `pnpm dev` |
| Ctrl+C | `attachGracefulShutdown`；130/143 → exit 0 |
| 文案 | OS locale 驱动；`messages.ts` 自持 catalog |
| 依赖 | `@systembug/tongyu: workspace:*` |

## 成功标准

1. `@systembug/tongyu` 使用 **Vite** 构建，产出 ESM/CJS/d.ts。
2. tongyu 测试 100% 覆盖且全通过；无 `create-translator` / `format-message` 公开导出。
3. pangu 测试全通过；Ctrl+C 无 `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`。
4. `SYSTEMBUG_LOCALE=zh-CN` / `en-US` 可覆盖 OS 设置。
5. qingniao 可在不修改 tongyu 的情况下按同一模式接入（文档说明即可，实现可后续 PR）。

## 风险

| 风险 | 缓解 |
|------|------|
| os-locale 在 CI 无 LANG | 测试 mock；支持 `SYSTEMBUG_LOCALE` |
| 仅 zh/en 不够 | 后续 RFC 扩展 `SupportedLocale` |
| pangu 仍用 tsc 构建 | 本 RFC 不强制改 pangu build；仅 tongyu 必须 Vite |

## 实施计划

### 阶段一：通语包修正（当前 Draft 代码对齐 RFC）

- **步骤 1.1**: 删除 `src/create-translator.ts`、`src/format-message.ts` 及对应测试。
- **步骤 1.2**: 添加 `vite.config.ts`、`vite-plugin-dts`；`build` 脚本改为 `vite build`；exports 双格式。
- **步骤 1.3**: 更新 `README.md` — locale-only 说明。
- **步骤 1.4**: `pnpm test:coverage` — 100% 通过。

### 阶段二：pangu 翻译下沉

- **步骤 2.1**: 新增 `pangu/src/i18n/translator.ts`（本地 translator，依赖 tongyu `resolveLocale`）。
- **步骤 2.2**: 重构 `messages.ts` — 不再从 tongyu 导入 `createTranslator`。
- **步骤 2.3**: 确认 `cli.ts` / `process-utils.ts` 已用 `t()`。
- **步骤 2.4**: 更新 `process-utils.test.ts`；pangu 测试全通过。

### 阶段三：文档与索引

- **步骤 3.1**: 本 RFC 状态 → Accepted（评审后）→ Implemented（落地后）。
- **步骤 3.2**: 更新 `.spec/rfc/index.md`。

## 测试策略

- **tongyu**: mock `os-locale`；覆盖 override、`zh-CN`/`en-US` 映射、Intl 回退路径。
- **pangu**: 现有 config/process-utils 测试；shutdown 中文案用 `getShutdownMessage("zh")` 固定 locale。

## 替代方案

| 方案 | 弃用原因 |
|------|----------|
| 各 CLI 手写 LANG 解析 | 重复、macOS 上不准 |
| tongyu 共享 catalog | 工具文案差异大，违反单一职责 |
| i18next | CLI 字符串少，过重 |
| tongyu 用 tsc build | 违反 monorepo Vite 库构建黄金法则 |
