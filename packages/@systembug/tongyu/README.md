# @systembug/tongyu

**通语** — CLI 共享 OS locale 解析。

基于 [os-locale](https://github.com/sindresorhus/os-locale) 读取 OS / shell 语言。**不含** 文案 catalog / `t()` — 翻译由各工具自持。

## 安装

```bash
pnpm add @systembug/tongyu
```

## 用法

```typescript
import { resolveLocale } from "@systembug/tongyu";

const locale = resolveLocale(); // "zh" | "en"
const localeWithOverride = resolveLocale({
  overrideEnvKeys: ["PANGU_LANG"],
});
```

各 CLI 自行实现 translator + catalog，只调用 `resolveLocale()`。

## Locale 优先级

1. `SYSTEMBUG_LOCALE` — 所有 @systembug 工具通用
2. 工具 `overrideEnvKeys`（如 `PANGU_LANG`）
3. `os-locale()` — `LC_*` / `LANG` / `LANGUAGE` + OS 系统语言

## License

MIT
