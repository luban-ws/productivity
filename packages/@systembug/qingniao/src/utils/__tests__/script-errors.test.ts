/**
 * script-errors 工具测试
 */

import { describe, expect, it } from "vitest";
import {
    extractMissingScriptName,
    formatMissingScriptMessage,
    isMissingNpmScript,
    isMissingScriptError,
    toPublishErrorMessage,
} from "../script-errors";

describe("isMissingScriptError", () => {
    it("识别 pnpm 缺失脚本错误", () => {
        const raw =
            'ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL\u2009 Command "format" not found';
        expect(isMissingScriptError(raw)).toBe(true);
    });

    it("识别 npm Missing script 错误", () => {
        expect(isMissingScriptError('Missing script: "lint"')).toBe(true);
    });

    it("非缺失脚本错误返回 false", () => {
        expect(isMissingScriptError("lint failed with 3 errors")).toBe(false);
    });
});

describe("extractMissingScriptName", () => {
    it("从 pnpm 输出提取脚本名", () => {
        const raw = 'ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "format" not found';
        expect(extractMissingScriptName(raw)).toBe("format");
    });

    it("从 npm 输出提取脚本名", () => {
        expect(extractMissingScriptName('Missing script: "typecheck"')).toBe("typecheck");
    });
});

describe("formatMissingScriptMessage", () => {
    it("输出可读提示", () => {
        const previous = process.env.QINGNIAO_LANG;
        process.env.QINGNIAO_LANG = "zh-CN";
        try {
            const message = formatMissingScriptMessage("format");
            expect(message).toContain('缺少 npm 脚本 "format"');
            expect(message).toContain("qingniao doctor --fix");
            expect(message).not.toContain("ELIFECYCLE");
        } finally {
            if (previous === undefined) {
                delete process.env.QINGNIAO_LANG;
            } else {
                process.env.QINGNIAO_LANG = previous;
            }
        }
    });
});

describe("toPublishErrorMessage", () => {
    it("将 pnpm 错误转为可读消息", () => {
        const previous = process.env.QINGNIAO_LANG;
        process.env.QINGNIAO_LANG = "zh-CN";
        try {
            const error = new Error(
                'ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "format" not found\nELIFECYCLE Command failed',
            );
            const message = toPublishErrorMessage(error, "format");
            expect(message).toBe(formatMissingScriptMessage("format"));
        } finally {
            if (previous === undefined) {
                delete process.env.QINGNIAO_LANG;
            } else {
                process.env.QINGNIAO_LANG = previous;
            }
        }
    });

    it("非缺失脚本错误返回 fallback", () => {
        expect(toPublishErrorMessage(new Error("boom"), "lint 失败")).toBe("lint 失败");
    });
});

describe("isMissingNpmScript", () => {
    it("兼容旧 API", () => {
        expect(isMissingNpmScript('Command "test" not found')).toBe(true);
    });
});
