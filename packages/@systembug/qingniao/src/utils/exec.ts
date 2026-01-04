/**
 * 命令执行工具
 */

import { execSync } from "child_process";

export interface ExecOptions {
    silent?: boolean;
    cwd?: string;
    encoding?: BufferEncoding;
}

/**
 * 执行命令
 */
export function exec(command: string, options: ExecOptions = {}): string {
    try {
        return execSync(command, {
            stdio: options.silent ? "pipe" : "inherit",
            cwd: options.cwd || process.cwd(),
            encoding: options.encoding || "utf-8",
        }) as string;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`命令执行失败: ${command} ${errorMessage}`);
    }
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
