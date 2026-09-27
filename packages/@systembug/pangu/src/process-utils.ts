/**
 * 子进程与信号处理工具
 * @description 解析包目录、判断优雅退出、绑定 Ctrl+C 关闭逻辑
 */

import { spawn, spawnSync, type ChildProcess } from "child_process";
import { existsSync, readFileSync } from "fs";
import { delimiter, join } from "path";
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

/** 子进程环境变量 */
type ProcessEnv = Record<string, string | undefined>;

interface PackageJsonWithScripts {
    scripts?: {
        dev?: unknown;
    };
}

/**
 * 读取包的 dev 脚本。直接执行它，避免 pnpm 在 SIGINT 时打印递归失败
 */
export function readDevScript(packageDirectory: string): string {
    const packageJsonPath = join(packageDirectory, "package.json");
    if (!existsSync(packageJsonPath)) {
        throw new Error(t("devScriptMissing", { package: packageDirectory }));
    }

    let pkg: PackageJsonWithScripts;
    try {
        pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as PackageJsonWithScripts;
    } catch {
        throw new Error(t("devScriptInvalid", { package: packageDirectory }));
    }

    const dev = pkg.scripts?.dev;
    if (typeof dev !== "string" || dev.trim() === "") {
        throw new Error(t("devScriptMissing", { package: packageDirectory }));
    }

    return dev;
}

/**
 * 把额外参数接到 dev 脚本后面
 */
export function appendDevArgs(script: string, extraArgs: string[]): string {
    if (extraArgs.length === 0) {
        return script;
    }

    return [script, ...extraArgs].join(" ");
}

/**
 * 让 dev 脚本能找到包和仓库根的 node_modules/.bin
 */
export function buildDevEnv(
    packageDirectory: string,
    workspaceRoot: string,
    baseEnv: ProcessEnv = process.env,
): ProcessEnv {
    const bins = [
        join(packageDirectory, "node_modules", ".bin"),
        join(workspaceRoot, "node_modules", ".bin"),
    ];
    const current = baseEnv.PATH ?? "";
    const pathValue =
        current.length > 0 ? [...bins, current].join(delimiter) : bins.join(delimiter);

    return {
        ...baseEnv,
        PATH: pathValue,
    };
}

/**
 * 在包目录直接启动 dev 脚本。
 * Unix 上 detached 让脚本单独成组，终端 Ctrl+C 只打到盘古。
 */
export function spawnDevScript(
    command: string,
    packageDirectory: string,
    env: ProcessEnv,
    platform: string = process.platform,
): ChildProcess {
    return spawn(command, {
        cwd: packageDirectory,
        env,
        shell: true,
        stdio: "inherit",
        detached: platform !== "win32",
    });
}

/**
 * 把信号发给子进程组。组已经没了就退回单个子进程。
 */
export function signalChildGroup(
    childProcess: ChildProcess,
    signal: "SIGINT" | "SIGTERM",
    platform: string = process.platform,
): void {
    const pid = childProcess.pid;
    if (platform !== "win32" && typeof pid === "number") {
        try {
            process.kill(-pid, signal);
            return;
        } catch {
            // 进程组已结束
        }
    }

    childProcess.kill(signal);
}

export interface GracefulShutdownOptions {
    /** Ctrl+C 时显示的提示文案 */
    message?: string;
    /** 测试注入，默认当前平台 */
    platform?: string;
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
        signalChildGroup(childProcess, signal, options.platform);
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
