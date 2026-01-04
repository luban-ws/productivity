// vite.config.ts
import { defineConfig } from "file:///Volumes/ORICO/ws/prj/luban-ws/productivity/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_less@4.5.1_sass@1.97.1_terser@5.44.1/node_modules/vite/dist/node/index.js";
import { wsx } from "file:///Volumes/ORICO/ws/prj/luban-ws/productivity/node_modules/.pnpm/@wsxjs+wsx-vite-plugin@0.0.25_esbuild@0.27.2_typescript@5.9.3_vite@5.4.21_@types+node@20.19.2_4vkaam2c6djlzffseqhteg3jei/node_modules/@wsxjs/wsx-vite-plugin/dist/index.mjs";
import UnoCSS from "file:///Volumes/ORICO/ws/prj/luban-ws/productivity/node_modules/.pnpm/unocss@66.5.12_postcss@8.5.6_vite@5.4.21_@types+node@20.19.27_less@4.5.1_sass@1.97.1_terser@5.44.1_/node_modules/unocss/dist/vite.mjs";
import path from "path";
import { fileURLToPath } from "url";
import { copyFileSync, cpSync } from "fs";
import { wsxPress } from "file:///Volumes/ORICO/ws/prj/luban-ws/productivity/node_modules/.pnpm/@wsxjs+wsx-press@0.0.25_typedoc-plugin-markdown@4.9.0_typedoc@0.25.13_typescript@5.9.3___type_pqwiu5lkxe5pvjdre36els7jmy/node_modules/@wsxjs/wsx-press/dist/node.js";
var __vite_injected_original_import_meta_url = "file:///Volumes/ORICO/ws/prj/luban-ws/productivity/site/vite.config.ts";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var copy404Plugin = () => {
  return {
    name: "copy-404-for-github-pages",
    apply: "build",
    // 只在构建时应用
    closeBundle() {
      const distPath = path.resolve(__dirname, "dist");
      const indexPath = path.join(distPath, "index.html");
      const notFoundPath = path.join(distPath, "404.html");
      try {
        copyFileSync(indexPath, notFoundPath);
        console.log("\u2705 Generated 404.html from index.html for GitHub Pages SPA routing");
      } catch (error) {
        console.error("\u274C Failed to generate 404.html:", error);
      }
    }
  };
};
var copyWsxPressPlugin = () => {
  return {
    name: "copy-wsx-press",
    apply: "build",
    closeBundle() {
      const wsxPressPath = path.resolve(__dirname, ".wsx-press");
      const distWsxPressPath = path.resolve(__dirname, "dist/.wsx-press");
      try {
        cpSync(wsxPressPath, distWsxPressPath, { recursive: true });
        console.log("\u2705 Copied .wsx-press directory to dist");
      } catch (error) {
        console.error("\u274C Failed to copy .wsx-press directory:", error);
      }
    }
  };
};
var vite_config_default = defineConfig({
  // Set base path for GitHub Pages deployment
  base: process.env.NODE_ENV === "production" && process.env.GITHUB_PAGES === "true" ? process.env.CUSTOM_DOMAIN === "true" ? "/" : "/productivity/" : "/",
  plugins: [
    UnoCSS(),
    wsx({
      debug: false,
      // Enable debug to see generated code
      jsxFactory: "h",
      jsxFragment: "Fragment"
    }),
    // WSX-Press 文档系统插件
    wsxPress({
      docsRoot: path.resolve(__dirname, "public/docs"),
      outputDir: path.resolve(__dirname, ".wsx-press")
      // API 文档生成暂时禁用，因为 TypeDoc 版本不兼容
      // api: {
      //     entryPoints: [
      //         path.resolve(__dirname, "../packages/core/src/index.ts"),
      //         path.resolve(__dirname, "../packages/router/src/index.ts"),
      //         path.resolve(__dirname, "../packages/base-components/src/index.ts"),
      //     ],
      //     tsconfig: path.resolve(__dirname, "../tsconfig.json"),
      //     outputDir: path.resolve(__dirname, "public/docs/api"),
      //     excludePrivate: true,
      //     excludeProtected: false,
      //     excludeInternal: true,
      //     publicPath: "/docs/api/",
      // },
    }),
    // 构建后自动复制 index.html 为 404.html（用于 GitHub Pages SPA 路由）
    copy404Plugin(),
    // 构建后复制 .wsx-press 目录到 dist
    copyWsxPressPlugin()
  ],
  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV !== "production"
    // No source maps in production
  },
  // Source maps are enabled by default in dev mode
  // Resolve workspace packages to source files in development mode
  // This allows hot reload without needing to build dependencies first
  // In production, Vite will use package.json exports (dist files)
  resolve: {},
  // 开发环境代理配置，解决 CORS 问题
  server: {
    proxy: {
      "/api/github": {
        target: "https://api.github.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/github/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.error("GitHub API proxy error", err);
          });
        }
      },
      "/api/npm": {
        target: "https://api.npmjs.org",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/npm/, "")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9PUklDTy93cy9wcmovbHViYW4td3MvcHJvZHVjdGl2aXR5L3NpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Wb2x1bWVzL09SSUNPL3dzL3Byai9sdWJhbi13cy9wcm9kdWN0aXZpdHkvc2l0ZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVm9sdW1lcy9PUklDTy93cy9wcmovbHViYW4td3MvcHJvZHVjdGl2aXR5L3NpdGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgd3N4IH0gZnJvbSBcIkB3c3hqcy93c3gtdml0ZS1wbHVnaW5cIjtcbmltcG9ydCBVbm9DU1MgZnJvbSBcInVub2Nzcy92aXRlXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCB7IGNvcHlGaWxlU3luYywgY3BTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyB3c3hQcmVzcyB9IGZyb20gXCJAd3N4anMvd3N4LXByZXNzL25vZGVcIjtcblxuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSk7XG5cbi8vIFZpdGUgXHU2M0QyXHU0RUY2XHVGRjFBXHU1NzI4XHU2Nzg0XHU1RUZBXHU1NDBFXHU1OTBEXHU1MjM2IGluZGV4Lmh0bWwgXHU0RTNBIDQwNC5odG1sXHVGRjA4XHU3NTI4XHU0RThFIEdpdEh1YiBQYWdlcyBTUEEgXHU4REVGXHU3NTMxXHVGRjA5XG4vLyBHaXRIdWIgUGFnZXMgXHU0RjdGXHU3NTI4IDQwNC5odG1sIFx1NEY1Q1x1NEUzQVx1NjI3RVx1NEUwRFx1NTIzMFx1OTg3NVx1OTc2Mlx1NjVGNlx1NzY4NFx1NTZERVx1OTAwMFx1RkYwQ1x1OEZEOVx1NUJGOVx1NEU4RSBTUEEgXHU4REVGXHU3NTMxXHU4MUYzXHU1MTczXHU5MUNEXHU4OTgxXG5jb25zdCBjb3B5NDA0UGx1Z2luID0gKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IFwiY29weS00MDQtZm9yLWdpdGh1Yi1wYWdlc1wiLFxuICAgICAgICBhcHBseTogXCJidWlsZFwiLCAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTVFOTRcdTc1MjhcbiAgICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgICAgICAvLyBjbG9zZUJ1bmRsZSBcdTU3MjhcdTYyNDBcdTY3MDkgYnVuZGxlIFx1NTE5OVx1NTE2NVx1NUI4Q1x1NjIxMFx1NTQwRVx1OEMwM1x1NzUyOFx1RkYwQ1x1Nzg2RVx1NEZERCBpbmRleC5odG1sIFx1NURGMlx1ODhBQlx1NTkwNFx1NzQwNlxuICAgICAgICAgICAgY29uc3QgZGlzdFBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImRpc3RcIik7XG4gICAgICAgICAgICBjb25zdCBpbmRleFBhdGggPSBwYXRoLmpvaW4oZGlzdFBhdGgsIFwiaW5kZXguaHRtbFwiKTtcbiAgICAgICAgICAgIGNvbnN0IG5vdEZvdW5kUGF0aCA9IHBhdGguam9pbihkaXN0UGF0aCwgXCI0MDQuaHRtbFwiKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29weUZpbGVTeW5jKGluZGV4UGF0aCwgbm90Rm91bmRQYXRoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlx1MjcwNSBHZW5lcmF0ZWQgNDA0Lmh0bWwgZnJvbSBpbmRleC5odG1sIGZvciBHaXRIdWIgUGFnZXMgU1BBIHJvdXRpbmdcIik7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJcdTI3NEMgRmFpbGVkIHRvIGdlbmVyYXRlIDQwNC5odG1sOlwiLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgLy8gXHU0RTBEXHU2MjlCXHU1MUZBXHU5NTE5XHU4QkVGXHVGRjBDXHU5MDdGXHU1MTREXHU0RTJEXHU2NUFEXHU2Nzg0XHU1RUZBXHU2RDQxXHU3QTBCXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfTtcbn07XG5cbi8vIFZpdGUgXHU2M0QyXHU0RUY2XHVGRjFBXHU1NzI4XHU2Nzg0XHU1RUZBXHU1NDBFXHU1OTBEXHU1MjM2IC53c3gtcHJlc3MgXHU3NkVFXHU1RjU1XHU1MjMwIGRpc3RcbmNvbnN0IGNvcHlXc3hQcmVzc1BsdWdpbiA9ICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBcImNvcHktd3N4LXByZXNzXCIsXG4gICAgICAgIGFwcGx5OiBcImJ1aWxkXCIsXG4gICAgICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgICAgICAgY29uc3Qgd3N4UHJlc3NQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIud3N4LXByZXNzXCIpO1xuICAgICAgICAgICAgY29uc3QgZGlzdFdzeFByZXNzUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiZGlzdC8ud3N4LXByZXNzXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjcFN5bmMod3N4UHJlc3NQYXRoLCBkaXN0V3N4UHJlc3NQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlx1MjcwNSBDb3BpZWQgLndzeC1wcmVzcyBkaXJlY3RvcnkgdG8gZGlzdFwiKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlx1Mjc0QyBGYWlsZWQgdG8gY29weSAud3N4LXByZXNzIGRpcmVjdG9yeTpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIC8vIFx1NEUwRFx1NjI5Qlx1NTFGQVx1OTUxOVx1OEJFRlx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUyRFx1NjVBRFx1Njc4NFx1NUVGQVx1NkQ0MVx1N0EwQlxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIC8vIFNldCBiYXNlIHBhdGggZm9yIEdpdEh1YiBQYWdlcyBkZXBsb3ltZW50XG4gICAgYmFzZTpcbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiICYmIHByb2Nlc3MuZW52LkdJVEhVQl9QQUdFUyA9PT0gXCJ0cnVlXCJcbiAgICAgICAgICAgID8gcHJvY2Vzcy5lbnYuQ1VTVE9NX0RPTUFJTiA9PT0gXCJ0cnVlXCJcbiAgICAgICAgICAgICAgICA/IFwiL1wiXG4gICAgICAgICAgICAgICAgOiBcIi9wcm9kdWN0aXZpdHkvXCJcbiAgICAgICAgICAgIDogXCIvXCIsXG4gICAgcGx1Z2luczogW1xuICAgICAgICBVbm9DU1MoKSxcbiAgICAgICAgd3N4KHtcbiAgICAgICAgICAgIGRlYnVnOiBmYWxzZSwgLy8gRW5hYmxlIGRlYnVnIHRvIHNlZSBnZW5lcmF0ZWQgY29kZVxuICAgICAgICAgICAganN4RmFjdG9yeTogXCJoXCIsXG4gICAgICAgICAgICBqc3hGcmFnbWVudDogXCJGcmFnbWVudFwiLFxuICAgICAgICB9KSxcbiAgICAgICAgLy8gV1NYLVByZXNzIFx1NjU4N1x1Njg2M1x1N0NGQlx1N0VERlx1NjNEMlx1NEVGNlxuICAgICAgICB3c3hQcmVzcyh7XG4gICAgICAgICAgICBkb2NzUm9vdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJwdWJsaWMvZG9jc1wiKSxcbiAgICAgICAgICAgIG91dHB1dERpcjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIud3N4LXByZXNzXCIpLFxuICAgICAgICAgICAgLy8gQVBJIFx1NjU4N1x1Njg2M1x1NzUxRlx1NjIxMFx1NjY4Mlx1NjVGNlx1Nzk4MVx1NzUyOFx1RkYwQ1x1NTZFMFx1NEUzQSBUeXBlRG9jIFx1NzI0OFx1NjcyQ1x1NEUwRFx1NTE3Q1x1NUJCOVxuICAgICAgICAgICAgLy8gYXBpOiB7XG4gICAgICAgICAgICAvLyAgICAgZW50cnlQb2ludHM6IFtcbiAgICAgICAgICAgIC8vICAgICAgICAgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9wYWNrYWdlcy9jb3JlL3NyYy9pbmRleC50c1wiKSxcbiAgICAgICAgICAgIC8vICAgICAgICAgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9wYWNrYWdlcy9yb3V0ZXIvc3JjL2luZGV4LnRzXCIpLFxuICAgICAgICAgICAgLy8gICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL3BhY2thZ2VzL2Jhc2UtY29tcG9uZW50cy9zcmMvaW5kZXgudHNcIiksXG4gICAgICAgICAgICAvLyAgICAgXSxcbiAgICAgICAgICAgIC8vICAgICB0c2NvbmZpZzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi90c2NvbmZpZy5qc29uXCIpLFxuICAgICAgICAgICAgLy8gICAgIG91dHB1dERpcjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJwdWJsaWMvZG9jcy9hcGlcIiksXG4gICAgICAgICAgICAvLyAgICAgZXhjbHVkZVByaXZhdGU6IHRydWUsXG4gICAgICAgICAgICAvLyAgICAgZXhjbHVkZVByb3RlY3RlZDogZmFsc2UsXG4gICAgICAgICAgICAvLyAgICAgZXhjbHVkZUludGVybmFsOiB0cnVlLFxuICAgICAgICAgICAgLy8gICAgIHB1YmxpY1BhdGg6IFwiL2RvY3MvYXBpL1wiLFxuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgfSksXG4gICAgICAgIC8vIFx1Njc4NFx1NUVGQVx1NTQwRVx1ODFFQVx1NTJBOFx1NTkwRFx1NTIzNiBpbmRleC5odG1sIFx1NEUzQSA0MDQuaHRtbFx1RkYwOFx1NzUyOFx1NEU4RSBHaXRIdWIgUGFnZXMgU1BBIFx1OERFRlx1NzUzMVx1RkYwOVxuICAgICAgICBjb3B5NDA0UGx1Z2luKCksXG4gICAgICAgIC8vIFx1Njc4NFx1NUVGQVx1NTQwRVx1NTkwRFx1NTIzNiAud3N4LXByZXNzIFx1NzZFRVx1NUY1NVx1NTIzMCBkaXN0XG4gICAgICAgIGNvcHlXc3hQcmVzc1BsdWdpbigpLFxuICAgIF0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgb3V0RGlyOiBcImRpc3RcIixcbiAgICAgICAgc291cmNlbWFwOiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIsIC8vIE5vIHNvdXJjZSBtYXBzIGluIHByb2R1Y3Rpb25cbiAgICB9LFxuICAgIC8vIFNvdXJjZSBtYXBzIGFyZSBlbmFibGVkIGJ5IGRlZmF1bHQgaW4gZGV2IG1vZGVcbiAgICAvLyBSZXNvbHZlIHdvcmtzcGFjZSBwYWNrYWdlcyB0byBzb3VyY2UgZmlsZXMgaW4gZGV2ZWxvcG1lbnQgbW9kZVxuICAgIC8vIFRoaXMgYWxsb3dzIGhvdCByZWxvYWQgd2l0aG91dCBuZWVkaW5nIHRvIGJ1aWxkIGRlcGVuZGVuY2llcyBmaXJzdFxuICAgIC8vIEluIHByb2R1Y3Rpb24sIFZpdGUgd2lsbCB1c2UgcGFja2FnZS5qc29uIGV4cG9ydHMgKGRpc3QgZmlsZXMpXG4gICAgcmVzb2x2ZToge30sXG4gICAgLy8gXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXHVGRjBDXHU4OUUzXHU1MUIzIENPUlMgXHU5NUVFXHU5ODk4XG4gICAgc2VydmVyOiB7XG4gICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICBcIi9hcGkvZ2l0aHViXCI6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbVwiLFxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvZ2l0aHViLywgXCJcIiksXG4gICAgICAgICAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHByb3h5Lm9uKFwiZXJyb3JcIiwgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkdpdEh1YiBBUEkgcHJveHkgZXJyb3JcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIi9hcGkvbnBtXCI6IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hcGkubnBtanMub3JnXCIsXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9ucG0vLCBcIlwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVSxTQUFTLG9CQUFvQjtBQUMvVixTQUFTLFdBQVc7QUFDcEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLGNBQWMsY0FBYztBQUNyQyxTQUFTLGdCQUFnQjtBQU4rSyxJQUFNLDJDQUEyQztBQVF6UCxJQUFNLFlBQVksS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUk3RCxJQUFNLGdCQUFnQixNQUFNO0FBQ3hCLFNBQU87QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLElBQ1AsY0FBYztBQUVWLFlBQU0sV0FBVyxLQUFLLFFBQVEsV0FBVyxNQUFNO0FB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
