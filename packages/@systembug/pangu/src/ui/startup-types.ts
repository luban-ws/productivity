/**
 * 启动流程类型
 */

/** 启动就绪后交给 spawn 的信息 */
export interface StartupReadyPayload {
    packageDirectory: string;
    command: string;
    packageManager: string;
    packageName: string;
}

/** 启动失败错误 */
export class StartupFailedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "StartupFailedError";
    }
}

/** 判断是否为启动失败错误 */
export function isStartupFailedError(error: unknown): error is StartupFailedError {
    return error instanceof StartupFailedError;
}
