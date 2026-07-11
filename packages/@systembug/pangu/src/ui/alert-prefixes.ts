/** Ink / console 告警前缀（单独常量，避免 emoji 正则 no-misleading-character-class） */
export const ALERT_PREFIX_ERROR = "❌";
export const ALERT_PREFIX_WARNING = "⚠️";
export const ALERT_PREFIX_SUCCESS = "✅";
export const ALERT_PREFIX_INFO = "ℹ️";

export const ALERT_TEXT_PREFIXES = [
    ALERT_PREFIX_ERROR,
    ALERT_PREFIX_WARNING,
    ALERT_PREFIX_SUCCESS,
    ALERT_PREFIX_INFO,
] as const;

/** 文案是否以告警 emoji 开头 */
export function startsWithAlertPrefix(text: string): boolean {
    const trimmed = text.trimStart();
    return ALERT_TEXT_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/** 去掉行首告警 emoji（messages 原文保留） */
export function stripLeadingAlertEmoji(text: string): string {
    const trimmed = text.trim();
    for (const prefix of ALERT_TEXT_PREFIXES) {
        if (trimmed.startsWith(prefix)) {
            return trimmed.slice(prefix.length).trimStart();
        }
    }
    return trimmed;
}
