/**
 * version-strategy 测试
 */

import { describe, expect, it } from "vitest";
import { resolveNonInteractiveVersionMethod } from "../version-strategy";

describe("resolveNonInteractiveVersionMethod", () => {
    it("有待消费 changeset 时使用 changeset", () => {
        expect(resolveNonInteractiveVersionMethod(true, "changeset", true)).toBe("changeset");
    });

    it("有 .changeset 目录但无文件时跳过版本更新", () => {
        expect(resolveNonInteractiveVersionMethod(false, "changeset", true)).toBe("skip");
    });

    it("无 .changeset 目录且 strategy 为 semver 时使用 semver", () => {
        expect(resolveNonInteractiveVersionMethod(false, "semver", false)).toBe("semver");
    });

    it("无 changeset 文件且 strategy 为 manual 时使用 manual", () => {
        expect(resolveNonInteractiveVersionMethod(false, "manual", true)).toBe("manual");
    });
});
