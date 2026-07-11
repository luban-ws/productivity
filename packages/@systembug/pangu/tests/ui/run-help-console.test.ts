/**
 * runHelp 非 TTY 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const printHelpMock = vi.fn();

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => false,
}));

vi.mock("../../src/ui/console-present.js", () => ({
    printHelp: (...args: unknown[]) => printHelpMock(...args),
}));

import { runHelp, runHelpUntilExit } from "../../src/ui/run-help.js";

const DEMO = {
    name: "Site",
    value: "site",
    description: "Site demo",
    package: "@test/site",
};

describe("runHelp console fallback", () => {
    beforeEach(() => {
        printHelpMock.mockClear();
    });

    it("runHelp 应调用 printHelp", async () => {
        await runHelp([DEMO], "pnpm");

        expect(printHelpMock).toHaveBeenCalledOnce();
    });

    it("runHelpUntilExit 应调用 printHelp", () => {
        runHelpUntilExit([DEMO], "pnpm");

        expect(printHelpMock).toHaveBeenCalledOnce();
    });
});
