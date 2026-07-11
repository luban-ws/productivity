import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
    test: {
        include: [
            "src/**/*.test.ts",
            "src/**/*.test.tsx",
            "src/**/__tests__/**/*.ts",
            "src/**/__tests__/**/*.tsx",
            "tests/**/*.test.ts",
        ],
        coverage: {
            provider: "v8",
            reporter: ["text", "text-summary", "html"],
            include: ["src/**/*.ts", "src/**/*.tsx"],
            exclude: [
                "src/**/*.test.ts",
                "src/**/*.test.tsx",
                "src/**/__tests__/**",
                "**/*.d.ts",
                "src/cli.ts",
                "src/ui/DoctorApp.tsx",
                "src/ui/run-doctor.tsx",
            ],
        },
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
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
                "chalk",
                "commander",
                "ora",
                "inquirer",
                "listr2",
                "ink",
                "@inkjs/ui",
                "react",
                "@systembug/tongyu",
                "react/jsx-runtime",
                "fs",
                "path",
                "url",
                "child_process",
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
        react(),
        dts({
            include: ["src/**/*.ts", "src/**/*.tsx"],
            exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/__tests__/**"],
            outDir: "dist",
            rollupTypes: true,
        }) as any,
    ],
});
