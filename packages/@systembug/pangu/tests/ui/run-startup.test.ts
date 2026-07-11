/**
 * runStartup 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";

const unmountMock = vi.fn();
const renderMock = vi.fn();

vi.mock("ink", () => ({
    render: (element: ReactElement, options?: unknown) => {
        renderMock(element, options);
        return { unmount: unmountMock };
    },
}));

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => true,
}));

import { runStartup } from "../../src/ui/run-startup.js";
import { StartupFailedError } from "../../src/ui/startup-types.js";

describe("runStartup", () => {
    beforeEach(() => {
        renderMock.mockClear();
        unmountMock.mockClear();
    });

    it("onReady 应 resolve 并 unmount", async () => {
        renderMock.mockImplementation(
            (element: ReactElement<{ onReady: (payload: unknown) => void }>) => {
                Promise.resolve().then(() => {
                    element.props.onReady({
                        packageDirectory: "/tmp/pkg",
                        command: "pnpm dev",
                        packageManager: "pnpm",
                        packageName: "@test/site",
                    });
                });
                return { unmount: unmountMock };
            },
        );

        await expect(
            runStartup({
                demoDisplayName: "Site",
                packageName: "@test/site",
                packageManager: "pnpm",
                command: "pnpm dev",
                resolveDirectory: () => "/tmp/pkg",
            }),
        ).resolves.toEqual({
            packageDirectory: "/tmp/pkg",
            command: "pnpm dev",
            packageManager: "pnpm",
            packageName: "@test/site",
        });

        expect(unmountMock).toHaveBeenCalledOnce();
    });

    it("onError 应 reject StartupFailedError", async () => {
        renderMock.mockImplementation(
            (element: ReactElement<{ onError: (message: string) => void }>) => {
                Promise.resolve().then(() => {
                    element.props.onError("resolve failed");
                });
                return { unmount: unmountMock };
            },
        );

        await expect(
            runStartup({
                demoDisplayName: "Site",
                packageName: "@test/site",
                packageManager: "pnpm",
                command: "pnpm dev",
                resolveDirectory: () => {
                    throw new Error("unused");
                },
            }),
        ).rejects.toBeInstanceOf(StartupFailedError);
    });
});
