/**
 * runDemoSelect 非 TTY 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const selectDemoFromConsoleMock = vi.fn();

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => false,
}));

vi.mock("../../src/ui/console-demo-select.js", () => ({
    selectDemoFromConsole: (...args: unknown[]) => selectDemoFromConsoleMock(...args),
}));

import { runDemoSelect } from "../../src/ui/run-demo-select.js";

const DEMOS = [
    {
        name: "Site",
        value: "site",
        description: "Site demo",
        package: "@systembug/site",
    },
];

describe("runDemoSelect console fallback", () => {
    beforeEach(() => {
        selectDemoFromConsoleMock.mockReset();
        selectDemoFromConsoleMock.mockResolvedValue("site");
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    it("应走 console 选择流程", async () => {
        await expect(runDemoSelect("鲁班工坊", DEMOS)).resolves.toBe("site");

        expect(selectDemoFromConsoleMock).toHaveBeenCalledWith(DEMOS);
        expect(console.log).toHaveBeenCalled();
    });
});
