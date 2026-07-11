/**
 * 盘古本地文案翻译（catalog 不共享，仅依赖 tongyu 解析 OS locale）
 */

import { resolveLocale, type SupportedLocale } from "@systembug/tongyu";

export type MessageParams = Record<string, string | number>;

export type MessageCatalog<TKey extends string> = Record<SupportedLocale, Record<TKey, string>>;

export interface CreateTranslatorOptions {
    /** 进程环境变量 */
    env?: Record<string, string | undefined>;
    /** 工具专属覆盖 env key */
    overrideEnvKeys?: readonly string[];
    /** 固定语言（测试用） */
    locale?: SupportedLocale;
}

/**
 * 将 `{key}` 替换为参数值
 */
export function formatMessage(template: string, params: MessageParams = {}): string {
    return Object.entries(params).reduce(
        (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
        template,
    );
}

/**
 * 基于 catalog 创建 `t(key, params?)`（locale 由 tongyu 解析）
 */
export function createTranslator<TKey extends string>(
    catalog: MessageCatalog<TKey>,
    options: CreateTranslatorOptions = {},
): (key: TKey, params?: MessageParams) => string {
    return (key: TKey, params: MessageParams = {}): string => {
        const locale =
            options.locale ??
            resolveLocale({
                env: options.env,
                overrideEnvKeys: options.overrideEnvKeys,
            });

        return formatMessage(catalog[locale][key], params);
    };
}

export type { SupportedLocale };
