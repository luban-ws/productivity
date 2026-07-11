/**
 * alert-prefixes 测试
 */

import { describe, it, expect } from "vitest";
import { startsWithAlertPrefix, stripLeadingAlertEmoji } from "../../src/ui/alert-prefixes.js";

describe("alert-prefixes", () => {
    it("stripLeadingAlertEmoji 应去掉行首 ❌", () => {
        expect(stripLeadingAlertEmoji("❌ Invalid demo name: dev")).toBe("Invalid demo name: dev");
    });

    it("无前缀时应原样返回", () => {
        expect(stripLeadingAlertEmoji("plain text")).toBe("plain text");
    });

    it("应去掉首尾空白", () => {
        expect(stripLeadingAlertEmoji("\n❌ 无效的 demo 名称: dev\n")).toBe(
            "无效的 demo 名称: dev",
        );
    });

    it("startsWithAlertPrefix 应识别 emoji 开头", () => {
        expect(startsWithAlertPrefix("⚠️ already warned")).toBe(true);
        expect(startsWithAlertPrefix("plain")).toBe(false);
    });
});
