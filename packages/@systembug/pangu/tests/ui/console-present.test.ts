/**
 * console-present 测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    printAlert,
    printHelp,
    printStartupError,
    printStartupSuccess,
} from "../../src/ui/console-present.js";

describe("console-present", () => {
    beforeEach(() => {
        vi.stubEnv("PANGU_LANG", "en");
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it("printHelp 应输出帮助行", () => {
        printHelp(
            [{ name: "Site", value: "site", description: "demo", package: "@test/site" }],
            "pnpm",
        );

        expect(console.log).toHaveBeenCalled();
    });

    it("printAlert 应输出 error 行", () => {
        printAlert({ variant: "error", title: "fail", lines: ["detail"] });

        expect(console.error).toHaveBeenCalled();
    });

    it("printAlert 已带 emoji 的文案不应重复前缀", () => {
        printAlert({ variant: "error", lines: ["❌ Invalid demo name: dev"] });

        expect(console.error).toHaveBeenCalledWith("❌ Invalid demo name: dev");
    });

    it("printAlert 其它 emoji 开头时不重复前缀", () => {
        printAlert({ variant: "error", lines: ["⚠️ already warned"] });

        expect(console.error).toHaveBeenCalledWith("⚠️ already warned");
    });

    it("printAlert 应输出 warning / success / info 前缀", () => {
        printAlert({ variant: "warning", lines: ["warn"] });
        printAlert({ variant: "success", title: "ok", lines: ["done"] });
        printAlert({ variant: "info", lines: ["note"] });

        expect(console.error).toHaveBeenCalled();
    });

    it("printStartupSuccess 应输出启动信息", () => {
        printStartupSuccess(
            {
                packageDirectory: "/tmp",
                command: "pnpm dev",
                packageManager: "pnpm",
                packageName: "@test/site",
            },
            "Site",
        );

        expect(console.log).toHaveBeenCalled();
    });

    it("printStartupError 应输出错误", () => {
        printStartupError("Site", "resolve failed");

        expect(console.error).toHaveBeenCalled();
    });
});
