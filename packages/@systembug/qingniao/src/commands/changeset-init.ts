/**
 * 初始化 Changeset 命令
 */

import { existsSync } from "fs";
import { join } from "path";
import { exec } from "../utils/exec";
import ora from "ora";
import { detectPackageManager } from "../utils/auto-detect";

/**
 * 初始化 Changeset
 */
export async function initChangeset(
    rootDir: string,
    options: { force?: boolean } = {},
): Promise<void> {
    const changesetDir = join(rootDir, ".changeset");

    // 检查是否已存在
    if (existsSync(changesetDir) && !options.force) {
        ora().warn(".changeset 目录已存在");
        ora().info("使用 --force 选项可重新初始化");
        throw new Error(".changeset 目录已存在");
    }

    // 检测包管理器
    const packageManager = detectPackageManager(rootDir);
    if (!packageManager) {
        throw new Error("无法检测包管理器，请确保在项目根目录运行");
    }

    // 检查是否安装了 @changesets/cli
    const pmCommand =
        packageManager === "pnpm" ? "pnpm exec" : packageManager === "yarn" ? "yarn" : "npx";

    const spinner = ora("正在初始化 Changeset").start();

    try {
        // 执行 changeset init
        exec(`${pmCommand} changeset init`, {
            cwd: rootDir,
            timeout: 5 * 60 * 1000, // 5 分钟
            description: "初始化 Changeset",
        });

        spinner.succeed("Changeset 初始化成功");

        ora().info("💡 提示：");
        ora().info(" - 使用 `changeset` 命令创建变更文件");
        ora().info(" - 使用 `qingniao` 发布时会自动使用 changeset 策略");
        ora().info(" - 更多信息请查看: https://github.com/changesets/changesets");
    } catch (error: unknown) {
        spinner.fail("Changeset 初始化失败");
        const errorMessage = error instanceof Error ? error.message : String(error);

        // 检查是否是未安装 @changesets/cli 的错误
        if (
            errorMessage.includes("command not found") ||
            errorMessage.includes("ENOENT") ||
            errorMessage.includes("不是内部或外部命令")
        ) {
            ora().warn("未找到 changeset 命令");
            ora().info("请先安装 @changesets/cli:");
            ora().info(`  ${packageManager} add -D @changesets/cli`);
            throw new Error("请先安装 @changesets/cli");
        }

        throw error;
    }
}
