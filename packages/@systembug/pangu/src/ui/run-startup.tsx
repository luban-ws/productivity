/**
 * Ink 启动 dev server 流程
 */

import React from "react";
import { render } from "ink";
import { t } from "../messages.js";
import { StartupApp } from "./StartupApp.js";
import { printStartupError, printStartupSuccess } from "./console-present.js";
import { StartupFailedError, type StartupReadyPayload } from "./startup-types.js";
import { isInteractiveTerminal } from "./tty.js";

/** 成功详情展示时长（毫秒） */
export const STARTUP_READY_DISMISS_MS = 600;

/** 错误详情展示时长（毫秒） */
export const STARTUP_ERROR_DISMISS_MS = 800;

export interface RunStartupOptions {
    demoDisplayName: string;
    packageName: string;
    packageManager: string;
    command: string;
    resolveDirectory: () => string;
}

/** 非 TTY 同步启动流程 */
function runStartupConsole(options: RunStartupOptions): StartupReadyPayload {
    console.log(t("startingServer", { name: options.demoDisplayName }));

    try {
        const packageDirectory = options.resolveDirectory();
        const payload: StartupReadyPayload = {
            packageDirectory,
            command: options.command,
            packageManager: options.packageManager,
            packageName: options.packageName,
        };
        printStartupSuccess(payload, options.demoDisplayName);
        return payload;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        printStartupError(options.demoDisplayName, message);
        throw new StartupFailedError(message);
    }
}

/** 解析包目录并展示 Ink 启动 UI，完成后 unmount */
export function runStartup(options: RunStartupOptions): Promise<StartupReadyPayload> {
    if (!isInteractiveTerminal()) {
        return Promise.resolve().then(() => runStartupConsole(options));
    }

    return new Promise((resolve, reject) => {
        let instance: ReturnType<typeof render> | undefined;

        const dispose = (): void => {
            instance?.unmount();
        };

        instance = render(
            <StartupApp
                demoDisplayName={options.demoDisplayName}
                packageName={options.packageName}
                packageManager={options.packageManager}
                command={options.command}
                resolveDirectory={options.resolveDirectory}
                readyDismissMs={STARTUP_READY_DISMISS_MS}
                errorDismissMs={STARTUP_ERROR_DISMISS_MS}
                onReady={(payload) => {
                    dispose();
                    resolve(payload);
                }}
                onError={(message) => {
                    dispose();
                    reject(new StartupFailedError(message));
                }}
            />,
            { exitOnCtrlC: false },
        );
    });
}
