import { describe, expect, it } from "vitest";
import { createPublishStepError } from "../publish-error";

describe("createPublishStepError", () => {
    it("保留失败命令的准确输出", () => {
        const error = new Error(
            "命令执行失败: [格式化代码] 命令: pnpm format\n命令输出:\nprettier: SyntaxError: broken.ts",
        );

        expect(createPublishStepError(error, "format", "Format failed").message).toBe(
            "Format failed\n命令执行失败: [格式化代码] 命令: pnpm format\n命令输出:\nprettier: SyntaxError: broken.ts",
        );
    });

    it("缺少脚本时给出可操作信息", () => {
        const error = new Error('Command "format" not found');

        const message = createPublishStepError(error, "format", "Format failed").message;
        expect(message).toContain('"format"');
        expect(message).toContain("qingniao doctor --fix");
    });
});
