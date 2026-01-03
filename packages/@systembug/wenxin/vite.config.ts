import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig([
    // 主构建：index 和 cli
    {
        build: {
            lib: {
                entry: {
                    index: resolve(__dirname, "src/index.ts"),
                    cli: resolve(__dirname, "src/cli.ts"),
                },
                formats: ["es", "cjs"],
                fileName: (format, entryName) => {
                    if (format === "es") {
                        return `${entryName}.mjs`;
                    }
                    return `${entryName}.cjs`;
                },
            },
            rollupOptions: {
                external: [
                    "commander",
                    "jsdoc",
                    "typedoc",
                    "typescript",
                    "fs",
                    "path",
                    "child_process",
                    "os",
                    "glob",
                ],
                output: {
                    preserveModules: false,
                    exports: "named",
                },
            },
            sourcemap: true,
            target: "es2020",
            minify: false,
        },
        plugins: [
            dts({
                include: ["src/index.ts", "src/cli.ts"],
                exclude: ["src/**/*.test.ts"],
                outDir: "dist",
                rollupTypes: true,
            }) as any,
        ],
    },
    // jsdoc-aliases 单独构建为 CommonJS（JSDoc 需要）
    {
        build: {
            lib: {
                entry: resolve(__dirname, "src/jsdoc-aliases.ts"),
                formats: ["cjs"],
                fileName: () => "jsdoc-aliases.js",
            },
            rollupOptions: {
                output: {
                    format: "cjs",
                    exports: "auto", // 自动检测导出方式
                },
            },
            sourcemap: false,
            target: "es2020",
            minify: false,
        },
    },
]);
