/**
 * runHelp 测试
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const runInkTimedScreenMock = vi.fn();
const openInkSessionMock = vi.fn();
const printHelpMock = vi.fn();

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => true,
}));

vi.mock("../../src/ui/ink-session.js", () => ({
    runInkTimedScreen: (renderScreen: () => React.ReactElement, dismissMs: number) => {
        renderScreen();
        runInkTimedScreenMock(renderScreen, dismissMs);
        return Promise.resolve();
    },
    openInkSession: (element: React.ReactElement) => {
        openInkSessionMock(element);
        return { dispose: vi.fn() };
    },
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

describe("runHelp", () => {
    beforeEach(() => {
        runInkTimedScreenMock.mockClear();
        openInkSessionMock.mockClear();
        printHelpMock.mockClear();
    });

    it("runHelp 应通过 runInkTimedScreen 渲染", async () => {
        await runHelp([DEMO], "pnpm");

        expect(runInkTimedScreenMock).toHaveBeenCalledOnce();
    });

    it("runHelp 应支持 showWelcome 选项", async () => {
        await runHelp([DEMO], "pnpm", { showWelcome: false });

        expect(runInkTimedScreenMock).toHaveBeenCalledOnce();
    });

    it("runHelpUntilExit 应用 openInkSession 保持显示", () => {
        runHelpUntilExit([DEMO], "pnpm");

        expect(openInkSessionMock).toHaveBeenCalledOnce();
    });

    it("runHelpUntilExit 应支持 showWelcome 选项", () => {
        runHelpUntilExit([DEMO], "pnpm", { showWelcome: false });

        expect(openInkSessionMock).toHaveBeenCalledOnce();
    });
});
