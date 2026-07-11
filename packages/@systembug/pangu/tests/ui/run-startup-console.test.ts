/**
 * runStartup 非 TTY 测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../src/ui/tty.js", () => ({
    isInteractiveTerminal: () => false,
}));

import { runStartup } from "../../src/ui/run-startup.js";
import { StartupFailedError } from "../../src/ui/startup-types.js";

describe("runStartup console fallback", () => {
    beforeEach(() => {
        vi.stubEnv("PANGU_LANG", "en");
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it("应同步 resolve 启动信息", async () => {
        await expect(
            runStartup({
                demoDisplayName: "Site",
                packageName: "@test/site",
                packageManager: "pnpm",
                command: "pnpm dev",
                resolveDirectory: () => "/tmp/pkg",
            }),
        ).resolves.toMatchObject({ packageDirectory: "/tmp/pkg" });
    });

    it("解析失败应 reject StartupFailedError", async () => {
        await expect(
            runStartup({
                demoDisplayName: "Site",
                packageName: "@test/site",
                packageManager: "pnpm",
                command: "pnpm dev",
                resolveDirectory: () => {
                    throw new Error("resolve failed");
                },
            }),
        ).rejects.toBeInstanceOf(StartupFailedError);
    });

    it("非 Error 抛出应转为 StartupFailedError", async () => {
        await expect(
            runStartup({
                demoDisplayName: "Site",
                packageName: "@test/site",
                packageManager: "pnpm",
                command: "pnpm dev",
                resolveDirectory: () => {
                    throw "plain failure";
                },
            }),
        ).rejects.toMatchObject({ message: "plain failure" });
    });
});
