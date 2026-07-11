/**
 * 通语 - 基于 os-locale 解析 OS / shell 语言偏好
 */

import osLocale from "os-locale";
import { LOCALE_OVERRIDE_ENV, type SupportedLocale } from "./constants.js";
import { localeTagToSupported } from "./locale-tag.js";

/** 环境变量字典（避免依赖 NodeJS 全局命名空间） */
export type EnvMap = Record<string, string | undefined>;

export interface ResolveLocaleOptions {
    /** 进程环境变量，默认 `process.env` */
    env?: EnvMap;
    /** 额外覆盖 env key（如工具专属 `PANGU_LANG`），优先级低于 SYSTEMBUG_LOCALE */
    overrideEnvKeys?: readonly string[];
    /** 注入 os-locale 返回值，仅用于测试 */
    osLocaleTag?: string;
}

/**
 * 从 env 中按优先级读取显式 locale 覆盖
 */
export function readLocaleOverride(
    env: EnvMap,
    overrideEnvKeys: readonly string[] = [],
): string | undefined {
    const keys = [LOCALE_OVERRIDE_ENV, ...overrideEnvKeys];

    for (const key of keys) {
        const value = env[key]?.trim();
        if (value) {
            return value;
        }
    }

    return undefined;
}

/**
 * 解析当前应使用的界面语言（尊重 OS / shell 设置）
 *
 * 优先级：SYSTEMBUG_LOCALE → 工具 overrideEnvKeys → os-locale()（含 LC_* / LANG / OS）
 */
export function resolveLocale(options: ResolveLocaleOptions = {}): SupportedLocale {
    const env = options.env ?? process.env;
    const override = readLocaleOverride(env, options.overrideEnvKeys);
    if (override) {
        return localeTagToSupported(override);
    }

    const osTag = options.osLocaleTag ?? osLocale();
    return localeTagToSupported(osTag);
}

/**
 * 读取原始 OS locale 标签（如 en-US、zh-CN）
 */
export function getOsLocaleTag(options: Pick<ResolveLocaleOptions, "osLocaleTag"> = {}): string {
    return options.osLocaleTag ?? osLocale();
}
