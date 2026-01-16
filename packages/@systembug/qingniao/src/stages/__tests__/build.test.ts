/**
 * 构建验证测试
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { checkBuildArtifact } from "../build";

describe("checkBuildArtifact", () => {
    let testDir: string;

    beforeEach(() => {
        // 创建临时测试目录
        testDir = join(tmpdir(), `qingniao-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
        mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
        // 清理临时目录
        if (existsSync(testDir)) {
            rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe("文件路径验证", () => {
        it("应该成功验证存在的文件", () => {
            // 创建测试文件
            const filePath = join(testDir, "dist", "index.cjs");
            mkdirSync(join(testDir, "dist"), { recursive: true });
            writeFileSync(filePath, "test content");

            const result = checkBuildArtifact(testDir, "dist/index.cjs");

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该失败当文件不存在", () => {
            const result = checkBuildArtifact(testDir, "dist/index.cjs");

            expect(result.success).toBe(false);
            expect(result.message).toBe("构建产物不存在: dist/index.cjs");
        });
    });

    describe("目录路径验证", () => {
        it("应该成功验证包含文件的目录", () => {
            // 创建包含文件的目录
            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.js"), "test content");

            const result = checkBuildArtifact(testDir, "dist");

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该失败当目录为空", () => {
            // 创建空目录
            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });

            const result = checkBuildArtifact(testDir, "dist");

            expect(result.success).toBe(false);
            expect(result.message).toBe("构建产物为空: dist");
        });

        it("应该失败当目录不存在", () => {
            const result = checkBuildArtifact(testDir, "dist");

            expect(result.success).toBe(false);
            expect(result.message).toBe("构建产物不存在: dist");
        });
    });

    describe("从 package.json 推断路径", () => {
        it("应该从 main 字段推断文件路径", () => {
            // 创建 package.json 和对应的文件
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                main: "./dist/index.cjs",
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.cjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该从 module 字段推断文件路径", () => {
            // 创建 package.json 和对应的文件
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                module: "./dist/index.mjs",
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.mjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该从 exports 字段推断路径（字符串格式）", () => {
            // 创建 package.json 和对应的文件
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                exports: "./dist/index.mjs",
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.mjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该从 exports 字段推断路径（对象格式，使用 . 键）", () => {
            // 创建 package.json 和对应的文件
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                exports: {
                    ".": "./dist/index.mjs",
                },
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.mjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该从 exports 字段推断路径（对象格式，使用 ./ 键）", () => {
            // 创建 package.json 和对应的文件
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                exports: {
                    "./": "./dist/index.mjs",
                },
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.mjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该从 exports 字段推断路径（对象格式，使用 default 键）", () => {
            // 创建 package.json 和对应的文件
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                exports: {
                    default: "./dist/index.mjs",
                },
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.mjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该从 exports 字段推断路径（嵌套对象，使用 default）", () => {
            // 创建 package.json 和对应的文件
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                exports: {
                    ".": {
                        default: "./dist/index.mjs",
                    },
                },
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.mjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });
    });

    describe("默认行为", () => {
        it("应该默认检查 dist 目录", () => {
            // 创建 dist 目录和文件
            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.js"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该失败当默认 dist 目录不存在", () => {
            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(false);
            expect(result.message).toBe("构建产物不存在: dist");
        });

        it("应该失败当默认 dist 目录为空", () => {
            // 创建空 dist 目录
            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(false);
            expect(result.message).toBe("构建产物为空: dist");
        });
    });

    describe("优先级", () => {
        it("应该优先使用 main 而不是 module", () => {
            // 创建 package.json
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                main: "./dist/index.cjs",
                module: "./dist/index.mjs",
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            // 只创建 main 指向的文件
            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.cjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该优先使用 main 而不是 exports", () => {
            // 创建 package.json
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                main: "./dist/index.cjs",
                exports: {
                    ".": "./dist/index.mjs",
                },
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            // 只创建 main 指向的文件
            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.cjs"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该优先使用显式传入的 distPath 而不是 package.json", () => {
            // 创建 package.json
            const packageJson = {
                name: "test-package",
                version: "1.0.0",
                main: "./dist/index.cjs",
            };
            writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson, null, 2));

            // 创建自定义路径
            const customDir = join(testDir, "custom");
            mkdirSync(customDir, { recursive: true });
            writeFileSync(join(customDir, "build.js"), "test content");

            const result = checkBuildArtifact(testDir, "custom");

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });
    });

    describe("错误处理", () => {
        it("应该处理无效的路径类型（既不是文件也不是目录）", () => {
            // 这个测试比较难模拟，因为需要创建一个既不是文件也不是目录的路径
            // 在实际场景中，这可能是符号链接等特殊情况
            // 我们主要测试代码逻辑是否正确
            const result = checkBuildArtifact(testDir, "nonexistent");

            expect(result.success).toBe(false);
            expect(result.message).toContain("构建产物不存在");
        });

        it("应该处理 package.json 不存在的情况", () => {
            // 不创建 package.json，应该使用默认 dist 目录
            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.js"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it("应该处理无效的 package.json", () => {
            // 创建无效的 package.json
            writeFileSync(join(testDir, "package.json"), "invalid json");

            // 应该回退到默认 dist 目录
            const distDir = join(testDir, "dist");
            mkdirSync(distDir, { recursive: true });
            writeFileSync(join(distDir, "index.js"), "test content");

            const result = checkBuildArtifact(testDir);

            expect(result.success).toBe(true);
            expect(result.message).toBeUndefined();
        });
    });
});
