/**
 * 盘古用户可见文案（随 OS locale；翻译逻辑在本包，locale 解析用 tongyu）
 */

import { createTranslator, type MessageCatalog, type SupportedLocale } from "./i18n/translator.js";

/** 盘古专属语言覆盖 env */
export const PANGU_LOCALE_ENV = "PANGU_LANG";

/** 文案键 */
export type MessageKey =
    | "shutdown"
    | "serverExit"
    | "demoNotFound"
    | "resolvePackageDirFailed"
    | "resolvePackageDirError"
    | "resolvePackageDirErrorWithStderr"
    | "locatePackageFailed"
    | "startingServer"
    | "startingServerSuccess"
    | "startServerFailed"
    | "labelPackage"
    | "labelDirectory"
    | "labelPackageManager"
    | "labelCommand"
    | "helpTitle"
    | "helpMenu"
    | "helpDirect"
    | "helpDemos"
    | "helpPackageManager"
    | "helpExamples"
    | "welcome"
    | "supportedBy"
    | "selectDemo"
    | "noDemos"
    | "configHint"
    | "invalidDemo"
    | "cancelled"
    | "errorOccurred"
    | "uiSelectHint";

const PANGU_CATALOG: MessageCatalog<MessageKey> = {
    en: {
        shutdown: "\n\n👋 The server is shutting down gracefully. Thank you!",
        serverExit: "\n❌ Dev server exited with code: {code}",
        demoNotFound: "❌ Demo not found: {demo}",
        resolvePackageDirFailed: "❌ Unable to locate package directory for {name}",
        resolvePackageDirError: "Unable to resolve package directory: {package}",
        resolvePackageDirErrorWithStderr: "Unable to resolve package directory {package}: {stderr}",
        locatePackageFailed: "❌ Unable to locate {name} package directory",
        startingServer: "Starting {name} dev server...",
        startingServerSuccess: "✅ Starting {name} dev server",
        startServerFailed: "❌ Failed to start {name} dev server",
        labelPackage: "📦 Package",
        labelDirectory: "📁 Directory",
        labelPackageManager: "🔧 Package manager",
        labelCommand: "🔧 Command",
        helpTitle: "\n📖 Usage:",
        helpMenu: "  pangu              # Interactive menu",
        helpDirect: "  pangu <demo>        # Start a demo directly\n",
        helpDemos: "Available demos:",
        helpPackageManager: "\nPackage manager",
        helpExamples: "\nExamples:",
        welcome: "\n🚀 Pangu · Dev Server\n",
        supportedBy: "Supported by {name}",
        selectDemo: "Select a demo to start:",
        noDemos: "❌ No demo entries found in config",
        configHint:
            "Create pangu.config.json, pangu.config.yaml, dev.config.json, or dev.config.yaml",
        invalidDemo: "\n❌ Invalid demo name: {demo}\n",
        cancelled: "\n👋 Cancelled",
        errorOccurred: "❌ Error:",
        uiSelectHint: "↑↓ navigate · Enter select · Esc cancel",
    },
    zh: {
        shutdown: "\n\n👋 开发服务器正在优雅关闭，感谢您的使用！",
        serverExit: "\n❌ 开发服务器退出，代码: {code}",
        demoNotFound: "❌ 未找到演示项目: {demo}",
        resolvePackageDirFailed: "❌ 无法定位 {name} 包目录",
        resolvePackageDirError: "无法解析包目录: {package}",
        resolvePackageDirErrorWithStderr: "无法解析包目录 {package}: {stderr}",
        locatePackageFailed: "❌ 无法定位 {name} 包目录",
        startingServer: "正在启动 {name} 开发服务器...",
        startingServerSuccess: "✅ 正在启动 {name} 开发服务器",
        startServerFailed: "❌ 启动 {name} 开发服务器失败",
        labelPackage: "📦 包名",
        labelDirectory: "📁 目录",
        labelPackageManager: "🔧 包管理器",
        labelCommand: "🔧 命令",
        helpTitle: "\n📖 使用方法:",
        helpMenu: "  pangu              # 显示交互式菜单",
        helpDirect: "  pangu <demo>        # 直接启动指定的 demo\n",
        helpDemos: "可用的 demo:",
        helpPackageManager: "\n包管理器",
        helpExamples: "\n示例:",
        welcome: "\n🚀 盘古 · 开发服务器\n",
        supportedBy: "由 {name} 提供支持",
        selectDemo: "请选择要启动的演示项目：",
        noDemos: "❌ 配置文件中没有找到任何 demo 选项",
        configHint:
            "请创建 pangu.config.json、pangu.config.yaml、dev.config.json 或 dev.config.yaml 配置文件",
        invalidDemo: "\n❌ 无效的 demo 名称: {demo}\n",
        cancelled: "\n👋 已取消",
        errorOccurred: "❌ 发生错误:",
        uiSelectHint: "↑↓ 移动 · Enter 确认 · Esc 取消",
    },
};

/** 盘古翻译函数（尊重 OS locale） */
export const t = createTranslator(PANGU_CATALOG, {
    overrideEnvKeys: [PANGU_LOCALE_ENV],
});

/**
 * 获取关闭提示（可指定 locale，供测试使用）
 */
export function getShutdownMessage(locale?: SupportedLocale): string {
    if (locale) {
        return createTranslator(PANGU_CATALOG, { locale })("shutdown");
    }
    return t("shutdown");
}

export type { SupportedLocale };
