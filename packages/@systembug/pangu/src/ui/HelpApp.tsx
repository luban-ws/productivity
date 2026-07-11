/**
 * Ink 帮助界面
 */

import React from "react";
import { Box, Text } from "ink";
import { t } from "../messages.js";

export interface HelpAppProps {
    lines: string[];
    /** 是否显示盘古标题（避免与上一屏重复） */
    showWelcome?: boolean;
}

export function HelpApp({ lines, showWelcome = true }: HelpAppProps): React.JSX.Element {
    return (
        <Box flexDirection="column">
            {showWelcome ? (
                <Text bold color="cyan">
                    {t("welcome").trim()}
                </Text>
            ) : null}
            {lines.map((line, index) => (
                <Text key={`help-line-${index}`}>{line}</Text>
            ))}
        </Box>
    );
}
