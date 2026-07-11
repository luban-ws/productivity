/**
 * 子进程与信号处理工具
 * @description 解析包目录、判断优雅退出、绑定 Ctrl+C 关闭逻辑
 */

import { spawnSync, type ChildProcess } from "child_process";
import { getShutdownMessage, t } from "./messages.js";

/** SIGINT 对应的常见退出码（128 + 2） */
export const EXIT_CODE_SIGINT = 130;

/** SIGTERM 对应的常见退出码（128 + 15） */
export const EXIT_CODE_SIGTERM = 143;
export function isGracefulExitCode(code: number | null): boolean {
    return code === null || code === 0 || code === EXIT_CODE_SIGINT || code === EXIT_CODE_SIGTERM;
}

/**
 * 解析 workspace 内目标包的绝对路径
 */
export function resolvePackageDirectory(
    packageName: string,
    packageManager: string,
    cwd: string,
): string {
    const result = spawnSync(
        packageManager,
        ["--filter", packageName, "exec", "node", "-p", "process.cwd()"],
        { cwd, encoding: "utf-8" },
    );

    const packageDirectory = result.stdout?.trim();
    if (result.status !== 0 || !packageDirectory) {
        const stderr = result.stderr?.trim();
        throw new Error(
            stderr
                ? t("resolvePackageDirErrorWithStderr", { package: packageName, stderr })
                : t("resolvePackageDirError", { package: packageName }),
        );
    }

    return packageDirectory;
}

/**
 * 构建在包目录内执行的 dev 命令参数
 */
export function buildPackageDevArgs(extraArgs: string[]): string[] {
    return extraArgs.length > 0 ? extraArgs : ["dev"];
}

export interface GracefulShutdownOptions {
    /** Ctrl+C 时显示的提示文案 */
    message?: string;
}

/**
 * 绑定 SIGINT/SIGTERM，优雅关闭子进程并在用户中断时以 0 退出
 */
export function attachGracefulShutdown(
    childProcess: ChildProcess,
    options: GracefulShutdownOptions = {},
): void {
    let shuttingDown = false;
    const shutdownMessage = options.message ?? getShutdownMessage();

    const requestShutdown = (signal: "SIGINT" | "SIGTERM"): void => {
        if (shuttingDown) {
            return;
        }

        shuttingDown = true;
        console.log(shutdownMessage);
        childProcess.kill(signal);
    };

    process.on("SIGINT", () => requestShutdown("SIGINT"));
    process.on("SIGTERM", () => requestShutdown("SIGTERM"));

    childProcess.on("exit", (code) => {
        if (shuttingDown || isGracefulExitCode(code)) {
            process.exit(0);
            return;
        }

        // stdio inherit：子进程已输出错误；exit 0 避免 pnpm ELIFECYCLE
        process.exit(0);
    });
}
