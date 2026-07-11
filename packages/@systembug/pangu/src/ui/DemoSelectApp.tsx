/**
 * Ink demo 选择界面
 */

import React, { useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { Select } from "@inkjs/ui";
import type { DemoOption } from "../types.js";
import { t } from "../messages.js";
import { buildSelectOptions } from "./build-select-options.js";

export interface DemoSelectAppProps {
    /** 「提供支持」署名，通常来自 config.projectName */
    supportedBy: string;
    demos: DemoOption[];
    onSelect: (value: string) => void;
    onCancel: () => void;
}

/** 可见选项上限 */
const MAX_VISIBLE_OPTIONS = 8;

export function DemoSelectApp({
    supportedBy,
    demos,
    onSelect,
    onCancel,
}: DemoSelectAppProps): React.JSX.Element {
    const options = buildSelectOptions(demos);
    const visibleOptionCount = Math.min(MAX_VISIBLE_OPTIONS, Math.max(options.length, 1));

    const handleCancel = useCallback(() => {
        onCancel();
    }, [onCancel]);

    useInput((_input, key) => {
        if (key.escape || (key.ctrl && _input === "c")) {
            handleCancel();
        }
    });

    return (
        <Box flexDirection="column">
            <Text bold color="cyan">
                {t("welcome")}
            </Text>
            <Text dimColor>{t("supportedBy", { name: supportedBy })}</Text>
            <Text>{t("selectDemo")}</Text>
            <Box marginTop={1} flexDirection="column">
                <Select
                    options={options}
                    onChange={onSelect}
                    visibleOptionCount={visibleOptionCount}
                />
            </Box>
            <Box marginTop={1}>
                <Text dimColor>{t("uiSelectHint")}</Text>
            </Box>
        </Box>
    );
}
