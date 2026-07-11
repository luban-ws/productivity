/**
 * startup-types 测试
 */

import { describe, it, expect } from "vitest";
import { StartupFailedError, isStartupFailedError } from "../../src/ui/startup-types.js";

describe("startup-types", () => {
    it("StartupFailedError 应有正确 name", () => {
        const error = new StartupFailedError("failed");
        expect(error.name).toBe("StartupFailedError");
    });

    it("isStartupFailedError 应识别启动失败", () => {
        expect(isStartupFailedError(new StartupFailedError("x"))).toBe(true);
        expect(isStartupFailedError(new Error("x"))).toBe(false);
    });
});
