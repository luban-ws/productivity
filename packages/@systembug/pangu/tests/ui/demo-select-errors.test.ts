/**
 * demo 选择错误类型测试
 */

import { describe, it, expect } from "vitest";
import {
    DemoSelectCancelledError,
    isDemoSelectCancelledError,
} from "../../src/ui/demo-select-errors.js";

describe("demo-select-errors", () => {
    it("DemoSelectCancelledError 应有正确 name", () => {
        const error = new DemoSelectCancelledError();
        expect(error.name).toBe("DemoSelectCancelledError");
    });

    it("isDemoSelectCancelledError 应识别取消错误", () => {
        expect(isDemoSelectCancelledError(new DemoSelectCancelledError())).toBe(true);
        expect(isDemoSelectCancelledError(new Error("other"))).toBe(false);
        expect(isDemoSelectCancelledError("plain")).toBe(false);
    });
});
