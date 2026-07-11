/**
 * Ink 告警 / 提示界面
 */

import React from "react";
import { Box } from "ink";
import { Alert } from "@inkjs/ui";
import { stripLeadingAlertEmoji } from "./alert-text.js";

export type AlertVariant = "info" | "success" | "error" | "warning";

export interface AlertAppProps {
    variant: AlertVariant;
    title?: string;
    lines: string[];
}

export function AlertApp({ variant, title, lines }: AlertAppProps): React.JSX.Element {
    const body = lines.map(stripLeadingAlertEmoji).join("\n");
    const alertTitle = title ? stripLeadingAlertEmoji(title) : undefined;

    return (
        <Box flexDirection="column">
            <Alert variant={variant} title={alertTitle}>
                {body}
            </Alert>
        </Box>
    );
}
