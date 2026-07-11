/**
 * messages 模块测试
 */

import { describe, expect, it } from "vitest";
import { QINGNIAO_LOCALE_ENV, t } from "../src/messages.js";
import { createTranslator } from "../src/i18n/translator.js";

describe("messages", () => {
    it("QINGNIAO_LANG=zh 应返回中文", () => {
        const translated = withEnv({ [QINGNIAO_LOCALE_ENV]: "zh-CN" }, () =>
            t("noChangesetFilesSkip"),
        );
        expect(translated).toContain("changeset");
        expect(translated).toContain("跳过");
    });

    it("missingScript 应包含脚本名", () => {
        expect(t("missingScript", { script: "format" })).toContain("format");
    });

    it("doctorTitle 英文 locale", () => {
        const title = createTranslator(
            {
                en: { doctorTitle: "Qingniao Doctor" },
                zh: { doctorTitle: "青鸟 Doctor" },
            } as Record<"en" | "zh", Record<"doctorTitle", string>>,
            { locale: "en" },
        )("doctorTitle");
        expect(title).toBe("Qingniao Doctor");
    });
});

function withEnv(env: Record<string, string>, run: () => string): string {
    const backup: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(env)) {
        backup[key] = process.env[key];
        process.env[key] = value;
    }
    try {
        return run();
    } finally {
        for (const [key, value] of Object.entries(backup)) {
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    }
}
