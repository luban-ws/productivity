import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, "src/index.ts"),
                cli: resolve(__dirname, "src/cli.ts"),
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
                "url",
                "child_process",
                "os",
                "glob",
            ],
            output: [
                // ESM 输出
                {
                    format: "es",
                    entryFileNames: "[name].mjs",
                    preserveModules: false,
                    exports: "named",
                },
                // CommonJS 输出
                {
                    format: "cjs",
                    entryFileNames: "[name].cjs",
                    preserveModules: false,
                    exports: "named",
                },
            ],
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
});
