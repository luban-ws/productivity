/**
 * doctor fixes 测试
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, describe, expect, it } from "vitest";
import { applyDoctorFixes } from "../fixes";
import type { DoctorFinding } from "../types";

function createTempRoot(): string {
    const dir = join(tmpdir(), `qingniao-doctor-fix-${Date.now()}-${Math.random()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
        join(dir, "package.json"),
        `${JSON.stringify({ name: "temp-root", private: true, scripts: {} }, null, 2)}\n`,
        "utf-8",
    );
    return dir;
}

describe("applyDoctorFixes", () => {
    let tempDir = "";

    afterEach(() => {
        if (tempDir && existsSync(tempDir)) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("自动补全缺失 scripts 并写入 qingniao.config.json", () => {
        tempDir = createTempRoot();
        const findings: DoctorFinding[] = [
            {
                id: "script-format",
                severity: "error",
                category: "Scripts",
                message: '缺少 "format" 脚本',
                fixable: true,
            },
            {
                id: "qingniao-config",
                severity: "warn",
                category: "Config",
                message: "缺少 qingniao.config.json",
                fixable: true,
            },
        ];

        const fixed = applyDoctorFixes(tempDir, findings);
        expect(fixed).toContain("script-format");
        expect(fixed).toContain("qingniao-config");

        const pkg = JSON.parse(readFileSync(join(tempDir, "package.json"), "utf-8")) as {
            scripts: Record<string, string>;
        };
        expect(pkg.scripts.format).toContain("prettier");
        expect(existsSync(join(tempDir, "qingniao.config.json"))).toBe(true);
    });
});
