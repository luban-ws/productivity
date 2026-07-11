/**
 * messages 模块测试
 */

import { describe, it, expect } from "vitest";
import { getShutdownMessage, t, PANGU_LOCALE_ENV } from "../src/messages.js";

describe("messages", () => {
    it("getShutdownMessage 指定 zh 应返回中文", () => {
        expect(getShutdownMessage("zh")).toContain("开发服务器");
    });

    it("getShutdownMessage 无参数应返回文案", () => {
        const message = getShutdownMessage();
        expect(message.length).toBeGreaterThan(0);
    });

    it("t 应支持 PANGU_LANG 覆盖", () => {
        const translated = createTranslatorWithEnv({ [PANGU_LOCALE_ENV]: "zh-CN" });
        expect(translated).toContain("开发服务器");
    });

    it("t 应能翻译带参数文案", () => {
        expect(t("demoNotFound", { demo: "foo" })).toContain("foo");
    });

    it("应包含 uiSelectHint 文案", () => {
        expect(t("uiSelectHint")).toContain("Enter");
    });

    it("welcome 应展示盘古品牌而非 projectName", () => {
        expect(t("welcome")).toContain("Pangu");
        expect(t("welcome")).not.toContain("鲁班工坊");
    });

    it("supportedBy 应包含署名", () => {
        expect(t("supportedBy", { name: "鲁班工坊" })).toContain("鲁班工坊");
    });
});

function createTranslatorWithEnv(env: Record<string, string>): string {
    const original = process.env[PANGU_LOCALE_ENV];
    process.env[PANGU_LOCALE_ENV] = env[PANGU_LOCALE_ENV];
    try {
        return t("shutdown");
    } finally {
        if (original === undefined) {
            delete process.env[PANGU_LOCALE_ENV];
        } else {
            process.env[PANGU_LOCALE_ENV] = original;
        }
    }
}
