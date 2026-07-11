/**
 * resolveLocale 测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const osLocaleMock = vi.hoisted(() => vi.fn(() => "en-US"));

vi.mock("os-locale", () => ({
    default: osLocaleMock,
}));

import { getOsLocaleTag, readLocaleOverride, resolveLocale } from "../src/resolve-locale.js";
import { LOCALE_OVERRIDE_ENV } from "../src/constants.js";

describe("resolve-locale", () => {
    beforeEach(() => {
        osLocaleMock.mockReset();
        osLocaleMock.mockReturnValue("en-US");
    });

    describe("readLocaleOverride", () => {
        it("应优先读取 SYSTEMBUG_LOCALE", () => {
            expect(
                readLocaleOverride({
                    [LOCALE_OVERRIDE_ENV]: "zh-CN",
                    PANGU_LANG: "en-US",
                }),
            ).toBe("zh-CN");
        });

        it("应读取工具专属 override key", () => {
            expect(readLocaleOverride({ PANGU_LANG: "zh-TW" }, ["PANGU_LANG"])).toBe("zh-TW");
        });

        it("无覆盖时应返回 undefined", () => {
            expect(readLocaleOverride({})).toBeUndefined();
        });

        it("应忽略空白 env 值", () => {
            expect(readLocaleOverride({ [LOCALE_OVERRIDE_ENV]: "   " })).toBeUndefined();
        });
    });

    describe("resolveLocale", () => {
        it("SYSTEMBUG_LOCALE 应覆盖 os-locale", () => {
            osLocaleMock.mockReturnValue("en-US");
            expect(resolveLocale({ env: { [LOCALE_OVERRIDE_ENV]: "zh-CN" } })).toBe("zh");
        });

        it("工具 overrideEnvKeys 应生效", () => {
            expect(
                resolveLocale({
                    env: { PANGU_LANG: "zh-CN" },
                    overrideEnvKeys: ["PANGU_LANG"],
                }),
            ).toBe("zh");
        });

        it("无覆盖时应使用 os-locale", () => {
            osLocaleMock.mockReturnValue("zh-CN");
            expect(resolveLocale({ env: {} })).toBe("zh");

            osLocaleMock.mockReturnValue("ja-JP");
            expect(resolveLocale({ env: {} })).toBe("en");
        });

        it("未传 env 时应回退到 process.env", () => {
            const original = process.env[LOCALE_OVERRIDE_ENV];
            delete process.env[LOCALE_OVERRIDE_ENV];
            osLocaleMock.mockReturnValue("zh-CN");

            try {
                expect(resolveLocale()).toBe("zh");
            } finally {
                if (original === undefined) {
                    delete process.env[LOCALE_OVERRIDE_ENV];
                } else {
                    process.env[LOCALE_OVERRIDE_ENV] = original;
                }
            }
        });

        it("osLocaleTag 注入应跳过 os-locale 调用", () => {
            expect(resolveLocale({ env: {}, osLocaleTag: "zh-HK" })).toBe("zh");
            expect(osLocaleMock).not.toHaveBeenCalled();
        });
    });

    describe("getOsLocaleTag", () => {
        it("应返回 os-locale 结果", () => {
            osLocaleMock.mockReturnValue("en-GB");
            expect(getOsLocaleTag()).toBe("en-GB");
        });

        it("应支持注入 osLocaleTag", () => {
            expect(getOsLocaleTag({ osLocaleTag: "zh-CN" })).toBe("zh-CN");
            expect(osLocaleMock).not.toHaveBeenCalled();
        });
    });
});
