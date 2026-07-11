/**
 * doctor checks 测试
 */

import { describe, expect, it } from "vitest";
import { hasDoctorErrors } from "../checks";
import type { DoctorFinding } from "../types";

describe("hasDoctorErrors", () => {
    const okFinding: DoctorFinding = {
        id: "a",
        severity: "ok",
        category: "Test",
        message: "ok",
        fixable: false,
    };

    const warnFinding: DoctorFinding = {
        id: "b",
        severity: "warn",
        category: "Test",
        message: "warn",
        fixable: false,
    };

    const errorFinding: DoctorFinding = {
        id: "c",
        severity: "error",
        category: "Test",
        message: "error",
        fixable: false,
    };

    it("存在 error 时返回 true", () => {
        expect(hasDoctorErrors([okFinding, errorFinding])).toBe(true);
    });

    it("仅 warning 且非 strict 时返回 false", () => {
        expect(hasDoctorErrors([okFinding, warnFinding])).toBe(false);
    });

    it("strict 模式下 warning 视为失败", () => {
        expect(hasDoctorErrors([okFinding, warnFinding], true)).toBe(true);
    });
});
