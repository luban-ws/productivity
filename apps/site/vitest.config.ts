import { defineConfig } from "vitest/config";
import { wsx } from "@wsxjs/wsx-vite-plugin";
import path from "path";

export default defineConfig({
    plugins: [
        wsx({
            jsxFactory: "h",
            jsxFragment: "Fragment",
        }),
    ],
    test: {
        globals: true,
        environment: "happy-dom",
        setupFiles: ["./test/setup.ts"],
        include: ["src/**/*.test.ts", "src/**/*.test.tsx", "test/**/*.test.ts", "vite-plugins/**/*.test.ts"],
        typecheck: {
            include: ["src/**/*.{ts,tsx,wsx}", "src/types.d.ts"],
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.{ts,tsx,wsx}"],
            exclude: ["src/**/*.d.ts", "src/**/*.test.{ts,tsx}", "src/main.ts"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            // 使用 node_modules 中的包，而不是本地路径
            // 这样测试环境可以正确解析 wsx 文件中的导入
        },
    },
    esbuild: {
        jsx: "transform",
        jsxFactory: "h",
        jsxFragment: "Fragment",
        jsxInject: `import { h, Fragment } from '@wsxjs/wsx-core'`,
        target: "es2020",
    },
});
