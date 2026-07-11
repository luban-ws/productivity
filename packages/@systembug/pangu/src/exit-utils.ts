/**
 * 退出码策略：用户已看到 CLI 提示时用 0，避免 pnpm 再刷 ELIFECYCLE
 */

/** 用户面向错误/提示已展示完毕，安静退出 */
export function exitAfterUserMessage(): never {
    process.exit(0);
}
