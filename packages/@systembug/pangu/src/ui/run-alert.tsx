/**
 * Ink 告警屏
 */

import React from "react";
import { AlertApp, type AlertVariant } from "./AlertApp.js";
import { printAlert } from "./console-present.js";
import { runInkTimedScreen } from "./ink-session.js";
import { isInteractiveTerminal } from "./tty.js";

/** 默认告警展示时长（毫秒） */
export const DEFAULT_ALERT_DISMISS_MS = 400;

export interface RunAlertOptions {
    variant: AlertVariant;
    title?: string;
    lines: string[];
    dismissMs?: number;
}

/** 展示告警并自动关闭（仅一层 timer，避免重复 dismiss） */
export async function runAlert(options: RunAlertOptions): Promise<void> {
    const dismissMs = options.dismissMs ?? DEFAULT_ALERT_DISMISS_MS;

    if (!isInteractiveTerminal()) {
        printAlert(options);
        return;
    }

    await runInkTimedScreen(
        () => <AlertApp variant={options.variant} title={options.title} lines={options.lines} />,
        dismissMs,
    );
}
