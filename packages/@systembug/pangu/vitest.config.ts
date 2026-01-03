/**
 * Vitest 配置文件
 * @description 为 @systembug/pangu 包配置测试环境
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // 测试环境设置
        environment: "node",

        // 测试文件匹配模式
        include: ["tests/**/*.test.ts"],

        // 覆盖率配置
        coverage: {
            // 覆盖率报告输出目录
            reportsDirectory: "./coverage",

            // 需要统计覆盖率的文件
            include: ["src/**/*.ts"],

            // 排除测试文件本身
            exclude: ["src/cli.ts", "tests/**/*"],
        },

        // 全局设置（如需要）
        globals: true,
    },
});
