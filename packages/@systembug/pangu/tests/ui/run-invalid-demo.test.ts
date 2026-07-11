/**
 * runInvalidDemoScreen 测试
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const runInkTimedScreenMock = vi.fn();

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => true,
}));

vi.mock("../../src/ui/ink-session.js", () => ({
    runInkTimedScreen: (renderScreen: () => React.ReactElement, dismissMs: number) => {
        runInkTimedScreenMock(renderScreen, dismissMs);
        return Promise.resolve();
    },
}));

import { runInvalidDemoScreen } from "../../src/ui/run-invalid-demo.js";

const DEMO = {
    name: "Site",
    value: "site",
    description: "Site demo",
    package: "@test/site",
};

describe("runInvalidDemoScreen", () => {
    beforeEach(() => {
        runInkTimedScreenMock.mockClear();
        vi.stubEnv("PANGU_LANG", "en");
    });

    it("应单屏展示错误与帮助", async () => {
        await runInvalidDemoScreen("invalid demo", [DEMO], "pnpm");

        expect(runInkTimedScreenMock).toHaveBeenCalledOnce();
    });
});
