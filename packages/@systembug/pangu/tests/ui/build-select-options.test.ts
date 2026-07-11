/**
 * buildSelectOptions 测试
 */

import { describe, it, expect } from "vitest";
import {
    buildSelectOptions,
    formatDemoLabel,
    DEMO_NAME_COLUMN_WIDTH,
} from "../../src/ui/build-select-options.js";
import type { DemoOption } from "../../src/types.js";

const SAMPLE_DEMO: DemoOption = {
    name: "Site",
    value: "site",
    description: "Marketing site",
    package: "@systembug/site",
};

describe("buildSelectOptions", () => {
    it("formatDemoLabel 应对齐名称列宽", () => {
        const label = formatDemoLabel(SAMPLE_DEMO);
        expect(label.startsWith("Site".padEnd(DEMO_NAME_COLUMN_WIDTH))).toBe(true);
        expect(label).toContain("Marketing site");
    });

    it("buildSelectOptions 应映射 label 与 value", () => {
        const options = buildSelectOptions([SAMPLE_DEMO]);

        expect(options).toEqual([
            {
                label: formatDemoLabel(SAMPLE_DEMO),
                value: "site",
            },
        ]);
    });

    it("空列表应返回空数组", () => {
        expect(buildSelectOptions([])).toEqual([]);
    });
});
