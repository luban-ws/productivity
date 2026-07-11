/**
 * loadConfig catch 分支：非 Error 异常路径
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { join } from "path";
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync, existsSync } from "fs";

vi.mock("js-yaml", () => ({
    default: {
        load: () => {
            throw "plain-yaml-error";
        },
    },
}));

const TEST_DIR = join(process.cwd(), ".test-temp-non-error");

function setupTestDir(): void {
    if (!existsSync(TEST_DIR)) {
        mkdirSync(TEST_DIR, { recursive: true });
    }
}

function cleanupTestDir(): void {
    if (existsSync(TEST_DIR)) {
        const filePath = join(TEST_DIR, "dev.config.yaml");
        if (existsSync(filePath)) {
            unlinkSync(filePath);
        }
        rmdirSync(TEST_DIR);
    }
}

describe("loadConfig 非 Error 异常", () => {
    beforeEach(() => {
        setupTestDir();
    });

    afterEach(() => {
        cleanupTestDir();
        vi.restoreAllMocks();
    });

    it("catch 到非 Error 时应走 String(error) 分支", async () => {
        const { loadConfig } = await import("../src/config.js");

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});

        writeFileSync(join(TEST_DIR, "dev.config.yaml"), "demos: []");

        const config = loadConfig(TEST_DIR);

        expect(config.demos).toEqual([]);
        expect(errorSpy).toHaveBeenCalledWith("plain-yaml-error");
    });
});
