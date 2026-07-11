/**
 * 渲染 Ink demo 选择器并返回 Promise
 */

import React from "react";
import type { DemoOption } from "../types.js";
import { t } from "../messages.js";
import { selectDemoFromConsole } from "./console-demo-select.js";
import { DemoSelectApp } from "./DemoSelectApp.js";
import { DemoSelectCancelledError } from "./demo-select-errors.js";
import { openInkSession } from "./ink-session.js";
import { isInteractiveTerminal } from "./tty.js";

/**
 * 交互式选择 demo（TTY: Ink Select；非 TTY: readline）
 */
export function runDemoSelect(supportedBy: string, demos: DemoOption[]): Promise<string> {
    if (!isInteractiveTerminal()) {
        console.log(t("supportedBy", { name: supportedBy }));
        return selectDemoFromConsole(demos);
    }

    return new Promise((resolve, reject) => {
        let session: { dispose: () => void } | undefined;

        const dispose = (): void => {
            session?.dispose();
        };

        session = openInkSession(
            <DemoSelectApp
                supportedBy={supportedBy}
                demos={demos}
                onSelect={(value) => {
                    dispose();
                    resolve(value);
                }}
                onCancel={() => {
                    dispose();
                    reject(new DemoSelectCancelledError());
                }}
            />,
        );
    });
}
