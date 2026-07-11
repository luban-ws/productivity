/**
 * 解析 npm/pnpm/yarn 缺失脚本类错误，输出可读消息
 */

import { t } from "../messages.js";

/** 是否为「缺少 npm 脚本」类错误 */
export function isMissingScriptError(errorMessage: string): boolean {
    return (
        /Missing script|Unknown script|does not provide a script named/i.test(errorMessage) ||
        /Command "[^"]+" not found/i.test(errorMessage) ||
        /ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL/i.test(errorMessage)
    );
}

/** 从错误输出中提取缺失的脚本名 */
export function extractMissingScriptName(errorMessage: string): string | undefined {
    const quoted = errorMessage.match(/Command "([^"]+)" not found/);
    if (quoted?.[1]) {
        return quoted[1];
    }

    const named = errorMessage.match(/script named "([^"]+)"/i);
    if (named?.[1]) {
        return named[1];
    }

    const missing = errorMessage.match(/Missing script: "([^"]+)"/i);
    if (missing?.[1]) {
        return missing[1];
    }

    return undefined;
}

/** 用户可读的错误文案（不含 ELIFECYCLE / pnpm 噪音） */
export function formatMissingScriptMessage(scriptName: string): string {
    return t("missingScript", { script: scriptName });
}

/** 将 exec 错误转为发布流程可读消息；缺失脚本时返回固定文案 */
export function toPublishErrorMessage(error: unknown, fallback: string): string {
    const raw = error instanceof Error ? error.message : String(error);
    if (isMissingScriptError(raw)) {
        const script = extractMissingScriptName(raw) ?? fallback;
        return formatMissingScriptMessage(script);
    }
    return fallback;
}

/** @deprecated 使用 isMissingScriptError */
export function isMissingNpmScript(errorMessage: string): boolean {
    return isMissingScriptError(errorMessage);
}
