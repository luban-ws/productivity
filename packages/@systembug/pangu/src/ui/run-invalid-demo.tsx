/**
 * 无效 demo：错误 + 帮助合并一屏（避免 alert 后再闪 help）
 */

import React from "react";
import { Box, Text } from "ink";
import { Alert } from "@inkjs/ui";
import { stripLeadingAlertEmoji } from "./alert-text.js";
import type { DemoOption } from "../types.js";
import { buildHelpLines } from "./build-help-lines.js";
import { printAlert, printHelp } from "./console-present.js";
import { runInkTimedScreen } from "./ink-session.js";
import { isInteractiveTerminal } from "./tty.js";

/** 合并屏展示时长 */
export const INVALID_DEMO_DISPLAY_MS = 600;

export interface InvalidDemoScreenProps {
    errorLine: string;
    helpLines: string[];
}

export function InvalidDemoScreen({
    errorLine,
    helpLines,
}: InvalidDemoScreenProps): React.JSX.Element {
    return (
        <Box flexDirection="column">
            <Alert variant="error">{stripLeadingAlertEmoji(errorLine)}</Alert>
            <Box marginTop={1} flexDirection="column">
                {helpLines.map((line, index) => (
                    <Text key={`invalid-help-${index}`}>{line}</Text>
                ))}
            </Box>
        </Box>
    );
}

/** 无效 demo 单屏展示错误与帮助 */
export async function runInvalidDemoScreen(
    errorLine: string,
    demos: DemoOption[],
    packageManager: string,
): Promise<void> {
    const helpLines = buildHelpLines(demos, packageManager);

    if (!isInteractiveTerminal()) {
        printAlert({ variant: "error", lines: [errorLine] });
        printHelp(demos, packageManager);
        return;
    }

    await runInkTimedScreen(
        () => <InvalidDemoScreen errorLine={errorLine} helpLines={helpLines} />,
        INVALID_DEMO_DISPLAY_MS,
    );
}
