/**
 * runAlert 非 TTY 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const printAlertMock = vi.fn();

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => false,
}));

vi.mock("../../src/ui/console-present.js", () => ({
    printAlert: (...args: unknown[]) => printAlertMock(...args),
}));

import { runAlert } from "../../src/ui/run-alert.js";

describe("runAlert console fallback", () => {
    beforeEach(() => {
        printAlertMock.mockClear();
    });

    it("应调用 printAlert", async () => {
        await runAlert({ variant: "info", lines: ["ok"] });

        expect(printAlertMock).toHaveBeenCalledOnce();
    });
});
