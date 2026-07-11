/**
 * 配置模块测试
 * @description 测试 loadConfig 和 getDemoOptions 函数
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { join } from "path";
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync, existsSync } from "fs";
import * as fs from "fs";

// 测试用临时目录
const TEST_DIR = join(process.cwd(), ".test-temp");

/**
 * 创建测试目录
 */
function setupTestDir(): void {
    if (!existsSync(TEST_DIR)) {
        mkdirSync(TEST_DIR, { recursive: true });
    }
}

/**
 * 清理测试目录
 */
function cleanupTestDir(): void {
    if (existsSync(TEST_DIR)) {
        // 删除目录中的所有配置文件
        const files = [
            "dev.config.json",
            "dev.config.yaml",
            "dev.config.yml",
            "pangu.config.json",
            "pangu.config.yaml",
            "pangu.config.yml",
        ];
        files.forEach((file) => {
            const filePath = join(TEST_DIR, file);
            if (existsSync(filePath)) {
                unlinkSync(filePath);
            }
        });
        rmdirSync(TEST_DIR);
    }
}

describe("config 模块", () => {
    beforeEach(() => {
        setupTestDir();
    });

    afterEach(() => {
        cleanupTestDir();
        vi.restoreAllMocks();
    });

    describe("loadConfig", () => {
        it("应该在没有配置文件时返回默认配置", async () => {
            // 动态导入以避免模块缓存问题
            const { loadConfig } = await import("../src/config.js");

            // 模拟 console.warn
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            const config = loadConfig(TEST_DIR);

            // 验证返回默认配置
            expect(config).toEqual({
                projectName: "quizerjs",
                packageManager: "pnpm",
                demos: [],
            });

            // 验证警告被输出
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("未找到"));
        });

        it("应该正确读取 JSON 配置文件", async () => {
            const { loadConfig } = await import("../src/config.js");

            // 创建测试配置文件
            const testConfig = {
                projectName: "test-project",
                packageManager: "npm",
                demos: [
                    {
                        name: "Test Demo",
                        value: "test",
                        description: "测试演示",
                        package: "@test/demo",
                    },
                ],
            };

            writeFileSync(join(TEST_DIR, "dev.config.json"), JSON.stringify(testConfig, null, 2));

            const config = loadConfig(TEST_DIR);

            // 验证配置被正确读取
            expect(config.projectName).toBe("test-project");
            expect(config.packageManager).toBe("npm");
            expect(config.demos).toHaveLength(1);
            expect(config.demos[0].name).toBe("Test Demo");
        });

        it("应该正确读取 YAML 配置文件", async () => {
            const { loadConfig } = await import("../src/config.js");

            // 创建 YAML 配置文件
            const yamlContent = `
projectName: yaml-project
packageManager: yarn
demos:
  - name: YAML Demo
    value: yaml-demo
    description: YAML 测试演示
    package: "@test/yaml-demo"
`;

            writeFileSync(join(TEST_DIR, "dev.config.yaml"), yamlContent);

            const config = loadConfig(TEST_DIR);

            // 验证配置被正确读取
            expect(config.projectName).toBe("yaml-project");
            expect(config.packageManager).toBe("yarn");
            expect(config.demos).toHaveLength(1);
            expect(config.demos[0].name).toBe("YAML Demo");
        });

        it("YAML 配置文件优先级应高于 JSON", async () => {
            const { loadConfig } = await import("../src/config.js");

            // 创建两个配置文件
            const jsonConfig = {
                projectName: "json-project",
                packageManager: "npm",
                demos: [
                    { name: "JSON", value: "json", description: "JSON", package: "@test/json" },
                ],
            };

            const yamlContent = `
projectName: yaml-project
packageManager: pnpm
demos:
  - name: YAML
    value: yaml
    description: YAML
    package: "@test/yaml"
`;

            writeFileSync(join(TEST_DIR, "dev.config.json"), JSON.stringify(jsonConfig));
            writeFileSync(join(TEST_DIR, "dev.config.yaml"), yamlContent);

            const config = loadConfig(TEST_DIR);

            // 验证 YAML 配置优先
            expect(config.projectName).toBe("yaml-project");
        });

        it("pangu.config.json 优先级应高于 dev.config.json", async () => {
            const { loadConfig } = await import("../src/config.js");

            // 创建两个配置文件
            const devConfig = {
                projectName: "dev-project",
                packageManager: "npm",
                demos: [
                    { name: "Dev Demo", value: "dev", description: "Dev", package: "@test/dev" },
                ],
            };

            const panguConfig = {
                projectName: "pangu-project",
                packageManager: "pnpm",
                demos: [
                    {
                        name: "Pangu Demo",
                        value: "pangu",
                        description: "Pangu",
                        package: "@test/pangu",
                    },
                ],
            };

            writeFileSync(join(TEST_DIR, "dev.config.json"), JSON.stringify(devConfig));
            writeFileSync(join(TEST_DIR, "pangu.config.json"), JSON.stringify(panguConfig));

            const config = loadConfig(TEST_DIR);

            // 验证 pangu.config.json 优先
            expect(config.projectName).toBe("pangu-project");
            expect(config.packageManager).toBe("pnpm");
            expect(config.demos[0].name).toBe("Pangu Demo");
        });

        it("应该在配置文件格式错误时返回默认配置", async () => {
            const { loadConfig } = await import("../src/config.js");

            // 模拟 console 输出
            vi.spyOn(console, "error").mockImplementation(() => {});
            vi.spyOn(console, "warn").mockImplementation(() => {});

            // 创建无效的 JSON 文件
            writeFileSync(join(TEST_DIR, "dev.config.json"), "{ invalid json }");

            const config = loadConfig(TEST_DIR);

            // 验证返回默认配置
            expect(config.demos).toEqual([]);
        });

        it("应该验证 demos 数组存在", async () => {
            const { loadConfig } = await import("../src/config.js");

            // 模拟 console 输出
            vi.spyOn(console, "error").mockImplementation(() => {});
            vi.spyOn(console, "warn").mockImplementation(() => {});

            // 创建缺少 demos 的配置
            writeFileSync(
                join(TEST_DIR, "dev.config.json"),
                JSON.stringify({ projectName: "test" }),
            );

            const config = loadConfig(TEST_DIR);

            // 验证返回默认配置
            expect(config.demos).toEqual([]);
        });

        it("应该验证每个 demo 的必需字段", async () => {
            const { loadConfig } = await import("../src/config.js");

            vi.spyOn(console, "error").mockImplementation(() => {});
            vi.spyOn(console, "warn").mockImplementation(() => {});

            writeFileSync(
                join(TEST_DIR, "dev.config.json"),
                JSON.stringify({
                    demos: [{ name: "Test" }],
                }),
            );

            const config = loadConfig(TEST_DIR);

            expect(config.demos).toEqual([]);
        });

        it("应该接受带 args 数组的有效 demo", async () => {
            const { loadConfig } = await import("../src/config.js");

            writeFileSync(
                join(TEST_DIR, "dev.config.json"),
                JSON.stringify({
                    demos: [
                        {
                            name: "Test",
                            value: "test",
                            package: "@test/pkg",
                            args: ["run", "dev"],
                        },
                    ],
                }),
            );

            const config = loadConfig(TEST_DIR);

            expect(config.demos[0].args).toEqual(["run", "dev"]);
        });

        it("demos 非数组时应返回默认配置", async () => {
            const { loadConfig } = await import("../src/config.js");

            vi.spyOn(console, "error").mockImplementation(() => {});
            vi.spyOn(console, "warn").mockImplementation(() => {});

            writeFileSync(
                join(TEST_DIR, "dev.config.json"),
                JSON.stringify({ demos: "not-array" }),
            );

            const config = loadConfig(TEST_DIR);

            expect(config.demos).toEqual([]);
        });

        it("应该验证 demo 的 args 必须是数组", async () => {
            const { loadConfig } = await import("../src/config.js");

            vi.spyOn(console, "error").mockImplementation(() => {});
            vi.spyOn(console, "warn").mockImplementation(() => {});

            writeFileSync(
                join(TEST_DIR, "dev.config.json"),
                JSON.stringify({
                    demos: [{ name: "Test", value: "test", package: "@test/pkg", args: "bad" }],
                }),
            );

            const config = loadConfig(TEST_DIR);

            expect(config.demos).toEqual([]);
        });

        it("应该读取 pangu.config.yml", async () => {
            const { loadConfig } = await import("../src/config.js");

            const yamlContent = `
projectName: yml-project
demos:
  - name: YML Demo
    value: yml
    description: yml demo
    package: "@test/yml"
`;

            writeFileSync(join(TEST_DIR, "pangu.config.yml"), yamlContent);

            const config = loadConfig(TEST_DIR);

            expect(config.projectName).toBe("yml-project");
            expect(config.demos[0].value).toBe("yml");
        });

        it("非 Error 异常时应使用 String 转换", async () => {
            const { loadConfig } = await import("../src/config.js");

            vi.spyOn(console, "error").mockImplementation(() => {});
            vi.spyOn(console, "warn").mockImplementation(() => {});

            writeFileSync(join(TEST_DIR, "dev.config.json"), "{}");

            vi.spyOn(fs, "readFileSync").mockImplementation(() => {
                throw "plain-error";
            });

            const config = loadConfig(TEST_DIR);

            expect(config.demos).toEqual([]);
        });
    });

    describe("getDemoOptions", () => {
        it("应该返回配置中的 demos 数组", async () => {
            const { getDemoOptions } = await import("../src/config.js");

            const mockConfig = {
                projectName: "test",
                demos: [
                    {
                        name: "Demo 1",
                        value: "demo1",
                        description: "演示 1",
                        package: "@test/demo1",
                    },
                    {
                        name: "Demo 2",
                        value: "demo2",
                        description: "演示 2",
                        package: "@test/demo2",
                    },
                ],
            };

            const demos = getDemoOptions(mockConfig);

            expect(demos).toHaveLength(2);
            expect(demos[0].name).toBe("Demo 1");
            expect(demos[1].name).toBe("Demo 2");
        });

        it("应该在 demos 不存在时返回空数组", async () => {
            const { getDemoOptions } = await import("../src/config.js");

            // @ts-expect-error 测试边界情况
            const demos = getDemoOptions({ projectName: "test" });

            expect(demos).toEqual([]);
        });
    });
});
