import { t } from "../messages.js";

/** 在 CLI 边界单次输出发布失败诊断。 */
export function reportReleaseFailure(
    error: unknown,
    output: (message: string) => void = console.error,
): void {
    const message = error instanceof Error ? error.message : String(error);
    output(`\n${t("releaseFailed", { message })}`);
}
