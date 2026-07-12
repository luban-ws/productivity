/**
 * 鲁班工坊生产力工具网站 - 主入口
 *
 * 使用 WSXJS 框架构建的鲁班工坊生产力工具展示网站
 */

import { createLogger } from "@wsxjs/wsx-core";
import "uno.css";
import "./main.css";
// Import base components package (includes CSS)
import "@wsxjs/wsx-base-components";
// Initialize i18next
import "./i18n";
// Initialize error handler
import { ErrorHandler } from "./utils/error-handler";
import "./press-base";
import { normalizeSitePathname } from "./sitePaths";
import "./App.wsx";

const logger = createLogger("Luban-Workshop-Site");

// Initialize the application
function initApp() {
    normalizeSitePathname();

    // 初始化全局错误处理
    ErrorHandler.init();

    const appContainer = document.getElementById("app");

    if (!appContainer) {
        logger.error("App container not found");
        return;
    }

    // Mount the WSX App component
    const appElement = document.createElement("wsx-app");
    appContainer.appendChild(appElement);

    logger.info("鲁班工坊生产力工具网站初始化完成");
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
