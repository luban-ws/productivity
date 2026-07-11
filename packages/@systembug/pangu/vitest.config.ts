/**
 * Vitest 配置文件
 * @description 为 @systembug/pangu 包配置测试环境
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
    esbuild: {
        jsx: "automatic",
    },
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
        globals: true,
        coverage: {
            provider: "v8",
            reportsDirectory: "./coverage",
            include: ["src/**/*.ts", "src/**/*.tsx"],
            exclude: [
                "src/cli.ts",
                "src/ui/DemoSelectApp.tsx",
                "src/ui/HelpApp.tsx",
                "src/ui/AlertApp.tsx",
                "src/ui/StartupApp.tsx",
                "src/ui/run-invalid-demo.tsx",
                "src/ui/console-demo-select.ts",
                "tests/**/*",
            ],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
});
