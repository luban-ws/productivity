import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
        globals: true,
        coverage: {
            provider: "v8",
            reportsDirectory: "./coverage",
            include: ["src/**/*.ts"],
            exclude: ["tests/**/*", "src/index.ts"],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
});
