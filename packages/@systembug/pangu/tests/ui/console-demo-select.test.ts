/**
 * console-demo-select 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { selectDemoFromConsole } from "../../src/ui/console-demo-select.js";
import { DemoSelectCancelledError } from "../../src/ui/demo-select-errors.js";

const questionMock = vi.fn();
const closeMock = vi.fn();

vi.mock("readline/promises", () => ({
    createInterface: () => ({
        question: questionMock,
        close: closeMock,
    }),
}));

const DEMOS = [
    {
        name: "Site",
        value: "site",
        description: "Site demo",
        package: "@systembug/site",
    },
    {
        name: "Docs",
        value: "docs",
        description: "Docs demo",
        package: "@systembug/docs",
    },
];

describe("selectDemoFromConsole", () => {
    beforeEach(() => {
        questionMock.mockReset();
        closeMock.mockReset();
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.stubEnv("PANGU_LANG", "en");
    });

    it("输入数字序号应返回对应 demo", async () => {
        questionMock.mockResolvedValue("1");

        const result = await selectDemoFromConsole(DEMOS);

        expect(result).toBe("site");
        expect(closeMock).toHaveBeenCalledOnce();
    });

    it("输入 demo 标识名称应返回对应 demo", async () => {
        questionMock.mockResolvedValue("docs");

        const result = await selectDemoFromConsole(DEMOS);

        expect(result).toBe("docs");
        expect(closeMock).toHaveBeenCalledOnce();
    });

    it("空输入应抛出 DemoSelectCancelledError", async () => {
        questionMock.mockResolvedValue("   ");

        await expect(selectDemoFromConsole(DEMOS)).rejects.toBeInstanceOf(DemoSelectCancelledError);
        expect(closeMock).toHaveBeenCalledOnce();
    });

    it("无效输入应抛出错误", async () => {
        questionMock.mockResolvedValue("unknown-demo");

        await expect(selectDemoFromConsole(DEMOS)).rejects.toThrow(/Demo not found: unknown-demo/);
        expect(closeMock).toHaveBeenCalledOnce();
    });
});
