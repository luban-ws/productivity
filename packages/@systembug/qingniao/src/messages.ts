/**
 * 青鸟用户可见文案（OS locale；翻译在本包，locale 解析用 tongyu）
 */

import { createTranslator, type MessageCatalog, type SupportedLocale } from "./i18n/translator.js";

/** 青鸟专属语言覆盖 env */
export const QINGNIAO_LOCALE_ENV = "QINGNIAO_LANG";

export type MessageKey =
    | "missingScript"
    | "doctorFixHint"
    | "noChangesetFilesSkip"
    | "releaseFailed"
    | "doctorFailed"
    | "formatCheckMissingScript"
    | "formatCheckFailed"
    | "lintFailed"
    | "typecheckFailed"
    | "testFailed"
    | "formatFailed"
    | "buildPreLintFailed"
    | "rootPackageJsonMissing"
    | "doctorTitle"
    | "doctorFixedCount"
    | "doctorSummary"
    | "doctorConsoleTitle"
    | "doctorConsoleFixed"
    | "npmLoggedIn"
    | "npmRegistry"
    | "npmRegistryHint"
    | "npmNotLoggedIn"
    | "npmLoginHint"
    | "gitNotRepo"
    | "gitBranch"
    | "gitDirty"
    | "gitDirtyHint"
    | "gitClean"
    | "gitUnpushed"
    | "gitUnpushedHint"
    | "workspaceDetected"
    | "workspaceMissing"
    | "packagesNone"
    | "packagesCount"
    | "scriptLintMissing"
    | "scriptLintOk"
    | "scriptFormatMissing"
    | "scriptFormatOk"
    | "scriptFormatCheckMissing"
    | "scriptFormatCheckOk"
    | "scriptTypecheckMissing"
    | "scriptTypecheckOk"
    | "scriptTestMissing"
    | "scriptTestOk"
    | "scriptBuildMissing"
    | "scriptBuildOk"
    | "scriptReleaseMissing"
    | "scriptReleaseOk"
    | "changesetDirOk"
    | "changesetPendingNone"
    | "changesetPendingHint"
    | "changesetPendingOk"
    | "changesetDirMissing"
    | "depChangesetsMissing"
    | "depChangesetsHint"
    | "depChangesetsOk"
    | "configMissing"
    | "configOk";

const QINGNIAO_CATALOG: MessageCatalog<MessageKey> = {
    en: {
        missingScript:
            'Missing npm script "{script}". Add it to root package.json scripts, or run: qingniao doctor --fix',
        doctorFixHint: "qingniao doctor --fix",
        noChangesetFilesSkip:
            "No pending changeset files; skipping version bump and publishing current versions",
        releaseFailed: "Release failed: {message}",
        doctorFailed: "Doctor failed: {message}",
        formatCheckMissingScript:
            'Missing "format:check" script. Run: qingniao doctor --fix',
        formatCheckFailed: "Format check failed",
        lintFailed: "Lint failed",
        typecheckFailed: "TypeScript type check failed",
        testFailed: "Tests failed",
        formatFailed: "Format failed",
        buildPreLintFailed: "Pre-lint build failed for {package}",
        rootPackageJsonMissing: "Root package.json not found",
        doctorTitle: "Qingniao Doctor",
        doctorFixedCount: "Auto-fixed {count} item(s)",
        doctorSummary: "Result: {errors} error(s), {warns} warning(s), {total} check(s)",
        doctorConsoleTitle: "Qingniao Doctor",
        doctorConsoleFixed: "Auto-fixed {count} item(s)",
        npmLoggedIn: "Logged in: {username}",
        npmRegistry: "Current registry: {registry}",
        npmRegistryHint: "Confirm this is the intended registry",
        npmNotLoggedIn: "Not logged in to NPM",
        npmLoginHint: "Run: {pm} login",
        gitNotRepo: "Not inside a git repository",
        gitBranch: "Current branch: {branch}",
        gitDirty: "Uncommitted changes detected",
        gitDirtyHint: "Commit or stash before publishing",
        gitClean: "Working tree clean",
        gitUnpushed: "Unpushed commits detected",
        gitUnpushedHint: "Push before publishing",
        workspaceDetected: "Detected: {type}",
        workspaceMissing: "No workspace configuration detected",
        packagesNone: "No publishable public packages found",
        packagesCount: "Publishable packages: {count}",
        scriptLintMissing: 'Missing "lint" script',
        scriptLintOk: "lint script configured",
        scriptFormatMissing: 'Missing "format" script',
        scriptFormatOk: "format script configured",
        scriptFormatCheckMissing: 'Missing "format:check" script',
        scriptFormatCheckOk: "format:check script configured",
        scriptTypecheckMissing: 'Missing "typecheck" script',
        scriptTypecheckOk: "typecheck script configured",
        scriptTestMissing: 'Missing "test" script',
        scriptTestOk: "test script configured",
        scriptBuildMissing: 'Missing "build" script',
        scriptBuildOk: "build script configured",
        scriptReleaseMissing: 'Missing "{script}" script',
        scriptReleaseOk: "release script configured",
        changesetDirOk: ".changeset directory exists",
        changesetPendingNone: "No pending changeset files",
        changesetPendingHint: "Run: pnpm changeset",
        changesetPendingOk: "Pending changesets found",
        changesetDirMissing: "Missing .changeset directory",
        depChangesetsMissing: "@changesets/cli not installed",
        depChangesetsHint: "{pm} add -D @changesets/cli",
        depChangesetsOk: "@changesets/cli installed",
        configMissing: "Missing qingniao.config.json (optional)",
        configOk: "qingniao.config.json exists",
    },
    zh: {
        missingScript:
            '缺少 npm 脚本 "{script}"。请在根目录 package.json 的 scripts 中添加该命令，或运行: qingniao doctor --fix',
        doctorFixHint: "qingniao doctor --fix",
        noChangesetFilesSkip: "未找到 changeset 文件，跳过版本更新，将使用当前版本发布",
        releaseFailed: "发布失败: {message}",
        doctorFailed: "Doctor 失败: {message}",
        formatCheckMissingScript: '缺少 "format:check" 脚本。请运行: qingniao doctor --fix',
        formatCheckFailed: "代码格式检查失败",
        lintFailed: "lint 失败",
        typecheckFailed: "TypeScript 类型检查失败",
        testFailed: "测试失败",
        formatFailed: "格式化代码失败",
        buildPreLintFailed: "构建 {package}（lint 依赖）失败",
        rootPackageJsonMissing: "未找到根目录 package.json",
        doctorTitle: "青鸟 Doctor",
        doctorFixedCount: "已自动修复 {count} 项",
        doctorSummary: "结果: {errors} 错误, {warns} 警告, {total} 项",
        doctorConsoleTitle: "青鸟 Doctor",
        doctorConsoleFixed: "已自动修复 {count} 项",
        npmLoggedIn: "已登录: {username}",
        npmRegistry: "当前 registry: {registry}",
        npmRegistryHint: "确认是否为预期源",
        npmNotLoggedIn: "未登录 NPM",
        npmLoginHint: "运行: {pm} login",
        gitNotRepo: "不在 git 仓库中",
        gitBranch: "当前分支: {branch}",
        gitDirty: "存在未提交更改",
        gitDirtyHint: "发布前请先 commit 或 stash",
        gitClean: "工作区干净",
        gitUnpushed: "存在未推送提交",
        gitUnpushedHint: "发布前请 push",
        workspaceDetected: "已检测: {type}",
        workspaceMissing: "未检测到 workspace 配置",
        packagesNone: "未找到可发布的公共包",
        packagesCount: "可发布包: {count} 个",
        scriptLintMissing: '缺少 "lint" 脚本',
        scriptLintOk: "lint 脚本已配置",
        scriptFormatMissing: '缺少 "format" 脚本',
        scriptFormatOk: "format 脚本已配置",
        scriptFormatCheckMissing: '缺少 "format:check" 脚本',
        scriptFormatCheckOk: "format:check 脚本已配置",
        scriptTypecheckMissing: '缺少 "typecheck" 脚本',
        scriptTypecheckOk: "typecheck 脚本已配置",
        scriptTestMissing: '缺少 "test" 脚本',
        scriptTestOk: "test 脚本已配置",
        scriptBuildMissing: '缺少 "build" 脚本',
        scriptBuildOk: "build 脚本已配置",
        scriptReleaseMissing: '缺少 "{script}" 脚本',
        scriptReleaseOk: "release 脚本已配置",
        changesetDirOk: ".changeset 已存在",
        changesetPendingNone: "无待发布 changeset 文件",
        changesetPendingHint: "运行: pnpm changeset",
        changesetPendingOk: "存在待消费 changeset",
        changesetDirMissing: "缺少 .changeset 目录",
        depChangesetsMissing: "未安装 @changesets/cli",
        depChangesetsHint: "{pm} add -D @changesets/cli",
        depChangesetsOk: "@changesets/cli 已安装",
        configMissing: "缺少 qingniao.config.json（可选）",
        configOk: "qingniao.config.json 已存在",
    },
};

/** 青鸟翻译函数（尊重 OS locale） */
export const t = createTranslator(QINGNIAO_CATALOG, {
    overrideEnvKeys: [QINGNIAO_LOCALE_ENV],
});

export type { SupportedLocale };
