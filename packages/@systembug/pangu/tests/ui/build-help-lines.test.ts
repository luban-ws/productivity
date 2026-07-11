/**
 * buildHelpLines 测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildHelpLines, HELP_EXAMPLE_LIMIT } from "../../src/ui/build-help-lines.js";
import type { DemoOption } from "../../src/types.js";

const DEMO: DemoOption = {
    name: "Site",
    value: "site",
    description: "Site demo",
    package: "@test/site",
};

describe("buildHelpLines", () => {
    beforeEach(() => {
        vi.stubEnv("PANGU_LANG", "en");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("应包含帮助标题与 demo 行", () => {
        const lines = buildHelpLines([DEMO], "pnpm");

        expect(lines.some((line) => line.includes("Usage"))).toBe(true);
        expect(lines.some((line) => line.includes("site") && line.includes("Site demo"))).toBe(
            true,
        );
        expect(lines.some((line) => line.includes("pnpm"))).toBe(true);
    });

    it("示例行最多 HELP_EXAMPLE_LIMIT 条", () => {
        const demos = Array.from({ length: 5 }, (_, index) => ({
            ...DEMO,
            value: `demo-${index}`,
            description: `Demo ${index}`,
        }));

        const lines = buildHelpLines(demos, "pnpm");
        const examplesIndex = lines.findIndex((line) => line.includes("Examples"));
        const exampleCount = lines
            .slice(examplesIndex + 1)
            .filter((line) => line.startsWith("  pangu ")).length;

        expect(exampleCount).toBe(HELP_EXAMPLE_LIMIT);
    });
});
