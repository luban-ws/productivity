import { isMissingScriptError, toPublishErrorMessage } from "../utils/script-errors";

/** 将发布步骤失败转换为单次、可诊断的用户错误。 */
export function createPublishStepError(
    error: unknown,
    scriptFallback: string,
    genericMessage: string,
): Error {
    const raw = error instanceof Error ? error.message : String(error);
    if (isMissingScriptError(raw)) {
        return new Error(toPublishErrorMessage(error, scriptFallback));
    }

    return new Error(`${genericMessage}\n${raw}`);
}
