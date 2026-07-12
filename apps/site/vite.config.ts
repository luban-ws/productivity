import { defineConfig } from "vite";
import { wsx } from "@wsxjs/wsx-vite-plugin";
import UnoCSS from "unocss/vite";
import path from "path";
import { fileURLToPath } from "url";
import { copyFileSync, cpSync } from "fs";
import { wsxPress } from "@wsxjs/wsx-press/node";
import { REPO_SLUG, resolveSiteBase } from "./vite-plugins/resolveSiteBase";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteBase = resolveSiteBase(REPO_SLUG);

/** GitHub Pages SPA：404.html = index.html（无 redirect 脚本） */
const copy404Plugin = () => ({
    name: "copy-404-for-github-pages",
    apply: "build" as const,
    closeBundle() {
        if (process.env.GITHUB_PAGES !== "true") {
            return;
        }
        const distPath = path.resolve(__dirname, "dist");
        const indexPath = path.join(distPath, "index.html");
        const notFoundPath = path.join(distPath, "404.html");
        try {
            copyFileSync(indexPath, notFoundPath);
            console.log("✅ Generated 404.html from index.html for GitHub Pages SPA routing");
        } catch (error) {
            console.error("❌ Failed to generate 404.html:", error);
        }
    },
});

/** 构建后将 .wsx-press 复制到 dist */
const copyWsxPressPlugin = () => ({
    name: "copy-wsx-press",
    apply: "build" as const,
    closeBundle() {
        const wsxPressPath = path.resolve(__dirname, ".wsx-press");
        const distWsxPressPath = path.resolve(__dirname, "dist/.wsx-press");
        try {
            cpSync(wsxPressPath, distWsxPressPath, { recursive: true });
            console.log("✅ Copied .wsx-press directory to dist");
        } catch (error) {
            console.error("❌ Failed to copy .wsx-press directory:", error);
        }
    },
});

export default defineConfig({
    root: __dirname,
    base: siteBase,
    plugins: [
        UnoCSS(),
        wsx({
            debug: false,
            jsxFactory: "h",
            jsxFragment: "Fragment",
        }),
        wsxPress({
            docsRoot: path.resolve(__dirname, "public/docs"),
            outputDir: path.resolve(__dirname, ".wsx-press"),
        }),
        copy404Plugin(),
        copyWsxPressPlugin(),
    ],
    build: {
        outDir: "dist",
        sourcemap: process.env.NODE_ENV !== "production",
    },
    resolve: {},
    server: {
        proxy: {
            "/api/github": {
                target: "https://api.github.com",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/github/, ""),
                configure: (proxy, _options) => {
                    proxy.on("error", (err, _req, _res) => {
                        console.error("GitHub API proxy error", err);
                    });
                },
            },
            "/api/npm": {
                target: "https://api.npmjs.org",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/npm/, ""),
            },
        },
    },
});
