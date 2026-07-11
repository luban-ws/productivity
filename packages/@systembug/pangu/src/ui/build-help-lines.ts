/**
 * 帮助文案构建（纯函数，供 Ink Help 与测试使用）
 */

import { t } from "../messages.js";
import type { DemoOption } from "../types.js";
import { DEMO_NAME_COLUMN_WIDTH } from "./build-select-options.js";

/** demo 值列宽（与选择列表对齐） */
export const DEMO_VALUE_COLUMN_WIDTH = DEMO_NAME_COLUMN_WIDTH;

/** 帮助示例最多展示条数 */
export const HELP_EXAMPLE_LIMIT = 3;

/**
 * 构建帮助文本行
 */
export function buildHelpLines(demos: DemoOption[], packageManager: string): string[] {
    const demoLines = demos.map(
        (option) => `  ${option.value.padEnd(DEMO_VALUE_COLUMN_WIDTH)} - ${option.description}`,
    );

    const exampleLines = demos
        .slice(0, HELP_EXAMPLE_LIMIT)
        .map((option) => `  pangu ${option.value}`);

    return [
        t("helpTitle"),
        t("helpMenu"),
        t("helpDirect"),
        t("helpDemos"),
        ...demoLines,
        `${t("helpPackageManager")}: ${packageManager}`,
        t("helpExamples"),
        ...exampleLines,
        "",
    ];
}
