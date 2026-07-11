/**
 * runInvalidDemoScreen 非 TTY 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const printAlertMock = vi.fn();
const printHelpMock = vi.fn();

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => false,
}));

vi.mock("../../src/ui/console-present.js", () => ({
    printAlert: (...args: unknown[]) => printAlertMock(...args),
    printHelp: (...args: unknown[]) => printHelpMock(...args),
}));

import { runInvalidDemoScreen } from "../../src/ui/run-invalid-demo.js";

const DEMO = {
    name: "Site",
    value: "site",
    description: "Site demo",
    package: "@test/site",
};

describe("runInvalidDemoScreen console fallback", () => {
    beforeEach(() => {
        printAlertMock.mockClear();
        printHelpMock.mockClear();
    });

    it("应分别 printAlert 与 printHelp", async () => {
        await runInvalidDemoScreen("bad", [DEMO], "pnpm");

        expect(printAlertMock).toHaveBeenCalledOnce();
        expect(printHelpMock).toHaveBeenCalledOnce();
    });
});
