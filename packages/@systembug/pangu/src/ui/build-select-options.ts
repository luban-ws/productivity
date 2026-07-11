/**
 * 将 demo 配置转为 Ink Select 选项
 */

import type { Option } from "@inkjs/ui";
import type { DemoOption } from "../types.js";

/** demo 名称列宽 */
export const DEMO_NAME_COLUMN_WIDTH = 15;

/**
 * 格式化单个 demo 的展示标签
 */
export function formatDemoLabel(demo: DemoOption): string {
    return `${demo.name.padEnd(DEMO_NAME_COLUMN_WIDTH)} - ${demo.description}`;
}

/**
 * 构建 Select 组件选项列表
 */
export function buildSelectOptions(demos: DemoOption[]): Option[] {
    return demos.map((demo) => ({
        label: formatDemoLabel(demo),
        value: demo.value,
    }));
}
