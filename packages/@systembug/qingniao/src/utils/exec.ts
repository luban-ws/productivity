/**
 * 命令执行工具
 */

import { execSync } from "child_process";

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
        description,
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
        const context = buildErrorContext(command, cwd, description, timeout);

        // 检查是否是超时错误
        if (errorMessage.includes("ETIMEDOUT") || errorMessage.includes("timeout")) {
            throw new Error(
                `命令执行超时（${timeout / 1000}秒）: ${context}\n` +
                    `命令可能已挂起，请检查：\n` +
                    `  1. 命令是否正确\n` +
                    `  2. 网络连接是否正常\n` +
                    `  3. 依赖服务是否可用\n` +
                    `  4. 是否需要交互式输入\n` +
                    `  5. 命令是否在等待用户输入`,
            );
        }

        // 检查是否是命令未找到错误
        if (
            errorMessage.includes("ENOENT") ||
            errorMessage.includes("command not found") ||
            errorMessage.includes("不是内部或外部命令")
        ) {
            throw new Error(
                `命令未找到: ${context}\n` +
                    `请检查：\n` +
                    `  1. 命令是否正确安装\n` +
                    `  2. 命令是否在 PATH 中\n` +
                    `  3. 是否需要安装依赖`,
            );
        }

        // 其他错误
        throw new Error(`命令执行失败: ${context}\n错误: ${errorMessage}`);
    }
}

/**
 * 构建错误上下文信息
 */
function buildErrorContext(
    command: string,
    cwd: string,
    description?: string,
    timeout?: number,
): string {
    const parts: string[] = [];
    if (description) {
        parts.push(`[${description}]`);
    }
    parts.push(`命令: ${command}`);
    parts.push(`工作目录: ${cwd}`);
    if (timeout && timeout > 0) {
        parts.push(`超时: ${timeout / 1000}秒`);
    }
    return parts.join(" ");
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
