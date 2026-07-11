/**
 * 终端交互能力检测
 */

/** 当前 stdin/stdout 是否支持 Ink 交互（需 TTY） */
export function isInteractiveTerminal(): boolean {
    return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
