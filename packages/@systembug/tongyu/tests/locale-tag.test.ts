/**
 * locale 标签工具测试
 */

import { describe, it, expect } from "vitest";
import {
    isChineseLocale,
    localeTagToSupported,
    normalizeLocaleTag,
} from "../src/locale-tag.js";

describe("locale-tag", () => {
    describe("normalizeLocaleTag", () => {
        it("应规范化为小写并用连字符", () => {
            expect(normalizeLocaleTag(" zh_CN ")).toBe("zh-cn");
            expect(normalizeLocaleTag("en-US")).toBe("en-us");
        });
    });

    describe("isChineseLocale", () => {
        it("应识别中文 locale", () => {
            expect(isChineseLocale("zh-CN")).toBe(true);
            expect(isChineseLocale("zh_TW")).toBe(true);
        });

        it("应识别非中文 locale", () => {
            expect(isChineseLocale("en-US")).toBe(false);
            expect(isChineseLocale("ja-JP")).toBe(false);
        });
    });

    describe("localeTagToSupported", () => {
        it("中文应映射为 zh", () => {
            expect(localeTagToSupported("zh-Hans-CN")).toBe("zh");
        });

        it("其他语言应映射为 en", () => {
            expect(localeTagToSupported("fr-FR")).toBe("en");
        });
    });
});
