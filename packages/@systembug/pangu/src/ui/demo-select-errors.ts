/**
 * Demo 选择 UI 相关错误
 */

/** 用户取消 demo 选择（Esc / Ctrl+C） */
export class DemoSelectCancelledError extends Error {
    constructor() {
        super("User cancelled demo selection");
        this.name = "DemoSelectCancelledError";
    }
}

/** 判断是否为取消选择错误 */
export function isDemoSelectCancelledError(error: unknown): error is DemoSelectCancelledError {
    return error instanceof DemoSelectCancelledError;
}
