/**
 * 通语 - 共享 locale 常量
 */

/** 全局语言覆盖环境变量（所有 @systembug CLI 通用） */
export const LOCALE_OVERRIDE_ENV = "SYSTEMBUG_LOCALE";

/** POSIX / GNU locale 环境变量（os-locale 也会读取，此处用于测试与文档） */
export const POSIX_LOCALE_ENV_KEYS = [
    "LC_ALL",
    "LC_MESSAGES",
    "LANG",
    "LANGUAGE",
] as const;

/** 当前支持的语言 */
export type SupportedLocale = "zh" | "en";
