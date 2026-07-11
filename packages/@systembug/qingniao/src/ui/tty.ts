/**
 * TTY 检测
 */

/** 是否为可交互终端（Ink UI） */
export function isInteractiveTerminal(): boolean {
    return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
