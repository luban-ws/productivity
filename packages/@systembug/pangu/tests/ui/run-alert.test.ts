/**
 * runAlert 测试
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEFAULT_ALERT_DISMISS_MS } from "../../src/ui/run-alert.js";

const runInkTimedScreenMock = vi.fn();
const printAlertMock = vi.fn();

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => true,
}));

vi.mock("../../src/ui/ink-session.js", () => ({
    runInkTimedScreen: (renderScreen: () => React.ReactElement, dismissMs: number) => {
        runInkTimedScreenMock(renderScreen, dismissMs);
        return Promise.resolve();
    },
}));

vi.mock("../../src/ui/console-present.js", () => ({
    printAlert: (...args: unknown[]) => printAlertMock(...args),
}));

import { runAlert } from "../../src/ui/run-alert.js";

describe("runAlert", () => {
    beforeEach(() => {
        runInkTimedScreenMock.mockClear();
        printAlertMock.mockClear();
    });

    it("TTY 下应使用 runInkTimedScreen", async () => {
        await runAlert({
            variant: "error",
            lines: ["boom"],
        });

        expect(runInkTimedScreenMock).toHaveBeenCalledWith(
            expect.any(Function),
            DEFAULT_ALERT_DISMISS_MS,
        );

        const renderScreen = runInkTimedScreenMock.mock.calls[0][0] as () => React.ReactElement;
        renderScreen();
    });
});
