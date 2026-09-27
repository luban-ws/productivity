/**
 * 命令执行工具
 */

import { execSync } from "child_process";
import { t } from "../messages.js";

export interface ExecOptions {
    silent?: boolean;
    cwd?: string;
    encoding?: BufferEncoding;
    /**
     * 超时时间（毫秒）
     * 如果未指定，则使用默认超时（30分钟）
     * 设置为 0 表示无超时
     */
    timeout?: number;
    /**
     * 命令描述（用于错误报告）
     */
    description?: string;
}

const DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 分钟

/**
 * 执行命令（支持超时）
 */
export function exec(command: string, options: ExecOptions = {}): string {
    const {
        silent = false,
        cwd = process.cwd(),
        encoding = "utf-8",
        timeout = DEFAULT_TIMEOUT,
    } = options;

    try {
        const execOptions: Parameters<typeof execSync>[1] = {
            stdio: silent ? "pipe" : "inherit",
            cwd,
            encoding,
        };

        // 添加超时选项（Node.js 12.5.0+ 支持）
        if (timeout > 0) {
            execOptions.timeout = timeout;
        }

        return execSync(command, execOptions) as string;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const context = buildErrorContext(command, cwd, timeout);
        // 保留子进程 stderr/stdout（如 tsc、lint 等），便于诊断
        const execErr = error as { stderr?: Buffer | string; stdout?: Buffer | string };
        const stderrStr =
            execErr.stderr != null
                ? typeof execErr.stderr === "string"
                    ? execErr.stderr.trim()
                    : execErr.stderr.toString("utf-8").trim()
                : "";
        const stdoutStr =
            execErr.stdout != null
                ? typeof execErr.stdout === "string"
                    ? execErr.stdout.trim()
                    : execErr.stdout.toString("utf-8").trim()
                : "";
        const childOutput = [stderrStr, stdoutStr].filter(Boolean).join("\n");

        // 检查是否是超时错误
        if (errorMessage.includes("ETIMEDOUT") || errorMessage.includes("timeout")) {
            throw new Error(`${t("commandTimedOut", { seconds: timeout / 1000 })}\n${context}`);
        }

        // 检查是否是命令未找到错误
        if (
            errorMessage.includes("ENOENT") ||
            errorMessage.includes("command not found") ||
            errorMessage.includes("不是内部或外部命令")
        ) {
            throw new Error(`${t("commandNotFound")}\n${context}`);
        }

        // 其他错误：附上子进程输出以便诊断（如 tsc 类型错误）
        const withOutput = childOutput ? `\n\n${t("commandOutput")}\n${childOutput}` : "";
        throw new Error(`${t("commandFailed")}\n${context}\nError: ${errorMessage}${withOutput}`);
    }
}

/**
 * 构建错误上下文信息
 */
function buildErrorContext(command: string, cwd: string, timeout?: number): string {
    return t("commandDetails", {
        command,
        cwd,
        seconds: timeout && timeout > 0 ? timeout / 1000 : 0,
    });
}

/**
 * 静默执行命令
 */
export function execSilent(
    command: string,
    options: Omit<ExecOptions, "silent"> = {},
): string | null {
    try {
        return execSync(command, {
            stdio: "pipe",
            cwd: options.cwd || process.cwd(),
            encoding: options.encoding || "utf-8",
        })
            .toString()
            .trim();
    } catch {
        return null;
    }
}
