/**
 * 青鸟 translator 测试
 */

import { describe, expect, it } from "vitest";
import { createTranslator, formatMessage, type MessageCatalog } from "../src/i18n/translator.js";

const CATALOG: MessageCatalog<"greet"> = {
    en: { greet: "Hello {name}" },
    zh: { greet: "你好 {name}" },
};

describe("qingniao i18n translator", () => {
    it("formatMessage 应替换占位符", () => {
        expect(formatMessage("Hello {name}", { name: "Qingniao" })).toBe("Hello Qingniao");
    });

    it("固定 zh locale", () => {
        const translate = createTranslator(CATALOG, { locale: "zh" });
        expect(translate("greet", { name: "青鸟" })).toBe("你好 青鸟");
    });

    it("QINGNIAO_LANG override", () => {
        const translate = createTranslator(CATALOG, {
            env: { QINGNIAO_LANG: "zh-CN" },
            overrideEnvKeys: ["QINGNIAO_LANG"],
        });
        expect(translate("greet", { name: "x" })).toBe("你好 x");
    });
});
