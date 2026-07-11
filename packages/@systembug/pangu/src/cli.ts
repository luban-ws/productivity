/**
 * 盘古 CLI - 交互式开发服务器启动工具
 */

import { spawn } from "child_process";
import { loadConfig, getDemoOptions } from "./config.js";
import { DEFAULT_SUPPORTED_BY } from "./constants.js";
import { t } from "./messages.js";
import { isDemoSelectCancelledError } from "./ui/demo-select-errors.js";
import { runDemoSelect } from "./ui/run-demo-select.js";
import { runHelpUntilExit } from "./ui/run-help.js";
import { runAlert } from "./ui/run-alert.js";
import { runInvalidDemoScreen } from "./ui/run-invalid-demo.js";
import { runStartup } from "./ui/run-startup.js";
import { isStartupFailedError } from "./ui/startup-types.js";
import {
    attachGracefulShutdown,
    buildPackageDevArgs,
    resolvePackageDirectory,
} from "./process-utils.js";
import { exitAfterUserMessage } from "./exit-utils.js";
import type { DemoOption } from "./types.js";

function getCommandLineArgs(): string[] {
    return process.argv.slice(2);
}

function isValidDemo(demo: string, options: DemoOption[]): boolean {
    return options.some((opt) => opt.value === demo.toLowerCase());
}

async function startDevServer(
    demo: string,
    demos: DemoOption[],
    defaultPackageManager: string,
    extraArgs: string[] = [],
): Promise<void> {
    const demoLower = demo.toLowerCase();
    const option = demos.find((opt) => opt.value === demoLower);
    if (!option) {
        await runAlert({
            variant: "error",
            lines: [t("demoNotFound", { demo })],
        });
        exitAfterUserMessage();
    }

    const packageManager = option.packageManager || defaultPackageManager;
    const allArgs = [...(option.args || []), ...extraArgs];
    const commandArgs = buildPackageDevArgs(allArgs);
    const command = `${packageManager} ${commandArgs.join(" ")}`;

    let payload;
    try {
        payload = await runStartup({
            demoDisplayName: option.name,
            packageName: option.package,
            packageManager,
            command,
            resolveDirectory: () =>
                resolvePackageDirectory(option.package, packageManager, process.cwd()),
        });
    } catch (error) {
        if (isStartupFailedError(error)) {
            exitAfterUserMessage();
        }
        throw error;
    }

    const childProcess = spawn(packageManager, commandArgs, {
        stdio: "inherit",
        cwd: payload.packageDirectory,
        shell: process.platform === "win32",
    });

    childProcess.on("error", (error) => {
        void runAlert({
            variant: "error",
            title: t("startServerFailed", { name: option.name }),
            lines: [error instanceof Error ? error.message : String(error)],
            dismissMs: 800,
        }).then(() => {
            exitAfterUserMessage();
        });
    });

    attachGracefulShutdown(childProcess);
}

export async function main(): Promise<void> {
    try {
        const args = getCommandLineArgs();
        const config = loadConfig();
        const demos = getDemoOptions(config);
        const packageManager = config.packageManager || "pnpm";

        if (demos.length === 0) {
            await runAlert({
                variant: "error",
                lines: [t("noDemos"), t("configHint")],
            });
            exitAfterUserMessage();
        }

        if (args.includes("--help") || args.includes("-h")) {
            runHelpUntilExit(demos, packageManager);
            process.exit(0);
        }

        if (args.length > 0) {
            const demoArg = args[0].toLowerCase();
            if (isValidDemo(demoArg, demos)) {
                const extraArgs = args.slice(1);
                await startDevServer(demoArg, demos, packageManager, extraArgs);
                return;
            }

            await runInvalidDemoScreen(
                t("invalidDemo", { demo: args[0] }).trim(),
                demos,
                packageManager,
            );
            exitAfterUserMessage();
        }

        const selectedDemo = await runDemoSelect(config.projectName || DEFAULT_SUPPORTED_BY, demos);
        await startDevServer(selectedDemo, demos, packageManager);
    } catch (error) {
        if (isDemoSelectCancelledError(error)) {
            await runAlert({
                variant: "info",
                lines: [t("cancelled").trim()],
            });
            process.exit(0);
        }

        if (isStartupFailedError(error)) {
            exitAfterUserMessage();
        }

        await runAlert({
            variant: "error",
            title: t("errorOccurred"),
            lines: [error instanceof Error ? error.message : String(error)],
            dismissMs: 800,
        });
        exitAfterUserMessage();
    }
}
