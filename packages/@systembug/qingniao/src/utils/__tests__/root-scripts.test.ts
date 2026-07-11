/**
 * root-scripts 工具测试
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, describe, expect, it } from "vitest";
import {
    listMissingRootScripts,
    mergeRootScripts,
    readRootScripts,
    RELEASE_SCRIPT_NAME,
    suggestDefaultScripts,
} from "../root-scripts";

function createTempRoot(scripts: Record<string, string> = {}): string {
    const dir = join(tmpdir(), `qingniao-root-scripts-${Date.now()}-${Math.random()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
        join(dir, "package.json"),
        `${JSON.stringify({ name: "temp-root", private: true, scripts }, null, 2)}\n`,
        "utf-8",
    );
    return dir;
}

describe("readRootScripts", () => {
    let tempDir = "";

    afterEach(() => {
        if (tempDir && existsSync(tempDir)) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("读取 scripts 字段", () => {
        tempDir = createTempRoot({ lint: "turbo run lint" });
        expect(readRootScripts(tempDir)).toEqual({ lint: "turbo run lint" });
    });

    it("无 scripts 时返回空对象", () => {
        tempDir = createTempRoot();
        expect(readRootScripts(tempDir)).toEqual({});
    });
});

describe("listMissingRootScripts", () => {
    let tempDir = "";

    afterEach(() => {
        if (tempDir && existsSync(tempDir)) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("列出缺失的必需 scripts", () => {
        tempDir = createTempRoot({ lint: "turbo run lint" });
        const missing = listMissingRootScripts(tempDir);
        expect(missing).toContain("format");
        expect(missing).toContain(RELEASE_SCRIPT_NAME);
        expect(missing).not.toContain("lint");
    });
});

describe("suggestDefaultScripts", () => {
    let tempDir = "";

    afterEach(() => {
        if (tempDir && existsSync(tempDir)) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("生成默认 release 脚本", () => {
        tempDir = createTempRoot();
        const defaults = suggestDefaultScripts(tempDir);
        expect(defaults[RELEASE_SCRIPT_NAME]).toBe("qingniao");
        expect(defaults.format).toContain("prettier");
    });
});

describe("mergeRootScripts", () => {
    let tempDir = "";

    afterEach(() => {
        if (tempDir && existsSync(tempDir)) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it("合并缺失 scripts 且不覆盖已有项", () => {
        tempDir = createTempRoot({ lint: "existing-lint" });
        const added = mergeRootScripts(tempDir, {
            lint: "new-lint",
            format: "prettier --write .",
        });
        expect(added).toEqual(["format"]);
        expect(readRootScripts(tempDir).lint).toBe("existing-lint");
        expect(readRootScripts(tempDir).format).toBe("prettier --write .");
    });
});
