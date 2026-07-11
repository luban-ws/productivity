/**
 * @systembug/tongyu
 * 通语 - CLI 共享 OS locale 解析（不含文案翻译）
 */

export {
    LOCALE_OVERRIDE_ENV,
    POSIX_LOCALE_ENV_KEYS,
    type SupportedLocale,
} from "./constants.js";

export {
    normalizeLocaleTag,
    isChineseLocale,
    localeTagToSupported,
} from "./locale-tag.js";

export {
    readLocaleOverride,
    resolveLocale,
    getOsLocaleTag,
    type ResolveLocaleOptions,
    type EnvMap,
} from "./resolve-locale.js";
