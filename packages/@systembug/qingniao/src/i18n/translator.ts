/**
 * 青鸟本地文案翻译（catalog 不共享，locale 解析用 tongyu）
 */

import { resolveLocale, type SupportedLocale } from "@systembug/tongyu";

export type MessageParams = Record<string, string | number>;

export type MessageCatalog<TKey extends string> = Record<SupportedLocale, Record<TKey, string>>;

export interface CreateTranslatorOptions {
    env?: Record<string, string | undefined>;
    overrideEnvKeys?: readonly string[];
    locale?: SupportedLocale;
}

/** 将 `{key}` 替换为参数值 */
export function formatMessage(template: string, params: MessageParams = {}): string {
    return Object.entries(params).reduce(
        (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
        template,
    );
}

/** 基于 catalog 创建 `t(key, params?)` */
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
