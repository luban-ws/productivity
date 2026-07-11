/**
 * 盘古本地 translator 测试
 */

import { describe, it, expect } from "vitest";
import { createTranslator, formatMessage, type MessageCatalog } from "../src/i18n/translator.js";

const CATALOG: MessageCatalog<"greet" | "bye"> = {
    en: {
        greet: "Hello {name}",
        bye: "Goodbye",
    },
    zh: {
        greet: "你好 {name}",
        bye: "再见",
    },
};

describe("pangu i18n translator", () => {
    describe("formatMessage", () => {
        it("应替换占位符", () => {
            expect(formatMessage("Hello {name}", { name: "Pangu" })).toBe("Hello Pangu");
        });
    });

    describe("createTranslator", () => {
        it("固定英文 locale 应返回英文文案", () => {
            const t = createTranslator(CATALOG, { locale: "en" });
            expect(t("greet", { name: "Pangu" })).toBe("Hello Pangu");
        });

        it("固定中文 locale 应返回中文文案", () => {
            const t = createTranslator(CATALOG, { locale: "zh" });
            expect(t("bye")).toBe("再见");
        });

        it("SYSTEMBUG_LOCALE 应覆盖默认检测", () => {
            const t = createTranslator(CATALOG, {
                env: { SYSTEMBUG_LOCALE: "zh-CN" },
            });
            expect(t("bye")).toBe("再见");
        });

        it("PANGU_LANG overrideEnvKeys 应生效", () => {
            const t = createTranslator(CATALOG, {
                env: { PANGU_LANG: "zh-CN" },
                overrideEnvKeys: ["PANGU_LANG"],
            });
            expect(t("greet", { name: "盘古" })).toBe("你好 盘古");
        });
    });
});
