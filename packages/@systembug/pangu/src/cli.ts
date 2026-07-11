/**
 * 盘古 CLI - 交互式开发服务器启动工具
 */

import { spawn } from "child_process";
import inquirer from "inquirer";
import ora from "ora";
import { loadConfig, getDemoOptions } from "./config.js";
import { t } from "./messages.js";
import {
    attachGracefulShutdown,
    buildPackageDevArgs,
    resolvePackageDirectory,
} from "./process-utils.js";
import type { DemoOption } from "./types.js";

function getCommandLineArgs(): string[] {
    return process.argv.slice(2);
}

function isValidDemo(demo: string, options: DemoOption[]): boolean {
    return options.some((opt) => opt.value === demo.toLowerCase());
}

function showHelp(config: { demos: DemoOption[]; packageManager: string }): void {
    console.log(t("helpTitle"));
    console.log(t("helpMenu"));
    console.log(t("helpDirect"));
    console.log(t("helpDemos"));
    config.demos.forEach((option) => {
        console.log(`  ${option.value.padEnd(15)} - ${option.description}`);
    });
    console.log(`${t("helpPackageManager")}: ${config.packageManager}`);
    console.log(t("helpExamples"));
    if (config.demos.length > 0) {
        config.demos.slice(0, 3).forEach((option) => {
            console.log(`  pangu ${option.value}`);
        });
    }
    console.log("");
}

function showWelcome(projectName: string): void {
    console.log(t("welcome", { projectName }));
}

async function selectDemo(demos: DemoOption[]): Promise<string> {
    const { demo } = await inquirer.prompt([
        {
            type: "list",
            name: "demo",
            message: t("selectDemo"),
            choices: demos.map((option) => ({
                name: `${option.name.padEnd(15)} - ${option.description}`,
                value: option.value,
            })),
        },
    ]);

    return demo;
}

function startDevServer(
    demo: string,
    demos: DemoOption[],
    defaultPackageManager: string,
    extraArgs: string[] = [],
): void {
    const demoLower = demo.toLowerCase();
    const option = demos.find((opt) => opt.value === demoLower);
    if (!option) {
        console.error(t("demoNotFound", { demo }));
        process.exit(1);
    }

    const packageManager = option.packageManager || defaultPackageManager;

    const spinner = ora({
        text: t("startingServer", { name: option.name }),
        color: "cyan",
    }).start();

    const allArgs = [...(option.args || []), ...extraArgs];
    const commandArgs = buildPackageDevArgs(allArgs);

    let packageDirectory: string;
    try {
        packageDirectory = resolvePackageDirectory(option.package, packageManager, process.cwd());
    } catch (error) {
        spinner.fail(t("locatePackageFailed", { name: option.name }));
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
        return;
    }

    const command = `${packageManager} ${commandArgs.join(" ")}`;
    spinner.succeed(t("startingServerSuccess", { name: option.name }));
    console.log(`\n${t("labelPackage")}: ${option.package}`);
    console.log(`${t("labelDirectory")}: ${packageDirectory}`);
    console.log(`${t("labelPackageManager")}: ${packageManager}`);
    console.log(`${t("labelCommand")}: ${command}\n`);

    const childProcess = spawn(packageManager, commandArgs, {
        stdio: "inherit",
        cwd: packageDirectory,
        shell: process.platform === "win32",
    });

    childProcess.on("error", (error) => {
        spinner.fail(t("startServerFailed", { name: option.name }));
        console.error(error);
        process.exit(1);
    });

    attachGracefulShutdown(childProcess);
}

export async function main(): Promise<void> {
    try {
        const args = getCommandLineArgs();
        const config = loadConfig();
        const demos = getDemoOptions(config);

        if (demos.length === 0) {
            console.error(t("noDemos"));
            console.error(t("configHint"));
            process.exit(1);
        }

        if (args.includes("--help") || args.includes("-h")) {
            showHelp({
                demos,
                packageManager: config.packageManager || "pnpm",
            });
            process.exit(0);
        }

        if (args.length > 0) {
            const demoArg = args[0].toLowerCase();
            if (isValidDemo(demoArg, demos)) {
                const extraArgs = args.slice(1);
                startDevServer(demoArg, demos, config.packageManager || "pnpm", extraArgs);
                return;
            }

            console.error(t("invalidDemo", { demo: args[0] }));
            showHelp({
                demos,
                packageManager: config.packageManager || "pnpm",
            });
            process.exit(1);
        }

        showWelcome(config.projectName || "项目");
        const selectedDemo = await selectDemo(demos);
        startDevServer(selectedDemo, demos, config.packageManager || "pnpm");
    } catch (error) {
        if (error instanceof Error && error.message.includes("User force closed")) {
            console.log(t("cancelled"));
            process.exit(0);
        }
        console.error(t("errorOccurred"), error);
        process.exit(1);
    }
}
