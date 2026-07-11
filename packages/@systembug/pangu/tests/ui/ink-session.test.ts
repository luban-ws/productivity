/**
 * ink-session 测试
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const unmountMock = vi.fn();
const renderMock = vi.fn();

vi.mock("ink", () => ({
    render: (element: React.ReactElement, options?: unknown) => {
        renderMock(element, options);
        return { unmount: unmountMock };
    },
}));

import {
    openInkSession,
    runInkScreen,
    runInkScreenTimed,
    runInkTimedScreen,
} from "../../src/ui/ink-session.js";

describe("ink-session", () => {
    beforeEach(() => {
        renderMock.mockClear();
        unmountMock.mockClear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("openInkSession dispose 应 unmount", () => {
        const session = openInkSession(React.createElement("span", null, "test"));
        session.dispose();

        expect(unmountMock).toHaveBeenCalledOnce();
    });

    it("runInkScreen 应在 done 后 unmount", async () => {
        const promise = runInkScreen(({ done }) => {
            Promise.resolve().then(() => {
                done();
            });
            return React.createElement("span", null, "x");
        });

        await Promise.resolve();
        await promise;

        expect(unmountMock).toHaveBeenCalledOnce();
    });

    it("runInkScreenTimed 应在超时后 unmount", async () => {
        const promise = runInkScreenTimed(() => React.createElement("span", null, "timed"), 50);

        vi.advanceTimersByTime(50);
        await promise;

        expect(unmountMock).toHaveBeenCalledOnce();
    });

    it("runInkTimedScreen 应委托 runInkScreenTimed", async () => {
        const promise = runInkTimedScreen(() => React.createElement("span", null, "wrapped"), 30);

        vi.advanceTimersByTime(30);
        await promise;

        expect(unmountMock).toHaveBeenCalledOnce();
    });
});
