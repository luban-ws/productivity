/**
 * console-doctor 测试
 */

import { describe, expect, it, vi } from "vitest";
import { printDoctorReport } from "../console-doctor";
import type { DoctorFinding } from "../../doctor/types";
import { QINGNIAO_LOCALE_ENV } from "../../messages.js";

describe("printDoctorReport", () => {
    it("打印 findings 与修复计数", () => {
        const previous = process.env[QINGNIAO_LOCALE_ENV];
        process.env[QINGNIAO_LOCALE_ENV] = "zh-CN";

        const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
        const findings: DoctorFinding[] = [
            {
                id: "script-format",
                severity: "error",
                category: "Scripts",
                message: '缺少 "format" 脚本',
                hint: "qingniao doctor --fix",
                fixable: true,
            },
        ];

        try {
            printDoctorReport(findings, 1);

            const output = logSpy.mock.calls.map((call) => String(call[0])).join("\n");
            expect(output).toContain("青鸟 Doctor");
            expect(output).toContain("已自动修复 1 项");
            expect(output).toContain('缺少 "format" 脚本');
        } finally {
            logSpy.mockRestore();
            if (previous === undefined) {
                delete process.env[QINGNIAO_LOCALE_ENV];
            } else {
                process.env[QINGNIAO_LOCALE_ENV] = previous;
            }
        }
    });
});
