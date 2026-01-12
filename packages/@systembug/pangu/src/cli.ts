/**
 * 盘古 CLI - 交互式开发服务器启动工具
 * @description 从配置文件读取 demo 列表并启动开发服务器
 *
 * 主要功能：
 * - 解析命令行参数
 * - 显示交互式菜单选择 demo
 * - 启动开发服务器
 * - 处理进程信号（如 Ctrl+C）
 */

import { spawn } from "child_process";
import inquirer from "inquirer";
import ora from "ora";
import { loadConfig, getDemoOptions } from "./config.js";
import type { DemoOption } from "./types.js";

/**
 * 获取命令行参数
 */
function getCommandLineArgs(): string[] {
    return process.argv.slice(2);
}

/**
 * 验证 demo 名称是否有效
 */
function isValidDemo(demo: string, options: DemoOption[]): boolean {
    return options.some((opt) => opt.value === demo.toLowerCase());
}

/**
 * 显示帮助信息
 */
function showHelp(config: { demos: DemoOption[]; packageManager: string }): void {
    console.log("\n📖 使用方法:");
    console.log("  pangu              # 显示交互式菜单");
    console.log("  pangu <demo>        # 直接启动指定的 demo\n");
    console.log("可用的 demo:");
    config.demos.forEach((option) => {
        console.log(`  ${option.value.padEnd(15)} - ${option.description}`);
    });
    console.log(`\n包管理器: ${config.packageManager}`);
    console.log("\n示例:");
    if (config.demos.length > 0) {
        config.demos.slice(0, 3).forEach((option) => {
            console.log(`  pangu ${option.value}`);
        });
    }
    console.log("");
}

/**
 * 显示欢迎信息
 */
function showWelcome(projectName: string): void {
    console.log(`\n🚀 ${projectName} 开发服务器\n`);
}

/**
 * 显示选择菜单并获取用户选择
 */
async function selectDemo(demos: DemoOption[]): Promise<string> {
    const { demo } = await inquirer.prompt([
        {
            type: "list",
            name: "demo",
            message: "请选择要启动的演示项目：",
            choices: demos.map((option) => ({
                name: `${option.name.padEnd(15)} - ${option.description}`,
                value: option.value,
            })),
        },
    ]);

    return demo;
}

/**
 * 启动开发服务器
 */
function startDevServer(
    demo: string,
    demos: DemoOption[],
    defaultPackageManager: string,
    extraArgs: string[] = [],
): void {
    // 确保 demo 名称是小写的
    const demoLower = demo.toLowerCase();
    const option = demos.find((opt) => opt.value === demoLower);
    if (!option) {
        console.error(`❌ 未找到演示项目: ${demo}`);
        process.exit(1);
    }

    // 使用 demo 特定的 packageManager，如果没有则使用全局的
    const packageManager = option.packageManager || defaultPackageManager;

    const spinner = ora({
        text: `正在启动 ${option.name} 开发服务器...`,
        color: "cyan",
    }).start();

    // 合并配置中的参数和命令行额外参数
    const allArgs = [...(option.args || []), ...extraArgs];

    // 构建命令参数
    // 如果提供了 args，直接使用 args；否则默认使用 "dev"
    const commandArgs = ["--filter", option.package];
    if (allArgs.length > 0) {
        // 如果提供了 args，直接使用这些 args（不自动添加 dev）
        commandArgs.push(...allArgs);
    } else {
        // 如果没有 args，默认使用 "dev"
        commandArgs.push("dev");
    }

    // 执行包管理器命令启动开发服务器
    const command = `${packageManager} ${commandArgs.join(" ")}`;
    spinner.succeed(`✅ 正在启动 ${option.name} 开发服务器`);
    console.log(`\n📦 包名: ${option.package}`);
    console.log(`🔧 包管理器: ${packageManager}`);
    console.log(`🔧 命令: ${command}\n`);

    // 使用 spawn 启动开发服务器（非阻塞，支持长时间运行）
    const childProcess = spawn(packageManager, commandArgs, {
        stdio: "inherit",
        cwd: process.cwd(),
        shell: process.platform === "win32", // Windows 需要 shell
    });

    // 处理进程退出
    childProcess.on("exit", (code) => {
        if (code !== 0 && code !== null) {
            console.error(`\n❌ 开发服务器退出，代码: ${code}`);
            process.exit(code);
        }
    });

    // 处理错误
    childProcess.on("error", (error) => {
        spinner.fail(`❌ 启动 ${option.name} 开发服务器失败`);
        console.error(error);
        process.exit(1);
    });

    // 处理 Ctrl+C
    process.on("SIGINT", () => {
        console.log("\n\n👋 正在关闭开发服务器...");
        childProcess.kill("SIGINT");
        process.exit(0);
    });
}

/**
 * 主函数
 */
export async function main(): Promise<void> {
    try {
        const args = getCommandLineArgs();

        // 加载配置
        const config = loadConfig();
        const demos = getDemoOptions(config);

        // 检查是否有可用的 demo
        if (demos.length === 0) {
            console.error("❌ 配置文件中没有找到任何 demo 选项");
            console.error(
                "请创建 pangu.config.json、pangu.config.yaml、dev.config.json 或 dev.config.yaml 配置文件",
            );
            process.exit(1);
        }

        // 检查是否需要显示帮助
        if (args.includes("--help") || args.includes("-h")) {
            showHelp({
                demos,
                packageManager: config.packageManager || "pnpm",
            });
            process.exit(0);
        }

        // 如果提供了参数，直接使用
        if (args.length > 0) {
            const demoArg = args[0].toLowerCase();
            if (isValidDemo(demoArg, demos)) {
                // 提取额外的参数（demo 名称之后的所有参数）
                const extraArgs = args.slice(1);
                // 直接启动指定的 demo，并传递额外参数
                startDevServer(demoArg, demos, config.packageManager || "pnpm", extraArgs);
                return;
            } else {
                // 参数无效，显示错误和帮助
                console.error(`\n❌ 无效的 demo 名称: ${args[0]}\n`);
                showHelp({
                    demos,
                    packageManager: config.packageManager || "pnpm",
                });
                process.exit(1);
            }
        }

        // 没有提供参数，显示交互式菜单
        showWelcome(config.projectName || "项目");
        const selectedDemo = await selectDemo(demos);
        startDevServer(selectedDemo, demos, config.packageManager || "pnpm");
    } catch (error) {
        if (error instanceof Error && error.message.includes("User force closed")) {
            console.log("\n👋 已取消");
            process.exit(0);
        }
        console.error("❌ 发生错误:", error);
        process.exit(1);
    }
}

// 注意：CLI 入口文件在 dist/cli.js，这里不需要直接执行
