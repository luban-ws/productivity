/**
 * Ink 帮助屏
 */

import React from "react";
import type { DemoOption } from "../types.js";
import { buildHelpLines } from "./build-help-lines.js";
import { printHelp } from "./console-present.js";
import { HelpApp } from "./HelpApp.js";
import { openInkSession, runInkTimedScreen } from "./ink-session.js";
import { isInteractiveTerminal } from "./tty.js";

/** 帮助屏展示时长（毫秒，仅 TTY） */
export const HELP_DISPLAY_MS = 80;

export interface RunHelpOptions {
    showWelcome?: boolean;
}

/** 展示帮助（TTY 用 Ink，非 TTY 用 console） */
export async function runHelp(
    demos: DemoOption[],
    packageManager: string,
    options: RunHelpOptions = {},
): Promise<void> {
    const lines = buildHelpLines(demos, packageManager);
    const showWelcome = options.showWelcome ?? true;

    if (!isInteractiveTerminal()) {
        printHelp(demos, packageManager);
        return;
    }

    await runInkTimedScreen(
        () => <HelpApp lines={lines} showWelcome={showWelcome} />,
        HELP_DISPLAY_MS,
    );
}

/** 展示帮助并保持到进程退出（用于 --help） */
export function runHelpUntilExit(
    demos: DemoOption[],
    packageManager: string,
    options: RunHelpOptions = {},
): void {
    const lines = buildHelpLines(demos, packageManager);
    const showWelcome = options.showWelcome ?? true;

    if (!isInteractiveTerminal()) {
        printHelp(demos, packageManager);
        return;
    }

    openInkSession(<HelpApp lines={lines} showWelcome={showWelcome} />);
}
