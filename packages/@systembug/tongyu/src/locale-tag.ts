/**
 * 通语 - locale 标签规范化
 */

import type { SupportedLocale } from "./constants.js";

export type { SupportedLocale };

/**
 * 将 locale 标签规范化为 BCP 47 风格（小写语言，`-` 分隔）
 */
export function normalizeLocaleTag(locale: string): string {
    return locale.trim().toLowerCase().replace(/_/g, "-");
}

/**
 * 判断 locale 是否属于中文
 */
export function isChineseLocale(locale: string): boolean {
    return normalizeLocaleTag(locale).startsWith("zh");
}

/**
 * 将任意 locale 标签映射为支持的语言
 */
export function localeTagToSupported(locale: string): SupportedLocale {
    return isChineseLocale(locale) ? "zh" : "en";
}
