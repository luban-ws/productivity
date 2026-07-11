/**
 * 非 TTY 环境下的纯文本输出（避免 Ink raw mode 报错）
 */

import { t } from "../messages.js";
import type { DemoOption } from "../types.js";
import { buildHelpLines } from "./build-help-lines.js";
import type { AlertVariant } from "./AlertApp.js";
import type { StartupReadyPayload } from "./startup-types.js";
import { startsWithAlertPrefix } from "./alert-prefixes.js";

function formatAlertLine(prefix: string, text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith(`${prefix} `) || trimmed === prefix) {
        return trimmed;
    }
    if (startsWithAlertPrefix(trimmed)) {
        return trimmed;
    }
    return `${prefix} ${trimmed}`;
}

/** 输出帮助文本 */
export function printHelp(demos: DemoOption[], packageManager: string): void {
    console.log(t("welcome").trim());
    for (const line of buildHelpLines(demos, packageManager)) {
        console.log(line);
    }
}

/** 输出告警文本 */
export function printAlert(options: {
    variant: AlertVariant;
    title?: string;
    lines: string[];
}): void {
    const prefix =
        options.variant === "error"
            ? "❌"
            : options.variant === "warning"
              ? "⚠️"
              : options.variant === "success"
                ? "✅"
                : "ℹ️";

    if (options.title) {
        console.error(formatAlertLine(prefix, options.title));
    }

    for (const line of options.lines) {
        console.error(formatAlertLine(prefix, line));
    }
}

/** 输出启动成功信息 */
export function printStartupSuccess(payload: StartupReadyPayload, demoDisplayName: string): void {
    console.log(t("startingServerSuccess", { name: demoDisplayName }));
    console.log(`${t("labelPackage")}: ${payload.packageName}`);
    console.log(`${t("labelDirectory")}: ${payload.packageDirectory}`);
    console.log(`${t("labelPackageManager")}: ${payload.packageManager}`);
    console.log(`${t("labelCommand")}: ${payload.command}\n`);
}

/** 输出启动失败信息 */
export function printStartupError(demoDisplayName: string, message: string): void {
    console.error(t("locatePackageFailed", { name: demoDisplayName }));
    console.error(message);
}
